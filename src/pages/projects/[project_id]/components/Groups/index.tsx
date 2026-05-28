import React, { useState } from 'react';
import { Users, UserPlus, ChevronRight } from 'lucide-react';
import { IProject } from '@/_base/interfaces/project';
import { EMPTY_HUB_GROUP_DATA, ICreateHubGroupParams, IHubGroup, createHubGroupSchema } from '@/_base/interfaces/group';
import { AvatarList } from '@/components/AvatarList';
import { SmallModal } from '@/components/Modal/Small';
import { useCustomRouter, useInputHandler, useAsyncCallback } from '@/_base/hooks';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
import { TextInput } from '@/components/Inputs/Text';
import { listAvailableUsersForGroupByProject } from '@/_base/services/group';
import { IHubUser } from '@/_base/interfaces/user';
import {
  Avatar,
  Badge,
  Button,
  CloseButton,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  VStack,
  Flex,
  Text,
} from '@chakra-ui/react';
import { FiUsers, FiStar, FiBarChart, FiMessageCircle, FiBox } from 'react-icons/fi';
import { IoChevronDownCircleOutline } from 'react-icons/io5';
import { AnimatePresence, motion } from 'framer-motion';

// Preservando Roles Customizadas Originais
const ROLE_CONFIG: Record<string, { min: number; max: number }> = {
  'Líder de Grupo': { min: 1, max: 1 },
  'Gestor de Projetos': { min: 1, max: 1 },
  'Social Media': { min: 1, max: 1 },
  'Construtor': { min: 0, max: 5 },
};
const ROLES = Object.keys(ROLE_CONFIG);

const getRoleIcon = (role: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Líder de Grupo': <FiStar size={16} />,
    'Gestor de Projetos': <FiBarChart size={16} />,
    'Social Media': <FiMessageCircle size={16} />,
    Construtor: <FiBox size={16} />,
  };
  return iconMap[role] || <FiUsers size={16} />;
};

interface IProps {
  project: IProject;
  canEdit: boolean;
  onPendingGroupAction: (group: IHubGroup, accept: boolean) => void;
  handleAddGroup: (data: ICreateHubGroupParams) => void;
}

export const Groups: React.FC<IProps> = ({ onPendingGroupAction, project, canEdit, handleAddGroup }) => {
  const [targetGroup, setTargetGroup] = useState<(IHubGroup & { accept: boolean }) | null>(null);
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({});
  const [availableStudents, setAvailableStudents] = useState<IHubUser[]>([]);
  const { colorMode } = useDarkMode();
  const router = useCustomRouter();

  const { errors, onInputChange, data, submit, setData } = useInputHandler<ICreateHubGroupParams>({
    data: EMPTY_HUB_GROUP_DATA, schema: createHubGroupSchema,
  });

  const handleChangeProject = useAsyncCallback(
    async (project_id: string) => {
      setData((e) => ({ ...(e || ({} as any)), hub_project_class_id: project_id, users: [] }));
      const students = await listAvailableUsersForGroupByProject(project_id);
      setAvailableStudents(students);
      setMemberRoles({});
    },
    [],
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
      if (newUsers.length >= 8) return;
      newUsers = [...newUsers, studentId];
    }
    onInputChange('users', newUsers);
  };

  const handleRoleChange = (studentId: string, role: string) => {
    setMemberRoles((prev) => ({ ...prev, [studentId]: role }));
  };

  const roleCounts = Object.values(memberRoles).reduce(
    (acc, role) => {
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const requiredRoles = ['Líder de Grupo', 'Gestor de Projetos', 'Social Media'];
  const hasAllRequiredRoles = requiredRoles.every((role) => (roleCounts[role] || 0) === 1);
  const constructorCount = roleCounts['Construtor'] || 0;
  const isConstructorCountValid = constructorCount <= 5;
  const isUserCountValid = data.users.length >= 3 && data.users.length <= 8;
  const areAllRolesAssigned = data.users.every((s) => !!memberRoles[s]);
  const isFormValid = isUserCountValid && areAllRolesAssigned && hasAllRequiredRoles && isConstructorCountValid;

  const onAddGroup = () => {
    handleAddGroup(data);
    setData(EMPTY_HUB_GROUP_DATA);
    setMemberRoles({});
    setAvailableStudents([]);
  };

  const onCancelModal = () => {
    setData(EMPTY_HUB_GROUP_DATA);
    setMemberRoles({});
    setAvailableStudents([]);
  };

  return (
    <>
      <div className="glass-card p-5 space-y-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5 text-base font-semibold text-foreground">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            Grupos
          </div>
          <button
            disabled={!canEdit}
            onClick={() => handleChangeProject(project.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50 font-medium"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Cadastrar grupo
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[350px] flex-1 pr-1">
          {/* Grupos Pendentes */}
          {project.groups.filter((group) => !group.approved_at).map((group) => (
            <div key={group.id} className="w-full flex flex-col gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5">
              <div className="flex flex-col gap-1">
                <span className="text-amber-700 dark:text-amber-500 font-bold text-sm">{group.display_name} (Pendente)</span>
                <AvatarList users={group.students || []} />
              </div>
              <div className="flex gap-2">
                <button
                  disabled={!canEdit}
                  onClick={() => setTargetGroup({ ...(group as any), accept: true })}
                  className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-emerald-950 text-xs font-semibold rounded-lg transition-colors"
                >
                  Aprovar
                </button>
                <button
                  disabled={!canEdit}
                  onClick={() => setTargetGroup({ ...(group as any), accept: false })}
                  className="flex-1 py-1.5 bg-background border border-border hover:bg-accent text-foreground text-xs font-semibold rounded-lg transition-colors"
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}

          {/* Grupos Aprovados */}
          {project.groups.filter((group) => !!group.approved_at).map((group) => (
            <div
              key={group.id}
              onClick={() => router.push(`/groups/${group.id}`)}
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border/40 bg-card/60 px-3 py-3 transition-all duration-300 hover:border-border hover:bg-card hover:shadow-sm cursor-pointer"
            >
              <span className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-purple-500 opacity-60 transition-all duration-300 group-hover:h-12 group-hover:opacity-100" />
              <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-500/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <h4 className="text-sm font-semibold text-foreground tracking-tight truncate">{group.display_name}</h4>
                <AvatarList users={group.students || []} />
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-foreground" />
            </div>
          ))}

          {project.groups.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm italic">
              Nenhum grupo cadastrado
            </div>
          )}
        </div>
      </div>

      <SmallModal show={!!targetGroup} onConfirm={() => { if(targetGroup) onPendingGroupAction(targetGroup, targetGroup.accept); setTargetGroup(null); }} onCancel={() => setTargetGroup(null)} topIcon={targetGroup?.accept ? 'checked' : 'warning'}>
        <p className="text-sm text-foreground">
          {targetGroup?.accept ? 'Aprovar' : 'Recusar'} o grupo <span className="font-bold">{targetGroup?.display_name}</span>?
        </p>
      </SmallModal>

      {/* Modal de Criação */}
      <SmallModal
        title="Cadastrar Grupo"
        show={!!data.hub_project_class_id}
        onConfirm={() => submit(onAddGroup)}
        okText="Criar grupo"
        onCancel={onCancelModal}
        disableOkButton={!data.users?.length || !data.display_name || !isFormValid}
        topIcon="checked"
        modalMaxW="600px"
      >
        <Flex direction="column" gap="1rem">
          {/* 1. Nome do Grupo */}
          <TextInput
            placeholder="Ex: Equipe Inovação"
            value={data?.display_name}
            onInputChange={(v) => onInputChange('display_name', v)}
            error={errors.display_name}
          />

          {/* 2. Alunos */}
          <Menu closeOnSelect={false} placement="bottom" preventOverflow={true}>
            <MenuButton
              as={Button}
              rightIcon={<IoChevronDownCircleOutline />}
              border="1px"
              borderColor="gray.300"
              bg="white"
              w="100%"
              textAlign="left"
              fontWeight="normal"
              color="gray.600"
            >
              {data.users.length === 8 ? 'Limite de 8 membros atingido' : 'Selecione os membros do grupo'}
            </MenuButton>
            <MenuList borderColor="gray.300" maxH="200px" overflow="auto" zIndex={10}>
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

          {/* 3. Lista de Membros Selecionados com Atribuição de Cargos */}
          <VStack w="100%" align="stretch" spacing={2}>
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
                        <Menu placement="left">
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
    </>
  );
};