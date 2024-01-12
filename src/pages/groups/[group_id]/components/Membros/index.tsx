import { Avatar, AvatarBadge, Divider, Flex, Text } from '@chakra-ui/react';

interface IProps {}

export const Members: React.FC<IProps> = () => {
  return (
    <Flex direction="column" display="flex" w="100%" h="fit-content" border="1px" borderColor="gray300" borderRadius="10px" bg="white">
      <Flex>
        <Text h="58px" w="100%" align="left" p="20px" fontSize="14px" color="gray600" borderBottom="1px" borderColor="gray300">
          Membros do Grupo
        </Text>
      </Flex>
      <Flex h="fit-content" gap="12px" p="12px 20px">
        <Avatar />
        <Flex direction="column">
          <Text color="gray700" fontSize="14px" fontWeight="600">
            Nome do Professor
          </Text>
          <Text color="gray500" fontSize="14px">
            Professor(a) responsável
          </Text>
        </Flex>
      </Flex>
      <Divider />
      <Flex h="fit-content" gap="12px" p="12px 20px">
        <Avatar>
          <AvatarBadge boxSize="1.25em" bg="green.500" />
        </Avatar>
        <Flex direction="column">
          <Text color="gray700" fontSize="14px" fontWeight="600">
            arthuralegria
          </Text>
          <Text color="gray500" fontSize="14px">
            #16
          </Text>
        </Flex>
      </Flex>
      <Divider />
      <Flex h="fit-content" gap="12px" p="12px 20px">
        <Avatar>
          <AvatarBadge boxSize="1.25em" bg="green.500" />
        </Avatar>
        <Flex direction="column">
          <Text color="gray700" fontSize="14px" fontWeight="600">
            carolsuit
          </Text>
          <Text color="gray500" fontSize="14px">
            #2
          </Text>
        </Flex>
      </Flex>
      <Divider />
      <Flex h="fit-content" gap="12px" p="12px 20px">
        <Avatar></Avatar>
        <Flex direction="column">
          <Text color="gray700" fontSize="14px" fontWeight="600">
            carolina curiosa
          </Text>
          <Text color="gray500" fontSize="14px">
            #10
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
