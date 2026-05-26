import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, Coins, ChevronDown, ChevronUp } from 'lucide-react';
import { IHubProjectStep, IProject } from '@/_base/interfaces/project';
import { ClassProjectMetadataReward } from '@/_base/interfaces/project/IClassProjectMetadata';
import { IHubUser } from '@/_base/interfaces/user';
import { SmallModal } from '@/components/Modal/Small';
import { formatShortName } from '@/_base/utils';
import { useAsyncCallback, useCustomRouter } from '@/_base/hooks';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
import { customEvents } from '@/_base/classes/events';
import { eventsConfig } from '@/_base/config/events';

interface IProps {
  project: IProject;
  setProject: Dispatch<SetStateAction<IProject>>;
  canEdit: boolean;
  handleSave: (newProject?: IProject, newRewards?: Record<string, ClassProjectMetadataReward[]>) => Promise<void>;
}
type ModalStep = 'hidden' | 'missing_students' | 'taxed_students' | 'students_rewarded';

export const Activities: React.FC<IProps> = ({ project, canEdit, handleSave }) => {
  const [targetRewards, setTargetRewards] = useState<IHubProjectStep[]>([]);
  const [missingStudents, setMissingStudents] = useState<string[]>([]);
  const [taxedStudents, setTaxedStudents] = useState<Record<string, string>>({});
  const [modalStep, setModalStep] = useState<ModalStep>('hidden');
  const [isOpen, setIsOpen] = useState(false);
  const router = useCustomRouter();
  const { colorMode } = useDarkMode();

  const onCloseModal = () => {
    setMissingStudents([]);
    setModalStep('hidden');
    setTargetRewards([]);
  };

  useEffect(() => {
    customEvents.on(eventsConfig.CASHBACK_MODAL, () => {
      setModalStep('missing_students');
    });
  }, []);

  const [expandedStages, setExpandedStages] = useState<string[]>(
    project.project?.metadata?.steps?.map(s => s.parent || '') || []
  );

  const toggleStage = (id: string) => {
    setExpandedStages(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const onConfirmActivity = useAsyncCallback(async () => {
    if (!targetRewards.length) return;
    const students = project.hub_class?.students || [];
    const newRewards: Record<string, ClassProjectMetadataReward[]> = {};

    const rewards = students.reduce((acc, student) => {
        acc[student.id] ||= [];
        newRewards[student.id] ||= [];

        const oldRewards = (project.metadata.rewards || {})[student.id];
        if (oldRewards?.length) acc[student.id].push(...oldRewards);

        // Se estudante está marcado como ausente, não recebe cashback
        if (missingStudents.includes(student.id)) {
          return acc;
        }

        // Calcule o cashback para cada recompensa alvo
        targetRewards.forEach((reward) => {
          const baseCashback = Number(reward?.cashback || 0);
          const taxPercentage = Number(taxedStudents[student.id] || 0);
          const finalCashback = baseCashback * (1 - taxPercentage / 100);

          const newReward = {
            reward_value: `${finalCashback.toFixed(0)}`,
            tax_value: `${taxPercentage}`,
            activity_title: reward.title || '',
            is_missing: false,
          };
          acc[student.id].push(newReward);
          newRewards[student.id].push(newReward);
        });
        return acc;
      }, {} as Record<string, ClassProjectMetadataReward[]>
    );

    const newProjectData = {
      ...project,
      metadata: {
        ...project.metadata,
        rewards,
        finished_activities: [...(project.metadata.finished_activities || []), ...targetRewards.map((e) => `${e.parent || '-'}.${e.title}`)].reduce(
          (acc, s) => (acc.includes(s) ? acc : [...acc, s]), [] as string[]
        ),
      },
    };
    onCloseModal();
    await handleSave(newProjectData, newRewards);
    localStorage.setItem(`pending_forms::${project.id}`, JSON.stringify({ project: newProjectData, students: students.map((e) => ({ id: e.id, name: e.name })) }));
  }, [project, targetRewards, missingStudents, taxedStudents]);

  const parents = project.project?.metadata?.steps?.reduce((acc, r) => (acc.includes(r.parent || '') ? acc : [...acc, r.parent || '']), [] as string[]) || [];

  return (
    <>
      <div className="glass-card p-5 space-y-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md w-full">
        <div className="flex items-center justify-between gap-2.5 text-base font-semibold text-foreground mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-amber-500" />
            </div>
            Atividades
          </div>
          <button
            onClick={() => {
              if (targetRewards.length === 0) {
                alert('Selecione pelo menos uma atividade');
                return;
              }
              setMissingStudents([]);
              setTaxedStudents({});
              setModalStep('missing_students');
            }}
            disabled={!canEdit || targetRewards.length === 0}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md
              ${canEdit && targetRewards.length > 0
                ? colorMode === 'light'
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900 hover:from-amber-600 hover:to-amber-700 hover:shadow-lg active:shadow-md'
                  : 'bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 hover:shadow-lg active:shadow-md'
                : 'bg-muted-foreground/20 text-muted-foreground cursor-not-allowed opacity-50'
              }`}
          >
            Concluir Atividades
          </button>
        </div>
        
        <div className="space-y-3">
          {parents.map((parent, idx) => {
            const isExpanded = expandedStages.includes(parent);
            const parentSteps = project.project?.metadata?.steps?.filter(s => s.parent === parent) || [];
            const finishedCount = parentSteps.filter(step => stepIsFinished(project, step)).length;
            const color = getActivityColor(project, parent) || 'hsl(142 71% 45%)';

            return (
              <div key={parent + idx} className="rounded-2xl overflow-hidden border border-border/50 bg-background/50">
                <button
                  onClick={() => toggleStage(parent)}
                  className="w-full flex items-center gap-3 p-3.5 hover:bg-accent/50 transition-colors"
                >
                  <div className="w-1.5 h-8 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                  <span className="font-semibold text-sm text-foreground flex-1 text-left">{parent}</span>
                  <span className="text-xs font-medium text-muted-foreground mr-2">
                    {finishedCount}/{parentSteps.length}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-border/30 overflow-hidden"
                    >
                      {parentSteps.map((step, i) => {
                        const isFinished = stepIsFinished(project, step);
                        const isSelected = !!targetRewards.find((e) => JSON.stringify(e) === JSON.stringify(step));

                        return (
                          <button
                            key={step.title + i}
                            disabled={!canEdit}
                            onClick={() => {
                              const studentsMissing = project.hub_class?.students?.filter((s) => studentIsMissing(project, s, step)) || [];
                              if (isFinished) {
                                if (!studentsMissing.length) return;
                                setTargetRewards([step]);
                                setModalStep('missing_students');
                              } else {
                                setTargetRewards((e) => e.find((r) => JSON.stringify(r) === JSON.stringify(step)) ? e.filter((r) => JSON.stringify(r) !== JSON.stringify(step)) : [...e, step]);
                              }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left
                              ${canEdit ? 'hover:bg-accent/40 cursor-pointer' : 'cursor-not-allowed opacity-80'}
                              ${isSelected ? 'bg-accent/20' : ''}`}
                          >
                            <div className="shrink-0 flex items-center justify-center">
                               {isFinished ? (
                                  <CheckSquare className="w-5 h-5 text-emerald-500" />
                               ) : isSelected ? (
                                  <CheckSquare className="w-5 h-5 text-primary" />
                               ) : (
                                  <Square className="w-5 h-5 text-muted-foreground/40" />
                               )}
                            </div>
                            <span className={`text-sm flex-1 font-medium ${isFinished ? 'text-muted-foreground line-through opacity-80' : 'text-foreground'}`}>
                              {step.title}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded-md">
                              {step.cashback || 0}
                              <Coins className="w-3.5 h-3.5" />
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal 1: Alunos Ausentes */}
      <SmallModal title="Alunos Ausentes" show={modalStep === 'missing_students'} onConfirm={() => setModalStep('taxed_students')} onCancel={onCloseModal} okText="Avançar" size="md">
        <div className="flex flex-col gap-5">
          <p className="text-muted-foreground text-sm leading-relaxed">Marque os alunos que faltaram. Eles não receberão o cashback desta atividade.</p>
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-2">
            {project.hub_class?.students?.filter((s) => !stepIsFinished(project, targetRewards[0]) || studentIsMissing(project, s, targetRewards[0])).map((student) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center p-4 bg-gradient-to-br from-accent/20 to-accent/5 hover:from-accent/30 hover:to-accent/15 rounded-2xl border border-accent/20 transition-all duration-200 cursor-pointer group"
                onClick={() => setMissingStudents((s) => (s.includes(student.id) ? s.filter((val) => val !== student.id) : [...s, student.id]))}
              >
                <span className="text-sm font-medium text-foreground">{formatShortName(student.name, true)}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  missingStudents.includes(student.id)
                    ? 'bg-amber-500/20 border-amber-500'
                    : 'border-border/30 group-hover:border-border/60'
                }`}>
                  {missingStudents.includes(student.id) && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-amber-500 rounded-full" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SmallModal>

      {/* Modal 2: Imposto de Comportamento */}
      <SmallModal title="Imposto de Comportamento" show={modalStep === 'taxed_students'} onConfirm={() => setModalStep('students_rewarded')} onCancel={() => setModalStep('missing_students')} okText="Avançar" size="md">
        <div className="flex flex-col gap-5">
          <p className="text-muted-foreground text-sm leading-relaxed">Defina o desconto (%) no cashback por mau comportamento. Use 0 para nenhum desconto.</p>
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-2">
            {project.hub_class?.students?.filter((s) => (!stepIsFinished(project, targetRewards[0]) || studentIsMissing(project, s, targetRewards[0])) && !missingStudents.includes(s.id)).map((student) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center p-4 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl border border-accent/20 transition-all duration-200"
              >
                <span className="text-sm font-medium text-foreground">{formatShortName(student.name, true)}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0" max="100"
                    defaultValue={taxedStudents[student.id] || 0}
                    onChange={(e) => setTaxedStudents(t => ({ ...t, [student.id]: e.target.value }))}
                    className="w-16 px-3 py-2 border border-border/30 bg-background/50 rounded-lg text-sm font-medium text-center outline-none focus:border-primary/50 focus:bg-background transition-all"
                  />
                  <span className="text-xs font-semibold text-muted-foreground w-6">%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SmallModal>

      {/* Modal 3: Resumo Cashback */}
      <SmallModal title="Resumo Cashback" show={modalStep === 'students_rewarded'} onConfirm={onConfirmActivity} onCancel={() => setModalStep('taxed_students')} okText="Concluir" size="md">
        <div className="flex flex-col gap-5">
          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-2xl border border-amber-500/20">
            <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">✓ Revise os valores abaixo e clique em "Concluir" para distribuir as moedas.</p>
          </div>
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-2">
            {project.hub_class?.students?.filter((s) => (!stepIsFinished(project, targetRewards[0]) || studentIsMissing(project, s, targetRewards[0])) && !missingStudents.includes(s.id)).map((student) => {
              const baseCashback = sumCashbacks(targetRewards);
              const taxPercentage = Number(taxedStudents[student.id] || 0);
              const finalCashback = baseCashback * (1 - taxPercentage / 100);
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/20 hover:from-emerald-500/15 hover:to-emerald-500/10 transition-all duration-200"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-foreground">{formatShortName(student.name, true)}</span>
                    {taxPercentage > 0 && (
                      <span className="text-xs text-muted-foreground">Desconto: {taxPercentage}%</span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    +{finalCashback.toFixed(0)}
                    <Coins className="w-5 h-5" />
                  </span>
                </motion.div>
              );
            })}
          </div>
          <div className="pt-3 border-t border-border/30">
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Total a distribuir: </span>
              <span className="text-lg font-bold text-amber-500 flex items-center justify-end gap-2">
                +{project.hub_class?.students?.filter((s) => (!stepIsFinished(project, targetRewards[0]) || studentIsMissing(project, s, targetRewards[0])) && !missingStudents.includes(s.id)).reduce((acc, student) => {
                  const baseCashback = sumCashbacks(targetRewards);
                  const taxPercentage = Number(taxedStudents[student.id] || 0);
                  return acc + baseCashback * (1 - taxPercentage / 100);
                }, 0).toFixed(0)}
                <Coins className="w-5 h-5" />
              </span>
            </div>
          </div>
        </div>
      </SmallModal>
    </>
  );
};

// Funções auxiliares (Preservadas)
const getActivityColor = (project: IProject, parent: string): string | undefined =>
  project.project?.metadata?.steps?.find((e) => e.parent === parent)?.color;

const sumCashbacks = (data: IHubProjectStep[]): number => data.reduce((acc, v) => (acc += Number(v.cashback || 0)), 0);

const stepIsFinished = (project: IProject, step: IHubProjectStep): boolean =>
  !!project.metadata.finished_activities?.includes(`${step?.parent || '-'}.${step?.title}`);

const studentIsMissing = (project: IProject, student: IHubUser, targetReward: IHubProjectStep): boolean => {
  return (
    !Object.keys(project.metadata?.rewards || {}).find(
      (studentId) => student.id === studentId && !project.metadata?.rewards?.[studentId]?.find((e) => e.is_missing && e.activity_title === targetReward.title),
    ) && !!Number(targetReward.cashback)
  );
};