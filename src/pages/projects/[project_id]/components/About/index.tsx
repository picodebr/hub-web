import React, { Dispatch, SetStateAction } from 'react';
import { FileText } from 'lucide-react';
import { IProject } from '@/_base/interfaces/project';

interface IProps {
  project: IProject;
  setProject: Dispatch<SetStateAction<IProject>>;
  canEdit: boolean;
}

export const About: React.FC<IProps> = ({ project, setProject, canEdit }) => {
  const disabled = !canEdit || !!project.project_id;

  return (
    <div className="glass-card p-5 space-y-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md h-full">
      <div className="flex items-center gap-2.5 text-base font-semibold text-foreground">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        Sobre o Projeto
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome do projeto</label>
          <input
            disabled={disabled}
            value={project.title || ''}
            onChange={(e) => setProject((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full bg-accent/30 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Objetivo</label>
          <textarea
            disabled={disabled}
            value={project.description || ''}
            onChange={(e) => setProject((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full bg-accent/30 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px] resize-none disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};