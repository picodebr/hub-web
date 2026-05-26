import React, { Dispatch, SetStateAction, useState } from 'react';
import { BookOpen, Target, Edit2 } from 'lucide-react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { IProject } from '@/_base/interfaces/project';
import { IBnccSkill } from '@/_base/interfaces/shared/IBnccSkill';
import { SmallModal } from '@/components/Modal/Small';

interface DataType {
  key: React.Key;
  tag: string;
  subject: string;
  grade: string;
  description: string;
}

interface IProps {
  project: IProject;
  setProject: Dispatch<SetStateAction<IProject>>;
  bnccSkills: IBnccSkill[];
  canEdit: boolean;
}

export const BnccSkills: React.FC<IProps> = ({ project, setProject, bnccSkills, canEdit }) => {
  const [showModal, setShowModal] = useState(false);

  const columns: ColumnsType<DataType> = [
    { title: 'Habilidade', dataIndex: 'tag', render: (text: string) => <a className="text-primary font-medium">{text}</a> },
    { title: 'Matéria', dataIndex: 'subject' },
    { title: 'Ano/Faixa', dataIndex: 'grade' },
    { title: 'Descrição', dataIndex: 'description' },
  ];

  const dataSource: DataType[] = bnccSkills.map((bncc) => ({ ...bncc, key: bncc.tag, description: `${bncc.title} - ${bncc.description || ''}` }));
  const canEditSkills = canEdit && !project.project_id;

  return (
    <>
      <div className="glass-card p-5 space-y-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-base font-semibold text-foreground">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-emerald-500" />
            </div>
            Habilidades BNCC
          </div>
          
          {canEditSkills && (
            <button
              onClick={() => setShowModal(true)}
              className="p-2 rounded-lg bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
          {project.metadata.bncc && project.metadata.bncc.length > 0 ? (
            project.metadata.bncc.map((bncc) => {
              const skill = bnccSkills.find((e) => e.tag === bncc);
              return (
                <div key={bncc} className="group relative flex items-start gap-3 overflow-hidden rounded-xl border border-border/40 bg-card/60 p-3 transition-all duration-300 hover:border-border hover:bg-card hover:shadow-sm">
                  <span className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-500 opacity-60 transition-all duration-300 group-hover:h-10 group-hover:opacity-100" />
                  <div className="w-7 h-7 shrink-0 rounded-lg bg-emerald-500/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 mt-0.5">
                    <Target className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground tracking-tight leading-snug">{bncc}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {skill?.title || ''} {skill?.description ? `- ${skill.description}` : ''}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-muted-foreground italic text-center py-4">
              Nenhuma habilidade selecionada
            </div>
          )}
        </div>
      </div>

      <SmallModal
        size="6xl"
        title="Habilidades BNCC"
        show={showModal}
        onConfirm={() => setShowModal(false)}
        okText={'Confirmar'}
        onCancel={() => setShowModal(false)}
        topIcon="warning"
      >
        <Table
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: (project.metadata.bncc || []).map((e: any) => e),
            onChange: (keys) => setProject((e) => ({ ...e, metadata: { ...e.metadata, bncc: keys as string[] } })),
          }}
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 25 }}
          className="font-sans"
        />
      </SmallModal>
    </>
  );
};