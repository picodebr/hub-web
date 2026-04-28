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
  Select,
  Skeleton,
  useColorMode,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { logError, cookieManager, formatShortName } from '@/_base/utils';
import { Flex, Text } from '@chakra-ui/react';
import { useAsyncCallback, useAuth, useInputHandler, useLoading } from '@/_base/hooks';
import { PageDataType } from '@/_base/interfaces/shared/IPageData';
import { EmptyPageData } from '@/components/EmptyPageData';
import { SmallModal } from '@/components/Modal/Small';
import { TextInput } from '@/components/Inputs/Text';
import { AvatarList } from '@/components/AvatarList';
import { createGroup, listAvailableUsersForGroupByProject, listStudentGroups } from '@/_base/services/group';
import { EMPTY_HUB_GROUP_DATA, ICreateHubGroupParams, IHubGroup, createHubGroupSchema } from '@/_base/interfaces/group';
import { listAvailableProjectsForStudent } from '@/_base/services/project';
import { IProject } from '@/_base/interfaces/project';
import { IHubUser } from '@/_base/interfaces/user';
import { IoChevronDownCircleOutline } from 'react-icons/io5';
import { AnimatePresence } from 'framer-motion';

const ROLE_LIMITS: Record<string, number> = {
  'Líder de Grupo': 1,
  'Gestor de Projetos': 1,
  'Social Media': 1,
  Construtor: 5,
};

const ROLES = Object.keys(ROLE_LIMITS);

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
      toast({ status: `success`, description: `Grupo adicionado` });
    },
    [],
    undefined,
    () => {
      setGroups((e) => ({ ...e, _isLoading: false }));
    },
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

  const isUserCountValid = data.users.length >= 3 && data.users.length <= 8;
  const areAllRolesAssigned = data.users.every((s) => !!memberRoles[s]);
  const isFormValid = isUserCountValid && areAllRolesAssigned;

  return (
    <Flex direction="column" w="100%" h="69px" padding="20px 0" gap="20px" textAlign="left" whiteSpace="nowrap">
      <Flex align="center" justify="flex-end" h="fit-content">
        <Flex
          bgColor="white"
          w="fit-content"
          h="fit-content"
          border="1px"
          borderColor="gray300"
          padding="8px 14px"
          align="center"
          gap="8px"
          borderRadius="8px"
          fontSize="16px"
          fontWeight="600"
          color="gray700"
          cursor="pointer"
          onClick={() => setOpenModal(true)}
        >
          <FaPlus />
          Adicionar Grupo
        </Flex>
      </Flex>
      {!groups.data.length && !groups._isLoading ? (
        <EmptyPageData />
      ) : (
        groups.data.map((group) => (
          <Skeleton key={group.id} rounded="lg" isLoaded={!groups._isLoading}>
            <Flex
              h="fit-content"
              bgColor="white"
              borderRadius="10px"
              align="center"
              padding="20px 24px"
              color="primary700"
              gap="16px"
              fontSize="18px"
              minH="5.5rem"
              maxH="5.5rem"
              overflowY="hidden"
            >
              <Flex flex="1" gap="1rem">
                <Link href={`/groups/${group.id}`} transition="color 0.1s" color="#21E080" _hover={{ color: '#36c27c' }}>
                  <FiUsers fontSize="40px" />
                </Link>
                <Flex display="column" justify="space-between">
                  <Link href={`/groups/${group.id}`}>
                    <Text fontWeight="700" transition="color 0.1s" _hover={{ color: 'indigo600' }}>
                      {group.display_name}
                    </Text>
                  </Link>
                  <AvatarList users={group.students} max={10} />
                </Flex>
              </Flex>
            </Flex>
          </Skeleton>
        ))
      )}
      <SmallModal
        title="Cadastrar Grupo"
        show={openModal}
        onConfirm={() => submit(handleAddGroup)}
        okText="Criar"
        onCancel={handleCloseModal}
        disableOkButton={!data.users?.length || !data.hub_project_class_id || !data.display_name || !selectedProject?.educator || !isFormValid}
        topIcon="checked"
      >
        <Flex direction="column" minW="380px" gap="1rem">
          <TextInput
            placeholder="Informe o nome do grupo"
            color={colorMode === 'dark' ? '#FFF' : '#1D2939'}
            _placeholder={{ fontSize: '14px' }}
            value={data?.display_name}
            onInputChange={(v) => onInputChange('display_name', v)}
            error={errors.display_name}
          />

          <Menu placement="right">
            <MenuButton as={Button} rightIcon={<IoChevronDownCircleOutline />} border="1px" borderColor="gray300" bg="white">
              {availableProjects.find((e) => data.hub_project_class_id === e.id)?.title || `Selecione o projeto`}
            </MenuButton>
            <MenuList borderColor="gray300">
              {availableProjects.length ? (
                availableProjects.map((project) => (
                  <MenuItem key={project.id} onClick={() => handleChangeProject(project.id)}>
                    {project.title}
                  </MenuItem>
                ))
              ) : (
                <MenuItem isDisabled>Nenhum projeto disponível</MenuItem>
              )}
            </MenuList>
          </Menu>

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
            <MenuList borderColor="gray300" maxH="250px" overflow="auto" zIndex={10}>
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

          {/* Lista de Membros Selecionados com Atribuição de Cargos */}
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
                        <Select
                          size="xs"
                          w="130px"
                          placeholder="Cargo"
                          bg="white"
                          color="gray.700"
                          value={memberRoles[student.id] || ''}
                          onChange={(e) => handleRoleChange(student.id, e.target.value)}
                        >
                          {ROLES.map((role) => {
                            const currentCount = roleCounts[role] || 0;
                            // Desabilita a opção se o limite já foi atingido E o usuário não possui esse cargo atualmente
                            const isFull = currentCount >= ROLE_LIMITS[role] && memberRoles[student.id] !== role;
                            return (
                              <option key={role} value={role} disabled={isFull}>
                                {role} {isFull ? '(Cheio)' : ''}
                              </option>
                            );
                          })}
                        </Select>
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
