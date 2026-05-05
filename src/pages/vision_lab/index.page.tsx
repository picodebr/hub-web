import { GetServerSideProps } from 'next';
import { FaPlus } from 'react-icons/fa';

import { Flex, Skeleton, Text } from '@chakra-ui/react';
import { useAsyncCallback, useCustomRouter, useCustomToast, useInputHandler } from '@/_base/hooks';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { SmallModal } from '@/components/Modal/Small';
import { TextInput } from '@/components/Inputs/Text';
import { BrainCircuit, FolderOpen, Layers, Pencil, Trash2 } from 'lucide-react';
import { InternalPageHeader } from '@/components/InternalPageHeader';
import { InternalCard } from '@/components/InternalCard';
import { createVisionLabFolder, getVisionLabFolders, removeVisionLabFolder, updateVisionLabFolder } from '@/_base/services/visionLab';
import { IVisionLabFolder } from '@/_base/interfaces/visionLab/IVisionLabFolder';
import { z } from 'zod';
import { zodSchemaErrors } from '@/_base/errors/zodSchemaErrors';

const VisionLabFolders: React.FC = () => {
  const [folders, setFolders] = useState<IVisionLabFolder[]>([]);
  const [targetFolderToUpdate, setTargetFolderToUpdate] = useState<IVisionLabFolder | null>(null);
  const [targetFolderToRemove, setTargetFolderToRemove] = useState<IVisionLabFolder | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useCustomToast();
  const router = useCustomRouter();
  const { data, errors, onInputChange, setData, submit } = useInputHandler({
    schema: z.object({
      name: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim(),
    }),
    data: { name: `` },
  });

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [{ results }] = await Promise.all([getVisionLabFolders()]);
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
      const newFolder = await createVisionLabFolder(data.name);
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
      const updatedFolder = await updateVisionLabFolder({ id: targetFolderToUpdate.id, name: targetFolderToUpdate.name });
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
      await removeVisionLabFolder(targetFolderToRemove.id);
      setFolders((f) => f.filter((folder) => folder.id !== targetFolderToRemove.id));
      onCloseModal();
    },
    [targetFolderToRemove],
    true,
    () => setIsLoading(false),
  );

  const getLastActivityFromFolder = (folder: IVisionLabFolder): string => {
    if (!folder.projects?.length) return folder.created_at;

    const lastActivity = folder.projects.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

    return lastActivity.updated_at;
  };

  return (
    <Flex flex="1" direction="column" gap="20px" textAlign="left" whiteSpace="nowrap" overflow="hidden">
      <InternalPageHeader
        title="Meus Projetos"
        description="Organize seus projetos em pastas"
        icon={<BrainCircuit className="w-6 h-6 text-primary" />}
        buttons={[{ label: `Nova Pasta`, leftIcon: <FaPlus />, onClick: () => setOpenCreateModal(true) }]}
      />

      {/* Grid de Pastas */}
      <Skeleton
        isLoaded={!isLoading}
        display="grid"
        overflow="hidden auto"
        gap="1rem"
        gridTemplateColumns={{ base: 'repeat(auto-fill, minmax(150px, 1fr))', sm: 'repeat(auto-fill, minmax(290px, 1fr))' }}
        gridTemplateRows="minmax(min-content, max-content)"
        borderRadius="md"
        flex="1"
      >
        {folders.length ? (
          folders.map((folder, index) => {
            return (
              <InternalCard
                key={folder.id}
                index={index}
                onClick={() => router.push(`/vision_lab/${folder.id}?_p=${folder.name}`)}
                title={folder.name}
                Icon={FolderOpen}
                actions={[
                  { label: `Editar`, onClick: () => setTargetFolderToUpdate(folder), Icon: Pencil },
                  { label: `Remover`, onClick: () => setTargetFolderToRemove(folder), Icon: Trash2, important: true },
                ]}
                footer={
                  <>
                    <p className="text-[11px] text-muted-foreground truncate flex-1 flex items-center gap-1.5">
                      <Layers className="w-3 h-3" />
                      {folder.projects?.length || `0`} {folder.projects?.length === 1 ? 'projeto' : 'projetos'}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60 shrink-0">{moment(getLastActivityFromFolder(folder)).fromNow()}</span>
                  </>
                }
                showFooterIcon
              />
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground mt-10">
            <FolderOpen className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground/70">Lista vazia</p>
            <p className="text-sm">Crie uma nova pasta para organizar seus projetos.</p>
          </div>
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

export default VisionLabFolders;

export const getServerSideProps: GetServerSideProps = async () => {
  const selectedPage = 'vision_lab';

  return { props: { selectedPage, pageTitle: 'Vision Lab', showBackButton: false } };
};
