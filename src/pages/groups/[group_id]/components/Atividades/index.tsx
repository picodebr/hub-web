import { Button, Flex, Grid, Image, Modal, ModalContent, Spinner, Text, useUpdateEffect } from '@chakra-ui/react';
import { FiChevronLeft, FiDownload, FiFileText } from 'react-icons/fi';
import { ContentState, EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { EditorProps } from 'react-draft-wysiwyg';

import { createHubGroupActivitySchema, ICreateHubGroupActivityDTO, IHubGroup, IHubGroupActivity } from '@/_base/interfaces/group';
import { ITempFile } from '@/_base/interfaces/shared';
import { SmallModal } from '@/components/Modal/Small';
import { FaPlus, FaRegTrashCan } from 'react-icons/fa6';
import { TextInput } from '@/components/Inputs/Text';
import { useAsyncCallback, useInputHandler } from '@/_base/hooks';
import { ColorPicker } from '@/components/ColorPicker';
import { FileInput, useFileInput } from '@/components/Inputs/File';
import { isColorLight } from '@/_base/utils';
import { Document, Page } from 'react-pdf';
import { BiLeftArrowAlt } from 'react-icons/bi';
import { MdOutlineZoomIn, MdOutlineZoomOut } from 'react-icons/md';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { addGroupActivity } from '@/_base/services/group';
import { IHubProjectStep } from '@/_base/interfaces/project';
import { SelectInput } from '@/components/Inputs/Select';

const Editor = dynamic<EditorProps>(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), { ssr: false });
interface IProps {
  group: IHubGroup;
  setGroup: Dispatch<SetStateAction<IHubGroup>>;
  canEdit: boolean;
  setActivityFiles: Dispatch<SetStateAction<ITempFile[]>>;
}

export const Activities: React.FC<IProps> = ({ group, setGroup, canEdit, setActivityFiles }) => {
  console.log('group: ', group.activities);
  const [isLoading, setIsLoading] = useState(false);
  const [openEditor, setOpenEditor] = useState(false);
  const [editorValue, setEditorValue] = useState<EditorState>(EditorState.createEmpty());
  const [contentIsMounted, setContentIsMounted] = useState(false);
  const [customActivities, setCustomActivities] = useState<IHubGroupActivity[]>(group.activities || []);
  const [fileActivity, setFileActivity] = useState<File | null>(null);
  const [targetProjectStep, setTargetProjectStep] = useState<IHubProjectStep | null>(null);
  const [targetCustomActivity, setTargetCustomActivity] = useState<IHubGroupActivity | null>(null);
  const [PDFPages, setPDFPages] = useState(0);
  const [scale, setScale] = useState(1);

  const { clearFileList } = useFileInput();
  const { errors, onInputChange, data, setData, setErrors, submit } = useInputHandler<ICreateHubGroupActivityDTO>({
    schema: createHubGroupActivitySchema,
  });

  useEffect(() => {
    const content = EditorState.createWithContent(
      group.metadata.annotation ? convertFromRaw(JSON.parse(group.metadata.annotation)) : ContentState.createFromText(``),
    );

    setEditorValue(content);
  }, []);

  useUpdateEffect(() => {
    if (!canEdit) return;

    if (contentIsMounted)
      setGroup((g) => ({ ...g, metadata: { ...g.metadata, annotation: JSON.stringify(convertToRaw(editorValue.getCurrentContent())) } }));
    else setContentIsMounted(true);
  }, [editorValue]);

  const uploadCallback = (file: File) => {
    return new Promise((resolve) => {
      const reader = new window.FileReader();
      reader.onloadend = async () => {
        const form_data = new FormData();
        form_data.append('file', file);
        const path = URL.createObjectURL(file);
        setActivityFiles((f) => [...f, { path, file }]);
        resolve({ data: { link: path } });
      };
      reader.readAsDataURL(file);
    });
  };

  const closeCustomActivityModal = () => {
    setFileActivity(null);
    clearFileList();
    setData({} as any);
    setErrors({} as any);
  };

  const handleCreateCustomActivity = useAsyncCallback(
    async () => {
      console.log('fileActivity: ', fileActivity);
      if (!fileActivity) return;
      setIsLoading(true);
      const response = await getPresignedUrl(fileActivity.type, 'groups');
      await uploadFile(response.link, fileActivity);

      const newActivity = await addGroupActivity({
        ...data,
        file_url: response.path,
        metadata: {
          color: data.metadata?.color,
          project_activity_parent: targetProjectStep?.parent,
          project_activity_title: targetProjectStep?.title,
        },
      });

      setCustomActivities((c) => [...c, newActivity]);
      closeCustomActivityModal();
    },
    [data],
    true,
    () => setIsLoading(false),
  );

  const downloadFile = (file: string, title: string) => {
    const link = document.createElement('a');
    link.setAttribute(`target`, `_blank`);
    link.href = file;
    link.download = `${title}.pdf`;
    link.click();
  };

  return (
    <Flex direction="column" gap="24px" overflow={openEditor ? `hidden` : 'auto'} flex="1">
      {openEditor ? (
        <>
          <Flex
            color="primary700"
            align="center"
            fontWeight="500"
            border="1px"
            borderColor="primary700"
            borderRadius="md"
            w="fit-content"
            p=".25rem .75rem .25rem .25rem"
            m="5px"
            cursor="pointer"
            transition="all 0.175s"
            _hover={{ transform: `scale(1.05)` }}
            onClick={() => setOpenEditor(false)}
            bg="white"
          >
            <FiChevronLeft fontSize="20px" />
            <Text>Atividades</Text>
          </Flex>
          <Flex bg="white" flex="1" sx={{ '.hub-editor-wrapper': { w: `100%` }, '.hub-editor-content': { p: `0 1rem` } }} overflow="hidden">
            <Editor
              toolbar={{
                image: {
                  uploadEnabled: true,
                  previewImage: true,
                  uploadCallback,
                },
              }}
              wrapperClassName="hub-editor-wrapper"
              editorClassName="hub-editor-content"
              editorState={editorValue}
              onEditorStateChange={setEditorValue}
            />
          </Flex>
        </>
      ) : (
        <Grid
          gap="1rem"
          gridTemplateColumns="repeat(auto-fill, minmax(220px, 1fr))"
          gridTemplateRows="minmax(min-content, max-content)"
          borderRadius="md"
          flex="1"
        >
          <Flex
            w="220px"
            h="183px"
            p="12px"
            gap="4px"
            display="flex"
            direction="column"
            bg="white"
            borderRadius="10px"
            border="1px"
            borderColor="gray300"
            cursor="pointer"
            _hover={{ filter: 'brightness(0.85)' }}
            onClick={() => setOpenEditor(true)}
          >
            <Flex align="center" color="primary500" gap="4px" fontWeight="500">
              <FiFileText />
              Anotações
            </Flex>
          </Flex>
          {customActivities.map((activity) => (
            <Flex
              w="220px"
              h="183px"
              p="12px"
              gap="4px"
              display="flex"
              direction="column"
              borderRadius="10px"
              cursor="pointer"
              border="1px"
              borderColor="gray300"
              bg={activity.metadata.color || `white`}
              color={activity.metadata.color ? (isColorLight(activity.metadata.color) ? `#4d4b5f` : `#fff`) : `primary800`}
              _hover={{ filter: 'brightness(0.85)' }}
              onClick={() => setTargetCustomActivity(activity)}
            >
              <Flex align="center" gap="4px" fontWeight="500" position="relative">
                <FiFileText />
                {activity.title}
                <Flex
                  position="absolute"
                  top="0"
                  right="0"
                  align="center"
                  justify="center"
                  color="primary500"
                  border="1px"
                  bg="gray100"
                  borderColor="gray300"
                  p=".35rem .35rem .38rem .38rem"
                  cursor="pointer"
                  borderRadius="50%"
                  transition="0.1s"
                  _hover={{
                    borderColor: `primary500`,
                  }}
                  // onClick={() => canEdit && setCustomActivities((c) => c.filter((e) => e.id !== newCustomActivity.id))}
                >
                  <FaRegTrashCan fontSize="1rem" />
                </Flex>
              </Flex>
            </Flex>
          ))}
          <Flex
            w="220px"
            h="183px"
            p="12px"
            gap="4px"
            display="flex"
            direction="column"
            bg="white"
            borderRadius="10px"
            border="1px"
            borderColor="gray300"
            cursor="pointer"
            justify="center"
            align="center"
            fontSize="2.5rem"
            _hover={{ filter: 'brightness(0.85)' }}
            onClick={() => onInputChange(`hub_group_id`, group.id)}
          >
            <FaPlus />
            <Text fontSize="1rem">Adicionar atividade</Text>
          </Flex>
        </Grid>
      )}
      <SmallModal
        show={!!data.hub_group_id}
        onConfirm={() => submit(handleCreateCustomActivity)}
        onCancel={closeCustomActivityModal}
        onClose={closeCustomActivityModal}
        disableOkButton={!canEdit}
        size="2xl"
        isLoading={isLoading}
      >
        <Flex direction="column" gap="1rem" flex="1" minH="25rem">
          <TextInput
            isDisabled={!canEdit}
            flex="1"
            label="Título"
            placeholder="Informe o título da atividade"
            _placeholder={{ fontSize: '14px' }}
            error={errors?.title}
            value={data?.title || ``}
            onInputChange={(value) => onInputChange(`title`, value)}
          />

          <SelectInput
            instanceId="order-status-select"
            // options={group.project?.project?.metadata.steps
            //   ?.filter((e) => e.requires_file_submission)
            //   .map((e) => ({ label: `${e.parent} - ${e.title}`, value: JSON.stringify(e) }))}
            options={group.project?.project?.metadata.steps?.map((e) => ({ label: `${e.parent} - ${e.title}`, value: JSON.stringify(e) }))}
            onSelectChange={([value]) => setTargetProjectStep(value ? JSON.parse(value) : null)}
            placeholder="Selecione uma etapa do projeto (opcional)"
            isMultiSelect={false}
            maxMenuHeight={200}
            styles={{ menu: (provided: any) => ({ ...provided, zIndex: 9999 }) }}
          />

          <Flex align="center" justify="space-between" w="100%">
            <Flex direction="column">
              <FileInput
                onChange={(files) => {
                  console.log('files: ', files);
                  setFileActivity(files[0]);
                  onInputChange(`file_url`, files[0]?.name);
                }}
                multiple={false}
              />
              {Object.values(errors || {}).length > 0 && (
                <Text color="red.500" fontSize="sm">
                  {Object.entries(errors)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(' | ')}
                </Text>
              )}
            </Flex>
            <Flex gap="1rem" align="center" mb="0.45rem">
              <ColorPicker onChange={(value) => onInputChange(`metadata`, { color: value })} enableInput={false} color={data?.metadata?.color} />
              <Text fontWeight="500" whiteSpace="nowrap">
                Cor de fundo
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </SmallModal>
      <Modal isOpen={!!targetCustomActivity} onClose={() => setTargetCustomActivity(null)} size="full" scrollBehavior="inside">
        <ModalContent
          display="flex"
          alignItems="center"
          bg="#eeefff"
          overflow="hidden auto"
          sx={{
            '&::-webkit-scrollbar': {
              width: '12px',
            },
            '&::-webkit-scrollbar-track': {
              width: '20px',
              margin: `1rem`,
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'primary700',
              width: '100px !important',
              height: `80px`,
              borderRadius: '9px',
              borderRight: `4px`,
              borderColor: `#7197ff`,
            },
          }}
        >
          <Document
            file={targetCustomActivity?.file_url}
            onLoadSuccess={({ _pdfInfo }) => {
              setIsLoading(false);
              setPDFPages(_pdfInfo.numPages);
            }}
            onLoadError={(err) => {
              // eslint-disable-next-line no-console
              console.error(err);
              setIsLoading(false);
            }}
            className="teste"
          >
            {Array.from({ length: PDFPages }).map((_, i) => (
              <Page key={i} pageNumber={i + 1} height={900} renderTextLayer={false} loading={isLoading} scale={scale} />
            ))}
          </Document>
          <Flex
            display={isLoading ? `flex` : `none`}
            align="center"
            justify="center"
            position="fixed"
            bg="#eeefff"
            w="100%"
            h="100%"
            zIndex={9999}
            direction="column"
          >
            <Image src="/loading/rocket-picode.gif" h="19rem" />
            <Spinner size="lg" />
          </Flex>
          <Button
            onClick={() => setTargetCustomActivity(null)}
            position="fixed"
            top="1rem"
            left="2rem"
            zIndex={9999}
            bg="primary700"
            color="white"
            colorScheme="blue"
            p="1rem 1rem 1rem 0.5rem"
            leftIcon={<BiLeftArrowAlt fontSize="1.5rem" />}
          >
            Voltar
          </Button>

          <Flex direction="column" gap="0.5rem" position="fixed" top="1rem" right="2rem" zIndex={9999}>
            <Button
              bg="primary700"
              color="white"
              colorScheme="blue"
              gap="0.5rem"
              p="0.5rem 1rem"
              onClick={() => targetCustomActivity && downloadFile(targetCustomActivity.file_url, targetCustomActivity.title)}
            >
              <FiDownload fontSize="1.5rem" />
              Baixar Arquivo
            </Button>
            <Flex align="center" justify="space-between" gap="0.5rem" w="100%">
              <Button
                onClick={() => setScale((s) => Math.min(s - 0.1, 3))}
                bg="primary700"
                color="white"
                colorScheme="blue"
                h="3rem"
                w="3rem"
                fontSize="1.8rem"
                p="0"
              >
                <MdOutlineZoomOut fontSize="1.5rem" />
              </Button>
              <Flex direction="column" justify="center">
                <Text fontWeight="400" lineHeight="14px" fontSize="12px" opacity="0.7">
                  Zoom
                </Text>
                <Text fontWeight="500">{Math.round(scale * 100)}%</Text>
              </Flex>

              <Button
                onClick={() => setScale((s) => Math.max(s + 0.1, 0))}
                bg="primary700"
                color="white"
                colorScheme="blue"
                h="3rem"
                w="3rem"
                fontSize="1.8rem"
                p="0"
              >
                <MdOutlineZoomIn fontSize="1.5rem" />
              </Button>
            </Flex>
          </Flex>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
