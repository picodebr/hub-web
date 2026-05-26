import { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';

import { logError, cookieManager } from '@/_base/utils';
import { addProjectAnnotation, getProject, removeProjectAnnotation, updateProject } from '@/_base/services/project';
import { IAddProjectAnnotationParams, IProject, IUpdateProjectParams } from '@/_base/interfaces/project';
import { getBnccSkills } from '@/_base/services/user';
import { IBnccSkill } from '@/_base/interfaces/shared/IBnccSkill';
import { useAsyncCallback, useAuth, useCustomToast, useCustomRouter } from '@/_base/hooks';
import { getPresignedUrl } from '@/_base/services/upload';
import { ICreateHubGroupParams, IHubGroup } from '@/_base/interfaces/group';
import { acceptGroup, addGroupToProject, removeGroup } from '@/_base/services/group';
import { ClassProjectMetadataReward } from '@/_base/interfaces/project/IClassProjectMetadata';
import { giveCashback } from '@/_base/services/project/giveCashback';

// Subcomponentes
import { About } from './components/About';
import { BnccSkills } from './components/BnccSkills';
import { Activities } from './components/Activities';
import { Annotations } from './components/Annotations';
import { Groups } from './components/Groups';
import { ProjectPhotos } from './components/ProjectPhotos';

interface IProps {
  project: IProject;
  bnccSkills: IBnccSkill[];
}

const statusLabels: Record<string, { label: string; colorClass: string }> = {
  stopped: { label: 'Não iniciado', colorClass: 'bg-gray-100 text-gray-600 border-gray-200' },
  running: { label: 'Em andamento', colorClass: 'bg-blue-100 text-blue-700 border-blue-200' },
  finished: { label: 'Finalizado', colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const ProjectPage: React.FC<IProps> = ({ project: hubProject, bnccSkills }) => {
  const [savedProject, setSavedProject] = useState<IProject>(hubProject);
  const [project, setProject] = useState<IProject>(hubProject);
  const [files, setFiles] = useState<File[]>([]);

  const toast = useCustomToast();
  const { user } = useAuth();
  const router = useCustomRouter();

  const canEdit = user.id === hubProject.user_id;
  const needSave = useMemo<boolean>(
    () => JSON.stringify(project) !== JSON.stringify(savedProject) || !!files.length,
    [project, savedProject, files]
  );

  const statusInfo = statusLabels[project.status] || statusLabels.stopped;

  // Preservando toda a Lógica de Salvamento e Upload
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
    setFiles([]); // Limpa os arquivos após o salvamento
    toast({ status: 'success', description: 'Projeto salvo' });
  }, [project, files, hubProject.id]);

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

  // Variável utilitária de animação para os cards
  const anim = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="w-full h-full pb-10 overflow-y-auto px-5 pt-5 text-foreground font-sans">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 mb-6 border-b border-border/50 gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 bg-background border border-border rounded-xl text-foreground hover:bg-accent transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {project.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.colorClass}`}>
              {statusInfo.label}
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              {project.hub_class?.display_name}
            </span>
          </div>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={!canEdit}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm
            ${needSave ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-primary/80 text-primary-foreground opacity-80'} 
            ${!canEdit && 'opacity-50 cursor-not-allowed'}`}
        >
          Salvar
          {needSave && <AlertTriangle className="w-4 h-4" />}
        </button>
      </div>

      {/* Grid Principal do Layout de Referência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...anim(0)}><About project={project} setProject={setProject} canEdit={canEdit} /></motion.div>
        <motion.div {...anim(1)}><BnccSkills project={project} setProject={setProject} bnccSkills={bnccSkills} canEdit={canEdit} /></motion.div>
        
        {project.project?.book_id && (
          <motion.div {...anim(2)} className="lg:col-span-2">
            <Activities project={project} setProject={setProject} canEdit={canEdit} handleSave={handleSave} />
          </motion.div>
        )}

        <motion.div {...anim(3)}><Annotations project={project} onRemoveAnnotation={handleRemoveAnnotation} onAddAnnotation={handleAddAnnotation} canEdit={canEdit} /></motion.div>
        <motion.div {...anim(4)}><Groups project={project} onPendingGroupAction={handleManagePendingGroup} canEdit={canEdit} handleAddGroup={handleAddGroup} /></motion.div>
        <motion.div {...anim(5)} className="lg:col-span-2"><ProjectPhotos project={project} onChangeFiles={(e) => setFiles((prev) => [...prev, ...e])} canEdit={canEdit} /></motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const selectedPage = 'project';
  try {
    cookieManager.updateToken(req);
    const [project, bnccSkills] = await Promise.all([getProject(`${query.project_id}`), getBnccSkills()]);
    return { props: { selectedPage, headerLabel: project.title, pageTitle: project.title, project, bnccSkills } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};