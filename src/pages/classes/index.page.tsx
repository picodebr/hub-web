import { useEffect, useMemo, useState } from 'react';
import { GetServerSideProps } from 'next';
import { FaPlus } from 'react-icons/fa';
import { FiUsers, FiBookOpen, FiArrowUpRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Checkbox, Skeleton, Flex, Text, Icon, Box, Button } from '@chakra-ui/react';

import { useAsyncCallback, useAuth, useCustomToast, useCustomRouter, useDarkMode } from '@/_base/hooks';
import { PageDataType } from '@/_base/interfaces/shared/IPageData';
import { IHubClass } from '@/_base/interfaces/class';
import { addClasses, listAllClasses, listMyClasses, removeClass } from '@/_base/services/class';
import { EmptyPageData } from '@/components/EmptyPageData';
import { SmallModal } from '@/components/Modal/Small';
import { AvatarList } from '@/components/AvatarList';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { sortGradesByClass } from '@/_base/utils';
import { InternalPageHeader } from '@/components/InternalPageHeader';
import { Users } from 'lucide-react';

type ModalType = { class_code?: boolean; confirm_remove?: boolean; classCodeToRemove?: string };

// Variáveis de Animação
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// Mapa de cores para a barra lateral baseado na série
const getColorByGrade = (grade: string): string => {
  const colorMap: { [key: string]: string } = {
    G3: '#D946EF', // Magenta
    '6': '#8B5CF6', // Purple
    '7': '#06B6D4', // Cyan
    '8': '#10B981', // Emerald
    '9': '#F59E0B', // Amber
    'MakersPro Mini': '#EC4899', // Pink
    'MakersPro Explorers': '#3B82F6', // Blue
    'MakersPro Creators': '#8B5CF6', // Violet
    'MakersPro Innovators': '#06B6D4', // Cyan
    'MakersPro Experts': '#F59E0B', // Amber
    CulturaTech: '#EF4444', // Red
  };
  return colorMap[grade] || '#6366F1'; // Indigo como padrão
};

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<PageDataType<IHubClass>>({ data: [] });
  const [allClasses, setAllClasses] = useState<IHubClass[]>([]);
  const [modalOpt, setOpenOpt] = useState<ModalType>({});
  const [selectedClasses, setSelectedClasses] = useState<IHubClass[]>([]);

  const { school } = useSelectedSchool();
  const { user } = useAuth();
  const toast = useCustomToast();
  const router = useCustomRouter();
  const { colorMode } = useDarkMode();

  const sortedClasses = useMemo(() => sortGradesByClass([...classes.data]), [classes.data]);

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

  // Cores dinâmicas
  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  return (
    <Flex direction="column" w="100%" h="100%" overflowY="auto" overflowX="hidden" pb="2rem">
      <Flex direction="column" w="100%" maxW="7xl" mx="auto" px="2rem" gap="2rem">
        {/* Header com Call to Action */}
        <InternalPageHeader
          title="Turmas"
          description="Gerencie suas turmas e alunos"
          icon={<Users className="w-6 h-6 text-primary" />}
          buttons={[{ label: `Adicionar Turma`, leftIcon: <FaPlus />, onClick: () => setOpenOpt({ class_code: true }) }]}
        />

        {/* Grid de Turmas */}
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
                        {/* Topo: Ícone + Código */}
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

                        {/* Seção com Barra Lateral: Nome + Alunos + Seta */}
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
                          {/* Nome da Turma */}
                          <Text fontWeight="700" fontSize="14px" color={colorMode === 'dark' ? 'white' : 'gray.800'} noOfLines={1} lineHeight="1.2">
                            {hubClass.display_name}
                          </Text>

                          {/* Alunos + Seta */}
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

        {/* Modal: Adicionar Turmas */}
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

            {/* Cabeçalho de Seleção (Selecionar Todas) */}
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

            {/* Lista Scrollável de Turmas */}
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

        {/* Modal: Remover Turma */}
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
    </Flex>
  );
};

export default Classes;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: { selectedPage: 'classes', pageTitle: 'Minhas turmas', showBackButton: false } };
};
