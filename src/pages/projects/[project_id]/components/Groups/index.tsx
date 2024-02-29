import { Button, Flex, Link, Menu, MenuButton, MenuItem, MenuItemOption, MenuList, MenuOptionGroup, Text } from '@chakra-ui/react';
import moment from 'moment';

import { IProject } from '@/_base/interfaces/project';
import { FiUsers } from 'react-icons/fi';
import { useState } from 'react';
import { EMPTY_HUB_GROUP_DATA, ICreateHubGroupParams, IHubGroup, createHubGroupSchema } from '@/_base/interfaces/group';
import { GenericButton } from '@/components/Buttons/Generic';
import { AvatarList } from '@/components/AvatarList';
import { SmallModal } from '@/components/Modal/Small';
import { useInputHandler } from '@/_base/hooks';
import { TextInput } from '@/components/Inputs/Text';
import { IoChevronDownCircleOutline } from 'react-icons/io5';
import { isLowestGrade } from '@/_base/utils';

interface IProps {
  project: IProject;
  canEdit: boolean;
  onPendingGroupAction: (group: IHubGroup, accept: boolean) => void;
  handleAddGroup: (data: ICreateHubGroupParams) => void;
}

export const Groups: React.FC<IProps> = ({ onPendingGroupAction, project, canEdit, handleAddGroup }) => {
  const [targetGroup, setTargetGroup] = useState<(IHubGroup & { accept: boolean }) | null>(null);

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
    handleAddGroup(data);
    setData(EMPTY_HUB_GROUP_DATA);
  };

  return (
    <Flex w="100%" h="100%" direction="column" gap="24px" overflow="hidden auto" margin="auto">
      {isLowestGrade(project.hub_class?.grade || ``) && (
        <Flex justify="flex-end" align="center">
          <GenericButton
            label="Cadastrar grupo"
            size="sm"
            color="white"
            isDisabled={!canEdit}
            _hover={{ filter: `brightness(0.9)` }}
            onClick={() => setData((e) => ({ ...(e || ({} as any)), hub_project_class_id: project.id }))}
          />
        </Flex>
      )}
      {project.groups
        .filter((group) => !group.approved_at)
        .map((group) => (
          <Flex key={group.id} w="100%" direction="column" gap="24px" bgColor="warning25" borderRadius="10px" boxShadow="md" position="relative">
            <Flex w="100%" h="108px" p="12px 32px" justify="space-between" align="center">
              <Flex direction="column">
                <Text color="warning700" fontWeight="500">
                  {group.display_name}
                </Text>
                <AvatarList users={group.students || []} />
              </Flex>
              <Flex color="warning500" fontSize="14px" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
                {moment(group.updated_at).format(`DD/MM/YYYY`)}
              </Flex>
              <Flex direction="column" gap="12px">
                <GenericButton
                  label="Aprovar"
                  size="sm"
                  bg="success600"
                  color="white"
                  isDisabled={!canEdit}
                  _hover={{ filter: `brightness(0.9)` }}
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
                  _hover={{ filter: `brightness(0.9)` }}
                  onClick={() => setTargetGroup({ ...(group as any), accept: false })}
                />
              </Flex>
            </Flex>
          </Flex>
        ))}

      {project.groups
        .filter((group) => !!group.approved_at)
        .map((group) => (
          <Link key={group.id} href={`/groups/${group.id}`} target="_blank">
            <Flex
              w="100%"
              h="auto"
              bg="white"
              borderRadius="10px"
              border="1px"
              borderColor="gray300"
              p="20px"
              gap="1rem"
              _hover={{ '#display_name': { transform: `scale(1.05)` } }}
            >
              <FiUsers size="50px" color="#21E080" />
              <Flex direction="column">
                <Text id="display_name" color="primary700" fontSize="18px" fontWeight="700" gap="4px" transition="transform 0.2s">
                  {group.display_name}
                </Text>
                <AvatarList users={group.students || []} />
              </Flex>
            </Flex>
          </Link>
        ))}

      <SmallModal
        show={!!targetGroup}
        onConfirm={handleConfirmAction}
        onCancel={() => setTargetGroup(null)}
        topIcon={targetGroup?.accept ? 'checked' : 'warning'}
      >
        <Flex direction="column" gap="1rem">
          <Text fontWeight="500" color="gray600">
            {targetGroup?.accept ? 'Aprovar' : 'Recusar'} o grupo <b>{targetGroup?.display_name}</b> ?
          </Text>
        </Flex>
      </SmallModal>

      <SmallModal
        title="Cadastrar Grupo"
        show={!!data.hub_project_class_id}
        onConfirm={() => submit(onAddGroup)}
        okText="Criar"
        onCancel={() => setData(EMPTY_HUB_GROUP_DATA)}
        disableOkButton={!data.users?.length || !data.hub_project_class_id || !data.display_name}
        topIcon={'checked'}
      >
        <Flex direction="column" minW="350px" gap="1rem">
          <TextInput
            placeholder="Informe o nome do grupo"
            _placeholder={{ fontSize: '14px' }}
            value={data?.display_name}
            onInputChange={(v) => onInputChange('display_name', v)}
            error={errors.display_name}
          />

          <Menu closeOnSelect={false} placement="right" preventOverflow={true}>
            <MenuButton as={Button} rightIcon={<IoChevronDownCircleOutline />} border="1px" borderColor="gray300" bg="white">
              Selecione os membros do grupo
            </MenuButton>
            <MenuList borderColor="gray300" boxShadow="md" maxH="350px" overflow="auto">
              <MenuOptionGroup type="checkbox">
                {project.hub_class?.students?.length ? (
                  project.hub_class.students.map((student) => (
                    <MenuItemOption
                      key={student.id}
                      value={student.id}
                      onClick={() =>
                        onInputChange(
                          `users`,
                          data.users?.find((id) => id === student.id)
                            ? data.users?.filter((id) => id !== student.id)
                            : [...(data?.users || []), student.id],
                        )
                      }
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
          <Flex align="center" gap="0.5rem">
            <Text fontSize="15px" fontWeight="500">
              Membros:
            </Text>
            <AvatarList
              users={project.hub_class?.students?.filter((e) => data.users?.includes(e.id)) || []}
              max={10}
              emptyMessage="Nenhum membro adicionado"
            />
          </Flex>
        </Flex>
      </SmallModal>
    </Flex>
  );
};
