import { FiBell, FiLogOut } from 'react-icons/fi';

import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { IHubUser } from '@/_base/interfaces/user';
import { Logo } from '@/components/Logo';
import { dimensions } from '@/styles/global';
import { Flex, Text } from '@chakra-ui/react';

interface IProps {
  user?: IHubUser;
}

export const Header: React.FC<IProps> = () => {
  const router = useCustomRouter();

  return (
    <Flex
      maxH={dimensions.header.height}
      minH={dimensions.header.height}
      w="100%"
      alignItems="center"
      justifyContent="space-between"
      padding="0 112px"
      borderRadius="0 0 0.4rem 0.4rem"
      borderColor="primary"
      bg="white"
    >
      <Logo size="md" />
      <Flex gap="1rem" align="center" fontSize="1.75rem">
        <FiBell />
        <FiLogOut />
      </Flex>
    </Flex>
  );
};
