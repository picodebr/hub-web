import React, { useState } from 'react';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import moment from 'moment';

import { IAddProjectAnnotationParams, IProject } from '@/_base/interfaces/project';
import { formatShortName } from '@/_base/utils';
import { SmallModal } from '@/components/Modal/Small';
import { useAuth } from '@/_base/hooks';

interface IProps {
  project: IProject;
  onAddAnnotation: (data: IAddProjectAnnotationParams) => void;
  onRemoveAnnotation: (id: string) => void;
  canEdit: boolean;
}

export const Annotations: React.FC<IProps> = ({ project, onAddAnnotation, onRemoveAnnotation, canEdit }) => {
  const [newAnnotation, setNewAnnotation] = useState('');
  const [annotationIdToRemove, setAnnotationIdToRemove] = useState('');
  const { user } = useAuth();

  const handleSend = () => {
    if (!newAnnotation.trim()) return;
    onAddAnnotation({ hub_project_class_id: project.id, metadata: { message: newAnnotation, attachments: [] } });
    setNewAnnotation('');
  };

  return (
    <>
      <div className="glass-card p-5 space-y-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md h-full flex flex-col">
        <div className="flex items-center gap-2.5 text-base font-semibold text-foreground mb-1">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          Anotações
        </div>

        <div className="flex flex-col gap-3">
          <textarea
            disabled={!canEdit}
            value={newAnnotation}
            onChange={(e) => setNewAnnotation(e.target.value)}
            placeholder="Faça uma anotação..."
            className="w-full bg-accent/30 border border-border/50 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px] resize-none disabled:opacity-70 disabled:cursor-not-allowed"
          />
          <div className="flex justify-end">
            <button
              disabled={!canEdit}
              onClick={handleSend}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar
            </button>
          </div>
        </div>

        <div className="space-y-3 mt-4 overflow-y-auto max-h-[300px] flex-1 pr-1">
          {project.annotations.map((annotation) => (
            <div key={annotation.id} className="p-3.5 rounded-xl bg-accent/30 border border-border/30 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={annotation.user?.avatar || '/avatars/default.jpeg'} className="w-7 h-7 rounded-full object-cover shrink-0" alt="avatar" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground tracking-tight leading-none mb-1">
                      {formatShortName(annotation.user?.name || user.name, true)}
                    </span>
                    <span className="text-xs text-muted-foreground leading-none">
                      @{annotation.user?.username || user.username}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setAnnotationIdToRemove(annotation.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors group"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                </button>
              </div>
              <p className="text-sm text-foreground/80 leading-snug break-words pl-0.5">
                {annotation.metadata.message}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium pl-0.5">
                {`${moment(annotation.created_at).format('DD/MM')} às ${moment(annotation.created_at).format('HH:mm')}`}
              </p>
            </div>
          ))}
          {project.annotations.length === 0 && (
            <div className="text-sm text-muted-foreground italic text-center py-4">Nenhuma anotação</div>
          )}
        </div>
      </div>

      <SmallModal
        title="Excluir anotação"
        show={!!annotationIdToRemove}
        onConfirm={() => {
          onRemoveAnnotation(annotationIdToRemove);
          setAnnotationIdToRemove('');
        }}
        okText="Confirmar"
        onCancel={() => setAnnotationIdToRemove('')}
        topIcon="warning"
      >
        <p className="text-muted-foreground text-sm">Tem certeza que deseja excluir essa anotação?</p>
      </SmallModal>
    </>
  );
};