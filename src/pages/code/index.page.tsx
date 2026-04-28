import { GetServerSideProps } from 'next';
import { FaPlus, FaRegFolder } from 'react-icons/fa';
import { FiEdit3, FiMoreVertical, FiTrash } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
import { Code2, FolderOpen, MoreVertical, Pencil, Trash2 } from 'lucide-react';

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between mb-4 gap-4 px-2 mt-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Code2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <Text fontSize="28px">Meus Códigos</Text>
            <p className="text-sm text-muted-foreground mt-0.5 whitespace-normal">Organize seus projetos em pastas</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PlusButton label="Compartilhados Comigo" leftIcon={<RiFolderSharedFill />} onClick={() => router.push(`/code/shared`)} />
          <PlusButton label="Nova Pasta" leftIcon={<FaPlus />} onClick={() => setOpenCreateModal(true)} />
        </div>
      </motion.div>
      {/* Grid de Pastas */}
      <Skeleton isLoaded={!isLoading} className="flex-1 rounded-md overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 overflow-y-auto pb-8 px-2 content-start h-full pt-2">
          {folders.length ? (
            folders.map((folder, index) => {
              const gradient = FOLDER_GRADIENTS[index % FOLDER_GRADIENTS.length];
              return (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => router.push(`/code/${folder.id}?_p=${folder.name}`)}
                  className="group relative rounded-3xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer border border-border/50 bg-card flex flex-col h-[280px]"
                >
                  {/* Área do Gradiente Superior */}
                  <div className={`h-32 bg-gradient-to-br ${gradient} p-4 relative overflow-hidden shrink-0`}>
                    <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center ring-1 ring-white/30 shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <FolderOpen className="w-7 h-7 text-white" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 opacity-[0.12]"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                      backgroundSize: '14px 14px',
                    }}
                  />
                  {/* Conteúdo do Card */}
                  <div className="p-3 flex flex-col flex-1 relative bg-white dark:bg-zinc-900">
                    {/* Botão de Opções (Menu Chakra UI flutuante sobre a divisão) */}
                    <div className="absolute -top-11 right-3" onClick={(e) => e.stopPropagation()}>
                      <Menu>
                        <MenuButton
                          className="p-1.5 rounded-xl bg-background/80 backdrop-blur-md border border-border/50 opacity-0 group-hover:opacity-100 hover:bg-background transition-all shadow-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-5 h-5 text-foreground" />
                        </MenuButton>
                        <MenuList borderColor="gray.200" color="gray.600" minW="160px" borderRadius="xl" shadow="xl" p={2}>
                          <MenuItem
                            gap="0.5rem"
                            borderRadius="md"
                            _hover={{ bg: 'gray.100' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTargetFolderToUpdate(folder);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                            <Text fontSize="sm" fontWeight="500">
                              Editar
                            </Text>
                          </MenuItem>
                          <MenuItem
                            gap="0.5rem"
                            borderRadius="md"
                            _hover={{ bg: 'red.50' }}
                            color="red.500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTargetFolderToRemove(folder);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            <Text fontSize="sm" fontWeight="500">
                              Remover
                            </Text>
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </div>

                    <p className="font-semibold text-foreground text-xl mb-1 mt-0 truncate group-hover:text-primary transition-colors pr-8">
                      {folder.name}
                    </p>

                    <div className="mt-auto space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Última atividade</span>
                        <span className="font-medium text-foreground">{moment(getLastActivityFromFolder(folder)).fromNow()}</span>
                      </div>

                      <div className="h-px w-full bg-border/50" />

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Code2 className="w-4 h-4" />
                          Projetos
                        </span>
                        <span className="font-medium text-foreground bg-primary/10 text-primary px-2.5 py-0.5 rounded-md">
                          {folder.projects?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground mt-10">
              <FolderOpen className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-foreground/70">Lista vazia</p>
              <p className="text-sm">Crie uma nova pasta para organizar seus códigos.</p>
            </div>
          )}
        </div>
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
const FOLDER_GRADIENTS = [
  'from-sky-400 to-blue-600',
  'from-violet-400 to-purple-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-600',
  'from-pink-400 to-rose-600',
  'from-cyan-400 to-sky-600',
];
