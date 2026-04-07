import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Button,
  Flex,
  Grid,
  Image,
  Modal,
  ModalContent,
  Spinner,
  Text,
  useUpdateEffect,
  Icon,
  Box,
} from '@chakra-ui/react';
import { FiChevronLeft, FiDownload, FiFileText, FiLayers, FiFolder } from 'react-icons/fi';
import { ContentState, EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { EditorProps } from 'react-draft-wysiwyg';
import { motion } from 'framer-motion';

import {
  createHubGroupActivityCategorySchema,
  createHubGroupActivitySchema,
  ICreateHubGroupActivityCategoryDTO,
  ICreateHubGroupActivityDTO,
  IHubGroup,
  IHubGroupActivity,
  IHubGroupActivityCategory,
} from '@/_base/interfaces/group';
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
import { addGroupActivity, addGroupActivityCategory, removeGroupActivity, removeGroupActivityCategory } from '@/_base/services/group';
import { IHubProjectStep } from '@/_base/interfaces/project';
import { SelectInput } from '@/components/Inputs/Select';
import { FileIcon } from '@/components/FileIcon';
import { TextAreaInput } from '@/components/Inputs/TextArea';

const Editor = dynamic<EditorProps>(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), { ssr: false });

interface IProps {
  group: IHubGroup;
  setGroup: Dispatch<SetStateAction<IHubGroup>>;
  canEdit: boolean;
  setActivityFiles: Dispatch<SetStateAction<ITempFile[]>>;
}

const getFileType = (url?: string) => {
  if (!url) return 'unsupported';
  const extension = url.split(/[#?]/)[0].split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension!)) return 'image';
  if (['mp4', 'webm', 'ogg', 'mov'].includes(extension!)) return 'video';
  if (['pdf'].includes(extension!)) return 'pdf';
  return 'unsupported';
};

// Variáveis de animação do Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export const Activities: React.FC<IProps> = ({ group, setGroup, canEdit, setActivityFiles }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [openEditor, setOpenEditor] = useState(false);
  const [editorValue, setEditorValue] = useState<EditorState>(EditorState.createEmpty());
  const [contentIsMounted, setContentIsMounted] = useState(false);
  const [customActivities, setCustomActivities] = useState<IHubGroupActivity[]>(group.activities || []);
  const [customCategories, setCustomCategories] = useState<IHubGroupActivityCategory[]>(group.activity_categories || []);
  const [fileActivity, setFileActivity] = useState<File | null>(null);
  const [targetProjectStep, setTargetProjectStep] = useState<IHubProjectStep | null>(null);
  const [targetCustomActivity, setTargetCustomActivity] = useState<IHubGroupActivity | null>(null);
  const [targetCustomActivityCategory, setTargetCustomActivityCategory] = useState<IHubGroupActivityCategory | null>(null);
  const [activityToRemove, setActivityToRemove] = useState<IHubGroupActivity | null>(null);
  const [activityCategoryToRemove, setActivityCategoryToRemove] = useState<IHubGroupActivityCategory | null>(null);

  const cancelRef = useRef<any>();
  const { clearFileList } = useFileInput();
  const { user } = useAuth();

  const { errors, onInputChange, data, setData, setErrors, submit } = useInputHandler<ICreateHubGroupActivityDTO>({
    schema: createHubGroupActivitySchema,
  });
  const {
    errors: errorsCategory,
    onInputChange: onInputChangeCategory,
    data: dataCategory,
    setData: setDataCategory,
    setErrors: setErrorsCategory,
    submit: submitCategory,
  } = useInputHandler<ICreateHubGroupActivityCategoryDTO>({ schema: createHubGroupActivityCategorySchema });

  useEffect(() => {
    const content = EditorState.createWithContent(
      group.metadata.annotation ? convertFromRaw(JSON.parse(group.metadata.annotation)) : ContentState.createFromText(''),
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

  const closeModals = () => {
    setFileActivity(null);
    setTargetCustomActivity(null);
    setTargetCustomActivityCategory(null);
    clearFileList();
    setData({} as any);
    setErrors({} as any);
    setDataCategory({} as any);
    setErrorsCategory({} as any);
  };

  const handleCreateCustomActivity = useAsyncCallback(
    async () => {
      if (!fileActivity) return;
      setIsLoading(true);
      const response = await getPresignedUrl(fileActivity.type, 'groups');
      await uploadFile(response.link, fileActivity);
      const newActivity = await addGroupActivity({ ...data, file_url: response.path, metadata: { color: data.metadata?.color } });
      newActivity.user = user;
      setCustomActivities((c) => [...c, newActivity]);
      closeModals();
    },
    [data],
    true,
    () => setIsLoading(false),
  );

  const handleCreateCustomActivityCategory = useAsyncCallback(
    async () => {
      setIsLoading(true);
      const newCategory = await addGroupActivityCategory({
        ...dataCategory,
        metadata: {
          color: data.metadata?.color,
          project_activity_parent: targetProjectStep?.parent,
          project_activity_title: targetProjectStep?.title,
        },
      });
      newCategory.user = user;
      setCustomCategories((c) => [...c, newCategory]);
      closeModals();
    },
    [dataCategory],
    true,
    () => setIsLoading(false),
  );

  const handleRemoveActivity = useAsyncCallback(
    async () => {
      if (!activityToRemove) return;
      setIsLoading(true);
      await removeGroupActivity(activityToRemove.id);
      setCustomActivities((c) => c.filter((a) => a.id !== activityToRemove.id));
      setActivityToRemove(null);
    },
    [activityToRemove],
    true,
    () => setIsLoading(false),
  );

  const handleRemoveActivityCategory = useAsyncCallback(
    async () => {
      if (!activityCategoryToRemove) return;
      setIsLoading(true);
      await removeGroupActivityCategory(activityCategoryToRemove.id);
      setCustomCategories((c) => c.filter((a) => a.id !== activityCategoryToRemove.id));
      setActivityCategoryToRemove(null);
    },
    [activityCategoryToRemove],
    true,
    () => setIsLoading(false),
  );

  const downloadFile = (file: string, title: string) => {
    const extension = file.split(/[#?]/)[0].split('.').pop()?.toLowerCase() || 'bin';
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.href = file;
    link.download = `${title}.${extension}`;
    link.click();
    setTargetCustomActivity(null);
  };

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
    <Flex direction="column" gap="32px" overflow={openEditor ? 'hidden' : 'auto'} flex="1" pb="2rem">
      {openEditor ? (
        // Editor Mode
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <Button
            leftIcon={<FiChevronLeft />}
            variant="ghost"
            colorScheme="blue"
            w="fit-content"
            mb="4"
            onClick={() => setOpenEditor(false)}
            _hover={{ bg: 'blue.50' }}
          >
            Voltar para Atividades
          </Button>
          <Flex bg="white" flex="1" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.200" overflow="hidden" p="2">
            <Editor
              toolbar={{ image: { uploadEnabled: true, previewImage: true, uploadCallback } }}
              wrapperClassName="hub-editor-wrapper"
              editorClassName="hub-editor-content"
              editorState={editorValue}
              onEditorStateChange={setEditorValue}
            />
          </Flex>
        </motion.div>
      ) : (
        // Dashboard Mode
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* SESSÃO 1: Seções de Atividades */}
          {(customCategories.length || user.id === group.hub_user_id) && (
            <Flex direction="column" gap="1.5rem">
              <Flex align="center" gap="3">
                <Flex p="2" bg="blue.50" borderRadius="lg">
                  <Icon as={FiLayers} color="blue.500" boxSize="5" />
                </Flex>
                <Text fontSize="xl" fontWeight="700" color="gray.700">
                  Seções de atividades
                </Text>
              </Flex>

              <Grid gap="1.5rem" gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))">
                {customCategories.map((category) => (
                  <motion.div key={category.id} variants={itemVariants}>
                    <Flex
                      w="100%"
                      h="190px"
                      p="1.25rem"
                      direction="column"
                      justify="space-between"
                      borderRadius="xl"
                      cursor="pointer"
                      border="1px solid"
                      borderColor="blackAlpha.100"
                      bg={category.metadata.color || 'white'}
                      boxShadow="sm"
                      transition="all 0.3s cubic-bezier(.25,.8,.25,1)"
                      color={category.metadata.color ? (isColorLight(category.metadata.color) ? 'gray.800' : 'white') : 'gray.800'}
                      _hover={{ transform: 'translateY(-6px)', boxShadow: 'xl' }}
                      onClick={() => setTargetCustomActivityCategory(category)}
                      position="relative"
                      role="group"
                    >
                      <Flex direction="column" gap="2">
                        <Text fontWeight="600" fontSize="1.1rem" noOfLines={2} pr="8">
                          {category.title}
                        </Text>
                        {category.metadata.project_activity_parent && (
                          <Text fontSize="xs" opacity={0.8} fontWeight="500">
                            {`${group.project?.title} • ${category.metadata.project_activity_parent}`}
                          </Text>
                        )}
                      </Flex>

                      {(user.id === category.hub_user_id || user.id === group.hub_user_id) && (
                        <Flex
                          position="absolute"
                          top="1rem"
                          right="1rem"
                          align="center"
                          justify="center"
                          color="red.400"
                          bg="whiteAlpha.800"
                          backdropFilter="blur(4px)"
                          p="2"
                          borderRadius="full"
                          cursor="pointer"
                          opacity={0}
                          _groupHover={{ opacity: 1 }}
                          transition="all 0.2s"
                          _hover={{ bg: 'red.50', color: 'red.500', transform: 'scale(1.1)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivityCategoryToRemove(category);
                          }}
                        >
                          <FaRegTrashCan fontSize="1rem" />
                        </Flex>
                      )}

                      <Flex justify="space-between" align="center" borderTop="1px solid" borderColor="blackAlpha.100" pt="3" mt="auto">
                        <Flex align="center" gap="2">
                          <Avatar size="2xs" name={category.user.name} />
                          <Text fontSize="xs" fontWeight="500">
                            {formatShortName(category.user.name, true)}
                          </Text>
                        </Flex>
                        <Text fontSize="xs" opacity={0.7}>
                          {new Date(category.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </Text>
                      </Flex>
                    </Flex>
                  </motion.div>
                ))}

                {/* Botão Adicionar Seção */}
                {user.id === group.hub_user_id && (
                  <motion.div variants={itemVariants}>
                    <Flex
                      w="100%"
                      h="190px"
                      direction="column"
                      align="center"
                      justify="center"
                      gap="3"
                      borderRadius="xl"
                      border="2px dashed"
                      borderColor="gray.300"
                      bg="gray.50"
                      cursor="pointer"
                      color="gray.500"
                      transition="all 0.2s"
                      _hover={{ borderColor: 'primary.400', color: 'primary.500', bg: 'primary.50', transform: 'translateY(-2px)' }}
                      onClick={() => onInputChangeCategory('hub_group_id', group.id)}
                    >
                      <Flex bg="white" p="3" borderRadius="full" boxShadow="sm">
                        <FaPlus fontSize="1.5rem" />
                      </Flex>
                      <Text fontWeight="600" fontSize="0.9rem">
                        Nova Seção
                      </Text>
                    </Flex>
                  </motion.div>
                )}
              </Grid>
            </Flex>
          )}

          {/* SESSÃO 2: Arquivos Gerais */}
          <Flex direction="column" gap="1.5rem" mt="4">
            <Flex align="center" gap="3">
              <Flex p="2" bg="green.50" borderRadius="lg">
                <Icon as={FiFolder} color="green.500" boxSize="5" />
              </Flex>
              <Text fontSize="xl" fontWeight="700" color="gray.700">
                Arquivos gerais
              </Text>
            </Flex>

            <Grid gap="1.5rem" gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))">
              {/* Card Fixo: Anotações Gerais */}
              <motion.div variants={itemVariants}>
                <Flex
                  w="100%"
                  h="190px"
                  p="1.25rem"
                  direction="column"
                  justify="center"
                  align="center"
                  gap="4"
                  bg="white"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.200"
                  boxShadow="sm"
                  cursor="pointer"
                  transition="all 0.3s cubic-bezier(.25,.8,.25,1)"
                  _hover={{ transform: 'translateY(-6px)', boxShadow: 'xl', borderColor: 'primary.200' }}
                  onClick={() => setOpenEditor(true)}
                >
                  <Flex bg="primary.50" color="primary.500" p="4" borderRadius="full">
                    <FiFileText fontSize="2rem" />
                  </Flex>
                  <Text fontWeight="600" color="gray.700">
                    Anotações Gerais
                  </Text>
                </Flex>
              </motion.div>

              {customActivities
                .filter((e) => !e.hub_group_activity_category_id)
                .map((activity) => (
                  <motion.div key={activity.id} variants={itemVariants}>
                    <Flex
                      w="100%"
                      h="190px"
                      p="1.25rem"
                      direction="column"
                      justify="space-between"
                      borderRadius="xl"
                      cursor="pointer"
                      border="1px solid"
                      borderColor="blackAlpha.100"
                      bg={activity.metadata.color || 'white'}
                      boxShadow="sm"
                      transition="all 0.3s"
                      color={activity.metadata.color ? (isColorLight(activity.metadata.color) ? 'gray.800' : 'white') : 'gray.800'}
                      _hover={{ transform: 'translateY(-6px)', boxShadow: 'xl' }}
                      onClick={() => handleOpenActivity(activity)}
                      position="relative"
                      role="group"
                    >
                      <Flex direction="column" gap="3">
                        <Flex align="center" gap="3">
                          <Box bg="whiteAlpha.500" p="2" borderRadius="md">
                            <FileIcon
                              fileName={activity.file_url}
                              size="1.5rem"
                              color={activity.metadata.color ? (isColorLight(activity.metadata.color) ? 'gray.800' : 'white') : 'primary.500'}
                            />
                          </Box>
                          <Text fontWeight="600" fontSize="1rem" noOfLines={2} pr="6">
                            {activity.title}
                          </Text>
                        </Flex>
                      </Flex>

                      {(user.id === activity.hub_user_id || user.id === group.hub_user_id) && (
                        <Flex
                          position="absolute"
                          top="1rem"
                          right="1rem"
                          align="center"
                          justify="center"
                          color="red.400"
                          bg="whiteAlpha.800"
                          backdropFilter="blur(4px)"
                          p="2"
                          borderRadius="full"
                          cursor="pointer"
                          opacity={0}
                          _groupHover={{ opacity: 1 }}
                          transition="all 0.2s"
                          _hover={{ bg: 'red.50', color: 'red.500', transform: 'scale(1.1)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivityToRemove(activity);
                          }}
                        >
                          <FaRegTrashCan fontSize="1rem" />
                        </Flex>
                      )}

                      <Flex justify="space-between" align="center" borderTop="1px solid" borderColor="blackAlpha.100" pt="3" mt="auto">
                        <Flex align="center" gap="2">
                          <Avatar size="2xs" src={activity.user.avatar || undefined} name={activity.user.name} />
                          <Text fontSize="xs" fontWeight="500">
                            {formatShortName(activity.user.name, true)}
                          </Text>
                        </Flex>
                        <Text fontSize="xs" opacity={0.7}>
                          {new Date(activity.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </Text>
                      </Flex>
                    </Flex>
                  </motion.div>
                ))}

              {/* Botão Adicionar Arquivo */}
              {(group.students.find((s) => s.id === user.id)?.group_role === 'Social Media' || user.id === group.hub_user_id) && (
                <motion.div variants={itemVariants}>
                  <Flex
                    w="100%"
                    h="190px"
                    direction="column"
                    align="center"
                    justify="center"
                    gap="3"
                    borderRadius="xl"
                    border="2px dashed"
                    borderColor="gray.300"
                    bg="gray.50"
                    cursor="pointer"
                    color="gray.500"
                    transition="all 0.2s"
                    _hover={{ borderColor: 'green.400', color: 'green.500', bg: 'green.50', transform: 'translateY(-2px)' }}
                    onClick={() => onInputChange('hub_group_id', group.id)}
                  >
                    <Flex bg="white" p="3" borderRadius="full" boxShadow="sm">
                      <FaPlus fontSize="1.5rem" />
                    </Flex>
                    <Text fontWeight="600" fontSize="0.9rem">
                      Novo Arquivo
                    </Text>
                  </Flex>
                </motion.div>
              )}
            </Grid>
          </Flex>
        </motion.div>
      )}

      {/* MODAL DE CRIAÇÃO DE ATIVIDADE CUSTOMIZADA */}
      <SmallModal
        title="Upload de Arquivo"
        show={!!data.hub_group_id}
        onConfirm={() => submit(handleCreateCustomActivity)}
        onCancel={closeModals}
        onClose={closeModals}
        disableOkButton={!canEdit}
        size="2xl"
        isLoading={isLoading}
        topIcon="checked"
      >
        <Flex direction="column" gap="1rem" flex="1" minH="12rem">
          <TextInput
            isDisabled={!canEdit}
            flex="1"
            label="Título"
            placeholder="Informe o título do arquivo"
            _placeholder={{ fontSize: '14px' }}
            error={errors?.title}
            value={data?.title || ``}
            onInputChange={(value) => onInputChange(`title`, value)}
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

      {/* MODAL DE CRIAÇÃO DE CATEGORIA CUSTOMIZADA */}
      <SmallModal
        title="Criar Seção de Atividade"
        show={!!dataCategory.hub_group_id}
        onConfirm={() => submitCategory(handleCreateCustomActivityCategory)}
        onCancel={closeModals}
        onClose={closeModals}
        disableOkButton={!canEdit}
        size="2xl"
        isLoading={isLoading}
        topIcon="checked"
      >
        <Flex direction="column" gap="1rem" flex="1" minH="22rem">
          <TextInput
            isDisabled={!canEdit}
            flex="1"
            label="Título"
            placeholder="Informe o título da atividade"
            _placeholder={{ fontSize: '14px' }}
            error={errorsCategory?.title}
            value={dataCategory?.title || ``}
            onInputChange={(value) => onInputChangeCategory(`title`, value)}
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

          <TextAreaInput
            isDisabled={!canEdit}
            flex="1"
            label="Descrição"
            placeholder="Informe a descrição da atividade"
            _placeholder={{ fontSize: '14px' }}
            error={errorsCategory?.description}
            value={dataCategory?.description || ``}
            onInputChange={(value) => onInputChangeCategory(`description`, value)}
          />
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

      {/* MODAL DE VISUALIZAÇÃO DE CATEGORIA */}
      <SmallModal
        show={!!targetCustomActivityCategory}
        onConfirm={() => {
          onInputChange(`hub_group_id`, group.id);
          onInputChange(`hub_group_activity_category_id`, targetCustomActivityCategory?.id || '');
        }}
        onCancel={closeModals}
        okText="Adicionar arquivo"
        cancelText="Sair"
        onClose={closeModals}
        disableOkButton={!canEdit}
        size="2xl"
        isLoading={isLoading}
      >
        <Flex direction="column" gap="1rem" flex="1" minH="12rem" overflow="hidden">
          <Text fontSize="1.5rem" fontWeight="600">
            {targetCustomActivityCategory?.title}
          </Text>
          <Text>{targetCustomActivityCategory?.description}</Text>

          <Flex direction="column" gap="1rem" overflowY="auto" maxH="40vh">
            {customActivities
              .filter((e) => e.hub_group_activity_category_id === targetCustomActivityCategory?.id)
              .map((activity) => (
                <Flex
                  key={activity.id}
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
                  w="100%"
                  onClick={() => handleOpenActivity(activity)}
                >
                  <Flex align="center" gap="4px" direction="column" justify="space-between" h="100%" minH="5rem" maxH="5rem" w="100%">
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

                    <Flex justify="space-between" w="100%">
                      <Flex align="center" gap="0.5rem">
                        <Avatar src={activity.user.avatar || undefined} size="xs" />

                        <Text fontSize="0.75rem">{formatShortName(activity.user.name, true)}</Text>
                      </Flex>

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
          </Flex>
        </Flex>
      </SmallModal>

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

      {/* COFIRM DELETE MODAL */}
      <AlertDialog isOpen={!!activityCategoryToRemove} leastDestructiveRef={cancelRef} onClose={() => setActivityCategoryToRemove(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Atividade
            </AlertDialogHeader>

            <AlertDialogBody>Você tem certeza que deseja remover essa atividade?</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setActivityCategoryToRemove(null)}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleRemoveActivityCategory} ml={3} isLoading={isLoading}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
};
