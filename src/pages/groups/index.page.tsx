import {
  Avatar,
  Badge,
  Button,
  CloseButton,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Skeleton,
  useColorMode,
  useToast,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { FiUsers, FiStar, FiBarChart, FiMessageCircle, FiBox } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

import { logError, cookieManager } from '@/_base/utils';
import { Flex, Text } from '@chakra-ui/react';
import { useAsyncCallback, useAuth, useInputHandler, useLoading } from '@/_base/hooks';
import { PageDataType } from '@/_base/interfaces/shared/IPageData';
import { EmptyPageData } from '@/components/EmptyPageData';
import { SmallModal } from '@/components/Modal/Small';
import { TextInput } from '@/components/Inputs/Text';
import { AvatarList } from '@/components/AvatarList';
import { InternalPageHeader } from '@/components/InternalPageHeader';
import { createGroup, listAvailableUsersForGroupByProject, listStudentGroups } from '@/_base/services/group';
import { EMPTY_HUB_GROUP_DATA, ICreateHubGroupParams, IHubGroup, createHubGroupSchema } from '@/_base/interfaces/group';
import { listAvailableProjectsForStudent } from '@/_base/services/project';
import { IProject } from '@/_base/interfaces/project';
import { IHubUser } from '@/_base/interfaces/user';
import { IoChevronDownCircleOutline } from 'react-icons/io5';
import { AnimatePresence } from 'framer-motion';

const ROLE_CONFIG: Record<string, { min: number; max: number }> = {
  'Líder de Grupo': { min: 1, max: 1 },
  'Gestor de Projetos': { min: 1, max: 1 },
  'Social Media': { min: 1, max: 1 },
  'Construtor': { min: 0, max: 5 },
};

const ROLES = Object.keys(ROLE_CONFIG);

// Mapa de ícones para cada cargo
const getRoleIcon = (role: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Líder de Grupo': <FiStar size={16} />,
    'Gestor de Projetos': <FiBarChart size={16} />,
    'Social Media': <FiMessageCircle size={16} />,
    Construtor: <FiBox size={16} />,
  };
  return iconMap[role] || <FiUsers size={16} />;
};

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

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<PageDataType<IHubGroup>>({ data: [] });
  const [availableProjects, setAvailableProjects] = useState<IProject[]>([]);
  const [availableStudents, setAvailableStudents] = useState<IHubUser[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({}); // Novo estado para os cargos

  const toast = useToast();
  const { colorMode } = useColorMode();
  const { user } = useAuth();

  const { setLoadingConfig } = useLoading();
  const { errors, onInputChange, data, submit, setData } = useInputHandler<ICreateHubGroupParams>({
    schema: createHubGroupSchema,
    data: EMPTY_HUB_GROUP_DATA,
  });

  const getAvailableProjects = useAsyncCallback(async () => {
    const [projects, meGroups] = await Promise.all([listAvailableProjectsForStudent(), listStudentGroups()]);
    setAvailableProjects(projects);
    setGroups((e) => ({ ...e, data: meGroups, _isLoading: false }));
    setLoadingConfig({ isLoading: false });
  }, []);

  useEffect(() => {
    if (!user) return;
    setAvailableStudents([user]);
    setMemberRoles({ [`${user.id}`]: `Líder de Grupo` });
    setData((e) => ({ ...(e || ({} as any)), users: [user.id] }));
  }, [user]);

  useEffect(() => {
    setLoadingConfig({ isLoading: true, type: 'darken-spinner' });
    setGroups({ data: [], _isLoading: true });

    getAvailableProjects();
  }, []);

  const handleChangeProject = useAsyncCallback(
    async (project_id: string) => {
      setData((e) => ({ ...(e || ({} as any)), hub_project_class_id: project_id, users: [user.id] }));
      const students = await listAvailableUsersForGroupByProject(project_id);
      setAvailableStudents([...students, user]);
      setMemberRoles({ [`${user.id}`]: `Líder de Grupo` });
    },
    [user],
  );

  const handleAddGroup = useAsyncCallback(
    async () => {
      setGroups((e) => ({ ...e, _isLoading: true }));
      const newGroup = await createGroup(data);
      newGroup.students = availableStudents.filter((s) => data.users.includes(s.id));
      setGroups((e) => ({ ...e, data: [newGroup, ...e.data] }));
      handleCloseModal();
      
      const isTeacher = user?.role === 'teacher' || user?.role === 'student';
      const toastMessage = isTeacher ? 'Grupo adicionado' : 'Solicitação de criação de grupo enviada para o professor';
      
      toast({ status: `success`, description: toastMessage });
    },
    [user],
    undefined,
    () => {
      setGroups((e) => ({ ...e, _isLoading: false }));
    },
  );

  const classProjects = useMemo<IProject[]>(
    () => (user?.hub_class_id ? availableProjects.filter((p) => p.class_id === user.hub_class_id) : availableProjects),
    [availableProjects, user?.hub_class_id],
  );

  const selectedProject = useMemo<IProject | undefined>(
    () => availableProjects.find((p) => p.id === data.hub_project_class_id),
    [data.hub_project_class_id],
  );

  const toggleUser = (studentId: string) => {
    const isSelected = data.users?.includes(studentId);
    let newUsers = data.users || [];

    if (isSelected) {
      newUsers = newUsers.filter((id) => id !== studentId);
      const newRoles = { ...memberRoles };
      delete newRoles[studentId];
      setMemberRoles(newRoles);
    } else {
      if (newUsers.length >= 8) return; // Trava o máximo de 8 no clique
      newUsers = [...newUsers, studentId];
    }
    onInputChange('users', newUsers);
  };

  const handleRoleChange = (studentId: string, role: string) => {
    setMemberRoles((prev) => ({ ...prev, [studentId]: role }));
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setData({ ...EMPTY_HUB_GROUP_DATA, users: [user.id] });
    setAvailableStudents([user]);
    setMemberRoles({ [`${user.id}`]: `Líder de Grupo` });
  };
  const roleCounts = Object.values(memberRoles).reduce(
    (acc, role) => {
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Validações de cargos
  const requiredRoles = ['Líder de Grupo', 'Gestor de Projetos', 'Social Media'];
  const hasAllRequiredRoles = requiredRoles.every((role) => (roleCounts[role] || 0) === 1);
  const constructorCount = roleCounts['Construtor'] || 0;
  const isConstructorCountValid = constructorCount <= 5;
  const isUserCountValid = data.users.length >= 3 && data.users.length <= 8;
  const areAllRolesAssigned = data.users.every((s) => !!memberRoles[s]);
  const isFormValid = isUserCountValid && areAllRolesAssigned && hasAllRequiredRoles && isConstructorCountValid;

  // Cores dinâmicas
  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  return (
    <Flex direction="column" w="100%" h="100%" gap="1rem">
      {/* Header com Call to Action */}
      <InternalPageHeader
        title="Meus Grupos"
        description="Grupos dos quais você faz parte"
        icon={<Users className="w-6 h-6 text-primary" />}
        buttons={[{ label: `Adicionar Grupo`, leftIcon: <FaPlus />, onClick: () => setOpenModal(true) }]}
      />

      {/* Grid de Grupos */}
      {!groups.data.length && !groups._isLoading ? (
        <EmptyPageData />
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups.data.map((group) => {
              const sidebarColor = group.project?.hub_class?.grade ? getColorByGrade(group.project.hub_class.grade) : '#6366F1';

              return (
                <Skeleton key={group.id} rounded="1.5rem" isLoaded={!groups._isLoading}>
                  <motion.div variants={itemVariants}>
                    <Link href={`/groups/${group.id}`} _hover={{ textDecoration: 'none' }}>
                      <Flex
                        w="100%"
                        direction="column"
                        position="relative"
                        borderRadius="1.5rem"
                        cursor="pointer"
                        bg={bgCard}
                        border="1px solid"
                        borderColor={borderColor}
                        boxShadow="sm"
                        transition="all 0.2s"
                        overflow="hidden"
                        _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg', borderColor: 'primary.300' }}
                      >
                        {/* Topo: Ícone + Nome do Projeto */}
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

                          {group.project && (
                            <Text
                              fontSize="12px"
                              fontWeight="700"
                              color={colorMode === 'light' ? 'gray.400' : 'gray.500'}
                              textAlign="right"
                              maxW="120px"
                              noOfLines={1}
                            >
                              {group.project.title}
                            </Text>
                          )}
                        </Flex>

                        {/* Seção com Barra Lateral: Conteúdo do Card */}
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
                          justify="space-between"
                          flex="1"
                        >
                          {/* Nome do Grupo + Turma + Membros alinhados à direita */}
                          <Flex direction="column" align="flex-end" gap="0.5rem">
                            <Text fontWeight="700" fontSize="14px" color={colorMode === 'dark' ? 'white' : 'gray.800'} noOfLines={1} lineHeight="1.2">
                              {group.display_name}
                            </Text>

                            {group.project?.hub_class && (
                              <Text fontSize="11px" fontWeight="600" color="gray.500">
                                Turma {group.project.hub_class.grade}
                              </Text>
                            )}

                            <Text fontSize="11px" fontWeight="600" color="gray.500">
                              {group.students?.length || 0} Membro{group.students?.length !== 1 ? 's' : ''}
                            </Text>
                          </Flex>

                          {/* Avatares dos Membros */}
                          <Flex justify="flex-end" w="100%">
                            <AvatarList users={group.students} max={4} />
                          </Flex>
                        </Flex>
                      </Flex>
                    </Link>
                  </motion.div>
                </Skeleton>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Modal */}
      <SmallModal
        title="Cadastrar Grupo"
        show={openModal}
        onConfirm={() => submit(handleAddGroup)}
        okText="Criar"
        onCancel={handleCloseModal}
        disableOkButton={!data.users?.length || !data.hub_project_class_id || !data.display_name || !selectedProject?.educator || !isFormValid}
        topIcon="checked"
        modalMaxW="600px"
      >
        <Flex direction="column" gap="1rem">
          {/* 1. Nome do Grupo */}
          <TextInput
            placeholder="Informe o nome do grupo"
            color={colorMode === 'dark' ? '#FFF' : '#1D2939'}
            _placeholder={{ fontSize: '14px' }}
            value={data?.display_name}
            onInputChange={(v) => onInputChange('display_name', v)}
            error={errors.display_name}
          />

          {/* 2. Projeto */}
          <Menu placement="bottom-start">
            <MenuButton as={Button} rightIcon={<IoChevronDownCircleOutline />} border="1px" borderColor="gray300" bg="white" w="100%">
              {classProjects.find((e) => data.hub_project_class_id === e.id)?.title || `Selecione o projeto`}
            </MenuButton>
            <MenuList borderColor="gray300" zIndex={10} maxH="200px" overflow="auto">
              {classProjects.length ? (
                classProjects.map((project) => (
                  <MenuItem key={project.id} onClick={() => handleChangeProject(project.id)}>
                    {project.title}
                  </MenuItem>
                ))
              ) : (
                <MenuItem isDisabled>Nenhum projeto disponível</MenuItem>
              )}
            </MenuList>
          </Menu>

          {/* Professor do Projeto */}
          {selectedProject && (
            <Flex
              bg={colorMode === 'light' ? 'blue.50' : 'whiteAlpha.50'}
              p="0.75rem"
              borderRadius="md"
              border="1px solid"
              borderColor={colorMode === 'light' ? 'blue.200' : 'whiteAlpha.200'}
              direction="column"
              gap="0.5rem"
            >
              <Text fontSize="12px" fontWeight="600" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                Professor Responsável
              </Text>
              <HStack>
                <Avatar size="sm" name={selectedProject.educator?.name} src={selectedProject.educator?.avatar || ''} />
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="14px" fontWeight="600" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                    {selectedProject.educator?.name || 'Sem professor'}
                  </Text>
                  {selectedProject.educator?.email && (
                    <Text fontSize="12px" color="gray.500">
                      {selectedProject.educator.email}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </Flex>
          )}

          {/* 3. Alunos */}
          <Menu closeOnSelect={false} placement="bottom" preventOverflow={true}>
            <MenuButton
              as={Button}
              rightIcon={<IoChevronDownCircleOutline />}
              border="1px"
              borderColor="gray300"
              bg="white"
              w="100%"
              textAlign="left"
              fontWeight="normal"
              color="gray.600"
            >
              {data.users.length === 8 ? 'Limite de 8 membros atingido' : 'Selecione os membros do grupo'}
            </MenuButton>
            <MenuList borderColor="gray300" maxH="200px" overflow="auto" zIndex={10}>
              <MenuOptionGroup type="checkbox">
                {availableStudents?.length ? (
                  availableStudents.map((student) => (
                    <MenuItemOption
                      key={student.id}
                      value={student.id}
                      isChecked={data.users?.includes(student.id)}
                      isDisabled={!data.users?.includes(student.id) && data.users.length >= 8}
                      onClick={() => toggleUser(student.id)}
                    >
                      {student.name}
                    </MenuItemOption>
                  ))
                ) : (
                  <MenuItem isDisabled>Nenhum membro disponível</MenuItem>
                )}
              </MenuOptionGroup>
            </MenuList>
          </Menu>

          {/* 4. Lista de Membros Selecionados com Atribuição de Cargos */}
          <VStack w="100%" align="stretch" spacing={2} mt={2}>
            <Flex justify="space-between" align="center">
              <Text fontSize="14px" fontWeight="600" color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}>
                Membros Selecionados
              </Text>
              <Badge colorScheme={isUserCountValid ? 'green' : 'orange'}>{data.users?.length || 0} / 8</Badge>
            </Flex>

            {data.users.length === 0 && (
              <Text fontSize="13px" color="gray.500" fontStyle="italic">
                Nenhum membro adicionado (mín. 3, recomendado 5, máx. 8).
              </Text>
            )}

            {/* Resumo de validação de cargos */}
            {data.users.length > 0 && (
              <VStack align="flex-start" w="100%" spacing={1}>
                <Text fontSize="12px" fontWeight="600" color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}>
                  Requisitos de Cargos:
                </Text>
                <HStack fontSize="12px" color={roleCounts['Líder de Grupo'] === 1 ? 'green.500' : 'orange.500'}>
                  <span>{roleCounts['Líder de Grupo'] === 1 ? '✓' : '○'}</span>
                  <span>Líder de Grupo: {roleCounts['Líder de Grupo'] || 0} / 1</span>
                </HStack>
                <HStack fontSize="12px" color={roleCounts['Gestor de Projetos'] === 1 ? 'green.500' : 'orange.500'}>
                  <span>{roleCounts['Gestor de Projetos'] === 1 ? '✓' : '○'}</span>
                  <span>Gestor de Projetos: {roleCounts['Gestor de Projetos'] || 0} / 1</span>
                </HStack>
                <HStack fontSize="12px" color={roleCounts['Social Media'] === 1 ? 'green.500' : 'orange.500'}>
                  <span>{roleCounts['Social Media'] === 1 ? '✓' : '○'}</span>
                  <span>Social Media: {roleCounts['Social Media'] || 0} / 1</span>
                </HStack>
                <HStack fontSize="12px" color={constructorCount <= 5 ? 'green.500' : 'red.500'}>
                  <span>{constructorCount <= 5 ? '✓' : '✕'}</span>
                  <span>Construtores: {constructorCount} / 5</span>
                </HStack>
              </VStack>
            )}

            <AnimatePresence>
              {data.users.map((studentId) => {
                const student = availableStudents.find((e) => e.id === studentId);
                if (!student) return null;
                return (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HStack
                      bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
                      p={2}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
                      justify="space-between"
                    >
                      <HStack overflow="hidden">
                        <Avatar size="xs" name={student.name} src={student.avatar || ''} />
                        <Text fontSize="14px" fontWeight="500" isTruncated maxW="110px">
                          {student.name}
                        </Text>
                      </HStack>

                      <HStack>
                        <Menu placement="top-end">
                          <MenuButton as={Button} size="xs" bg="blue.50" color="blue.700" border="1px" borderColor="blue.200" fontWeight="500" _hover={{ bg: 'blue.100' }}>
                            <HStack spacing={1}>
                              {memberRoles[student.id] ? (
                                <>
                                  {getRoleIcon(memberRoles[student.id])}
                                  <span>{memberRoles[student.id]}</span>
                                </>
                              ) : (
                                <span>Cargo</span>
                              )}
                            </HStack>
                          </MenuButton>
                          <MenuList fontSize="13px" zIndex={15}>
                            {ROLES.map((role) => {
                              const currentCount = roleCounts[role] || 0;
                              const roleConfig = ROLE_CONFIG[role];
                              const isAlreadyAssigned = memberRoles[student.id] === role;
                              const isAtMaxLimit = currentCount >= roleConfig.max && !isAlreadyAssigned;
                              
                              return (
                                <MenuItem
                                  key={role}
                                  isDisabled={isAtMaxLimit}
                                  onClick={() => handleRoleChange(student.id, role)}
                                  bg={isAlreadyAssigned ? 'blue.100' : 'transparent'}
                                  _hover={{ bg: isAlreadyAssigned ? 'blue.200' : 'gray.100' }}
                                >
                                  <HStack spacing={2}>
                                    <span>{getRoleIcon(role)}</span>
                                    <span>{role}</span>
                                    {isAtMaxLimit && <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#999' }}>(Cheio)</span>}
                                  </HStack>
                                </MenuItem>
                              );
                            })}
                          </MenuList>
                        </Menu>
                        <CloseButton size="sm" onClick={() => toggleUser(student.id)} color="red.400" />
                      </HStack>
                    </HStack>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </VStack>
        </Flex>
      </SmallModal>
    </Flex>
  );
};

export default Groups;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'groups';

  try {
    cookieManager.updateToken(req);

    return { props: { selectedPage, pageTitle: 'Meus Grupos' } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
