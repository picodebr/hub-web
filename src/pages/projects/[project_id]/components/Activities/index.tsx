import {
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
} from '@chakra-ui/react';
import { IProject } from '@/_base/interfaces/project';
import { Dispatch, SetStateAction, useState } from 'react';
import { motion } from 'framer-motion';
import { SmallModal } from '@/components/Modal/Small';
import { formatShortName } from '@/_base/utils';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { IHubBookMetadataReward } from '@/_base/interfaces/book/IHubBookMetadata';
import { ClassProjectMetadataReward } from '@/_base/interfaces/project/IClassProjectMetadata';
import { MdOutlineCheckBox, MdPendingActions } from 'react-icons/md';
import { useAsyncCallback } from '@/_base/hooks';

interface IProps {
  project: IProject;
  setProject: Dispatch<SetStateAction<IProject>>;
  canEdit: boolean;
  handleSave: (newProject?: IProject, newRewards?: Record<string, ClassProjectMetadataReward>) => Promise<void>;
}
type ModalStep = 'hidden' | 'missing_students' | 'taxed_students' | 'students_rewarded';

export const Activities: React.FC<IProps> = ({ project, canEdit, handleSave }) => {
  const [targetReward, setTargetReward] = useState<IHubBookMetadataReward | null>(null);
  const [missingStudents, setMissingStudents] = useState<string[]>([]);
  const [taxedStudents, setTaxedStudents] = useState<Record<string, string>>({});
  const [modalStep, setModalStep] = useState<ModalStep>('hidden');

  const onCloseModal = () => {
    setMissingStudents([]);
    setModalStep(`hidden`);
    setTargetReward(null);
  };

  const onConfirmAcitivity = useAsyncCallback(async () => {
    if (!targetReward) return;
    const students = project.hub_class?.students?.filter((s) => !missingStudents.includes(s.id));
    const newRewards: Record<string, ClassProjectMetadataReward> = {};
    const rewards = students.reduce(
      (acc, student) => {
        acc[student.id] ||= [];

        const oldRewards = (project.metadata.rewards || {})[student.id];
        if (oldRewards?.length) acc[student.id].push(...oldRewards);

        const newReward = {
          reward_value: `${
            Number(targetReward?.reward_value || 0) - Number(targetReward.reward_value || 0) * (Number(taxedStudents[student.id] || 0) / 100)
          }`,
          tax_value: `${taxedStudents[student.id] || 0}`,
          activity_title: targetReward.activity || ``,
        };

        acc[student.id].push(newReward);
        newRewards[student.id] = newReward;
        return acc;
      },
      {} as Record<string, ClassProjectMetadataReward[]>,
    );

    const newProjectData = {
      ...project,
      metadata: {
        ...project.metadata,
        rewards,
        finished_activities: [...(project.metadata.finished_activities?.filter((e) => e !== targetReward.activity) || []), targetReward?.activity],
      },
    };
    setModalStep(`hidden`);
    await handleSave(newProjectData, newRewards);
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
          <Flex pb={4} gap="6px" w="100%" justify="space-between" borderBottom="1px" borderColor="gray300">
            <Flex fontSize="14px" fontWeight="500" align="center" gap="8px" color="gray800">
              Atividade
            </Flex>
            <Text fontSize="14px" fontWeight="500" color="gray800">
              Cashback
            </Text>
          </Flex>
          {project.project?.book?.metadata?.rewards?.map((reward) => (
            <Tooltip
              key={reward.activity}
              label={
                project.metadata.finished_activities?.includes(reward?.activity || ``) ? 'Atividade concluída' : 'Clique para concluir a atividade'
              }
              isDisabled={!canEdit}
            >
              <motion.button
                disabled={!canEdit || project.metadata.finished_activities?.includes(reward?.activity || ``)}
                whileHover={
                  !canEdit || project.metadata.finished_activities?.includes(reward?.activity || ``)
                    ? undefined
                    : { scale: 1.02, backgroundColor: `#cccccc11` }
                }
                whileTap={!canEdit || project.metadata.finished_activities?.includes(reward?.activity || ``) ? undefined : { scale: 0.98 }}
                onClick={() => {
                  if (!canEdit) return;
                  setTargetReward(reward);
                  setModalStep(`missing_students`);
                }}
                key={reward.activity}
                style={{
                  display: `flex`,
                  padding: '20px',
                  gap: '6px',
                  borderBottom: '1px solid #D0D5DD',
                  fontSize: '14px',
                  fontWeight: '500',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <Flex align="center" gap="0.4rem">
                  {project.metadata.finished_activities?.includes(reward?.activity || ``) ? (
                    <MdOutlineCheckBox fontSize="20px" color="#1db832" />
                  ) : (
                    <MdPendingActions fontSize="20px" color="#4d4f5cdd" />
                  )}
                  <Text>{reward.activity}</Text>
                </Flex>
                <Flex align="center" gap="0.4rem">
                  <Text>{reward.reward_value}</Text>
                  <Image src="/icons/coin.svg" />
                </Flex>
              </motion.button>
            </Tooltip>
          ))}
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
            {project.hub_class?.students?.map((student) => (
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
              ?.filter((s) => !missingStudents.includes(s.id))
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
              ?.filter((s) => !missingStudents.includes(s.id))
              .map((student) => (
                <Flex key={student.id} padding="0.35rem 0.5rem" gap="1rem" justify="space-between" align="center">
                  <Text flex="1" whiteSpace="nowrap">
                    {formatShortName(student.name, true)}
                  </Text>
                  <Flex align="center" gap="0.5rem" justify="space-between">
                    {Number(targetReward?.reward_value || 0) -
                      Number(targetReward?.reward_value || 0) * (Number(taxedStudents[student.id] || 0) / 100)}
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
    </motion.div>
  );
};
