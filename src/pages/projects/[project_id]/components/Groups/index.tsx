import { Flex, Link, Text } from '@chakra-ui/react';
import moment from 'moment';

import { IProject } from '@/_base/interfaces/project';
import { FiUsers } from 'react-icons/fi';
import { useState } from 'react';
import { IHubGroup } from '@/_base/interfaces/group';
import { GenericButton } from '@/components/Buttons/Generic';
import { AvatarList } from '@/components/AvatarList';
import { SmallModal } from '@/components/Modal/Small';

interface IProps {
  project: IProject;
  onPendingGroupAction: (group: IHubGroup, accept: boolean) => void;
  canEdit: boolean;
}

export const Groups: React.FC<IProps> = ({ onPendingGroupAction, project, canEdit }) => {
  const [targetGroup, setTargetGroup] = useState<(IHubGroup & { accept: boolean }) | null>(null);

  const handleConfirmAction = () => {
    if (!targetGroup) return;
    onPendingGroupAction(targetGroup, targetGroup.accept);
    setTargetGroup(null);
  };

  return (
    <Flex w="100%" h="100%" direction="column" gap="24px" overflow="hidden auto" margin="auto">
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
    </Flex>
  );
};
