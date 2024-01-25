import { IHubGroup } from '@/_base/interfaces/group';
import { Avatar, AvatarBadge, Divider, Flex, Text } from '@chakra-ui/react';

interface IProps {
  group: IHubGroup;
}

export const Members: React.FC<IProps> = ({ group }) => {
  return (
    <Flex direction="column" display="flex" w="100%" h="fit-content" border="1px" borderColor="gray300" borderRadius="10px" bg="white">
      <Flex>
        <Text h="58px" w="100%" align="left" p="20px" fontSize="14px" color="gray600" borderBottom="1px" borderColor="gray300">
          Membros do Grupo
        </Text>
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
          <Flex h="fit-content" gap="12px" p="12px 20px">
            <Avatar src={student.avatar || undefined}>
              <AvatarBadge boxSize="1.25em" bg="green.500" />
            </Avatar>
            <Flex direction="column">
              <Text color="gray700" fontSize="14px" fontWeight="600">
                {student.name}
              </Text>
              <Text color="gray500" fontSize="14px">
                @{student.username}
              </Text>
            </Flex>
          </Flex>
          {i < arr.length - 1 && <Divider color="gray300" />}
        </Flex>
      ))}
    </Flex>
  );
};
