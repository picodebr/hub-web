import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { IAdmin } from '@/_base/interfaces/admin';
import { getUserInitials } from '@/_base/utils';
import { dimensions } from '@/styles/global';
import { Flex, Image, Text } from '@chakra-ui/react';

interface IProps {
  admin: IAdmin;
}

export const Header: React.FC<IProps> = ({ admin }) => {
  const router = useCustomRouter();

  const handleMenuOptions = {
    logout: () => router.push('/logout'),
  };

  return (
    <Flex
      maxH={dimensions.header.height}
      minH={dimensions.header.height}
      w="100%"
      alignItems="center"
      justifyContent="space-between"
      padding="0 1rem"
      borderRadius="0 0 0.4rem 0.4rem"
      borderBottom="2px solid"
      borderColor="#5924a8"
    >
      <Image src="/adhow-logo.svg" alt="logo" h="25px" />
      <Flex
        border="2px solid"
        bg="bg.white"
        borderColor="secondary"
        w="2.875rem"
        h="2.875rem"
        borderRadius="50%"
        justify="center"
        align="center"
        position="relative"
        userSelect="none"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ background: 'bg.gray' }}
        onClick={() => router.push(`/profile`)}
      >
        <Text color="primary" fontWeight="extrabold" fontSize="1.5rem" letterSpacing={1}>
          {getUserInitials(admin.name)}
        </Text>
      </Flex>
    </Flex>
  );
};
