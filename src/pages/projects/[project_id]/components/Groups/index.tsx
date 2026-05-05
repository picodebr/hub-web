import React, { useState } from 'react';
import {
  Flex,
  Text,
  CloseButton,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from '@chakra-ui/react';

import { IProject } from '@/_base/interfaces/project';
import { FiUsers } from 'react-icons/fi';
import { EMPTY_HUB_GROUP_DATA, ICreateHubGroupParams, IHubGroup, createHubGroupSchema } from '@/_base/interfaces/group';
import { GenericButton } from '@/components/Buttons/Generic';
import { AvatarList } from '@/components/AvatarList';
import { SmallModal } from '@/components/Modal/Small';
import { useCustomRouter, useInputHandler } from '@/_base/hooks';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
import { TextInput } from '@/components/Inputs/Text';

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

const ROLE_CONFIG: Record<string, { color: string; icon: string; bgColor: string; borderColor: string }> = {
  'Líder de Grupo': { color: '#f59e0b', icon: '👑', bgColor: '#fffbeb', borderColor: '#fcd34d' },
  'Gestor de Projetos': { color: '#007aff', icon: '📊', bgColor: '#eff6ff', borderColor: '#bfdbfe' },
  'Social Media': { color: '#ec4899', icon: '💕', bgColor: '#fdf2f8', borderColor: '#fbcfe8' },
  Construtor: { color: '#10b981', icon: '🌱', bgColor: '#f0fdf4', borderColor: '#86efac' },
};

const ROLES = Object.keys(ROLE_LIMITS);

export const Groups: React.FC<IProps> = ({ onPendingGroupAction, project, canEdit, handleAddGroup }) => {
  const [targetGroup, setTargetGroup] = useState<(IHubGroup & { accept: boolean }) | null>(null);
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({}); 
  const { colorMode } = useDarkMode();
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
      if (newUsers.length >= 8) return;
      newUsers = [...newUsers, studentId];
    }
    onInputChange('users', newUsers);
  };

  const handleRoleChange = (studentId: string, role: string) => {
    setMemberRoles((prev) => ({ ...prev, [studentId]: role }));
  };

  const selectedStudents = project.hub_class?.students?.filter((e) => data.users?.includes(e.id)) || [];

  const roleCounts = Object.values(memberRoles).reduce(
    (acc, role) => {
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const isUserCountValid = selectedStudents.length >= 5 && selectedStudents.length <= 8;
  const areAllRolesAssigned = selectedStudents.every((s) => !!memberRoles[s.id]);
  const isFormValid = !!data.hub_project_class_id && !!data.display_name && isUserCountValid && areAllRolesAssigned;

  return (
    <>
      <Flex w="100%" h="auto" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300" overflow="hidden">
        <Flex
          w="100%"
          h="42px"
          bg="primary500"
          p="12px 20px"
          color="white"
          fontWeight="500"
          align="center"
          justify="space-between"
        >
          Grupos
          <GenericButton
            label="Cadastrar grupo"
            size="sm"
            color="white"
            h="28px"
            fontSize="12px"
            isDisabled={!canEdit}
            _hover={{ filter: 'brightness(0.9)' }}
            onClick={() => setData((e) => ({ ...(e || ({} as any)), hub_project_class_id: project.id }))}
          />
        </Flex>

        <Flex direction="column" gap="8px" p="12px" flex="1" overflowY="auto" maxH="400px">
          {/* Renderização de grupos pendentes... */}
          {project.groups
            .filter((group) => !group.approved_at)
            .map((group) => (
              <Flex key={group.id} w="100%" direction="column" gap="8px" bgColor="warning25" borderRadius="8px" position="relative" p="12px">
                <Flex direction="column" gap="4px">
                  <Text color="warning700" fontWeight="600" fontSize="13px">
                    {group.display_name}
                  </Text>
                  <AvatarList users={group.students || []} />
                </Flex>
                <Flex direction="row" gap="6px" pt="4px">
                  <GenericButton
                    label="Aprovar"
                    size="xs"
                    bg="success600"
                    color="white"
                    h="24px"
                    fontSize="11px"
                    isDisabled={!canEdit}
                    _hover={{ filter: 'brightness(0.9)' }}
                    onClick={() => setTargetGroup({ ...(group as any), accept: true })}
                  />
                  <GenericButton
                    label="Recusar"
                    size="xs"
                    bg="white"
                    color="gray700"
                    border="1px"
                    h="24px"
                    fontSize="11px"
                    isDisabled={!canEdit}
                    borderColor="gray300"
                    _hover={{ filter: 'brightness(0.9)' }}
                    onClick={() => setTargetGroup({ ...(group as any), accept: false })}
                  />
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
                bg="gray50"
                borderRadius="8px"
                border="1px"
                borderColor="gray300"
                p="12px"
                gap="8px"
                cursor="pointer"
                transition="0.2s"
                _hover={{ boxShadow: 'sm', bg: 'gray100' }}
              >
                <Flex flexShrink={0}>
                  <FiUsers size="24px" color="#21E080" />
                </Flex>
                <Flex direction="column" gap="2px" flex="1" minW="0">
                  <Text id="display_name" color="primary700" fontSize="13px" fontWeight="600" isTruncated>
                    {group.display_name}
                  </Text>
                  <AvatarList users={group.students || []} />
                </Flex>
              </Flex>
            ))}

          {project.groups.length === 0 && (
            <Flex align="center" justify="center" py="20px" color="gray400">
              <Text fontSize="13px">Nenhum grupo criado</Text>
            </Flex>
          )}
        </Flex>
      </Flex>

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
        okText="Criar grupo"
        onCancel={handleCloseModal}
        disableOkButton={!isFormValid}
        topIcon="checked"
      >
        <Flex direction="column" w="100%" maxW="480px" gap="1.25rem" maxH="80vh" display="flex" flexDirection="column" overflow="hidden">
          {/* Nome do Grupo */}
          <Flex direction="column" gap="0.5rem">
            <Flex align="center" gap="0.5rem">
              <Text fontSize="14px" fontWeight="600" color="gray700">
                ✨ Nome do grupo
              </Text>
            </Flex>
            <TextInput
              placeholder="Ex: Equipe Inovação"
              color={colorMode === 'dark' ? '#FFF' : '#1D2939'}
              _placeholder={{ fontSize: '14px', color: '#999' }}
              value={data?.display_name}
              onInputChange={(v) => onInputChange('display_name', v)}
              error={errors.display_name}
            />
          </Flex>

          {/* Seção de Seleção de Membros */}
          <Flex direction="column" gap="0.75rem" flex="1" overflow="hidden" display="flex" flexDirection="column">
            <Flex justify="space-between" align="center">
              <Flex align="center" gap="0.5rem">
                <Text fontSize="14px" fontWeight="600" color="gray700">
                  👥 Adicionar membros
                </Text>
                <Badge colorScheme={selectedStudents.length >= 5 ? 'blue' : 'gray'} fontSize="12px" color={selectedStudents.length >= 5 ? 'white' : 'gray700'} bg={selectedStudents.length >= 5 ? '#007aff' : '#e8e8e8'}>
                  {selectedStudents.length} / 8
                </Badge>
              </Flex>
            </Flex>

            {/* Barra de Progresso */}
            <Flex direction="column" gap="0.25rem">
              <Flex
                h="4px"
                bg="#e8e8e8"
                borderRadius="2px"
                overflow="hidden"
              >
                <Flex
                  h="100%"
                  bg="#007aff"
                  w={`${(selectedStudents.length / 8) * 100}%`}
                  transition="width 0.3s ease"
                />
              </Flex>
            </Flex>

            {/* Campo de Busca */}
            <Flex
              align="center"
              gap="0.75rem"
              px="1rem"
              py="0.75rem"
              bg="#f5f5f5"
              borderRadius="10px"
              border="1px solid #e8e8e8"
              w="100%"
            >
              <Text fontSize="16px">🔍</Text>
              <TextInput
                placeholder="Buscar aluno..."
                fontSize="14px"
                w="100%"
                border="none"
                bg="transparent"
                p="0"
                _focus={{ outline: 'none', boxShadow: 'none' }}
                _placeholder={{ color: '#999' }}
              />
            </Flex>

            {/* Lista de Alunos Disponíveis com Scroll */}
            <Flex
              direction="column"
              gap="0.5rem"
              maxH="200px"
              overflowY="auto"
              overflowX="hidden"
              borderRadius="10px"
              bg="white"
              border="1px solid #e8e8e8"
              p="0.75rem"
              flex="1"
              css={{
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#ccc',
                  borderRadius: '3px',
                },
              }}
            >
              {project.hub_class?.students?.length ? (
                project.hub_class.students
                  .filter((student) => {
                    const approvedGroups = project.groups?.filter((group) => group.approved_at !== null) || [];
                    return !approvedGroups.some((group) => group.students?.some((s) => s.id === student.id));
                  })
                  .map((student) => {
                    const isSelected = data.users?.includes(student.id);
                    const initials = student.name
                      .split(' ')
                      .slice(0, 2)
                      .map((n) => n[0].toUpperCase())
                      .join('');
                    const colors = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
                    const colorIndex = student.name.charCodeAt(0) % colors.length;

                    return (
                      <Flex
                        key={student.id}
                        align="center"
                        gap="0.75rem"
                        p="0.75rem"
                        bg={isSelected ? '#f0f0f0' : 'white'}
                        borderRadius="8px"
                        cursor={selectedStudents.length >= 8 && !isSelected ? 'not-allowed' : 'pointer'}
                        opacity={selectedStudents.length >= 8 && !isSelected ? 0.6 : 1}
                        onClick={() => {
                          if (selectedStudents.length >= 8 && !isSelected) return;
                          toggleUser(student.id);
                        }}
                        transition="all 0.2s"
                        _hover={selectedStudents.length >= 8 && !isSelected ? {} : { bg: '#f5f5f5' }}
                        border="1px solid"
                        borderColor={isSelected ? '#007aff' : '#e8e8e8'}
                        w="100%"
                        overflow="hidden"
                      >
                        <Flex
                          w="32px"
                          h="32px"
                          borderRadius="50%"
                          bg={colors[colorIndex]}
                          align="center"
                          justify="center"
                          flexShrink={0}
                        >
                          <Text fontSize="12px" fontWeight="600" color="white">
                            {initials}
                          </Text>
                        </Flex>
                        <Text fontSize="14px" fontWeight="500" color="gray700" flex="1" noOfLines={1}>
                          {student.name}
                        </Text>
                        <Flex
                          w="18px"
                          h="18px"
                          borderRadius="3px"
                          border="2px solid"
                          borderColor={isSelected ? '#007aff' : '#e8e8e8'}
                          bg={isSelected ? '#007aff' : 'white'}
                          align="center"
                          justify="center"
                          flexShrink={0}
                        >
                          {isSelected && <Text fontSize="11px" color="white" fontWeight="700">✓</Text>}
                        </Flex>
                      </Flex>
                    );
                  })
              ) : (
                <Text fontSize="13px" color="gray500" textAlign="center" py="1rem">
                  Nenhum membro disponível
                </Text>
              )}
            </Flex>
          </Flex>

          {/* Seção de Membros e Cargos */}
          <Flex direction="column" gap="0.75rem">
            <Text fontSize="14px" fontWeight="600" color="gray700">
              Membros e cargos
            </Text>

            <Flex direction="column" gap="0.5rem" maxH="180px" overflowY="auto" overflowX="hidden" css={{
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#ccc',
                borderRadius: '3px',
              },
            }}>
              {selectedStudents.length === 0 ? (
                <Text fontSize="13px" color="gray500" fontStyle="italic">
                  Nenhum membro selecionado (mín. 5, máx. 8)
                </Text>
              ) : (
                selectedStudents.map((student) => {
                  const initials = student.name
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0].toUpperCase())
                    .join('');
                  const colors = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
                  const colorIndex = student.name.charCodeAt(0) % colors.length;
                  const assignedRole = memberRoles[student.id];
                  const roleConfig = assignedRole ? ROLE_CONFIG[assignedRole] : null;

                  return (
                    <Flex
                      key={student.id}
                      align="center"
                      gap="0.75rem"
                      p="0.75rem"
                      bg="gray50"
                      borderRadius="8px"
                      border="1px solid #e8e8e8"
                      justify="space-between"
                      w="100%"
                      overflow="hidden"
                    >
                      <Flex align="center" gap="0.75rem" flex="1" minW="0" overflow="hidden">
                        <Flex
                          w="32px"
                          h="32px"
                          borderRadius="50%"
                          bg={colors[colorIndex]}
                          align="center"
                          justify="center"
                          flexShrink={0}
                        >
                          <Text fontSize="12px" fontWeight="600" color="white">
                            {initials}
                          </Text>
                        </Flex>
                        <Text fontSize="13px" fontWeight="500" color="gray700" flex="1" noOfLines={1}>
                          {student.name}
                        </Text>
                      </Flex>

                      <Flex align="center" gap="0.5rem" flexShrink={0}>
                        {assignedRole && roleConfig ? (
                          <Popover placement="top">
                            <PopoverTrigger>
                              <Flex
                                px="0.75rem"
                                py="0.5rem"
                                bg={roleConfig.bgColor}
                                border={`1.5px solid ${roleConfig.borderColor}`}
                                borderRadius="6px"
                                align="center"
                                gap="0.5rem"
                                cursor="pointer"
                                transition="all 0.2s"
                                _hover={{ opacity: 0.8 }}
                              >
                                <Text fontSize="14px">{roleConfig.icon}</Text>
                                <Text fontSize="12px" fontWeight="600" color={roleConfig.color}>
                                  {assignedRole}
                                </Text>
                              </Flex>
                            </PopoverTrigger>
                            <PopoverContent w="fit-content" border="1px solid #e8e8e8" boxShadow="lg">
                              <PopoverBody p="0.75rem">
                                <Flex direction="column" gap="0.75rem">
                                  {ROLES.map((role) => {
                                    const currentCount = roleCounts[role] || 0;
                                    const limit = ROLE_LIMITS[role];
                                    const isFull = currentCount >= limit && memberRoles[student.id] !== role;
                                    const config = ROLE_CONFIG[role];

                                    return (
                                      <Flex
                                        key={role}
                                        px="1rem"
                                        py="0.75rem"
                                        bg={config.bgColor}
                                        border={`1px solid ${config.borderColor}`}
                                        borderRadius="6px"
                                        align="center"
                                        gap="0.75rem"
                                        cursor={isFull ? 'not-allowed' : 'pointer'}
                                        opacity={isFull ? 0.5 : 1}
                                        onClick={() => {
                                          if (!isFull) handleRoleChange(student.id, role);
                                        }}
                                        transition="all 0.2s"
                                        _hover={isFull ? {} : { opacity: 0.8 }}
                                      >
                                        <Text fontSize="16px">{config.icon}</Text>
                                        <Flex direction="column" gap="0" flex="1">
                                          <Text fontSize="12px" fontWeight="600" color={config.color}>
                                            {role}
                                          </Text>
                                        </Flex>
                                        <Badge colorScheme="gray" fontSize="11px" bg="white" border={`1px solid ${config.borderColor}`} color={config.color}>
                                          {currentCount}/{limit}
                                        </Badge>
                                      </Flex>
                                    );
                                  })}
                                </Flex>
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <Popover placement="top">
                            <PopoverTrigger>
                              <Flex
                                px="0.75rem"
                                py="0.5rem"
                                bg="white"
                                border="1px solid #e0e0e0"
                                borderRadius="6px"
                                align="center"
                                gap="0.5rem"
                                cursor="pointer"
                                transition="all 0.2s"
                                _hover={{ bg: 'gray50' }}
                              >
                                <Text fontSize="12px" color="#999">
                                  ⚙️
                                </Text>
                                <Text fontSize="12px" fontWeight="500" color="#666">
                                  Cargo
                                </Text>
                              </Flex>
                            </PopoverTrigger>
                            <PopoverContent w="fit-content" border="1px solid #e8e8e8" boxShadow="lg">
                              <PopoverBody p="0.75rem">
                                <Flex direction="column" gap="0.75rem">
                                  {ROLES.map((role) => {
                                    const currentCount = roleCounts[role] || 0;
                                    const limit = ROLE_LIMITS[role];
                                    const isFull = currentCount >= limit;
                                    const config = ROLE_CONFIG[role];

                                    return (
                                      <Flex
                                        key={role}
                                        px="1rem"
                                        py="0.75rem"
                                        bg={config.bgColor}
                                        border={`1px solid ${config.borderColor}`}
                                        borderRadius="6px"
                                        align="center"
                                        gap="0.75rem"
                                        cursor={isFull ? 'not-allowed' : 'pointer'}
                                        opacity={isFull ? 0.5 : 1}
                                        onClick={() => {
                                          if (!isFull) handleRoleChange(student.id, role);
                                        }}
                                        transition="all 0.2s"
                                        _hover={isFull ? {} : { opacity: 0.8 }}
                                      >
                                        <Text fontSize="16px">{config.icon}</Text>
                                        <Flex direction="column" gap="0" flex="1">
                                          <Text fontSize="12px" fontWeight="600" color={config.color}>
                                            {role}
                                          </Text>
                                        </Flex>
                                        <Badge colorScheme="gray" fontSize="11px" bg="white" border={`1px solid ${config.borderColor}`} color={config.color}>
                                          {currentCount}/{limit}
                                        </Badge>
                                      </Flex>
                                    );
                                  })}
                                </Flex>
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                        )}
                        <CloseButton size="sm" onClick={() => toggleUser(student.id)} color="red.400" />
                      </Flex>
                    </Flex>
                  );
                })
              )}
            </Flex>
          </Flex>
        </Flex>
      </SmallModal>
    </>
  );
};
