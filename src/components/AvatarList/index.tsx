import { Avatar, AvatarGroup, Flex, Text } from '@chakra-ui/react';
import { IAvatarListProps } from './interfaces';
import { formatShortName } from '@/_base/utils';

export const AvatarList: React.FC<IAvatarListProps> = ({ users, max = 6 }) => {
  return (
    <AvatarGroup size="sm" max={max} userSelect="none">
      {users?.length ? (
        users.map((user) => (
          <Avatar name={formatShortName(user?.name || '', true)} title={user?.name} src={user?.avatar || undefined} cursor="pointer" />
        ))
      ) : (
        <Flex align="flex-end">
          <Text color="gray400" fontSize="14px">
            Nenhum aluno cadastrado
          </Text>
        </Flex>
      )}
    </AvatarGroup>
  );
};
