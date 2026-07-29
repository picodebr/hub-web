import { useEffect, useMemo, useState } from 'react';
import { GetServerSideProps } from 'next';
import { FaPlus } from 'react-icons/fa';
import { FiUsers, FiArrowUpRight, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Checkbox, Skeleton, Flex, Text, Icon, Box, Heading, Grid, useUpdateEffect } from '@chakra-ui/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { useAsyncCallback, useAuth, useCustomToast, useCustomRouter, useDarkMode } from '@/_base/hooks';
import { PageDataType } from '@/_base/interfaces/shared/IPageData';
import { IHubClass } from '@/_base/interfaces/class';
import { addClasses, downloadClassForms, listAllClasses, listMyClasses, removeClass } from '@/_base/services/class';
import { EmptyPageData } from '@/components/EmptyPageData';
import { SmallModal } from '@/components/Modal/Small';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { sortGradesByClass } from '@/_base/utils';
import { InternalPageHeader } from '@/components/InternalPageHeader';
import { Users } from 'lucide-react';
import { ClassSkillChart } from './[class_id]/components/ClassSkillChart';
import { isUuid } from 'uuidv4';

type ModalType = { class_code?: boolean; confirm_remove?: boolean; classCodeToRemove?: string };

interface IEvaluationRecord {
  student_id: string | number;
  category: string;
  score: number;
  created_at: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const getColorByGrade = (grade: string): string => {
  const colorMap: { [key: string]: string } = {
    G3: '#D946EF',
    '6': '#8B5CF6',
    '7': '#06B6D4',
    '8': '#10B981',
    '9': '#F59E0B',
    'MakersPro Mini': '#EC4899',
    'MakersPro Explorers': '#3B82F6',
    'MakersPro Creators': '#8B5CF6',
    'MakersPro Innovators': '#06B6D4',
    'MakersPro Experts': '#F59E0B',
    CulturaTech: '#EF4444',
  };
  return colorMap[grade] || '#6366F1';
};

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<PageDataType<IHubClass>>({ data: [] });
  const [allClasses, setAllClasses] = useState<IHubClass[]>([]);
  const [modalOpt, setOpenOpt] = useState<ModalType>({});
  const [selectedClasses, setSelectedClasses] = useState<IHubClass[]>([]);
  const [fullClassData, setFullClassData] = useState<IHubClass[]>([]);

  // Estados de controle para o PDF
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  const [exportingClassId, setExportingClassId] = useState<string | null>(null);

  const { school } = useSelectedSchool();
  const { user } = useAuth();
  const toast = useCustomToast();
  const router = useCustomRouter();
  const { colorMode } = useDarkMode();

  const sortedClasses = useMemo(() => sortGradesByClass([...classes.data]), [classes.data]);

  useUpdateEffect(() => {
    if (!sortedClasses.length || !!sortedClasses.find((c) => !isUuid(c.id))) return;
    downloadClassForms(sortedClasses.map((c) => c.id))
      .then((classData) =>
        setFullClassData(
          sortedClasses
            .map((c) => ({ ...c, form_links: classData.filter((d) => d.hub_class_id === c.id) || [] }))
            .filter((e) => e.form_links.length) || [],
        ),
      )
      .catch((err) => {
        console.error('Erro ao baixar os formulários das turmas:', err);
      });
  }, [sortedClasses]);

  const getClasses = useAsyncCallback(
    async (school_id: string) => {
      if (!school_id) return;
      const [userClasses, schoolClasses] = await Promise.all([listMyClasses(school_id), listAllClasses(school_id)]);
      setAllClasses(schoolClasses);
      setClasses({ _isLoading: false, data: user.role === `master` ? schoolClasses : userClasses });
    },
    [school],
  );

  useEffect(() => {
    setClasses(() => ({ data: [{ id: '1' }, { id: '2' }, { id: '3' }] as any, _isLoading: true }));
    getClasses(school?.hub_school_id || user.chosen_school_id || ``);
  }, [school, user]);

  const handleAddClasses = useAsyncCallback(async () => {
    try {
      setClasses((s) => ({ ...s, _isLoading: true }));
      const newClasses = await addClasses({ class_ids: selectedClasses.map((e) => e.id) });
      setClasses((s) => ({ ...s, data: [...newClasses, ...s.data], _isLoading: false }));
      onCloseModal();
    } catch {
      toast({ status: `error`, description: `Ocorreu um erro ao vincular as turmas, por favor tente novamente` });
    } finally {
      setClasses((s) => ({ ...s, _isLoading: false }));
    }
  }, []);

  const handleRemoveClass = useAsyncCallback(async () => {
    if (!modalOpt.classCodeToRemove) return;
    setClasses((s) => ({ ...s, _isLoading: true }));
    await removeClass(modalOpt.classCodeToRemove);
    setTimeout(() => {
      setClasses((s) => ({ data: s.data.filter((e) => e.code !== modalOpt.classCodeToRemove) }));
      onCloseModal();
    }, 1000);
  }, []);

  const onCloseModal = () => {
    setSelectedClasses([]);
    setOpenOpt({});
  };

  const classIsAvailable = (hubClass: IHubClass): boolean => {
    return !classes.data?.find((e) => e.id === hubClass.id);
  };

  const handleChangeSelectedClass = (hubClass: IHubClass, adding: boolean) => {
    if (!selectedClasses.find((e) => e.id === hubClass.id) && adding) setSelectedClasses((s) => [hubClass, ...s]);
    if (!adding) setSelectedClasses((s) => s.filter((e) => e.id !== hubClass.id));
  };

  const navigateToClass = (hubClass: IHubClass) => {
    router.push(`/classes/${hubClass.id}?_p=${hubClass.display_name}`);
  };

  const handleExportAllCharts = useAsyncCallback(async () => {
    if (fullClassData.length === 0) return;

    setIsExporting(true);
    setExportProgress({ current: 0, total: fullClassData.length });

    try {
      await document.fonts.ready;
      let pdf: jsPDF | null = null;
      const pdfWidth = 210;
      let hasAddedPage = false;

      for (let i = 0; i < fullClassData.length; i++) {
        const hubClass = fullClassData[i];

        // Atualiza a UI do botão e injeta SOMENTE esta turma no DOM oculto
        setExportProgress({ current: i + 1, total: fullClassData.length });
        setExportingClassId(hubClass.id);

        // PAUSA OBRIGATÓRIA (1s)
        // Isso dá tempo para o React montar a turma, os gráficos carregarem
        // as animações, e o navegador limpar o lixo de memória da rodada anterior.
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const element = document.getElementById(`pdf-class-export-${hubClass.id}`);
        if (!element) continue;

        const hasEvals = element.getAttribute('data-has-evals') === 'true';
        if (!hasEvals) continue;

        // Tira o Print (com escala reduzida de 2 para 1.5 para salvar RAM, mantendo alta qualidade)
        const canvas = await html2canvas(element, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false, // Desliga os logs internos do html2canvas para ganhar ms
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (!pdf) {
          pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: [pdfWidth, pdfHeight] });
        } else {
          pdf.addPage([pdfWidth, pdfHeight], 'p');
        }

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        hasAddedPage = true;
      }

      if (pdf && hasAddedPage) {
        pdf.save(`Historico_Avaliacoes_${school?.display_name || 'Turmas'}.pdf`);
        toast({ status: 'success', description: 'Relatórios gerados com sucesso!' });
      } else {
        toast({ status: 'warning', description: 'Nenhuma avaliação encontrada nas turmas atuais.' });
      }
    } catch (err) {
      console.error('Erro ao gerar PDF de todas as turmas:', err);
      toast({ status: 'error', description: 'Erro ao gerar o PDF.' });
    } finally {
      // 4. Limpa e reseta tudo
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0 });
      setExportingClassId(null);
    }
  }, [fullClassData, school]);

  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  return (
    <Flex direction="column" w="100%" h="100%" position="relative">
      <Flex direction="column" w="100%" maxW="7xl" mx="auto" px="2rem" gap="2rem">
        <InternalPageHeader
          title="Turmas"
          description="Gerencie suas turmas e alunos"
          icon={<Users className="w-6 h-6 text-primary" />}
          buttons={[
            {
              label: 'Exportar Avaliações',
              leftIcon: <FiDownload />,
              onClick: handleExportAllCharts,
              isLoading: isExporting,
              loadingText: `Gerando PDF (${exportProgress.current}/${exportProgress.total})`,
            },
            { label: `Adicionar Turma`, leftIcon: <FaPlus />, onClick: () => setOpenOpt({ class_code: true }) },
          ]}
        />

        {!classes.data.length && !classes._isLoading ? (
          <EmptyPageData />
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedClasses.map((hubClass) => {
                const showBadge = [
                  '6',
                  '7',
                  '8',
                  '9',
                  'MakersPro Mini',
                  'MakersPro Explorers',
                  'MakersPro Creators',
                  'MakersPro Innovators',
                  'MakersPro Experts',
                  'CulturaTech',
                ].includes(hubClass.grade);
                const sidebarColor = getColorByGrade(hubClass.grade);

                return (
                  <Skeleton key={hubClass.id} rounded="1.5rem" isLoaded={!classes._isLoading}>
                    <motion.div variants={itemVariants}>
                      <Flex
                        w="100%"
                        direction="column"
                        position="relative"
                        borderRadius="1.5rem"
                        cursor="pointer"
                        onClick={() => navigateToClass(hubClass)}
                        bg={bgCard}
                        border="1px solid"
                        borderColor={borderColor}
                        boxShadow="sm"
                        transition="all 0.2s"
                        overflow="hidden"
                        _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg', borderColor: 'primary.300' }}
                      >
                        <Flex justify="space-between" align="flex-start" pl="0.875rem" pr="0.875rem" pt="1.125rem" pb="0.75rem">
                          <Flex
                            bg={colorMode === 'light' ? 'primary.50' : 'whiteAlpha.100'}
                            color="primary.500"
                            p="0.375rem"
                            borderRadius="md"
                            w="fit-content"
                          >
                            <Icon as={FiUsers} boxSize="0.875rem" />
                          </Flex>
                          {showBadge && (
                            <Text fontSize="14px" fontWeight="700" color={colorMode === 'light' ? 'gray.400' : 'gray.500'}>
                              #{hubClass.code}
                            </Text>
                          )}
                        </Flex>
                        <Flex
                          direction="column"
                          pl="1rem"
                          pr="0.875rem"
                          py="1rem"
                          pb="1.125rem"
                          borderLeft="4px solid"
                          borderColor={sidebarColor}
                          transition="border-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          _hover={{ borderLeftWidth: '6px' }}
                          gap="1rem"
                        >
                          <Text fontWeight="700" fontSize="14px" color={colorMode === 'dark' ? 'white' : 'gray.800'} noOfLines={1} lineHeight="1.2">
                            {hubClass.display_name}
                          </Text>
                          <Flex align="center" justify="space-between">
                            <Text fontSize="11px" fontWeight="600" color="gray.500">
                              {hubClass.students?.length || 0} Alunos
                            </Text>
                            <Icon as={FiArrowUpRight} boxSize="0.8rem" color="gray.400" />
                          </Flex>
                        </Flex>
                      </Flex>
                    </motion.div>
                  </Skeleton>
                );
              })}
            </div>
          </motion.div>
        )}

        <SmallModal
          title={`Turmas da Escola ${school?.display_name || ''}`}
          show={!!modalOpt.class_code}
          onConfirm={handleAddClasses}
          okText="Adicionar Turmas"
          size="lg"
          isLoading={classes._isLoading}
          onCancel={onCloseModal}
          topIcon="ray"
          disableOkButton={!selectedClasses.length}
        >
          <Flex direction="column" gap="1rem">
            <Text fontSize="14px" color="gray.500">
              Selecione as turmas nas quais você leciona para adicioná-las ao seu painel.
            </Text>
            <Flex
              align="center"
              justify="space-between"
              bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'}
              p="1rem"
              borderRadius="xl"
              border="1px solid"
              borderColor={borderColor}
            >
              <Text fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                Selecionar todas as disponíveis
              </Text>
              <Checkbox
                size="lg"
                colorScheme="blue"
                isChecked={sortGradesByClass(allClasses)
                  .filter(classIsAvailable)
                  .every((c) => selectedClasses.find((s) => s.id === c.id))}
                isDisabled={classes._isLoading}
                onChange={(e) => {
                  if (e.target.checked) setSelectedClasses(sortGradesByClass(allClasses).filter(classIsAvailable));
                  else setSelectedClasses([]);
                }}
              />
            </Flex>
            <Flex
              direction="column"
              gap="0.5rem"
              maxH="40vh"
              overflowY="auto"
              pr="0.5rem"
              css={{ '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '10px' } }}
            >
              {sortGradesByClass(allClasses).map((hubClass) => {
                const isAvail = classIsAvailable(hubClass);
                return (
                  <Flex
                    key={hubClass.id}
                    align="center"
                    justify="space-between"
                    p="1rem"
                    bg={bgCard}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={borderColor}
                    opacity={isAvail ? 1 : 0.5}
                    transition="all 0.2s"
                    _hover={isAvail ? { borderColor: 'primary.300', bg: colorMode === 'light' ? 'primary.50' : 'whiteAlpha.50' } : {}}
                  >
                    <Flex align="center" gap="1rem" overflow="hidden">
                      <Flex bg={colorMode === 'light' ? 'gray.100' : 'whiteAlpha.200'} p="0.5rem" borderRadius="md" color="gray.500">
                        <Icon as={FiUsers} />
                      </Flex>
                      <Text fontWeight="600" color={colorMode === 'dark' ? 'white' : 'gray.800'} isTruncated title={hubClass.display_name}>
                        {hubClass.display_name}
                      </Text>
                    </Flex>
                    <Checkbox
                      defaultChecked={!isAvail}
                      isDisabled={!isAvail}
                      size="lg"
                      colorScheme="blue"
                      onChange={(v) => handleChangeSelectedClass(hubClass, v.target.checked)}
                      isChecked={!isAvail || !!selectedClasses.find((s) => s.id === hubClass.id)}
                    />
                  </Flex>
                );
              })}
            </Flex>
          </Flex>
        </SmallModal>

        <SmallModal
          title="Remover turma"
          show={!!modalOpt.confirm_remove}
          onConfirm={handleRemoveClass}
          okText="Sim, remover"
          isLoading={classes._isLoading}
          onCancel={onCloseModal}
          topIcon="warning"
        >
          <Flex direction="column" gap="1rem" align="center" textAlign="center">
            <Text color="gray.500" fontSize="15px">
              Tem certeza que deseja remover esta turma do seu painel? Você não perderá os dados, mas precisará adicioná-la novamente para acessá-la.
            </Text>
          </Flex>
        </SmallModal>
      </Flex>

      {/* CONTÊINER OCULTO  */}
      <Box position="absolute" top="-9999px" left="-9999px" width="1024px" zIndex="-1" opacity={0} pointerEvents="none">
        {fullClassData
          .filter((hubClass) => hubClass.id === exportingClassId) // MÁGICA AQUI: Apenas 1 turma fica montada no DOM por vez!
          .map((hubClass) => {
            const allEvaluations: IEvaluationRecord[] =
              hubClass?.form_links?.reduce((acc: any, form_link: any) => {
                const exams: IEvaluationRecord[] = [];
                form_link.student_relations?.forEach((studentRel: any) => {
                  studentRel.questions?.forEach((q: any) => {
                    exams.push({
                      category: form_link.form.questions.find((e: any) => e.id === q.question_id)?.title || 'Habilidade Desconhecida',
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

            return (
              <Box
                key={`export-${hubClass.id}`}
                id={`pdf-class-export-${hubClass.id}`}
                data-has-evals={uniqueSkills.length > 0 ? 'true' : 'false'}
                p={8}
                bg="#ffffff"
                style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" }}
              >
                <Heading size="lg" color="#1A202C" pb={4}>
                  {hubClass.display_name} - Histórico de Avaliações
                </Heading>

                <Box bg="#F8FAFC" p={3} borderRadius="md" border="1px solid #E2E8F0" mb={6}>
                  <Text fontSize="xs" fontWeight="bold" color="#64748B" textTransform="uppercase" mb={1}>
                    Alunos Selecionados na Visualização:
                  </Text>
                  <Text fontSize="sm" fontWeight="600" color="#1E293B">
                    *Todos alunos da turma
                  </Text>
                </Box>

                {uniqueSkills.length > 0 && (
                  <Grid templateColumns="repeat(3, 1fr)" gap={6} width="100%">
                    {uniqueSkills.map((skillName) => {
                      const skillEvals = allEvaluations.filter((e) => e.category === skillName);
                      const dailyMap = new Map<string, { sum: number; count: number }>();

                      skillEvals.forEach((ev) => {
                        const exactDay = new Date(ev.created_at).toLocaleDateString('pt-BR');
                        const current = dailyMap.get(exactDay) || { sum: 0, count: 0 };
                        dailyMap.set(exactDay, {
                          sum: current.sum + Number(ev.score || 0),
                          count: current.count + 1,
                        });
                      });

                      const chartData = Array.from(dailyMap.entries())
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
                )}
              </Box>
            );
          })}
      </Box>
    </Flex>
  );
};

export default Classes;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: { selectedPage: 'classes', pageTitle: 'Minhas turmas', showBackButton: false } };
};
