import { useEffect, useMemo, useState } from 'react';
import { GetServerSideProps } from 'next';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { FiMoreVertical, FiUsers, FiBookOpen } from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
  Badge,
  Checkbox,
  SimpleGrid,
  Skeleton,
  Flex,
  Text,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Divider,
  Box,
  Button,
} from '@chakra-ui/react';

import { useAsyncCallback, useAuth, useCustomToast, useCustomRouter, useDarkMode } from '@/_base/hooks';
import { PageDataType } from '@/_base/interfaces/shared/IPageData';
import { IHubClass } from '@/_base/interfaces/class';
import { addClasses, listAllClasses, listMyClasses, removeClass } from '@/_base/services/class';
import { EmptyPageData } from '@/components/EmptyPageData';
import { SmallModal } from '@/components/Modal/Small';
import { AvatarList } from '@/components/AvatarList';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { sortGradesByClass } from '@/_base/utils';

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
    <Flex direction="column" w="100%" h="100%" gap="1.5rem" overflowY="auto" overflowX="hidden" pb="2rem">
      {/* Header com Call to Action */}
      <Flex align="center" direction={{ base: 'column', sm: 'row' }} pt="2px" gap="1rem" mb="0.5rem">
        <Flex bg="primary.100" color="primary600" p="0.5rem" borderRadius="lg">
          <Icon as={FiBookOpen} boxSize="1.5rem" />
        </Flex>

        <Button
          bg="primary600"
          color="white"
          leftIcon={<FaPlus />}
          borderRadius="lg"
          px="1.5rem"
          h="44px"
          _hover={{ bg: 'primary.700', transform: 'translateY(-2px)', boxShadow: 'md' }}
          transition="all 0.2s"
          onClick={() => setOpenOpt({ class_code: true })}
        >
          Adicionar Turma
        </Button>
      </Flex>

      {/* Grid de Turmas */}
      {!classes.data.length && !classes._isLoading ? (
        <EmptyPageData />
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="1.5rem" alignItems="stretch">
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

              return (
                <Skeleton key={hubClass.id} rounded="2xl" isLoaded={!classes._isLoading}>
                  <motion.div variants={itemVariants} style={{ height: '100%' }}>
                    <Flex
                      w="100%"
                      h="100%"
                      direction="column"
                      bg={bgCard}
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor={borderColor}
                      boxShadow="sm"
                      transition="all 0.2s"
                      cursor="pointer"
                      _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg', borderColor: 'primary.300' }}
                      onClick={() => navigateToClass(hubClass)}
                    >
                      {/* Topo do Card: Ícone + Título + Menu */}
                      <Flex p="1.25rem" gap="1rem" align="flex-start" justify="space-between">
                        <Flex gap="1rem" align="flex-start" flex="1" minW={0}>
                          <Flex bg={colorMode === 'light' ? 'primary.50' : 'whiteAlpha.100'} color="primary.500" p="0.75rem" borderRadius="xl">
                            <Icon as={FiUsers} boxSize="1.5rem" />
                          </Flex>

                          <Flex direction="column" gap="0.25rem" minW={0} mt="2px">
                            <Text fontWeight="700" fontSize="18px" color={colorMode === 'dark' ? 'white' : 'gray.800'} noOfLines={1}>
                              {hubClass.display_name}
                            </Text>
                            {showBadge && (
                              <Badge w="fit-content" colorScheme="purple" variant="subtle" borderRadius="md" px="2" py="0.5">
                                #{hubClass.code}
                              </Badge>
                            )}
                          </Flex>
                        </Flex>

                        {/* Menu de Ações (Substitui o Popover antigo) */}
                        <Menu placement="bottom-end">
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                            color="gray.400"
                            borderRadius="full"
                            onClick={(e) => e.stopPropagation()} // Impede o clique de abrir a turma
                          />
                          <MenuList borderColor={borderColor} zIndex={10} minW="150px" p="1">
                            <MenuItem
                              borderRadius="md"
                              color="red.500"
                              icon={<FaTrash />}
                              _hover={{ bg: 'red.50' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenOpt({ confirm_remove: true, classCodeToRemove: hubClass.code });
                              }}
                            >
                              Remover Turma
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>

                      <Divider borderColor={borderColor} opacity={0.6} />

                      {/* Rodapé do Card: Avatares dos Alunos */}
                      <Flex
                        p="1rem 1.25rem"
                        align="center"
                        justify="space-between"
                        bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'}
                        borderRadius="0 0 16px 16px"
                      >
                        <Text fontSize="13px" fontWeight="600" color="gray.500">
                          {hubClass.students?.length || 0} Alunos
                        </Text>
                        <Box onClick={(e) => e.stopPropagation()}>
                          <AvatarList users={hubClass.students} max={6} />
                        </Box>
                      </Flex>
                    </Flex>
                  </motion.div>
                </Skeleton>
              );
            })}
          </SimpleGrid>
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
  );
};

export default Classes;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: { selectedPage: 'classes', pageTitle: 'Minhas turmas', showBackButton: false } };
};
