import React, { useState } from 'react';
import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text,
  useColorMode,
  VStack,
  HStack,
  Select,
  Avatar,
  CloseButton,
  Badge,
} from '@chakra-ui/react';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

import { IProject } from '@/_base/interfaces/project';
import { FiUsers } from 'react-icons/fi';
import { EMPTY_HUB_GROUP_DATA, ICreateHubGroupParams, IHubGroup, createHubGroupSchema } from '@/_base/interfaces/group';
import { GenericButton } from '@/components/Buttons/Generic';
import { AvatarList } from '@/components/AvatarList';
import { SmallModal } from '@/components/Modal/Small';
import { useCustomRouter, useInputHandler } from '@/_base/hooks';
import { TextInput } from '@/components/Inputs/Text';
import { IoChevronDownCircleOutline } from 'react-icons/io5';

interface IProps {
  project: IProject;
  canEdit: boolean;
  onPendingGroupAction: (group: IHubGroup, accept: boolean) => void;
  handleAddGroup: (data: ICreateHubGroupParams) => void;
}

const ROLE_LIMITS: Record<string, number> = {
  'Líder de Grupo': 1,
  'Gestor de Projetos': 1,
  'Social Media': 1,
  Construtor: 5,
};

const ROLES = Object.keys(ROLE_LIMITS);

export const Groups: React.FC<IProps> = ({ onPendingGroupAction, project, canEdit, handleAddGroup }) => {
  const [targetGroup, setTargetGroup] = useState<(IHubGroup & { accept: boolean }) | null>(null);
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({}); // Novo estado para os cargos
  const { colorMode } = useColorMode();
  const router = useCustomRouter();

  const { errors, onInputChange, data, submit, setData } = useInputHandler<ICreateHubGroupParams>({
    data: EMPTY_HUB_GROUP_DATA,
    schema: createHubGroupSchema,
  });

  const handleConfirmAction = () => {
    if (!targetGroup) return;
    onPendingGroupAction(targetGroup, targetGroup.accept);
    setTargetGroup(null);
  };

  const onAddGroup = () => {
    // Adicionamos os cargos ao payload (você precisará garantir que sua interface e schema aceitem isso)
    handleAddGroup({ ...data, user_roles: memberRoles });
    setData(EMPTY_HUB_GROUP_DATA);
    setMemberRoles({});
  };

  const handleCloseModal = () => {
    setData(EMPTY_HUB_GROUP_DATA);
    setMemberRoles({});
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
      if (newUsers.length >= 8) return; // Trava o máximo de 8 no clique
      newUsers = [...newUsers, studentId];
    }
    onInputChange('users', newUsers);
  };

  const handleRoleChange = (studentId: string, role: string) => {
    setMemberRoles((prev) => ({ ...prev, [studentId]: role }));
  };

  // Cálculos de validação
  const selectedStudents = project.hub_class?.students?.filter((e) => data.users?.includes(e.id)) || [];

  const roleCounts = Object.values(memberRoles).reduce(
    (acc, role) => {
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const isUserCountValid = selectedStudents.length >= 3 && selectedStudents.length <= 8;
  const areAllRolesAssigned = selectedStudents.every((s) => !!memberRoles[s.id]);
  const isFormValid = !!data.hub_project_class_id && !!data.display_name && isUserCountValid && areAllRolesAssigned;

  return (
    <motion.div
      key="Groups"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'flex', height: '100%', overflow: 'hidden auto', flexDirection: 'column', gap: '24px', width: '100%', margin: 'auto' }}
    >
      <Flex justify="flex-end" align="center">
        <GenericButton
          label="Cadastrar grupo"
          size="sm"
          color="white"
          isDisabled={!canEdit}
          _hover={{ filter: 'brightness(0.9)' }}
          onClick={() => setData((e) => ({ ...(e || ({} as any)), hub_project_class_id: project.id }))}
        />
      </Flex>

      {/* Renderização de grupos pendentes... */}
      {project.groups
        .filter((group) => !group.approved_at)
        .map((group) => (
          <Flex key={group.id} w="100%" direction="column" gap="24px" bgColor="warning25" borderRadius="10px" position="relative">
            {/* Conteúdo existente mantido... */}
            <Flex w="100%" h="108px" p="12px 32px" justify="space-between" align="center">
              <Flex direction="column">
                <Text color="warning700" fontWeight="500">
                  {group.display_name}
                </Text>
                <AvatarList users={group.students || []} />
              </Flex>
              <Flex color="warning500" fontSize="14px" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
                {moment(group.updated_at).format('DD/MM/YYYY')}
              </Flex>
              <Flex direction="column" gap="12px">
                <GenericButton
                  label="Aprovar"
                  size="sm"
                  bg="success600"
                  color="white"
                  isDisabled={!canEdit}
                  _hover={{ filter: 'brightness(0.9)' }}
                  onClick={() => setTargetGroup({ ...(group as any), accept: true })}
                />
                <GenericButton
                  label="Recusar"
                  size="sm"
                  bg="white"
                  color="gray700"
                  border="1px"
                  isDisabled={!canEdit}
                  borderColor="gray300"
                  _hover={{ filter: 'brightness(0.9)' }}
                  onClick={() => setTargetGroup({ ...(group as any), accept: false })}
                />
              </Flex>
            </Flex>
          </Flex>
        ))}

      {/* Renderização de grupos aprovados... */}
      {project.groups
        .filter((group) => !!group.approved_at)
        .map((group) => (
          <Flex
            key={group.id}
            onClick={() => router.push(`/groups/${group.id}`)}
            w="100%"
            h="auto"
            bg="white"
            borderRadius="10px"
            border="1px"
            borderColor="gray300"
            p="20px"
            gap="1rem"
            cursor="pointer"
            transition="0.2s"
            _hover={{ boxShadow: 'md', '#display_name': { transform: 'scale(1.05)' } }}
          >
            <FiUsers size="50px" color="#21E080" />
            <Flex direction="column">
              <Text id="display_name" color="primary700" fontSize="18px" fontWeight="700" gap="4px" transition="transform 0.2s">
                {group.display_name}
              </Text>
              <AvatarList users={group.students || []} />
            </Flex>
          </Flex>
        ))}

      <SmallModal
        show={!!targetGroup}
        onConfirm={handleConfirmAction}
        onCancel={() => setTargetGroup(null)}
        topIcon={targetGroup?.accept ? 'checked' : 'warning'}
      >
        <Flex direction="column" gap="1rem">
          <Text fontWeight="500" color="gray600">
            {targetGroup?.accept ? 'Aprovar' : 'Recusar'} o grupo <b>{targetGroup?.display_name}</b>?
          </Text>
        </Flex>
      </SmallModal>

      <SmallModal
        title="Cadastrar Grupo"
        show={!!data.hub_project_class_id}
        onConfirm={() => submit(onAddGroup)}
        okText="Criar"
        onCancel={handleCloseModal}
        disableOkButton={!isFormValid}
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
              {selectedStudents.length === 8 ? 'Limite de 8 membros atingido' : 'Selecione os membros do grupo'}
            </MenuButton>
            <MenuList borderColor="gray300" maxH="250px" overflow="auto" zIndex={10}>
              <MenuOptionGroup type="checkbox">
                {project.hub_class?.students?.length ? (
                  project.hub_class.students
                    .filter((student) => {
                      const approvedGroups = project.groups?.filter((group) => group.approved_at !== null) || [];
                      return !approvedGroups.some((group) => group.students?.some((s) => s.id === student.id));
                    })
                    .map((student) => (
                      <MenuItemOption
                        key={student.id}
                        value={student.id}
                        isChecked={data.users?.includes(student.id)}
                        isDisabled={!data.users?.includes(student.id) && selectedStudents.length >= 8}
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
              <Badge colorScheme={isUserCountValid ? 'green' : 'orange'}>{selectedStudents.length} / 8</Badge>
            </Flex>

            {selectedStudents.length === 0 && (
              <Text fontSize="13px" color="gray.500" fontStyle="italic">
                Nenhum membro adicionado (mín. 3, recomendado 5, máx. 8).
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
              ))}
            </AnimatePresence>
          </VStack>
        </Flex>
      </SmallModal>
    </motion.div>
  );
};
