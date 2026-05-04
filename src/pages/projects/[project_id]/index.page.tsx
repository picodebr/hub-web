import { GetServerSideProps } from 'next';
import { MdWarning, MdArrowBack } from 'react-icons/md';
import { Flex, Text, Badge } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import axios from 'axios';

import { logError, cookieManager } from '@/_base/utils';
import { addProjectAnnotation, getProject, removeProjectAnnotation, updateProject } from '@/_base/services/project';
import { IAddProjectAnnotationParams, IProject } from '@/_base/interfaces/project';
import { getBnccSkills } from '@/_base/services/user';
import { IBnccSkill } from '@/_base/interfaces/shared/IBnccSkill';
import { About } from './components/About';
import { Annotations } from './components/Annotations';
import { Groups } from './components/Groups';
import { BnccSkills } from './components/BnccSkills';
import { ProjectPhotos } from './components/ProjectPhotos';
import { GenericButton } from '@/components/Buttons/Generic';
import { useAsyncCallback, useAuth, useCustomToast, useCustomRouter } from '@/_base/hooks';
import { getPresignedUrl } from '@/_base/services/upload';
import { IUpdateProjectParams } from '@/_base/interfaces/project';
import { ICreateHubGroupParams, IHubGroup } from '@/_base/interfaces/group';
import { acceptGroup, addGroupToProject, removeGroup } from '@/_base/services/group';
import { Activities } from './components/Activities';
import { ClassProjectMetadataReward } from '@/_base/interfaces/project/IClassProjectMetadata';
import { giveCashback } from '@/_base/services/project/giveCashback';

interface IProps {
  project: IProject;
  bnccSkills: IBnccSkill[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  stopped: { label: 'Não iniciado', color: 'gray' },
  running: { label: 'Em andamento', color: 'blue' },
  finished: { label: 'Finalizado', color: 'green' },
};

const ProjectPage: React.FC<IProps> = ({ project: hubProject, bnccSkills }) => {
  const [savedProject, setSavedProject] = useState<IProject>(hubProject);
  const [project, setProject] = useState<IProject>(hubProject);
  const [files, setFiles] = useState<File[]>([]);

  const toast = useCustomToast();
  const { user } = useAuth();
  const router = useCustomRouter();

  const canEdit = user.id === hubProject.user_id;
  const needSave = useMemo<boolean>(() => JSON.stringify(project) !== JSON.stringify(savedProject) || !!files.length, [project, savedProject, files]);

  const statusInfo = statusLabels[project.status] || statusLabels.stopped;

  const handleSave = useAsyncCallback(async (newProject?: IProject, newRewards?: Record<string, ClassProjectMetadataReward[]>) => {
    const _project = newProject || project;
    const dto: IUpdateProjectParams = {
      id: _project.id,
      title: _project.title,
      description: _project.description || undefined,
      metadata: _project.metadata,
    };
    if (files.length) {
      const fileData = await Promise.all(files.map((f) => getPresignedUrl(f.type || '', 'user_projects')));

      await Promise.all(
        fileData.map((e, i) =>
          axios.put(e.link, files[i] as any, {
            headers: { 'Content-Type': (files[i] as any).type },
          }),
        ),
      );

      (dto.metadata as any).attachments = [...(dto.metadata?.attachments || []), ...fileData.map((e) => e.path)];
    }

    const updatedProject = await updateProject(dto);

    if (newRewards) await giveCashback(hubProject.id, { rewards: newRewards });

    setProject((p) => ({ ...p, ...updatedProject, hub_class: p.hub_class, educator: p.educator }));
    setSavedProject((p) => ({ ...p, ...updatedProject, hub_class: p.hub_class, educator: p.educator }));
    toast({ status: 'success', description: 'Projeto salvo' });
  }, []);

  const handleAddAnnotation = useAsyncCallback(async (dto: IAddProjectAnnotationParams) => {
    const annotation = await addProjectAnnotation(dto);

    setProject((e) => ({ ...e, annotations: [annotation, ...e.annotations] }));
    setSavedProject((e) => ({ ...e, annotations: [annotation, ...e.annotations] }));
  }, []);

  const handleRemoveAnnotation = useAsyncCallback(async (id: string) => {
    await removeProjectAnnotation(id);

    setProject((e) => ({ ...e, annotations: e.annotations.filter((a) => a.id !== id) }));
    setSavedProject((e) => ({ ...e, annotations: e.annotations.filter((a) => a.id !== id) }));
  }, []);

  const handleManagePendingGroup = useAsyncCallback(async (group: IHubGroup, accept: boolean) => {
    if (accept) {
      const updatedGroup = await acceptGroup(group.id);
      setProject((p) => ({ ...p, groups: p.groups.map((g) => (g.id === group.id ? { ...g, approved_at: updatedGroup.approved_at } : g)) }));
      setSavedProject((p) => ({ ...p, groups: p.groups.map((g) => (g.id === group.id ? { ...g, approved_at: updatedGroup.approved_at } : g)) }));
    } else {
      await removeGroup(group.id);
      setProject((p) => ({ ...p, groups: p.groups.filter((g) => g.id !== group.id) }));
      setSavedProject((p) => ({ ...p, groups: p.groups.filter((g) => g.id !== group.id) }));
    }
  }, []);

  const handleAddGroup = useAsyncCallback(async (data: ICreateHubGroupParams) => {
    const newGroup = await addGroupToProject(data);
    setProject((p) => ({ ...p, groups: [newGroup, ...p.groups] }));
    setSavedProject((p) => ({ ...p, groups: [newGroup, ...p.groups] }));
    toast({ status: `success`, description: `Grupo adicionado` });
  }, []);

  return (
    <Flex direction="column" w="100%" h="100%" gap="24px" pb="40px" overflow="auto" px="20px" pt="20px">
      {/* Header com botão de volta, nome, status e turma */}
      <Flex justify="space-between" align="flex-start" pb="16px" borderBottom="1px" borderColor="gray300" gap="16px">
        <Flex direction="column" gap="8px" flex="1">
          <Flex align="center" gap="12px">
            <GenericButton
              label=""
              w="32px"
              h="32px"
              p="0"
              bg="white"
              color="gray700"
              border="1px"
              borderColor="gray300"
              leftIcon={<MdArrowBack size="20px" />}
              onClick={() => router.back()}
              _hover={{ bg: 'gray100', borderColor: 'gray400' }}
            />
            <Text fontSize="24px" fontWeight="700" color="gray900">
              {project.title}
            </Text>
          </Flex>
          <Flex align="center" gap="12px">
            <Badge colorScheme={statusInfo.color} fontSize="12px">
              {statusInfo.label}
            </Badge>
            <Text fontSize="13px" color="gray600" fontWeight="500">
              {project.hub_class?.name}
            </Text>
          </Flex>
        </Flex>
        <GenericButton
          label="Salvar"
          onClick={() => handleSave()}
          border="1px"
          borderColor="gray300"
          bg={needSave ? 'primary500' : 'primary700'}
          color="white"
          isDisabled={!canEdit}
          _hover={{ filter: 'brightness(0.9)' }}
          rightIcon={needSave ? <MdWarning /> : undefined}
        />
      </Flex>

      {/* Dois cards lado a lado: Sobre e Habilidades BNCC */}
      <Flex gap="24px" w="100%">
        <Flex flex="1" minW="0">
          <About project={project} setProject={setProject} canEdit={canEdit} />
        </Flex>
        <Flex flex="1" minW="0">
          <BnccSkills project={project} setProject={setProject} bnccSkills={bnccSkills} canEdit={canEdit} />
        </Flex>
      </Flex>

      {/* Card de Atividades - Full Width */}
      {project.project?.book_id && (
        <Flex w="100%">
          <Activities project={project} setProject={setProject} canEdit={canEdit} handleSave={handleSave} />
        </Flex>
      )}

      {/* Dois cards lado a lado: Anotações e Grupos */}
      <Flex gap="24px" w="100%">
        <Flex flex="1" minW="0" direction="column">
          <Annotations project={project} onRemoveAnnotation={handleRemoveAnnotation} onAddAnnotation={handleAddAnnotation} canEdit={canEdit} />
        </Flex>
        <Flex flex="1" minW="0" direction="column">
          <Groups project={project} onPendingGroupAction={handleManagePendingGroup} canEdit={canEdit} handleAddGroup={handleAddGroup} />
        </Flex>
      </Flex>

      {/* Card de Fotos - Full Width */}
      <Flex w="100%">
        <ProjectPhotos project={project} onChangeFiles={(e) => setFiles(e)} canEdit={canEdit} />
      </Flex>
    </Flex>
  );
};

export default ProjectPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const selectedPage = 'project';

  try {
    cookieManager.updateToken(req);

    // TODO: add in use effect
    const [project, bnccSkills] = await Promise.all([getProject(`${query.project_id}`), getBnccSkills()]);

    return { props: { selectedPage, headerLabel: project.title, pageTitle: project.title, project, bnccSkills } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
