import { Avatar, AvatarGroup, Flex, Text } from '@chakra-ui/react';
import { IAvatarListProps } from './interfaces';
import { formatShortName } from '@/_base/utils';

export const AvatarList: React.FC<IAvatarListProps> = ({ users, max = 6, emptyMessage, color, showMessage = true }) => {
  return (
    <AvatarGroup size="sm" max={max} userSelect="none">
      {users?.length
        ? users.map((user) => (
            <Avatar
              key={user.id}
              name={formatShortName(user?.name || '', true)}
              title={user?.name}
              src={user?.avatar || undefined}
              cursor="pointer"
            />
          ))
        : showMessage && (
            <Flex align="flex-end">
              <Text color={color || 'gray400'} fontSize="14px">
                {emptyMessage || `Nenhum aluno cadastrado`}
              </Text>
            </Flex>
          )}
    </AvatarGroup>
  );
};
