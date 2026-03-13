import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Flex,
  Grid,
  Image,
  Modal,
  ModalContent,
  Spinner,
  Text,
  useUpdateEffect,
} from '@chakra-ui/react';
import { FiChevronLeft, FiDownload, FiFileText } from 'react-icons/fi';
import { ContentState, EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { EditorProps } from 'react-draft-wysiwyg';

import { createHubGroupActivitySchema, ICreateHubGroupActivityDTO, IHubGroup, IHubGroupActivity } from '@/_base/interfaces/group';
import { ITempFile } from '@/_base/interfaces/shared';
import { SmallModal } from '@/components/Modal/Small';
import { FaPlus, FaRegTrashCan } from 'react-icons/fa6';
import { TextInput } from '@/components/Inputs/Text';
import { useAsyncCallback, useAuth, useInputHandler } from '@/_base/hooks';
import { ColorPicker } from '@/components/ColorPicker';
import { FileInput, useFileInput } from '@/components/Inputs/File';
import { formatShortName, isColorLight } from '@/_base/utils';
import { BiLeftArrowAlt } from 'react-icons/bi';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { addGroupActivity, removeGroupActivity } from '@/_base/services/group';
import { IHubProjectStep } from '@/_base/interfaces/project';
import { SelectInput } from '@/components/Inputs/Select';
import { FileIcon } from '@/components/FileIcon';

const Editor = dynamic<EditorProps>(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), { ssr: false });
interface IProps {
  group: IHubGroup;
  setGroup: Dispatch<SetStateAction<IHubGroup>>;
  canEdit: boolean;
  setActivityFiles: Dispatch<SetStateAction<ITempFile[]>>;
}

// Utilitário para identificar o tipo do arquivo pela URL
const getFileType = (url?: string) => {
  if (!url) return 'unsupported';
  const extension = url.split(/[#?]/)[0].split('.').pop()?.toLowerCase();

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension!)) return 'image';
  if (['mp4', 'webm', 'ogg', 'mov'].includes(extension!)) return 'video';
  if (['pdf'].includes(extension!)) return 'pdf';
  // if (['txt', 'csv', 'md'].includes(extension!)) return 'text';

  return 'unsupported';
};

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
  const [activityToRemove, setActivityToRemove] = useState<IHubGroupActivity | null>(null);

  const cancelRef = useRef<any>();
  const { clearFileList } = useFileInput();
  const { user } = useAuth();
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

      newActivity.user = user;

      setCustomActivities((c) => [...c, newActivity]);
      closeCustomActivityModal();
    },
    [data],
    true,
    () => setIsLoading(false),
  );

  const handleRemoveActivity = useAsyncCallback(async () => {
    if (!activityToRemove) return;
    setIsLoading(true);
    await removeGroupActivity(activityToRemove.id);
    setCustomActivities((c) => c.filter((a) => a.id !== activityToRemove.id));
    setActivityToRemove(null);
    setIsLoading(false);
  }, [activityToRemove]);

  const downloadFile = (file: string, title: string) => {
    // Correção: Pega a extensão real ao invés de forçar .pdf
    const extension = file.split(/[#?]/)[0].split('.').pop()?.toLowerCase() || 'bin';
    const link = document.createElement('a');
    link.setAttribute(`target`, `_blank`);
    link.href = file;
    link.download = `${title}.${extension}`;
    link.click();
    setTargetCustomActivity(null);
  };

  // Nova Lógica de Abertura da Atividade
  const handleOpenActivity = (activity: IHubGroupActivity) => {
    const type = getFileType(activity.file_url);
    if (type === 'unsupported') {
      downloadFile(activity.file_url, activity.title);
      setTargetCustomActivity(null);
    } else {
      setTargetCustomActivity(activity);
      setIsLoading(true);
    }
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
              key={activity.id}
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
              onClick={() => handleOpenActivity(activity)}
            >
              <Flex align="center" gap="4px" direction="column" justify="space-between" h="100%">
                <Flex align="center" gap="4px" fontWeight="500" position="relative" w="100%">
                  {/* <FiFileText /> */}
                  <FileIcon
                    fileName={activity.file_url}
                    color={activity.metadata.color ? (isColorLight(activity.metadata.color) ? `#4d4b5f` : `#fff`) : `primary800`}
                    size="1.2rem"
                  />
                  <Text mr="1rem" noOfLines={2}>
                    {activity.title.concat(`.${activity.file_url.split(/[#?]/)[0].split('.').pop()?.toLowerCase()}`)}
                  </Text>
                  {/* Só aparece se for o criador da atividade ou do grupo */}
                  {(user.id === activity.hub_user_id || user.id === group.hub_user_id) && (
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
                      borderRadius="sm"
                      transition="0.1s"
                      _hover={{
                        borderColor: `primary500`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivityToRemove(activity);
                      }}
                    >
                      <FaRegTrashCan fontSize="1rem" />
                    </Flex>
                  )}
                </Flex>
                <Flex flex="1" w="100%" align="end" pb="0.5rem">
                  {activity.metadata.project_activity_parent && (
                    <Text fontSize="0.75rem">{`${group.project?.title} - ${activity.metadata.project_activity_parent}`}</Text>
                  )}
                </Flex>
                <Flex justify="space-between" w="100%">
                  <Text fontSize="0.75rem">{formatShortName(activity.user.name, true)}</Text>

                  <Text fontSize="0.75rem">
                    {new Date(activity.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                    })}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          ))}
          {/* // Card de Adicionar Atividade - Só aparece para membros do grupo ou criador */}
          {(group.students.find((s) => s.id === user.id) || user.id === group.hub_user_id) && (
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
          )}
        </Grid>
      )}
      {/* MODAL DE CRIAÇÃO DE ATIVIDADE CUSTOMIZADA */}
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
            options={group.project?.project?.metadata.steps?.map((e) => ({ label: `${e.parent} - ${e.title}`, value: JSON.stringify(e) }))}
            onSelectChange={([value]) => setTargetProjectStep(value ? JSON.parse(value) : null)}
            placeholder="Selecione uma etapa do projeto (opcional)"
            isMultiSelect={false}
            maxMenuHeight={200}
            styles={{ menu: (provided: any) => ({ ...provided, zIndex: 9999 }) }}
          />

          <Flex align="center" justify="space-between" w="100%">
            <Flex direction="column" overflow="hidden">
              <FileInput
                onChange={(files) => {
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

      {/* Modal Universal de Arquivos */}
      <Modal isOpen={!!targetCustomActivity} onClose={() => setTargetCustomActivity(null)} size="full" scrollBehavior="inside">
        <ModalContent display="flex" alignItems="center" justifyContent="center" bg="#eeefff" overflow="hidden auto" position="relative">
          {isLoading && (
            <Flex align="center" justify="center" position="absolute" inset="0" bg="#eeefff" zIndex={2} direction="column">
              <Image src="/loading/rocket-picode.gif" h="19rem" alt="Carregando" />
              <Spinner size="lg" />
            </Flex>
          )}

          {targetCustomActivity && (
            <Flex w="100%" h="100vh" align="center" justify="center">
              {getFileType(targetCustomActivity.file_url) === 'image' && (
                <Image
                  src={targetCustomActivity.file_url}
                  alt={targetCustomActivity.title}
                  objectFit="contain"
                  maxH="100vh"
                  w="100%"
                  onLoad={() => setIsLoading(false)}
                />
              )}

              {getFileType(targetCustomActivity.file_url) === 'video' && (
                <video
                  src={targetCustomActivity.file_url}
                  controls
                  autoPlay
                  style={{ maxHeight: '100vh', width: '100%', outline: 'none' }}
                  onLoadedData={() => setIsLoading(false)}
                />
              )}

              {['pdf', 'text'].includes(getFileType(targetCustomActivity.file_url)) && (
                <iframe
                  src={targetCustomActivity.file_url}
                  title={targetCustomActivity.title}
                  style={{ width: '100%', height: '100vh', border: 'none' }}
                  onLoad={() => setIsLoading(false)}
                />
              )}
            </Flex>
          )}

          <Button
            id="back-button-custom-activity"
            onClick={() => setTargetCustomActivity(null)}
            position="fixed"
            top="4rem"
            left="2rem"
            zIndex={9999}
            bg="primary700"
            color="white"
            colorScheme="blue"
            p="1rem 1rem 1rem 0.5rem"
            leftIcon={<BiLeftArrowAlt fontSize="1.5rem" />}
            boxShadow="md"
          >
            Voltar
          </Button>

          <Flex direction="column" gap="0.5rem" position="fixed" top="4rem" right="2rem" zIndex={9999}>
            <Button
              bg="primary700"
              color="white"
              colorScheme="blue"
              gap="0.5rem"
              p="0.5rem 1rem"
              boxShadow="md"
              onClick={() => targetCustomActivity && downloadFile(targetCustomActivity.file_url, targetCustomActivity.title)}
            >
              <FiDownload fontSize="1.5rem" />
              Baixar Arquivo
            </Button>
          </Flex>
        </ModalContent>
      </Modal>

      {/* COFIRM DELETE MODAL */}
      <AlertDialog isOpen={!!activityToRemove} leastDestructiveRef={cancelRef} onClose={() => setActivityToRemove(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Atividade
            </AlertDialogHeader>

            <AlertDialogBody>Você tem certeza que deseja remover essa atividade?</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setActivityToRemove(null)}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleRemoveActivity} ml={3} isLoading={isLoading}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
};
