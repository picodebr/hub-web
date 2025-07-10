import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Checkbox,
  Flex,
  Image,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  Tooltip,
  useDisclosure,
  useUpdateEffect,
} from '@chakra-ui/react';
import { IHubProjectStep, IProject } from '@/_base/interfaces/project';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SmallModal } from '@/components/Modal/Small';
import { formatShortName } from '@/_base/utils';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { ClassProjectMetadataReward } from '@/_base/interfaces/project/IClassProjectMetadata';
import { MdOutlineCheckBox, MdOutlineFactCheck, MdPendingActions } from 'react-icons/md';
import { useAsyncCallback, useCustomRouter } from '@/_base/hooks';
import { customEvents } from '@/_base/classes/events';
import { eventsConfig } from '@/_base/config/events';
import { IHubUser } from '@/_base/interfaces/user';

interface IProps {
  project: IProject;
  setProject: Dispatch<SetStateAction<IProject>>;
  canEdit: boolean;
  handleSave: (newProject?: IProject, newRewards?: Record<string, ClassProjectMetadataReward[]>) => Promise<void>;
  setButtonCustomLabel: (value: SetStateAction<{ label?: string; isDisabled: boolean }>) => void;
}
type ModalStep = 'hidden' | 'missing_students' | 'taxed_students' | 'students_rewarded';

export const Activities: React.FC<IProps> = ({ project, canEdit, handleSave, setButtonCustomLabel }) => {
  const [targetRewards, setTargetRewards] = useState<IHubProjectStep[]>([]);
  const [missingStudents, setMissingStudents] = useState<string[]>([]);
  const [taxedStudents, setTaxedStudents] = useState<Record<string, string>>({});
  const [modalStep, setModalStep] = useState<ModalStep>('hidden');

  const { isOpen, onClose } = useDisclosure();
  const router = useCustomRouter();

  const onCloseModal = () => {
    setMissingStudents([]);
    setModalStep(`hidden`);
    setTargetRewards([]);
  };

  useEffect(() => {
    customEvents.on(eventsConfig.CASHBACK_MODAL, () => {
      setModalStep(`missing_students`);
    });
  }, []);

  useUpdateEffect(() => {
    const haveCashbackStep = !!targetRewards.find((e) => Number(e.cashback || `0`) > 0);
    setButtonCustomLabel({ isDisabled: !targetRewards.length, label: haveCashbackStep ? `Distribuir cashback` : `Finalizar atividades` });
  }, [targetRewards]);

  const onConfirmAcitivity = useAsyncCallback(async () => {
    if (!targetRewards.length) return;
    const students = project.hub_class?.students;
    const newRewards: Record<string, ClassProjectMetadataReward[]> = {};

    const rewards = students.reduce(
      (acc, student) => {
        acc[student.id] ||= [];
        newRewards[student.id] ||= [];

        const oldRewards = (project.metadata.rewards || {})[student.id];
        if (oldRewards?.length) acc[student.id].push(...oldRewards);

        if (
          stepIsFinished(project, targetRewards[0]) &&
          (!studentIsMissing(project, student, targetRewards[0]) || missingStudents.includes(student.id))
        )
          return acc;

        if (stepIsFinished(project, targetRewards[0]) && !missingStudents.includes(student.id)) {
          acc[student.id].forEach((e) => {
            if (e.activity_title === targetRewards[0].title) {
              e.is_missing = false;
              newRewards[student.id].push(e);
            }
          });

          return acc;
        }

        targetRewards.forEach((reward) => {
          const newReward = {
            reward_value: `${Number(reward?.cashback || 0) - Number(reward.cashback || 0) * (Number(taxedStudents[student.id] || 0) / 100)}`,
            tax_value: `${taxedStudents[student.id] || 0}`,
            activity_title: reward.title || ``,
            is_missing: missingStudents.includes(student.id),
          };

          acc[student.id].push(newReward);
          newRewards[student.id].push(newReward);
        });
        return acc;
      },
      {} as Record<string, ClassProjectMetadataReward[]>,
    );

    const newProjectData = {
      ...project,
      metadata: {
        ...project.metadata,
        rewards,
        finished_activities: [...(project.metadata.finished_activities || []), ...targetRewards.map((e) => `${e.parent || `-`}.${e.title}`)].reduce(
          (acc, s) => (acc.includes(s) ? acc : [...acc, s]),
          [] as string[],
        ),
      },
    };
    onCloseModal();
    await handleSave(newProjectData, newRewards);
    localStorage.setItem(
      `pending_forms::${project.id}`,
      JSON.stringify({ project: newProjectData, students: students.map((e) => ({ id: e.id, name: e.name })) }),
    );
    // const tm = setTimeout(() => onOpen(), 750);

    // return () => {
    //   clearTimeout(tm);
    // };
  }, []);

  return (
    <motion.div
      key={'Activities'}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: `flex`, overflow: `auto`, flexDirection: `column`, gap: `24px` }}
    >
      <Flex direction="column" gap="24px" w="100%">
        <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300">
          <Accordion allowMultiple w="100%" fontWeight="500" color="gray700" border="none" h="100%" display="flex" flexDirection="column">
            {(
              project.project?.metadata?.steps?.reduce((acc, r) => (acc.includes(r.parent || ``) ? acc : [...acc, r.parent || ``]), [] as string[]) ||
              []
            ).map((parent, idx) => (
              <AccordionItem key={parent + idx} border="none" p="0 0 1rem" gap="0">
                <Flex
                  w="100%"
                  h="100%"
                  backgroundColor={`${getActivityColor(project, parent)}22`}
                  borderRadius="md"
                  overflow="hidden"
                  gap="2px"
                  border="1px"
                  borderColor={`${getActivityColor(project, parent)}aa`}
                >
                  <Flex w="4rem" h="100%" overflow="hidden">
                    <Box
                      flex="1"
                      backgroundImage={`/patterns/${getActivityPattern(getActivityColor(project, parent) || ``)}.svg`}
                      backgroundPosition="center"
                      backgroundSize="cover"
                      transform="scale(3)"
                      backgroundRepeat="no-repeat"
                    />
                  </Flex>
                  <Flex direction="column" flex="1" borderLeft="2px" borderColor={getActivityColor(project, parent)}>
                    <AccordionButton justifyContent="space-between" p="0.5rem">
                      <Text>{parent}</Text>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel fontWeight="400" p="0.75rem 1rem 0" mb="-8.75rem">
                      <Flex pb={4} gap="6px" w="100%" justify="space-between">
                        <Flex fontSize="14px" align="center" gap="8px" color="gray500">
                          Atividade
                        </Flex>
                        <Text fontSize="14px" color="gray500">
                          Cashback
                        </Text>
                      </Flex>
                    </AccordionPanel>

                    {(project.project?.metadata?.steps || []).map((step, i, arr) =>
                      step.parent !== parent ? null : (
                        <AccordionPanel
                          fontWeight="400"
                          key={step.title + (i + 1)}
                          p="0.5rem 1rem"
                          borderBottom={arr.slice(i).filter((e) => e.parent === parent).length > 1 ? `1px` : `none`}
                          borderColor="gray300"
                        >
                          <Tooltip
                            label={
                              stepIsFinished(project, step)
                                ? project.hub_class.students.filter((s) => studentIsMissing(project, s, step)).length
                                  ? 'Atividade concluída, clique para reavaliar'
                                  : 'Atividade concluída'
                                : 'Marque a checkbox para concluir a atividade'
                            }
                            isDisabled={!canEdit}
                          >
                            <motion.button
                              disabled={!canEdit}
                              key={step.title}
                              whileHover={{
                                filter: `brightness(0.45)`,
                              }}
                              onClick={() => {
                                const studentsMissing = project.hub_class.students.filter((s) => studentIsMissing(project, s, step));
                                if (stepIsFinished(project, step)) {
                                  if (!studentsMissing.length) return;
                                  setTargetRewards([step]);
                                  setModalStep(`missing_students`);
                                } else
                                  setTargetRewards((e) =>
                                    e.find((r) => JSON.stringify(r) === JSON.stringify(step))
                                      ? e.filter((r) => JSON.stringify(r) !== JSON.stringify(step))
                                      : [...e, step],
                                  );
                              }}
                              style={{
                                display: `flex`,
                                width: `100%`,
                                gap: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                              }}
                            >
                              <Flex align="center" gap="0.4rem">
                                <Checkbox
                                  isDisabled={!canEdit || stepIsFinished(project, step)}
                                  size="lg"
                                  isChecked={!!targetRewards.find((e) => JSON.stringify(e) === JSON.stringify(step))}
                                  visibility="visible"
                                  border="2px"
                                  p="0.25rem"
                                  borderColor={getActivityColor(project, parent)}
                                  borderRadius="4px"
                                  sx={{
                                    span: {
                                      bg: `${getActivityColor(project, parent)}${targetRewards.find((e) => JSON.stringify(e) === JSON.stringify(step)) ? `` : `66`} !important`,
                                    },
                                  }}
                                  onChange={() => {
                                    setTargetRewards((r) =>
                                      !r.find((e) => JSON.stringify(e) === JSON.stringify(step))
                                        ? [...r, step]
                                        : r.filter((e) => JSON.stringify(e) !== JSON.stringify(step)),
                                    );
                                  }}
                                />
                                {stepIsFinished(project, step) ? (
                                  project.hub_class.students.filter((s) => studentIsMissing(project, s, step)).length ? (
                                    <MdOutlineFactCheck fontSize="20px" color="#1db832" />
                                  ) : (
                                    <MdOutlineCheckBox fontSize="20px" color="#1db832" />
                                  )
                                ) : (
                                  <MdPendingActions fontSize="20px" color="#4d4f5cdd" />
                                )}
                                <Text>{step.title}</Text>
                              </Flex>
                              <Flex align="center" gap="0.4rem">
                                <Text>{step.cashback || 0}</Text>
                                <Image src="/icons/coin.svg" />
                              </Flex>
                            </motion.button>
                          </Tooltip>
                        </AccordionPanel>
                      ),
                    )}
                  </Flex>
                </Flex>
              </AccordionItem>
            ))}
          </Accordion>
        </Flex>
      </Flex>

      <SmallModal
        title="Selecione os alunos ausentes"
        show={modalStep === 'missing_students'}
        onConfirm={() => setModalStep('taxed_students')}
        size="md"
        onCancel={onCloseModal}
        onCloseModal={onCloseModal}
        okText="Avançar"
        cancelText="Cancelar"
        topIcon="warning"
      >
        <Flex direction="column" gap="1rem" overflow="hidden auto">
          <Text color="gray500" fontSize="15px">
            Os alunos ausentes não recebem cashback:
          </Text>

          <Flex direction="column" gap="0.5rem">
            {project.hub_class?.students
              ?.filter((s) => !stepIsFinished(project, targetRewards[0]) || studentIsMissing(project, s, targetRewards[0]))
              .map((student) => (
                <Flex key={student.id} padding="0.35rem 0.5rem" gap="1rem" justify="space-between">
                  <Text>{formatShortName(student.name, true)}</Text>
                  <Checkbox
                    defaultChecked={missingStudents.includes(student.id)}
                    size="md"
                    visibility="visible"
                    border="2px"
                    p="0.25rem"
                    color="primary900"
                    colorScheme="red"
                    borderRadius="4px"
                    onChange={(v) => setMissingStudents((s) => (v.target.checked ? [...s, student.id] : s.filter((v) => v !== student.id)))}
                  />
                </Flex>
              ))}
          </Flex>
        </Flex>
      </SmallModal>

      <SmallModal
        title="Imposto por comportamento"
        show={modalStep === 'taxed_students'}
        onConfirm={() => setModalStep('students_rewarded')}
        size="md"
        onCancel={() => setModalStep('missing_students')}
        onCloseModal={onCloseModal}
        okText="Avançar"
        cancelText="Voltar"
        topIcon="ray"
      >
        <Flex direction="column" gap="1rem" overflow="hidden auto">
          <Text color="gray500" fontSize="15px">
            Os alunos que realizaram as atividades podem ter redução no cashback recebido dependendo do seu comportamento.
          </Text>
          <Text color="gray500" fontSize="15px">
            Defina a porcentagem de imposto para os alunos que não se comportaram:
          </Text>

          <Flex direction="column" gap="0.5rem">
            {project.hub_class.students
              ?.filter(
                (s) =>
                  (!stepIsFinished(project, targetRewards[0]) || studentIsMissing(project, s, targetRewards[0])) && !missingStudents.includes(s.id),
              )
              .map((student) => (
                <Flex key={student.id} padding="0.35rem 0.5rem" gap="1rem" justify="space-between" align="center">
                  <Text flex="1" whiteSpace="nowrap">
                    {formatShortName(student.name, true)}
                  </Text>
                  <Flex align="center" gap="0.5rem">
                    <FaMinus color="#e01f1f" />
                    <NumberInput
                      maxW="8rem"
                      size="sm"
                      defaultValue={0}
                      value={`${taxedStudents[student.id] || 0} %`}
                      min={0}
                      max={100}
                      onChange={(v) => setTaxedStudents((t) => ({ ...t, [student.id]: v }))}
                    >
                      <NumberInputField borderRadius="md" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Flex>
                </Flex>
              ))}
          </Flex>
        </Flex>
      </SmallModal>

      <SmallModal
        title="Resumo"
        show={modalStep === 'students_rewarded'}
        onConfirm={onConfirmAcitivity}
        size="md"
        onCancel={() => setModalStep('taxed_students')}
        onCloseModal={onCloseModal}
        okText="Concluir"
        cancelText="Voltar"
        topIcon="checked"
      >
        <Flex direction="column" gap="1rem" overflow="hidden auto">
          <Text color="gray500" fontSize="15px">
            Confirme os valores que cada aluno vai receber de cashback, após validar é só clicar no botão "Concluir" para finalizar a atividade e
            distribuir as moedas.
          </Text>

          <Flex direction="column" gap="0.5rem">
            {project.hub_class.students
              ?.filter(
                (s) =>
                  (!stepIsFinished(project, targetRewards[0]) || studentIsMissing(project, s, targetRewards[0])) && !missingStudents.includes(s.id),
              )
              .map((student) => (
                <Flex key={student.id} padding="0.35rem 0.5rem" gap="1rem" justify="space-between" align="center">
                  <Text flex="1" whiteSpace="nowrap">
                    {formatShortName(student.name, true)}
                  </Text>
                  <Flex align="center" gap="0.5rem" justify="space-between">
                    R$ {sumCashbacks(targetRewards) - sumCashbacks(targetRewards) * (Number(taxedStudents[student.id] || 0) / 100)}
                    ,00
                    <Flex position="relative">
                      <Image src="/icons/coin.svg" />
                      <Flex position="absolute" right="-0.5rem">
                        <FaPlus color="#1fe039" />
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              ))}
          </Flex>
        </Flex>
      </SmallModal>

      <SmallModal
        title="Nova avaliação disponível"
        show={isOpen}
        onConfirm={() => router.push(`/exam?project=${project.id}`)}
        size="md"
        onCancel={onClose}
        onCloseModal={onClose}
        okText="Sim"
        cancelText="Não"
        topIcon="ray"
      >
        <Flex direction="column" gap="1rem" overflow="hidden auto">
          <Text color="gray500" fontSize="15px">
            Deseja realizar a avaliação de desempenho dos alunos sobre a atividade finalizada?
          </Text>
        </Flex>
      </SmallModal>
    </motion.div>
  );
};

const getActivityColor = (project: IProject, parent: string): string | undefined =>
  project.project?.metadata?.steps?.find((e) => e.parent === parent)?.color;

const getActivityPattern = (color: string): string | undefined => {
  const colors = [
    { color: `#f8bb3c`, pattern: `rockets-amarelo` },
    { color: `#5671b6`, pattern: `rockets-azul-claro` },
    { color: `#1a1740`, pattern: `rockets-azul-marinho` },
    { color: `#3e7aff`, pattern: `rockets-azul` },
    { color: `#20f480`, pattern: `rockets-verde` },
    { color: `#ff515c`, pattern: `rockets-vermelho` },
  ];

  return colors.find((e) => e.color === color)?.pattern;
};

const sumCashbacks = (data: IHubProjectStep[]): number => data.reduce((acc, v) => (acc += Number(v.cashback || 0)), 0);

const stepIsFinished = (project: IProject, step: IHubProjectStep): boolean =>
  !!project.metadata.finished_activities?.includes(`${step?.parent || `-`}.${step?.title}`);

const studentIsMissing = (project: IProject, student: IHubUser, targetReward: IHubProjectStep): boolean => {
  return (
    !Object.keys(project.metadata?.rewards || `{}`).find(
      (studentId) =>
        student.id === studentId && !project.metadata?.rewards?.[studentId]?.find((e) => e.is_missing && e.activity_title === targetReward.title),
    ) && !!Number(targetReward.cashback)
  );
};
