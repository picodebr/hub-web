import { GetServerSideProps } from 'next';
import { FaPlus, FaRegFolder } from 'react-icons/fa';
import { FiEdit3, FiMoreVertical, FiTrash } from 'react-icons/fi';

import { Flex, Menu, MenuButton, MenuItem, MenuList, Skeleton, Text } from '@chakra-ui/react';
import { useAsyncCallback, useCustomRouter, useCustomToast, useInputHandler } from '@/_base/hooks';
import { PlusButton } from '@/components/Buttons/Plus';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { IProjectFolder } from '@/_base/interfaces/codeFolder/IProjectFolder';
import {
  createCodeProjectFolder,
  listCodeProjectFolders,
  removeCodeProjectFolder,
  updateCodeProjectFolder,
} from '@/_base/services/codeProjectFolder';
import { createCodeProjectFolderSchema } from '@/_base/interfaces/codeFolder/ICreateProjectFolderParams';
import { SmallModal } from '@/components/Modal/Small';
import { TextInput } from '@/components/Inputs/Text';
import { RiFolderSharedFill } from 'react-icons/ri';

const CodeFolders: React.FC = () => {
  const [folders, setFolders] = useState<IProjectFolder[]>([]);
  const [targetFolderToUpdate, setTargetFolderToUpdate] = useState<IProjectFolder | null>(null);
  const [targetFolderToRemove, setTargetFolderToRemove] = useState<IProjectFolder | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useCustomToast();
  const router = useCustomRouter();
  const { data, errors, onInputChange, setData, submit } = useInputHandler({ schema: createCodeProjectFolderSchema, data: { name: `` } });

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [{ results }] = await Promise.all([listCodeProjectFolders()]);
        setFolders(results);
      } catch {
        toast({ status: `error`, description: `Não foi possível listar as pastas disponíveis no momento` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const onCloseModal = () => {
    setOpenCreateModal(false);
    setTargetFolderToRemove(null);
    setTargetFolderToUpdate(null);
    setData({ name: `` });
  };

  const handleAddFolder = useAsyncCallback(
    async () => {
      setIsLoading(true);
      const newFolder = await createCodeProjectFolder(data);
      setFolders((f) => [newFolder, ...f]);
      onCloseModal();
    },
    [data],
    true,
    () => setIsLoading(false),
  );

  const handleUpdateFolder = useAsyncCallback(
    async () => {
      if (!targetFolderToUpdate) return;
      setIsLoading(true);
      const updatedFolder = await updateCodeProjectFolder({ id: targetFolderToUpdate.id, name: targetFolderToUpdate.name });
      setFolders((f) => f.map((folder) => (folder.id === updatedFolder.id ? { ...folder, ...updatedFolder } : folder)));
      onCloseModal();
    },
    [targetFolderToUpdate],
    true,
    () => setIsLoading(false),
  );

  const handleRemoveFolder = useAsyncCallback(
    async () => {
      if (!targetFolderToRemove) return;
      setIsLoading(true);
      await removeCodeProjectFolder(targetFolderToRemove.id);
      setFolders((f) => f.filter((folder) => folder.id !== targetFolderToRemove.id));
      onCloseModal();
    },
    [targetFolderToRemove],
    true,
    () => setIsLoading(false),
  );

  const getLastActivityFromFolder = (folder: IProjectFolder): string => {
    if (!folder.projects?.length) return folder.created_at;

    const lastActivity = folder.projects.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

    return lastActivity.updated_at;
  };

  return (
    <Flex flex="1" direction="column" gap="20px" textAlign="left" whiteSpace="nowrap" overflow="hidden">
      <Flex align="center" justify="flex-end" h="fit-content" gap="1rem">
        <PlusButton label="Compartilhados Comigo" leftIcon={<RiFolderSharedFill />} onClick={() => router.push(`/code/shared`)} />
        <PlusButton label="Nova Pasta" leftIcon={<FaPlus />} onClick={() => setOpenCreateModal(true)} />
      </Flex>
      <Skeleton
        display="grid"
        overflow="hidden auto"
        isLoaded={!isLoading}
        gap="1rem"
        gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))"
        gridTemplateRows="minmax(min-content, max-content)"
        borderRadius="md"
        flex="1"
      >
        {folders.length ? (
          folders.map((folder) => (
            <Flex
              key={folder.id}
              direction="column"
              bgColor="white"
              borderRadius="10px"
              padding="0.75rem 1rem 1rem"
              color="primary700"
              border="1px"
              h="12rem"
              justify="space-between"
              gap="0.5rem"
              borderColor="gray200"
              fontSize="18px"
              cursor="pointer"
              transition="all 0.1s"
              _hover={{ boxShadow: `md` }}
              onClick={() => router.push(`/code/${folder.id}?_p=${folder.name}`)}
            >
              <Flex gap="0.5rem" align="center">
                <FaRegFolder fontSize="29px" />
                <Text fontWeight="700" w="100%">
                  {folder.name}
                </Text>
                <Menu>
                  <MenuButton
                    onClick={(e) => e.stopPropagation()}
                    color="gray300"
                    p="0.45rem"
                    borderRadius="50%"
                    transition="0.1s"
                    _hover={{ bg: 'gray300', color: 'white' }}
                  >
                    <FiMoreVertical cursor="pointer" />
                  </MenuButton>
                  <MenuList borderColor="gray300" color="gray600">
                    <MenuItem
                      gap="0.5rem"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetFolderToUpdate(folder);
                      }}
                    >
                      <Flex color="gray400">
                        <FiEdit3 />
                      </Flex>
                      <Text fontSize="15px">Editar</Text>
                    </MenuItem>
                    <MenuItem
                      gap="0.5rem"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetFolderToRemove(folder);
                      }}
                    >
                      <Flex color="gray400">
                        <FiTrash />
                      </Flex>
                      <Text fontSize="15px">Remover</Text>
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="14px" fontWeight="400" color="gray500" gap="16px">
                  {moment(getLastActivityFromFolder(folder)).fromNow()}
                </Text>
                <Text fontSize="14px" fontWeight="400" color="gray500" gap="16px">
                  {`${folder.projects?.length || 0} ${folder.projects?.length === 1 ? 'projeto' : 'projetos'}`}
                </Text>
              </Flex>
            </Flex>
          ))
        ) : (
          <Flex flex="1" justify="center" pt="1rem">
            <Text fontSize="1rem" fontWeight="500" color="gray600">
              Lista vazia
            </Text>
          </Flex>
        )}
      </Skeleton>

      {/* only modals from here down */}

      {/* Create folder modal */}
      <SmallModal
        topIcon="checked"
        show={openCreateModal}
        onCancel={onCloseModal}
        onConfirm={() => submit(handleAddFolder)}
        title="Nova Pasta"
        okText="Adicionar"
        isLoading={isLoading}
      >
        <Flex direction="column" gap="1rem" mt="1rem">
          <Text fontSize="1rem" fontWeight="500" color="gray600">
            Dê um nome para a sua pasta de projetos do CODE
          </Text>
          <TextInput placeholder="Nome da pasta" value={data.name} onInputChange={(value) => onInputChange('name', value)} error={errors.name} />
        </Flex>
      </SmallModal>

      {/* Update folder modal */}
      <SmallModal
        topIcon="ray"
        show={!!targetFolderToUpdate}
        onCancel={onCloseModal}
        onConfirm={handleUpdateFolder}
        title="Editar pasta"
        okText="Salvar"
        isLoading={isLoading}
      >
        <Flex direction="column" gap="1rem" mt="1rem">
          <TextInput
            label="Nome da pasta"
            value={targetFolderToUpdate?.name}
            onInputChange={(name) => setTargetFolderToUpdate((e) => ({ ...(e || ({} as any)), name }))}
          />
        </Flex>
      </SmallModal>

      {/* Remove folder modal */}
      <SmallModal
        show={!!targetFolderToRemove}
        topIcon="warning"
        onCancel={onCloseModal}
        onConfirm={handleRemoveFolder}
        title="Atenção"
        okText="Confirmar"
        isLoading={isLoading}
      >
        <Flex direction="column" gap="1rem" mt="1rem">
          <Text fontSize="1rem" fontWeight="500" color="gray600">
            Tem certeza que deseja excluir a pasta <b>{targetFolderToRemove?.name}</b> ?
          </Text>
          <Text fontSize="1rem" fontWeight="500" color="gray600">
            Essa ação é <b>irreversível</b> e você perderá todos projetos dessa pasta.
          </Text>
        </Flex>
      </SmallModal>
    </Flex>
  );
};

export default CodeFolders;

export const getServerSideProps: GetServerSideProps = async () => {
  const selectedPage = 'code';

  return { props: { selectedPage, pageTitle: 'Meus códigos', showBackButton: false } };
};
