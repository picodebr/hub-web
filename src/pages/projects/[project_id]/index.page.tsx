import { GetServerSideProps } from 'next';
import { MdWarning } from 'react-icons/md';
import { Flex } from '@chakra-ui/react';
import { ReactNode, useMemo, useState } from 'react';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';

import { logError, cookieManager } from '@/_base/utils';
import { ProjectPageView, projectPageViews } from './interfaces';
import { TabSwitch } from '@/components/TabSwitch';
import { addProjectAnnotation, getProject, removeProjectAnnotation, updateProject } from '@/_base/services/project';
import { IAddProjectAnnotationParams, IProject } from '@/_base/interfaces/project';
import { getBnccSkills } from '@/_base/services/user';
import { IBnccSkill } from '@/_base/interfaces/shared/IBnccSkill';
import { About } from './components/About';
import { Materials } from './components/Materials';
import { Annotations } from './components/Annotations';
import { Groups } from './components/Groups';
import { GenericButton } from '@/components/Buttons/Generic';
import { useAsyncCallback, useAuth, useCustomToast } from '@/_base/hooks';
import { getPresignedUrl } from '@/_base/services/upload';
import { IUpdateProjectParams } from '@/_base/interfaces/project';
import { ICreateHubGroupParams, IHubGroup } from '@/_base/interfaces/group';
import { acceptGroup, addGroupToProject, removeGroup } from '@/_base/services/group';
import { Activities } from './components/Activities';
import { ClassProjectMetadataReward } from '@/_base/interfaces/project/IClassProjectMetadata';
import { giveCashback } from '@/_base/services/project/giveCashback';
import { customEvents } from '@/_base/classes/events';
import { eventsConfig } from '@/_base/config/events';

interface IProps {
  project: IProject;
  bnccSkills: IBnccSkill[];
}

const ProjectPage: React.FC<IProps> = ({ project: hubProject, bnccSkills }) => {
  const [savedProject, setSavedProject] = useState<IProject>(hubProject);
  const [pageView, setPageView] = useState<ProjectPageView>('Sobre');
  const [buttonCustomLabel, setButtonCustomLabel] = useState<{ label?: string; isDisabled: boolean }>({ isDisabled: true });
  const [project, setProject] = useState<IProject>(hubProject);
  const [files, setFiles] = useState<File[]>([]);

  const toast = useCustomToast();
  const { user } = useAuth();

  const canEdit = user.id === hubProject.user_id;
  const needSave = useMemo<boolean>(() => JSON.stringify(project) !== JSON.stringify(savedProject) || !!files.length, [project, savedProject, files]);

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
    //TODO: add attachments
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

  const PageViewComponent: Record<ProjectPageView, ReactNode> = {
    Sobre: <About project={project} setProject={setProject} bnccSkills={bnccSkills} onChangeFiles={(e) => setFiles(e)} canEdit={canEdit} />,
    Materiais: <Materials project={project} setProject={setProject} canEdit={canEdit} />,
    Atividades: (
      <Activities project={project} setProject={setProject} canEdit={canEdit} handleSave={handleSave} setButtonCustomLabel={setButtonCustomLabel} />
    ),
    Anotações: <Annotations project={project} onRemoveAnnotation={handleRemoveAnnotation} onAddAnnotation={handleAddAnnotation} canEdit={canEdit} />,
    Grupos: <Groups project={project} onPendingGroupAction={handleManagePendingGroup} canEdit={canEdit} handleAddGroup={handleAddGroup} />,
  };
  return (
    <Flex direction="column" w="100%" h="100%" gap="2rem" overflow="hidden">
      <Flex justify="space-between">
        <TabSwitch
          tabs={projectPageViews
            .filter((e) => (project.project?.book_id ? e : e !== `Atividades`))
            .map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
          onSwitch={(view) => {
            setPageView(view as any);
            setButtonCustomLabel((e) => (view === `Atividades` ? { ...e, label: `Finalizar atividades` } : { isDisabled: true }));
          }}
          currentTabColor="primary700"
        />

        <GenericButton
          label={buttonCustomLabel.label || 'Salvar'}
          onClick={() => {
            if (pageView === `Atividades`) {
              customEvents.emit(eventsConfig.CASHBACK_MODAL);
            } else handleSave();
          }}
          border="1px"
          borderColor="gray300"
          bg={needSave ? 'primary500' : 'primary700'}
          color="white"
          
          isDisabled={!canEdit || (pageView === `Atividades` && buttonCustomLabel.isDisabled)}
          _hover={{ filter: 'brightness(0.9)' }}
          rightIcon={needSave ? <MdWarning /> : undefined}
        />
      </Flex>
      <AnimatePresence mode="wait">{PageViewComponent[pageView]}</AnimatePresence>
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
