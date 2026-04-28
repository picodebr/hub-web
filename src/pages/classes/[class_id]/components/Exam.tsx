import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Text,
  useColorMode,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Progress,
  Icon,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { FaGraduationCap, FaUsers } from 'react-icons/fa';
import { FiCalendar, FiCheckCircle, FiClock, FiUserCheck, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import moment from 'moment';

import { IHubUser } from '@/_base/interfaces/user';
import { formatShortName } from '@/_base/utils';
import { IHubClass } from '@/_base/interfaces/class';
import { createHubFormClassUser, finishHubFormClass, updateHubFormClassUser } from '@/_base/services/form';
import { IHubFormClass } from '@/_base/interfaces/form';

type RatingQuestion = { id: string; label: string; description?: string; value: number };
type FinishedForms = { student_id: string; questions: RatingQuestion[]; hub_form_class_user_id?: string | null };

interface IProps {
  hub_class: IHubClass | null;
}

export const Exam: React.FC<IProps> = ({ hub_class }) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [targetStudent, setTargetStudent] = useState<IHubUser | null>(null);
  const [lastExam, setLastExam] = useState<IHubFormClass | null>(null);
  const [finishedForms, setFinishedForms] = useState<FinishedForms[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizingEval, setIsFinalizingEval] = useState(false);
  const [currentFormLink, setCurrentFormLink] = useState<IHubFormClass | null>(hub_class?.current_form || null);

  const { isOpen, onClose, onOpen } = useDisclosure();

  const students = hub_class?.students || [];
  const evaluatedCount = finishedForms.length;
  const progressPercent = Math.round((evaluatedCount / (students.length || 1)) * 100);

  const formClassId = currentFormLink?.id;

  // Mapeia as questions do formulário para o formato esperado
  const formQuestions: Omit<RatingQuestion, `value`>[] = useMemo(() => {
    if (!currentFormLink?.form.questions) return [];
    return currentFormLink.form.questions.map((q) => ({
      id: q.id,
      label: q.title,
      description: q.description,
    }));
  }, [currentFormLink?.form.questions]);

  useEffect(() => {
    const _lastExam = hub_class?.form_links
      .filter((f) => f.finished_at)
      .sort((a, b) => new Date(b.finished_at!).getTime() - new Date(a.finished_at!).getTime())[0];

    if (_lastExam) {
      setLastExam(_lastExam);
    }
  }, [hub_class?.form_links]);

  // Carrega as avaliações já existentes quando o formulário muda
  useEffect(() => {
    if (!currentFormLink?.id || !currentFormLink?.student_relations || currentFormLink.student_relations.length === 0) {
      return;
    }

    try {
      const existingEvaluations = currentFormLink.student_relations
        .map((studentRel) => {
          const questions = studentRel.questions
            .map((q) => {
              const formQuestion = currentFormLink.form?.questions?.find((fq) => fq.id === q.question_id);
              if (!formQuestion) return null;

              return {
                id: q.question_id,
                label: formQuestion.title,
                value: q.score,
              };
            })
            .filter(Boolean);

          return {
            student_id: studentRel.hub_user_id,
            questions,
            hub_form_class_user_id: studentRel.id,
          };
        })
        .filter(Boolean) as FinishedForms[];

      setFinishedForms(existingEvaluations);
    } catch (error) {
      console.error('Erro ao carregar avaliações existentes:', error);
    }
  }, [currentFormLink?.id, students]);

  const handleOpenEvaluation = (student: IHubUser) => {
    setTargetStudent(student);
    onOpen();
  };

  const handleSaveEvaluation = useCallback(
    async (questions: RatingQuestion[], onSuccess: () => void) => {
      if (!targetStudent || !formClassId) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregado dados da avaliação.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setIsLoading(true);
      try {
        const existingForm = finishedForms.find((f) => f.student_id === targetStudent.id);
        const questionsData = questions.map((q) => ({
          question_id: q.id,
          score: q.value,
        }));

        if (existingForm?.hub_form_class_user_id) {
          // Atualizar avaliação existente
          await updateHubFormClassUser(existingForm.hub_form_class_user_id, questionsData);
          setFinishedForms((prev) =>
            prev.map((f) =>
              f.student_id === targetStudent.id ? { ...f, questions, hub_form_class_user_id: existingForm.hub_form_class_user_id } : f,
            ),
          );
          toast({
            title: 'Sucesso',
            description: `Avaliação de ${targetStudent.name} atualizada com sucesso.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          // Criar nova avaliação
          await createHubFormClassUser({
            hub_form_class_id: formClassId,
            questions: questionsData,
            hub_user_id: targetStudent.id,
          });

          setFinishedForms((prev) => {
            const exists = prev.find((f) => f.student_id === targetStudent.id);
            if (exists) {
              return prev.map((f) => (f.student_id === targetStudent.id ? { ...f, questions, hub_form_class_user_id: null } : f));
            }
            return [...prev, { student_id: targetStudent.id, questions, hub_form_class_user_id: null }];
          });

          toast({
            title: 'Sucesso',
            description: `Avaliação de ${targetStudent.name} criada com sucesso.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }

        onSuccess();
      } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao salvar a avaliação. Tente novamente.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [targetStudent, formClassId, finishedForms, toast],
  );

  const handleFinishEvaluation = useCallback(async () => {
    if (!formClassId) {
      toast({
        title: 'Erro',
        description: 'Não foi possível finalizar a avaliação.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsFinalizingEval(true);
    try {
      await finishHubFormClass(formClassId);
      setLastExam({ ...currentFormLink, finished_at: new Date().toISOString() });
      setCurrentFormLink((e) => (e ? { ...e, finished_at: new Date().toISOString() } : null));
      toast({
        title: 'Sucesso',
        description: 'Ciclo de avaliação finalizado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao finalizar avaliação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao finalizar a avaliação. Tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsFinalizingEval(false);
    }
  }, [formClassId, toast, currentFormLink]);

  const bgCard = colorMode === 'light' ? 'white' : 'gray800';
  const borderColor = colorMode === 'light' ? 'gray200' : 'gray700';
  const hoverBg = colorMode === 'light' ? 'gray50' : 'rgba(255, 255, 255, 0.05)';
  const textColor = colorMode === 'light' ? 'gray800' : 'white';
  const subTextColor = colorMode === 'light' ? 'gray500' : 'gray400';

  return (
    <Flex direction="column" w="100%" h="100%" gap="1.5rem" overflowY="auto" pb="0.5rem">
      {/* 1. HERO BANNER: Ciclo de Avaliação (DESIGN CLEAN) */}
      <Flex
        bg={bgCard}
        border="1px solid"
        borderColor={borderColor}
        p={{ base: '1.25rem', md: '1.5rem' }}
        borderRadius="2xl"
        align={{ base: 'flex-start', md: 'center' }}
        justify="space-between"
        direction={{ base: 'column', md: 'row' }}
        gap="1.5rem"
        boxShadow="sm"
      >
        <Flex align="center" gap="1rem">
          <Flex bg={colorMode === 'light' ? 'primary50' : 'rgba(255, 255, 255, 0.05)'} p="0.75rem" borderRadius="xl">
            <Icon as={FiCalendar} boxSize="28px" color={colorMode === 'light' ? 'primary500' : 'primary300'} />
          </Flex>
          <Box>
            <Text fontSize="20px" fontWeight="800" lineHeight="1.2" color={textColor}>
              Ciclo de Avaliação Quinzenal
            </Text>
            <Text fontSize="14px" fontWeight="500" color={subTextColor} mt="2px">
              Acompanhe e avalie o desenvolvimento da sua turma.
            </Text>
          </Box>
        </Flex>

        <Flex gap={{ base: '1rem', md: '1.5rem' }} w={{ base: '100%', md: 'auto' }} align="center">
          <Box flex={{ base: 1, md: 'none' }}>
            <Text fontSize="12px" fontWeight="700" color={subTextColor} textTransform="uppercase">
              Última Avaliação
            </Text>
            <Text fontSize="16px" fontWeight="800" color={textColor}>
              {lastExam?.finished_at ? moment(lastExam?.finished_at).format('DD/MM/YYYY') : '-'}
            </Text>
          </Box>

          {currentFormLink?.finished_at && (
            <Divider orientation="vertical" h="32px" borderColor={borderColor} display={{ base: 'none', md: 'block' }} />
          )}

          {currentFormLink?.finished_at && (
            <Box flex={{ base: 1, md: 'none' }}>
              <Text fontSize="12px" fontWeight="700" color="primary500" textTransform="uppercase">
                Próxima
              </Text>
              <Text fontSize="16px" fontWeight="800" color={colorMode === 'light' ? 'primary600' : 'primary300'}>
                {moment(currentFormLink?.finished_at).add(15, 'days').format('DD/MM/YYYY')}
              </Text>
            </Box>
          )}
        </Flex>
      </Flex>

      {/* 2. ESTATÍSTICAS DA TURMA */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="1rem">
        <StatCard
          icon={FaGraduationCap}
          label="Turma"
          value={hub_class?.display_name || '...'}
          bg={bgCard}
          border={borderColor}
          textColor={textColor}
        />
        <StatCard icon={FaUsers} label="Total de Alunos" value={students.length} bg={bgCard} border={borderColor} textColor={textColor} />

        <Flex
          direction="column"
          justify="center"
          bg={bgCard}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="xl"
          p="1.25rem"
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb="0.5rem">
            <Text fontSize="12px" color="gray500" fontWeight="bold" textTransform="uppercase">
              Progresso
            </Text>
            <Text fontSize="14px" fontWeight="800" color="primary500">
              {progressPercent}%
            </Text>
          </Flex>
          <Progress
            value={progressPercent}
            size="sm"
            borderRadius="full"
            bg={colorMode === 'light' ? 'gray100' : 'gray700'}
            sx={{ '& > div': { bg: 'success500' } }}
          />
          <Text fontSize="12px" color="gray500" mt="0.5rem" fontWeight="500">
            {evaluatedCount} de {students.length} avaliados
          </Text>
        </Flex>
      </Grid>

      {/* 3. BOTÃO FINALIZAR AVALIAÇÃO */}
      {!currentFormLink?.finished_at && evaluatedCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Button
            w="100%"
            size="lg"
            borderRadius="xl"
            bg="success500"
            color="white"
            _hover={{ bg: 'success600' }}
            isLoading={isFinalizingEval}
            leftIcon={<Icon as={FiCheck} />}
            onClick={handleFinishEvaluation}
          >
            Finalizar Ciclo de Avaliação
          </Button>
        </motion.div>
      )}

      {/* 4. LISTA DE ALUNOS */}
      <Box bg={bgCard} borderRadius="2xl" border="1px solid" borderColor={borderColor} boxShadow="sm" overflow="hidden" flex="1">
        <Flex bg={hoverBg} p="1rem 1.5rem" borderBottom="1px solid" borderColor={borderColor} justify="space-between" align="center">
          <Text fontWeight="700" color={textColor}>
            Status de Avaliação dos Alunos
          </Text>
          {currentFormLink?.finished_at && (
            <Flex
              align="center"
              gap="0.25rem"
              bg="success50"
              color="success600"
              px="0.75rem"
              py="0.25rem"
              borderRadius="full"
              fontSize="16px"
              border="1px"
              fontWeight="600"
            >
              <Icon as={FiCheckCircle} /> Avaliação finalizada
            </Flex>
          )}
        </Flex>

        <Flex direction="column" overflowY="auto" maxH="calc(100% - 3rem)" p="0.5rem">
          <motion.div variants={listVariants} initial="hidden" animate="show">
            {students.map((student) => {
              const isFinished = !!finishedForms.find((f) => f.student_id === student.id);

              return (
                <motion.div key={student.id} variants={itemVariants}>
                  <Flex
                    align="center"
                    justify="space-between"
                    p="1rem"
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    _last={{ borderBottom: 'none' }}
                    transition="all 0.2s"
                    _hover={{ bg: hoverBg }}
                  >
                    <Flex align="center" gap="1rem" flex="1" minW={0}>
                      <Avatar
                        size="md"
                        name={formatShortName(student.name)}
                        src={student.avatar || ''}
                        border="2px solid"
                        borderColor={isFinished ? 'success500' : 'gray200'}
                      />
                      <Flex direction="column" minW={0}>
                        <Text fontWeight="700" fontSize="16px" color={textColor} isTruncated>
                          {student.name}
                        </Text>
                        <Text fontSize="13px" color="gray500" isTruncated>
                          @{student.username}
                        </Text>
                      </Flex>
                    </Flex>

                    <Flex align="center" gap="1.5rem">
                      <Flex display={{ base: 'none', md: 'flex' }}>
                        {isFinished ? (
                          <Flex
                            align="center"
                            gap="0.25rem"
                            bg="success50"
                            color="success600"
                            px="0.75rem"
                            py="0.25rem"
                            borderRadius="full"
                            fontSize="13px"
                            fontWeight="600"
                          >
                            <Icon as={FiCheckCircle} /> Avaliado
                          </Flex>
                        ) : (
                          <Flex
                            align="center"
                            gap="0.25rem"
                            bg="warning50"
                            color="warning600"
                            px="0.75rem"
                            py="0.25rem"
                            borderRadius="full"
                            fontSize="13px"
                            fontWeight="600"
                          >
                            <Icon as={FiClock} /> Pendente
                          </Flex>
                        )}
                      </Flex>

                      {!currentFormLink?.finished_at &&
                        (isFinished ? (
                          <Button
                            size="sm"
                            borderRadius="lg"
                            px="1.5rem"
                            bg="transparent"
                            border="1px solid"
                            borderColor="primary600"
                            color="primary600"
                            _hover={{ bg: 'primary50' }}
                            onClick={() => handleOpenEvaluation(student)}
                          >
                            Revisar
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            borderRadius="lg"
                            px="1.5rem"
                            bg="primary600"
                            color="white"
                            _hover={{ bg: 'primary700' }}
                            onClick={() => handleOpenEvaluation(student)}
                          >
                            Avaliar
                          </Button>
                        ))}
                    </Flex>
                  </Flex>
                </motion.div>
              );
            })}
          </motion.div>
        </Flex>
      </Box>

      {/* MODAL DE AVALIAÇÃO */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent bg={bgCard} borderRadius="2xl" overflow="hidden">
          <ModalCloseButton zIndex={10} />
          {targetStudent && (
            <EvaluationForm
              student={targetStudent}
              onClose={onClose}
              onSave={handleSaveEvaluation}
              existingData={finishedForms.find((f) => f.student_id === targetStudent?.id)?.questions}
              isLoading={isLoading}
              formQuestions={formQuestions || []}
              formTitle={currentFormLink?.form.title}
              formDescription={currentFormLink?.form.description}
            />
          )}
        </ModalContent>
      </Modal>
    </Flex>
  );
};

// --- COMPONENTES AUXILIARES ---

function StatCard({ icon: IconComponent, label, value, bg, border, textColor }: any) {
  return (
    <Flex align="center" gap="1rem" bg={bg} p="1.25rem" borderRadius="xl" border="1px solid" borderColor={border} boxShadow="sm">
      <Flex h="48px" w="48px" align="center" justify="center" borderRadius="xl" bg="primary50" color="primary500">
        <IconComponent size="24px" />
      </Flex>
      <Box>
        <Text fontSize="12px" color="gray500" fontWeight="bold" textTransform="uppercase" letterSpacing="0.5px">
          {label}
        </Text>
        <Text fontSize="22px" fontWeight="800" color={textColor} lineHeight="1.2">
          {value}
        </Text>
      </Box>
    </Flex>
  );
}

// --- FORMULÁRIO DE AVALIAÇÃO ---

function EvaluationForm({
  student,
  onClose,
  onSave,
  existingData,
  isLoading = false,
  formQuestions = [],
  formTitle,
  formDescription,
}: {
  student: IHubUser;
  onClose: () => void;
  onSave: (q: RatingQuestion[], onSuccess: () => void) => Promise<void>;
  existingData?: RatingQuestion[];
  isLoading?: boolean;
  formQuestions?: Array<{ id: string; label: string; description?: string }>;
  formTitle?: string;
  formDescription?: string | null;
}) {
  const { colorMode } = useColorMode();
  const [questions, setQuestions] = useState<RatingQuestion[]>(existingData || formQuestions.map((q) => ({ ...q, value: 0 })));
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRate = (id: string, value: number) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, value } : q)));
  };

  const allAnswered = questions.every((q) => q.value > 0);

  const handleSubmit = async () => {
    await onSave(questions, () => setIsSuccess(true));
  };

  const borderColor = colorMode === 'light' ? 'gray200' : 'gray700';
  const modalBg = colorMode === 'light' ? 'white' : 'gray800';
  const headerBg = colorMode === 'light' ? 'gray50' : 'rgba(255, 255, 255, 0.05)';
  const textColor = colorMode === 'light' ? 'gray800' : 'white';

  if (isSuccess) {
    return (
      <ModalBody p="3rem 2rem" textAlign="center" bg={modalBg}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Flex direction="column" align="center" gap="1rem">
            <Icon as={FiUserCheck} fontSize="4rem" color="success500" />
            <Text fontSize="24px" fontWeight="800" color={textColor}>
              Avaliação Registrada!
            </Text>
            <Text color="gray500" fontSize="15px" mb="1.5rem">
              O feedback para <b>{student.name}</b> foi salvo com sucesso. Ele ajudará no desenvolvimento do aluno.
            </Text>
            <Button bg="success500" color="white" _hover={{ bg: 'success600' }} w="100%" size="lg" borderRadius="xl" onClick={onClose}>
              Retornar à Lista
            </Button>
          </Flex>
        </motion.div>
      </ModalBody>
    );
  }

  return (
    <ModalBody p="0" bg={modalBg}>
      {/* Cabeçalho do Aluno */}
      <Flex bg={headerBg} p="1.5rem" borderBottom="1px solid" borderColor={borderColor} align="center" gap="1rem">
        <Avatar size="lg" name={student.name} src={student.avatar || ''} border="3px solid white" boxShadow="sm" />
        <Box>
          <Text fontSize="13px" fontWeight="700" color="primary500" textTransform="uppercase">
            Avaliando Aluno(a)
          </Text>
          <Text fontSize="22px" fontWeight="800" lineHeight="1.2" color={textColor}>
            {student.name}
          </Text>
        </Box>
      </Flex>

      {/* Lista de Critérios */}
      <Flex direction="column" p="1.5rem" gap="1rem" maxH="50vh" overflowY="auto">
        {formTitle && (
          <Box mb="0.5rem">
            <Text fontSize="16px" fontWeight="700" color={textColor} mb="0.5rem">
              {formTitle}
            </Text>
            {formDescription && (
              <Text fontSize="14px" color="gray500" lineHeight="1.5">
                {formDescription}
              </Text>
            )}
          </Box>
        )}

        <Text fontSize="14px" color="gray500" mb="0.5rem">
          Avalie o aluno de 1 a 5 estrelas nos critérios abaixo:
        </Text>

        {questions.map((q) => (
          <RatingQuestion
            id={q.id}
            question={q.description || ``}
            title={q.label}
            rating={q.value}
            onRatingChange={(id, star) => handleRate(id, star)}
          />
        ))}
      </Flex>

      {/* Footer / Ações */}
      <Flex p="1.5rem" borderTop="1px solid" borderColor={borderColor} bg={modalBg}>
        <Button
          w="100%"
          size="lg"
          borderRadius="xl"
          bg={allAnswered ? 'primary600' : 'gray300'}
          color="white"
          _hover={allAnswered ? { bg: 'primary700' } : {}}
          isDisabled={!allAnswered || isLoading}
          isLoading={isLoading}
          onClick={handleSubmit}
        >
          {existingData ? 'Atualizar Avaliação' : 'Concluir Avaliação'}
        </Button>
      </Flex>
    </ModalBody>
  );
}

// Animações da lista
const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

interface RatingQuestionProps {
  id: string;
  title: string;
  question: string;
  rating: number | null;
  onRatingChange: (id: string, rating: number) => void;
}

export const RatingQuestion: React.FC<RatingQuestionProps> = ({ id, title, question, rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(null);
  };

  return (
    <motion.div className="question-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Flex direction="column" gap="1rem">
        <Text fontWeight="600" fontSize="16px">
          {title}
        </Text>

        <p className="text-gray-600 mb-6">{question}</p>

        <div className="flex flex-col items-center">
          <div className="flex space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = hoverRating !== null ? star <= hoverRating : rating !== null && star <= rating;

              return (
                <motion.button
                  key={star}
                  className="focus:outline-none"
                  onClick={() => onRatingChange(id, star)}
                  onMouseEnter={() => handleMouseEnter(star)}
                  onMouseLeave={handleMouseLeave}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={isActive ? '#ffd166' : 'none'}
                    stroke={isActive ? '#ffd166' : '#cbd5e1'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-10 h-10"
                    animate={{
                      scale: isActive ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </motion.svg>
                </motion.button>
              );
            })}
          </div>

          <motion.p className="text-sm text-gray-500 mt-2" animate={{ opacity: rating ? 1 : 0.5 }}>
            {rating
              ? rating === 5
                ? 'Excelente! Você atribuiu a nota máxima.'
                : rating === 1
                  ? 'Muito baixo. Agradecemos seu feedback.'
                  : `Você selecionou ${rating} ${rating === 1 ? 'estrela' : 'estrelas'}.`
              : 'Selecione uma classificação acima'}
          </motion.p>
        </div>
      </Flex>
    </motion.div>
  );
};
