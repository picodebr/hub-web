import { Button, Flex, Grid, Image, Modal, ModalContent, Spinner, Text, useUpdateEffect } from '@chakra-ui/react';
import { FiChevronLeft, FiDownload, FiFileText } from 'react-icons/fi';
import { ContentState, EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { EditorProps } from 'react-draft-wysiwyg';

import { IHubGroup } from '@/_base/interfaces/group';
import { ITempFile } from '@/_base/interfaces/shared';
import { SmallModal } from '@/components/Modal/Small';
import { FaPlus, FaRegTrashCan } from 'react-icons/fa6';
import { TextInput } from '@/components/Inputs/Text';
import { useInputHandler } from '@/_base/hooks';
import { ColorPicker } from '@/components/ColorPicker';
import { FileInput, useFileInput } from '@/components/Inputs/File';
import { isColorLight } from '@/_base/utils';
import { Document, Page } from 'react-pdf';
import { BiLeftArrowAlt } from 'react-icons/bi';
import { MdOutlineZoomIn, MdOutlineZoomOut } from 'react-icons/md';

const Editor = dynamic<EditorProps>(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), { ssr: false });

interface ICustomActivity extends ITempFile {
  id?: string;
  error?: string;
  title: string;
  color?: string;
}

interface IProps {
  group: IHubGroup;
  setGroup: Dispatch<SetStateAction<IHubGroup>>;
  canEdit: boolean;
  setActivityFiles: Dispatch<SetStateAction<ITempFile[]>>;
}

export const Activities: React.FC<IProps> = ({ group, setGroup, canEdit, setActivityFiles }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [openEditor, setOpenEditor] = useState(false);
  const [editorValue, setEditorValue] = useState<EditorState>(EditorState.createEmpty());
  const [contentIsMounted, setContentIsMounted] = useState(false);
  const [customActivities, setCustomActivities] = useState<ICustomActivity[]>([]);
  const [newCustomActivity, setNewCustomActivity] = useState<Partial<ICustomActivity> | null>(null);
  const [targetCustomActivity, setTargetCustomActivity] = useState<ICustomActivity | null>(null);
  const [PDFPages, setPDFPages] = useState(0);
  const [scale, setScale] = useState(1);

  const { clearFileList } = useFileInput();

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
    setNewCustomActivity(null);
    clearFileList();
  };

  const handleCustomActivity = () => {
    if (!newCustomActivity) return;

    const url = URL.createObjectURL(newCustomActivity.file as File);
    setCustomActivities((c) => [...c, { ...newCustomActivity, path: url } as any]);
    closeCustomActivityModal();
  };

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
              bg={activity.color || `white`}
              color={activity.color ? (isColorLight(activity.color) ? `#4d4b5f` : `#fff`) : `primary800`}
              _hover={{ filter: 'brightness(0.85)' }}
              onClick={() => setTargetCustomActivity(activity)}
            >
              <Flex align="center" gap="4px" fontWeight="500">
                <FiFileText />
                {activity.title}
              </Flex>
            </Flex>
          ))}
          {/* <Flex
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
            onClick={() => setNewCustomActivity({})}
          >
            <FaPlus />
            <Text fontSize="1rem">Adicionar atividade</Text>
          </Flex> */}
        </Grid>
      )}
      <SmallModal
        show={!!newCustomActivity}
        onConfirm={handleCustomActivity}
        onCancel={closeCustomActivityModal}
        onClose={closeCustomActivityModal}
        disableOkButton={!canEdit}
        size="2xl"
      >
        {!!newCustomActivity?.id && (
          <Flex justify="flex-end" m="-0.5rem 1.5rem 0">
            <Flex
              align="center"
              justify="center"
              color="primary500"
              border="1px"
              borderColor="gray300"
              p=".35rem .35rem .38rem .38rem"
              cursor="pointer"
              borderRadius="50%"
              transition="0.1s"
              _hover={{
                borderColor: `primary500`,
              }}
              onClick={() => canEdit && setCustomActivities((c) => c.filter((e) => e.id !== newCustomActivity.id))}
            >
              <FaRegTrashCan fontSize="1rem" />
            </Flex>
          </Flex>
        )}
        <Flex direction="column" gap="1rem" flex="1">
          <TextInput
            isDisabled={!canEdit}
            flex="1"
            label="Título"
            placeholder="Informe o título da atividade"
            _placeholder={{ fontSize: '14px' }}
            error={newCustomActivity?.error}
            value={newCustomActivity?.title || ``}
            onInputChange={(value) => setNewCustomActivity((e) => (e ? { ...e, title: value } : null))}
          />
          <Flex align="center" justify="space-between" w="100%">
            <FileInput onChange={(files) => setNewCustomActivity((e) => (e ? { ...e, file: files[0] } : null))} multiple={false} />
            <Flex gap="1rem" align="center" mb="0.45rem">
              <ColorPicker
                onChange={(value) => setNewCustomActivity((e) => (e ? { ...e, color: value } : null))}
                enableInput={false}
                color={newCustomActivity?.color}
              />
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
            file={targetCustomActivity?.path}
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
              onClick={() => targetCustomActivity && downloadFile(targetCustomActivity.file as any, targetCustomActivity.title)}
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
