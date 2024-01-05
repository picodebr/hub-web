import { GetServerSideProps } from 'next';
import { MdWarning } from 'react-icons/md';
import { Flex } from '@chakra-ui/react';
import { ReactNode, useMemo, useState } from 'react';
import axios from 'axios';

import { logError, cookieManager } from '@/_base/utils';
import { ProjectPageView, projectPageViews } from './interfaces';
import { TabSwitch } from '@/components/TabSwitch';
import { addProjectAnnotation, getProject, removeProjectAnnotation, updateProject } from '@/_base/services/project';
import { IAddProjectAnnotationParams, IProject } from '@/_base/interfaces/project';
import { getBnccSkills } from '@/_base/services/user';
import { IBnccSkill } from '@/_base/interfaces/shared/IBnccSkill';
import { About } from './components/About/index.page';
import { Materials } from './components/Materials/index.page';
import { Annotations } from './components/Annotations/index.page';
import { Groups } from './components/Groups/index.page';
import { GenericButton } from '@/components/Buttons/Generic';
import { useAsyncCallback, useCustomToast } from '@/_base/hooks';
import { getPresignedUrl } from '@/_base/services/upload';
import { IUpdateProjectParams } from '@/_base/interfaces/project';
import { IHubGroup } from '@/_base/interfaces/group';
import { acceptGroup, removeGroup } from '@/_base/services/group';

interface IProps {
  project: IProject;
  bnccSkills: IBnccSkill[];
}
const mockGroups: Partial<IHubGroup>[] = [
  {
    id: `1`,
    display_name: `Grupo brabo`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    approved_at: new Date().toString(),
  },
  {
    id: `5`,
    display_name: `Grupo tech`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    approved_at: new Date().toString(),
  },
  {
    id: `6`,
    display_name: `Grupo always`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    approved_at: new Date().toString(),
  },
  {
    id: `7`,
    display_name: `Grupo leet code`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    approved_at: new Date().toString(),
  },
  {
    id: `11`,
    display_name: `Grupo rico`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    updated_at: new Date().toString(),
  },
  {
    id: `12`,
    display_name: `Grupo pobre`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    updated_at: new Date().toString(),
  },
  {
    id: `13`,
    display_name: `Grupo influencer`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    updated_at: new Date().toString(),
  },
  {
    id: `14`,
    display_name: `Grupo top`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    updated_at: new Date().toString(),
  },
];
const ProjectPage: React.FC<IProps> = ({ project: hubProject, bnccSkills }) => {
  const [savedProject, setSavedProject] = useState<IProject>({ ...hubProject, groups: mockGroups as any });
  const [pageView, setPageView] = useState<ProjectPageView>('Sobre');
  const [project, setProject] = useState<IProject>({ ...hubProject, groups: mockGroups as any });
  const [files, setFiles] = useState<File[]>([]);

  const toast = useCustomToast();

  const needSave = useMemo<boolean>(() => JSON.stringify(project) !== JSON.stringify(savedProject) || !!files.length, [project, savedProject, files]);

  const handleSave = useAsyncCallback(async () => {
    const dto: IUpdateProjectParams = {
      id: project.id,
      title: project.title,
      description: project.description || undefined,
      metadata: project.metadata,
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

      dto.metadata.attachments = [...(dto.metadata.attachments || []), ...fileData.map((e) => e.path)];
    }

    const updatedProject = await updateProject(dto);

    setProject(updatedProject);
    setSavedProject(updatedProject);
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
      // const updatedGroup = await acceptGroup(group.id);
      const updatedGroup = { approved_at: new Date().toString() };
      setProject((p) => ({ ...p, groups: p.groups.map((g) => (g.id === group.id ? { ...g, approved_at: updatedGroup.approved_at } : g)) }));
      setSavedProject((p) => ({ ...p, groups: p.groups.map((g) => (g.id === group.id ? { ...g, approved_at: updatedGroup.approved_at } : g)) }));
    } else {
      // await removeGroup(group.id);
      setProject((p) => ({ ...p, groups: p.groups.filter((g) => g.id !== group.id) }));
      setSavedProject((p) => ({ ...p, groups: p.groups.filter((g) => g.id !== group.id) }));
    }
  }, []);

  const PageViewComponent: Record<ProjectPageView, ReactNode> = {
    Sobre: <About project={project} setProject={setProject} bnccSkills={bnccSkills} onChangeFiles={(e) => setFiles(e)} />,
    Materiais: <Materials project={project} setProject={setProject} />,
    Anotações: <Annotations project={project} onRemoveAnnotation={handleRemoveAnnotation} onAddAnnotation={handleAddAnnotation} />,
    Grupos: <Groups project={project} onPendingGroupAction={handleManagePendingGroup} />,
  };

  return (
    <Flex direction="column" w="100%" h="100%" gap="2rem" overflow="hidden">
      <Flex justify="space-between">
        <TabSwitch
          tabs={projectPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
          onSwitch={(view) => setPageView(view as any)}
          currentTabColor="primary700"
        />

        <GenericButton
          label="Salvar"
          onClick={handleSave}
          border="1px"
          borderColor="gray300"
          bg={needSave ? 'primary500' : 'primary700'}
          color="white"
          boxShadow="sm"
          _hover={{ filter: 'brightness(0.9)' }}
          rightIcon={needSave ? <MdWarning /> : undefined}
        />
      </Flex>
      {PageViewComponent[pageView]}
    </Flex>
  );
};

export default ProjectPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const selectedPage = 'project';

  try {
    cookieManager.updateToken(req);

    const [project, bnccSkills] = await Promise.all([getProject(`${query.project_id}`), getBnccSkills()]);

    return { props: { selectedPage, pageTitle: project.title, project, bnccSkills } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
