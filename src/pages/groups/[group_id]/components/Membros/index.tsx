import { useEffect, useState } from 'react';
import {
  Avatar,
  AvatarBadge,
  Button,
  Divider,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text,
  Tooltip,
  VStack,
  HStack,
  Select,
  CloseButton,
  Badge,
  useColorMode,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus } from 'react-icons/fa6';
import { GoGear } from 'react-icons/go';
import { IoChevronDownCircleOutline } from 'react-icons/io5';

import { useInputHandler } from '@/_base/hooks';
import { HUB_GROUP_ROLES, HubGroupRole, IHubGroup, IUpdateHubGroupParams, updateHubGroupSchema } from '@/_base/interfaces/group';
import { IHubUser } from '@/_base/interfaces/user';
import { formatCoin, formatShortName } from '@/_base/utils';
import { GenericButton } from '@/components/Buttons/Generic';
import { NumberScaleInput } from '@/components/Inputs/NumberScale';
import { TextInput } from '@/components/Inputs/Text';
import { CoinIcon } from '@/components/Logo';
import { SmallModal } from '@/components/Modal/Small';

interface IStudentDonation {
  student: IHubUser | null;
  donation: string;
}

interface IProps {
  group: IHubGroup;
  user: IHubUser;
  availableStudents: IHubUser[];
  onDonation: (data: IStudentDonation) => void;
  onUpdateGroup: (data: IUpdateHubGroupParams) => void;
}

const EMPTY_DONATION: IStudentDonation = { student: null, donation: '0' };

const ROLE_LIMITS: Record<HubGroupRole, number> = {
  'Líder de Grupo': 1,
  'Gestor de Projetos': 1,
  'Social Media': 1,
  Construtor: 2,
};

export const Members: React.FC<IProps> = ({ group, onDonation, user, availableStudents, onUpdateGroup }) => {
  console.log('group: ', group);
  const [studentDonationData, setStudentDonationData] = useState<IStudentDonation>(EMPTY_DONATION);
  const [openModal, setOpenModal] = useState(false);
  const [memberRoles, setMemberRoles] = useState<Record<string, HubGroupRole>>({});
  const { colorMode } = useColorMode();

  const { errors, onInputChange, data, submit, setData } = useInputHandler<IUpdateHubGroupParams>({
    schema: updateHubGroupSchema,
  });

  // Consolida todos os estudantes (do grupo atual + disponíveis) sem duplicatas
  const allStudentsMap = new Map([...group.students, ...availableStudents].map((s) => [s.id, s]));
  const allStudents = Array.from(allStudentsMap.values());

  useEffect(() => {
    const initialRoles: Record<string, HubGroupRole> = {};
    group.students.forEach((student) => {
      // Considerando que o cargo vem da api na propriedade group_role
      if (student.group_role) {
        initialRoles[student.id] = student.group_role;
      }
    });
    setMemberRoles(initialRoles);

    setData({
      display_name: group.display_name,
      id: group.id,
      users: group.students.map((student) => student.id),
    });
  }, [group, setData]);

  const handleUpdateGroup = () => {
    onUpdateGroup({ ...data, id: group.id, user_roles: memberRoles });
    setOpenModal(false);
  };

  const handleCancelEdit = () => {
    setOpenModal(false);
    // Reseta para o estado original do grupo
    const initialRoles: Record<string, HubGroupRole> = {};
    group.students.forEach((student) => {
      if (student.group_role) initialRoles[student.id] = student.group_role;
    });
    setMemberRoles(initialRoles);
    setData({ display_name: group.display_name, id: group.id, users: group.students.map((student) => student.id) });
  };

  const toggleUser = (studentId: string) => {
    const isSelected = data.users?.includes(studentId);
    let newUsers = data.users || [];

    if (isSelected) {
      newUsers = newUsers.filter((id) => id !== studentId);
      const newRoles = { ...memberRoles };
      delete newRoles[studentId];
      setMemberRoles(newRoles);
    } else {
      if (newUsers.length >= 5) return;
      newUsers = [...newUsers, studentId];
    }
    onInputChange('users', newUsers);
  };

  const handleRoleChange = (studentId: string, role: HubGroupRole) => {
    setMemberRoles((prev) => ({ ...prev, [studentId]: role }));
  };

  // Validações
  const selectedStudents = allStudents.filter((e) => data.users?.includes(e.id));

  const roleCounts = Object.values(memberRoles).reduce(
    (acc, role) => {
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const isUserCountValid = selectedStudents.length >= 3 && selectedStudents.length <= 5;
  const areAllRolesAssigned = selectedStudents.every((s) => !!memberRoles[s.id]);
  const isFormValid = !!data.display_name && isUserCountValid && areAllRolesAssigned;

  return (
    <Flex
      direction="column"
      display="flex"
      w="100%"
      h="fit-content"
      border="1px"
      borderColor="gray300"
      borderRadius="10px"
      bg="white"
      overflow="auto"
    >
      <Flex justify="space-between" align="center" p="10px 20px" borderBottom="1px" borderColor="gray300">
        <Text w="100%" fontSize="14px" color="gray600">
          Membros do Grupo
        </Text>
        {user.role !== 'student' && (
          <GenericButton size="sm" label="Editar" rightIcon={<GoGear fontSize="18px" />} onClick={() => setOpenModal(true)} />
        )}
      </Flex>

      <Flex h="fit-content" gap="12px" p="12px 20px">
        <Avatar src={group.educator?.avatar || undefined} />
        <Flex direction="column">
          <Text color="gray700" fontSize="14px" fontWeight="600">
            {group.educator?.name}
          </Text>
          <Text color="gray500" fontSize="14px">
            Professor(a) responsável
          </Text>
        </Flex>
      </Flex>
      <Divider />

      {group.students.map((student, i, arr) => (
        <Flex key={student.id} direction="column">
          <Flex h="fit-content" gap="12px" p="12px 20px" w="100%">
            <Avatar src={student.avatar || undefined}>
              <AvatarBadge boxSize="1.25em" bg="green.500" />
            </Avatar>
            <Flex direction="column" flex="1">
              <Text color="gray700" fontSize="14px" fontWeight="600">
                {student.name}
              </Text>
              <Text color="gray500" fontSize="14px">
                @{student.username} {` `}
                {/* Exibindo o cargo na lista principal */}
                {student.group_role && (
                  <Badge ml="2" colorScheme="blue" fontSize="0.7em" variant="subtle">
                    {student.group_role}
                  </Badge>
                )}
              </Text>
            </Flex>

            {user.role === 'student' && (
              <Tooltip label={student.id !== user.id ? `Fazer doação para ${student.name}` : ``}>
                <Flex
                  align="center"
                  justify="center"
                  cursor={student.id !== user.id ? 'pointer' : `default`}
                  onClick={() => student.id !== user.id && setStudentDonationData((e) => ({ ...e, student }))}
                  position="relative"
                  p="0.5rem"
                  gap="0.25rem"
                  _hover={student.id !== user.id ? { filter: `brightness(0.9)` } : undefined}
                >
                  <Text fontWeight="600" color={(student.metadata.coins || 0) > 0 ? 'green' : 'red'}>
                    {formatCoin(student.metadata.coins || 0)}
                  </Text>
                  <CoinIcon />
                  {student.id !== user.id && (
                    <Flex position="absolute" bottom="0.45rem" right="0.25rem" fontSize="1.1rem" color="primary300">
                      <FaPlus />
                    </Flex>
                  )}
                </Flex>
              </Tooltip>
            )}
          </Flex>
          {i < arr.length - 1 && <Divider color="gray300" />}

          <SmallModal
            topIcon="checked"
            show={!!studentDonationData.student}
            title="Quantas moedas você deseja doar?"
            okText="Doar"
            onConfirm={() => {
              onDonation(studentDonationData);
              setStudentDonationData(EMPTY_DONATION);
            }}
            onCancel={() => setStudentDonationData(EMPTY_DONATION)}
          >
            <Flex>
              <NumberScaleInput
                value={studentDonationData.donation || ``}
                onInputChange={(donation) => setStudentDonationData((e) => ({ ...e, donation }))}
                max={user.metadata.coins || 0}
              />
            </Flex>
          </SmallModal>
        </Flex>
      ))}

      <SmallModal
        title="Alterar informação do grupo"
        show={openModal}
        onConfirm={() => submit(handleUpdateGroup)}
        okText="Atualizar"
        onCancel={handleCancelEdit}
        disableOkButton={!isFormValid}
        topIcon={'checked'}
      >
        <Flex direction="column" minW="380px" gap="1rem">
          <TextInput
            value={data?.display_name}
            onInputChange={(v) => onInputChange('display_name', v)}
            error={errors.display_name}
            placeholder="Nome do grupo"
          />

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
              {selectedStudents.length === 5 ? 'Limite de 5 membros atingido' : 'Gerenciar membros do grupo'}
            </MenuButton>
            <MenuList borderColor="gray300" maxH="250px" overflow="auto" zIndex={10}>
              <MenuOptionGroup type="checkbox">
                {allStudents.length ? (
                  allStudents.map((student) => (
                    <MenuItemOption
                      key={student.id}
                      value={student.id}
                      isChecked={data.users?.includes(student.id)}
                      isDisabled={!data.users?.includes(student.id) && selectedStudents.length >= 5}
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

          <VStack w="100%" align="stretch" spacing={2} mt={2}>
            <Flex justify="space-between" align="center">
              <Text fontSize="14px" fontWeight="600" color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}>
                Membros e Cargos
              </Text>
              <Badge colorScheme={isUserCountValid ? 'green' : 'orange'}>{selectedStudents.length} / 5</Badge>
            </Flex>

            {selectedStudents.length < 3 && (
              <Text fontSize="13px" color="orange.500" fontStyle="italic">
                Selecione pelo menos 3 membros.
              </Text>
            )}

            <AnimatePresence>
              {selectedStudents.map((student) => (
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
                        {formatShortName(student.name, true)}
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
                        onChange={(e) => handleRoleChange(student.id, e.target.value as HubGroupRole)}
                      >
                        {HUB_GROUP_ROLES.map((role) => {
                          const currentCount = roleCounts[role] || 0;
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
              ))}
            </AnimatePresence>
          </VStack>

          {!!group.project && (
            <Flex direction="column" gap="0.25rem" bg="gray100" p="0.5rem" borderRadius="md" position="relative" mt={2}>
              <Text alignSelf="flex-end" fontSize="14px" color="gray400" position="absolute">
                {group.educator && `Professor`}
              </Text>
              <Flex align="center" gap="0.5rem">
                {group.educator ? (
                  <>
                    <Avatar
                      name={formatShortName(group.educator?.name || '', true)}
                      title={group.educator?.name}
                      src={group.educator?.avatar || undefined}
                      cursor="pointer"
                      size="sm"
                    />
                    <Text color="gray.700" fontWeight="500">
                      {formatShortName(group.educator?.name || '', true)}
                    </Text>
                  </>
                ) : (
                  <Text color="primary500">Esse projeto não está sendo lecionado por nenhum professor.</Text>
                )}
              </Flex>
            </Flex>
          )}
        </Flex>
      </SmallModal>
    </Flex>
  );
};
