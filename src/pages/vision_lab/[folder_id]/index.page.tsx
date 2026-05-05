import { GetServerSideProps } from 'next';
import { FaPlus } from 'react-icons/fa';

import { cookieManager } from '@/_base/utils';
import { Flex, Skeleton, Text } from '@chakra-ui/react';
import { useAsyncCallback, useAuth, useCustomRouter, useCustomToast } from '@/_base/hooks';
import { useEffect, useState } from 'react';
import { SmallModal } from '@/components/Modal/Small';
import { IHubUser } from '@/_base/interfaces/user';
import { listRelatedUsers } from '@/_base/services/user';
import { TextInput } from '@/components/Inputs/Text';
import { BrainCircuit, Globe, Lock, Trash2 } from 'lucide-react';
import moment from 'moment';
import { InternalPageHeader } from '@/components/InternalPageHeader';
import { InternalCard } from '@/components/InternalCard';
import { createVisionLabProject, getVisionLabFolder, removeVisionLabProject } from '@/_base/services/visionLab';
import { IVisionLabProject } from '@/_base/interfaces/visionLab/IVisionLabProject';
import { IVisionLabFolder } from '@/_base/interfaces/visionLab/IVisionLabFolder';

interface IProps {
  folderId: string;
}

const VisionLabProjects: React.FC<IProps> = ({ folderId }) => {
  const [targetFolder, setTargetFolder] = useState<IVisionLabFolder | null>(null);
  const [targetProjectToRemove, setTargetProjectToRemove] = useState<IVisionLabProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newProjectName, setNewProjectName] = useState<string | null>(null);

  const toast = useCustomToast();
  const router = useCustomRouter();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [projectFolder] = await Promise.all([getVisionLabFolder(folderId)]);
        setTargetFolder(projectFolder);
      } catch {
        toast({ status: `error`, description: `Não foi possível listar as pastas disponíveis no momento` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const onCloseModal = () => {
    setTargetProjectToRemove(null);
  };

  const handleRemoveProject = useAsyncCallback(
    async () => {
      if (!targetProjectToRemove) return;
      setIsLoading(true);
      await removeVisionLabProject(targetProjectToRemove.id);
      setTargetFolder((f) => ({ ...(f || ({} as any)), projects: f?.projects.filter((p) => p.id !== targetProjectToRemove.id) || [] }));
      onCloseModal();
    },
    [targetProjectToRemove],
    true,
    () => setIsLoading(false),
  );

  const handleCreateProject = useAsyncCallback(
    async () => {
      if (!newProjectName) {
        toast({ status: 'error', description: 'O nome do projeto não pode ser vazio' });
        return;
      }
      setIsLoading(true);
      const newProject = await createVisionLabProject({
        folder_id: folderId,
        name: newProjectName || 'Novo projeto',
      });
      router.push(`/vision_lab/${folderId}/${newProject.id}?_p=${newProject.name}`);
      setNewProjectName(null);
      toast({
        status: 'success',
        position: `top`,
        duration: 5000,
        description: 'Redirecionando você para o novo projeto',
        title: `Projeto criado com sucesso!`,
      });
    },
    [],
    true,
    () => setIsLoading(false),
  );

  return (
    <Flex flex="1" direction="column" gap="20px" textAlign="left" whiteSpace="nowrap">
      <InternalPageHeader
        title={targetFolder?.name || `Projetos`}
        description={`${targetFolder?.projects.length || `0`} ${targetFolder?.projects.length === 1 ? 'projeto' : 'projetos'}`}
        buttons={[{ label: `Novo projeto`, leftIcon: <FaPlus />, onClick: () => setNewProjectName(``) }]}
      />

      <Skeleton
        display={{ base: `grid`, sm: 'grid' }}
        minH="calc(100% - 2rem)"
        isLoaded={!isLoading}
        gap="1rem"
        gridTemplateColumns={{ base: 'repeat(auto-fill, minmax(150px, 1fr))', sm: 'repeat(auto-fill, minmax(290px, 1fr))' }}
        gridTemplateRows={{ base: undefined, sm: 'minmax(min-content, max-content)' }}
        gridAutoRows={{ base: '200px', sm: `max-content` }}
        rowGap={{ base: `1rem`, sm: `3rem`, md: `1rem` }}
        borderRadius="md"
        flex="1"
        pt="1rem"
      >
        {targetFolder?.projects?.length ? (
          targetFolder.projects.map((project, index) => (
            <InternalCard
              minH="200px"
              key={project.id}
              index={index}
              onClick={() => router.push(`/vision_lab/${folderId}/${project.id}?_p=${project.name}`)}
              title={project.name}
              Icon={BrainCircuit}
              actions={[{ label: `Remover`, onClick: () => setTargetProjectToRemove(project), Icon: Trash2, important: true }]}
              footer={
                <div className="flex items-center justify-between gap-2 flex-1">
                  <p className="text-[11px] text-muted-foreground/70 truncate">{moment(project.updated_at).fromNow()}</p>
                  {(() => {
                    const isPrivate = project.privacy_mode === `private`;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          isPrivate
                            ? 'bg-foreground/10 text-foreground border-foreground/20'
                            : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400'
                        }`}
                        title={isPrivate ? 'Projeto publicado — visível apenas para você' : 'Projeto público — visível para todos'}
                      >
                        {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                        {isPrivate ? 'PRIVADO' : 'PÚBLICO'}
                      </span>
                    );
                  })()}
                </div>
              }
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground mt-10">
            <BrainCircuit className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground/70">Lista vazia</p>
            <p className="text-sm">Crie um novo projeto para começar sua experiência.</p>
          </div>
        )}
      </Skeleton>

      {/* Remove project modal */}
      <SmallModal
        show={!!targetProjectToRemove}
        topIcon="warning"
        onCancel={onCloseModal}
        onConfirm={handleRemoveProject}
        title="Atenção"
        okText="Confirmar"
        isLoading={isLoading}
      >
        <Flex direction="column" gap="1rem" mt="1rem">
          <Text fontSize="1rem" fontWeight="500" color="gray600">
            Tem certeza que deseja excluir o projeto <b>{targetProjectToRemove?.name}</b> ?
          </Text>
          <Text fontSize="1rem" fontWeight="500" color="gray600">
            Essa ação é <b>irreversível</b>.
          </Text>
        </Flex>
      </SmallModal>

      <SmallModal
        show={newProjectName !== null}
        topIcon="checked"
        onCancel={() => setNewProjectName(null)}
        onConfirm={handleCreateProject}
        title="Defina um nome para esse projeto"
        okText="Confirmar"
        isLoading={isLoading}
      >
        <Flex direction="column" gap="1rem" mt="1rem">
          <TextInput value={newProjectName || ''} onChange={(e) => setNewProjectName(e.target.value)} />
        </Flex>
      </SmallModal>
    </Flex>
  );
};

export default VisionLabProjects;

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  const selectedPage = 'vision_lab';

  cookieManager.updateToken(req);

  const folderId = query.folder_id || ``;
  const pageTitle = query._p || 'Vision Lab';

  return { props: { selectedPage, pageTitle, folderId } };
};
