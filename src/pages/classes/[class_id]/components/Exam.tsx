import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Text,
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
  Heading,
} from '@chakra-ui/react';
import { FaGraduationCap, FaUsers } from 'react-icons/fa';
import { FiCalendar, FiCheckCircle, FiClock, FiUserCheck, FiCheck, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import moment from 'moment';

import { IHubUser } from '@/_base/interfaces/user';
import { formatShortName } from '@/_base/utils';
import { IHubClass } from '@/_base/interfaces/class';
import { createHubFormClassUser, finishHubFormClass, updateHubFormClassUser } from '@/_base/services/form';
import { IHubFormClass } from '@/_base/interfaces/form';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
import { TabSwitch } from '@/components/TabSwitch';
import { SelectInput } from '@/components/Inputs/Select';
import { ClassSkillChart, IDailySkillAverage } from './ClassSkillChart';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAsyncCallback } from '@/_base/hooks';

type RatingQuestion = { id: string; label: string; description?: string; value: number };
type FinishedForms = { student_id: string; questions: RatingQuestion[]; hub_form_class_user_id?: string | null };

interface IProps {
  hub_class: IHubClass | null;
}

interface IEvaluationRecord {
  student_id: string | number;
  category: string;
  score: number;
  created_at: string;
}

const pageViews = ['Avaliar', 'Histórico'];
type PageView = (typeof pageViews)[number];

export const Exam: React.FC<IProps> = ({ hub_class }) => {
  const [targetStudent, setTargetStudent] = useState<IHubUser | null>(null);
  const [lastExam, setLastExam] = useState<IHubFormClass | null>(null);
  const [finishedForms, setFinishedForms] = useState<FinishedForms[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizingEval, setIsFinalizingEval] = useState(false);
  const [currentFormLink, setCurrentFormLink] = useState<IHubFormClass | null>(hub_class?.current_form || null);
  const [pageView, setPageView] = useState<PageView>('Avaliar');
  const [selectedStudentOptions, setSelectedStudentOptions] = useState([{ label: 'TODOS (Média Geral da Turma)', value: 'ALL' }]);

  const { isOpen, onClose, onOpen } = useDisclosure();
  const { colorMode } = useDarkMode();
  const toast = useToast();
  const pdfExportRef = useRef<HTMLDivElement>(null);

  const students = hub_class?.students || [];
  const evaluatedCount = finishedForms.length;
  const progressPercent = Math.round((evaluatedCount / (students.length || 1)) * 100);

  const formClassId = currentFormLink?.id;

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
      if (!targetStudent || !formClassId) return;
      setIsLoading(true);
      try {
        const existingForm = finishedForms.find((f) => f.student_id === targetStudent.id);
        const questionsData = questions.map((q) => ({
          question_id: q.id,
          score: q.value,
        }));

        if (existingForm?.hub_form_class_user_id) {
          await updateHubFormClassUser(existingForm.hub_form_class_user_id, questionsData);
          setFinishedForms((prev) =>
            prev.map((f) =>
              f.student_id === targetStudent.id ? { ...f, questions, hub_form_class_user_id: existingForm.hub_form_class_user_id } : f,
            ),
          );
          toast({ title: 'Sucesso', description: `Avaliação atualizada.`, status: 'success', duration: 3000 });
        } else {
          await createHubFormClassUser({
            hub_form_class_id: formClassId,
            questions: questionsData,
            hub_user_id: targetStudent.id,
          });

          setFinishedForms((prev) => {
            const exists = prev.find((f) => f.student_id === targetStudent.id);
            if (exists) return prev.map((f) => (f.student_id === targetStudent.id ? { ...f, questions, hub_form_class_user_id: null } : f));
            return [...prev, { student_id: targetStudent.id, questions, hub_form_class_user_id: null }];
          });
          toast({ title: 'Sucesso', description: `Avaliação criada.`, status: 'success', duration: 3000 });
        }
        onSuccess();
      } catch (error) {
        toast({ title: 'Erro', description: 'Erro ao salvar.', status: 'error', duration: 3000 });
      } finally {
        setIsLoading(false);
      }
    },
    [targetStudent, formClassId, finishedForms, toast],
  );

  const handleFinishEvaluation = useCallback(async () => {
    if (!formClassId) return;
    setIsFinalizingEval(true);
    try {
      await finishHubFormClass(formClassId);
      setLastExam({ ...currentFormLink, finished_at: new Date().toISOString() });
      setCurrentFormLink((e) => (e ? { ...e, finished_at: new Date().toISOString() } : null));
      toast({ title: 'Sucesso', description: 'Ciclo finalizado!', status: 'success', duration: 3000 });
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao finalizar.', status: 'error', duration: 3000 });
    } finally {
      setIsFinalizingEval(false);
    }
  }, [formClassId, toast, currentFormLink]);

  const handleExportCharts = useAsyncCallback(
    async () => {
      if (!pdfExportRef.current) return;

      try {
        await document.fonts.ready;

        // Pausa para a UI respirar e atualizar o botão de loading
        await new Promise((resolve) => {
          requestAnimationFrame(() => setTimeout(resolve, 150));
        });

        const canvas = await html2canvas(pdfExportRef.current, {
          scale: 1.5, // Reduzido de 2 para 1.5 para mais velocidade e menos RAM
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false, // Otimização de performance
          onclone: (clonedDoc) => {
            clonedDoc.querySelectorAll('[data-pdf-ignore="true"]').forEach((el) => {
              if (el instanceof HTMLElement) el.style.display = 'none';
            });
            const header = clonedDoc.querySelector('[data-pdf-header="true"]');
            if (header instanceof HTMLElement) header.style.display = 'block';
          },
        });

        const imgData = canvas.toDataURL('image/png');

        // Definição da altura dinâmica
        const pdfWidth = 210; // mm (equivalente à largura A4)
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: [pdfWidth, pdfHeight],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        const safeClassName = hub_class?.display_name ? hub_class.display_name.replace(/\s+/g, '_') : 'Turma';
        pdf.save(`Historico_Avaliacoes_${safeClassName}.pdf`);

        toast({ title: 'Sucesso', description: 'Relatório gerado com sucesso!', status: 'success', duration: 3000 });
      } catch (err) {
        console.error('Erro ao gerar PDF:', err);
        toast({ title: 'Erro', description: 'Ocorreu um erro ao gerar o PDF.', status: 'error', duration: 3000 });
      }
    },
    [],
    true,
    () => setIsLoading(false),
  );

  const bgCard = colorMode === 'light' ? 'white' : 'gray800';
  const borderColor = colorMode === 'light' ? 'gray200' : 'gray700';
  const hoverBg = colorMode === 'light' ? 'gray50' : 'rgba(255, 255, 255, 0.05)';
  const textColor = colorMode === 'light' ? 'gray800' : 'white';
  const subTextColor = colorMode === 'light' ? 'gray500' : 'gray400';

  return (
    <Flex direction="column" w="100%" h="100%" gap="1.5rem" pb="2rem" position="relative">
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap="1rem"
        position="absolute"
        right="0"
        top="-4.75rem"
      >
        <TabSwitch
          tabs={pageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
          onSwitch={(view) => setPageView(view as any)}
        />
      </Flex>
      <Flex gap="2rem" w="100%">
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
          flex="1"
        >
          <Flex align="center" gap="1rem">
            <Flex bg={colorMode === 'light' ? 'primary50' : 'rgba(255, 255, 255, 0.05)'} p="0.75rem" borderRadius="xl">
              <Icon as={FiCalendar} boxSize="28px" color={colorMode === 'light' ? 'primary500' : 'primary300'} />
            </Flex>
            <Box>
              <Text fontSize="20px" fontWeight="800" lineHeight="1.2" color={textColor}>
                {pageView === 'Avaliar' ? 'Ciclo de Avaliação Quinzenal' : 'Histórico de Avaliações'}
              </Text>
              <Text fontSize="14px" fontWeight="500" color={subTextColor} mt="2px">
                {pageView === 'Avaliar' ? 'Acompanhe e avalie o desenvolvimento da sua turma.' : 'Visualize o histórico de avaliações da sua turma.'}
              </Text>
            </Box>
          </Flex>

          {pageView === `Avaliar` && (
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
          )}
        </Flex>
        {pageView === `Histórico` && (
          <StatCard
            icon={FaGraduationCap}
            label="Turma"
            value={hub_class?.display_name || '...'}
            bg={bgCard}
            border={borderColor}
            textColor={textColor}
          />
        )}
      </Flex>

      {pageView === `Avaliar` && (
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
      )}

      {!currentFormLink?.finished_at && evaluatedCount > 0 && pageView === `Avaliar` && (
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

      <Box bg={bgCard} borderRadius="2xl" border="1px solid" borderColor={borderColor} boxShadow="sm" flex="1">
        <Flex
          bg={hoverBg}
          borderRadius="16px 16px 0 0"
          p="1rem 1.5rem"
          borderBottom="1px solid"
          borderColor={borderColor}
          justify="space-between"
          align="center"
        >
          <Text fontWeight="700" color={textColor}>
            {pageView === `Avaliar` ? 'Status de Avaliação dos Alunos' : 'Histórico'}
          </Text>
          {currentFormLink?.finished_at && pageView === `Avaliar` && (
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

        <Flex direction="column" h="100%">
          {pageView === `Avaliar` ? (
            <motion.div variants={listVariants} initial="hidden" animate="show" style={{ height: `100%`, borderRadius: `16px` }}>
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
          ) : (
            <Box width="100%">
              {/* Contêiner do PDF injetando a stack tipográfica */}
              <Box ref={pdfExportRef} p={4} bg="transparent" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" }}>
                <Box data-pdf-header="true" display="none" mb={6}>
                  <Heading size="lg" color="#1A202C" pb={4} fontFamily="'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif">
                    {hub_class?.display_name || 'Histórico de Avaliações'}
                  </Heading>

                  <Box bg="#F8FAFC" p={3} borderRadius="md" border="1px solid #E2E8F0" mb={2}>
                    <Text fontSize="xs" fontWeight="bold" color="#64748B" textTransform="uppercase" mb={1}>
                      Alunos Selecionados na Visualização:
                    </Text>

                    {(() => {
                      const isAllSelected = selectedStudentOptions.some((opt: any) => opt.value === 'ALL');

                      if (isAllSelected) {
                        return (
                          <Text fontSize="sm" fontWeight="600" color="#1E293B">
                            *Todos alunos da turma
                          </Text>
                        );
                      }

                      const names = selectedStudentOptions.map((opt: any) => opt.label);

                      if (names.length > 3) {
                        return (
                          <Text fontSize="sm" color="#334155" lineHeight="relaxed">
                            {names.join(', ')}
                          </Text>
                        );
                      }

                      // Até 6 alunos ficam listados linha a linha
                      return (
                        <Flex direction="column" gap={0.5} mt={1}>
                          {names.map((name) => (
                            <Text key={name} fontSize="sm" color="#334155">
                              • {name}
                            </Text>
                          ))}
                        </Flex>
                      );
                    })()}
                  </Box>
                </Box>

                {/* Controles de Tela (Marcados com data-pdf-ignore para sumirem no print) */}
                <Flex align="center" justify="space-between" mb={6} data-pdf-ignore="true">
                  <Box maxWidth="500px" minWidth="500px">
                    <SelectInput
                      instanceId={1}
                      isMulti={true}
                      placeholder="Selecione os alunos..."
                      value={selectedStudentOptions}
                      options={[
                        { label: 'TODOS (Média Geral da Turma)', value: 'ALL' },
                        ...(hub_class?.students || []).map((student) => ({
                          label: student.name,
                          value: String(student.id),
                        })),
                      ]}
                      onChange={(selected: any) => {
                        if (Array.isArray(selected) && selected.some((opt: any) => opt.value === 'ALL')) {
                          setSelectedStudentOptions([{ label: 'TODOS (Média Geral da Turma)', value: 'ALL' }]);
                        } else {
                          setSelectedStudentOptions(selected || []);
                        }
                      }}
                    />
                  </Box>

                  <Button
                    leftIcon={<FiDownload />}
                    colorScheme="blue"
                    size="sm"
                    isLoading={isLoading}
                    loadingText="Exportando..."
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsLoading(true);
                      handleExportCharts();
                    }}
                  >
                    Exportar
                  </Button>
                </Flex>

                {/* Grade dos Gráficos */}
                {(() => {
                  const isAllSelected = selectedStudentOptions.some((opt: any) => opt.value === 'ALL');
                  const activeStudentIds = new Set(
                    isAllSelected
                      ? (hub_class?.students || []).map((s: any) => String(s.id))
                      : selectedStudentOptions.map((opt: any) => String(opt.value)),
                  );

                  const allEvaluations: IEvaluationRecord[] =
                    hub_class?.form_links.reduce((acc, form_link) => {
                      const exams: IEvaluationRecord[] = [];
                      form_link.student_relations.forEach((studentRel) => {
                        studentRel.questions.forEach((q) => {
                          exams.push({
                            category: form_link.form.questions.find((e) => e.id === q.question_id)?.title || 'Habilidade Desconhecida',
                            score: q.score,
                            student_id: studentRel.hub_user_id,
                            created_at: form_link.finished_at || new Date().toISOString(),
                          });
                        });
                      });
                      acc.push(...exams);
                      return acc;
                    }, [] as IEvaluationRecord[]) || [];

                  const uniqueSkills = Array.from(new Set(allEvaluations.map((e) => e.category))).filter(Boolean);

                  if (uniqueSkills.length === 0) {
                    return (
                      <Text color="gray.500" py={8} textAlign="center">
                        Nenhuma avaliação registrada até o momento.
                      </Text>
                    );
                  }

                  return (
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6} width="100%">
                      {uniqueSkills.map((skillName) => {
                        const skillEvals = allEvaluations.filter((e) => e.category === skillName);
                        const dailyMap = new Map<string, { sum: number; count: number }>();

                        skillEvals.forEach((ev) => {
                          if (!activeStudentIds.has(String(ev.student_id))) return;
                          const exactDay = new Date(ev.created_at).toLocaleDateString('pt-BR');
                          const current = dailyMap.get(exactDay) || { sum: 0, count: 0 };
                          dailyMap.set(exactDay, {
                            sum: current.sum + Number(ev.score || 0),
                            count: current.count + 1,
                          });
                        });

                        const chartData: IDailySkillAverage[] = Array.from(dailyMap.entries())
                          .map(([date, { sum, count }]) => ({
                            date,
                            média: count > 0 ? Number((sum / count).toFixed(2)) : 0,
                          }))
                          .sort((a, b) => {
                            const [dA, mA, yA] = a.date.split('/').map(Number);
                            const [dB, mB, yB] = b.date.split('/').map(Number);
                            return new Date(yA, mA - 1, dA).getTime() - new Date(yB, mB - 1, dB).getTime();
                          });

                        return <ClassSkillChart key={skillName} skillName={skillName} data={chartData} />;
                      })}
                    </Grid>
                  );
                })()}
              </Box>
            </Box>
          )}
        </Flex>
      </Box>

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

function EvaluationForm({ student, onClose, onSave, existingData, isLoading = false, formQuestions = [], formTitle, formDescription }: any) {
  const { colorMode } = useDarkMode();
  const [questions, setQuestions] = useState<RatingQuestion[]>(existingData || formQuestions.map((q: any) => ({ ...q, value: 0 })));
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRate = (id: string, value: number) => setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, value } : q)));
  const allAnswered = questions.every((q) => q.value > 0);
  const handleSubmit = async () => await onSave(questions, () => setIsSuccess(true));

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
              O feedback para <b>{student.name}</b> foi salvo com sucesso.
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
      <Flex direction="column" p="1.5rem" gap="1rem" maxH="50vh" overflowY="auto">
        {formTitle && (
          <Box mb="0.5rem">
            <Text fontSize="16px" fontWeight="700" color={textColor} mb="0.5rem">
              {formTitle}
            </Text>
            {formDescription && (
              <Text fontSize="14px" color="gray500">
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
            key={q.id}
            id={q.id}
            question={q.description || ``}
            title={q.label}
            rating={q.value}
            onRatingChange={(id, star) => handleRate(id, star)}
          />
        ))}
      </Flex>
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

const listVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface RatingQuestionProps {
  id: string;
  title: string;
  question: string;
  rating: number | null;
  onRatingChange?: (id: string, rating: number) => void;
  viewOnly?: boolean;
}

export const RatingQuestion: React.FC<RatingQuestionProps> = ({ id, title, question, rating, onRatingChange, viewOnly }) => {
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
                  onClick={() => onRatingChange?.(id, star)}
                  onMouseEnter={viewOnly ? undefined : () => handleMouseEnter(star)}
                  onMouseLeave={viewOnly ? undefined : handleMouseLeave}
                  whileHover={viewOnly ? undefined : { scale: 1.2 }}
                  whileTap={viewOnly ? undefined : { scale: 0.9 }}
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
