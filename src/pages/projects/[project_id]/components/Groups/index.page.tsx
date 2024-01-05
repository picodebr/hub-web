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
}

const mockGroups: Partial<IHubGroup>[] = [
  { id: `1`, display_name: `Grupo brabo`, students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any },
  { id: `2`, display_name: `Grupo teste`, students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any },
  { id: `3`, display_name: `Grupo abc`, students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any },
  { id: `4`, display_name: `Grupo yup`, students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any },
  { id: `5`, display_name: `Grupo tech`, students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any },
  { id: `6`, display_name: `Grupo always`, students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any },
  { id: `7`, display_name: `Grupo leet code`, students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any },
  { id: `8`, display_name: `Grupo bay`, students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any },
];
const mockPendingGroups: Partial<IHubGroup>[] = [
  {
    id: `11`,
    display_name: `Grupo brabinho`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    updated_at: new Date(),
  },
  {
    id: `12`,
    display_name: `Grupo brabinho`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    updated_at: new Date(),
  },
  {
    id: `13`,
    display_name: `Grupo brabinho`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    updated_at: new Date(),
  },
  {
    id: `14`,
    display_name: `Grupo brabinho`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    updated_at: new Date(),
  },
  {
    id: `25`,
    display_name: `Grupo brabinho`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    updated_at: new Date(),
  },
  {
    id: `21`,
    display_name: `Grupo brabinho`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    updated_at: new Date(),
  },
  {
    id: `22`,
    display_name: `Grupo brabinho`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    updated_at: new Date(),
  },
  {
    id: `23`,
    display_name: `Grupo brabinho`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    updated_at: new Date(),
  },
  {
    id: `24`,
    display_name: `Grupo brabinho`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    updated_at: new Date(),
  },
  {
    id: `26`,
    display_name: `Grupo brabinho`,
    students: [{ name: `Aluno 1` }, { name: `Aluno 2` }, { name: `Aluno 3` }, { name: `Aluno 4` }] as any,
    updated_at: new Date(),
  },
];

export const Groups: React.FC<IProps> = ({ onPendingGroupAction }) => {
  const [targetGroup, setTargetGroup] = useState<(IHubGroup & { accept: boolean }) | null>(null);

  return (
    <Flex w="100%" h="100%" direction="column" gap="24px" overflow="hidden auto" margin="auto">
      {mockPendingGroups.map((group) => (
        <Flex key={group.id} w="100%" direction="column" gap="24px" bgColor="warning25" borderRadius="10px" boxShadow="md">
          <Flex w="100%" h="108px" p="12px 32px" justify="space-between" align="center">
            <Flex direction="column">
              <Text color="warning700" fontWeight="500">
                {group.display_name}
              </Text>
              <AvatarList users={group.students || []} />
            </Flex>
            <Flex color="warning500" fontSize="14px">
              {moment(group.updated_at).format(`DD/MM/YYYY`)}
            </Flex>
            <Flex direction="column" gap="12px">
              <GenericButton
                label="Aprovar"
                size="sm"
                bg="success600"
                color="white"
                _hover={{ filter: `brightness(0.9)` }}
                onClick={() => setTargetGroup({ ...(group as any), accept: true })}
              />
              <GenericButton
                label="Recusar"
                size="sm"
                bg="white"
                color="gray700"
                border="1px"
                borderColor="gray300"
                _hover={{ filter: `brightness(0.9)` }}
                onClick={() => setTargetGroup({ ...(group as any), accept: false })}
              />
            </Flex>
          </Flex>
        </Flex>
      ))}

      {mockGroups.map((group) => (
        <Link key={group.id} href={`/groups/${group.id}`} target="_blank">
          <Flex w="100%" h="auto" bg="white" borderRadius="10px" border="1px" borderColor="gray300" p="20px" gap="1rem">
            <FiUsers size="50px" color="#21E080" />
            <Flex direction="column">
              <Text color="primary700" fontSize="18px" fontWeight="700" gap="4px">
                {group.display_name}
              </Text>
              <AvatarList users={group.students || []} />
            </Flex>
          </Flex>
        </Link>
      ))}

      <SmallModal
        title={targetGroup?.accept ? `Aceitar Grupo ?` : `Recusar Grupo ?`}
        show={!!targetGroup}
        onConfirm={() => !!targetGroup && onPendingGroupAction(targetGroup, targetGroup.accept)}
        onCancel={() => setTargetGroup(null)}
        topIcon={targetGroup?.accept ? 'checked' : 'warning'}
      />
    </Flex>
  );
};
