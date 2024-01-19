import { FiBell, FiLogOut } from 'react-icons/fi';

import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { IHubUser } from '@/_base/interfaces/user';
import { Logo } from '@/components/Logo';
import { dimensions } from '@/styles/global';
import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { SelectPicker } from 'rsuite';
import { useState } from 'react';

interface IProps {
  user?: IHubUser;
  headerLabel?: string;
}

export const Header: React.FC<IProps> = ({ user, headerLabel }) => {
  const router = useCustomRouter();
  const [selectedSchool, setSelectedSchool] = useState(user?.schools?.map((item) => ({ label: item.display_name, value: item.id }))[0]);

  const data = user?.schools.map((item) => ({ label: item.display_name, value: item.id })) || [];

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
      userSelect="none"
      boxShadow="md"
      position="relative"
    >
      <Logo size="md" />
      {!!headerLabel && (
        <Flex position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
          <Tooltip label={`Projeto: ${headerLabel}`}>
            <Text fontSize="19px" fontWeight="500">
              {headerLabel}
            </Text>
          </Tooltip>
        </Flex>
      )}
      <Flex gap="1rem" align="center" fontSize="1.75rem">
        <SelectPicker
          data={data}
          value={selectedSchool?.value}
          size="sm"
          style={{ paddingBottom: 5 }}
          searchable={false}
          cleanable={false}
          onChange={(e) => setSelectedSchool(data.find((d) => d.value === e))}
        />
        <Tooltip label="Notificações">
          <Flex cursor="pointer" transition="0.12s" _hover={{ filter: 'brightness(0.7)' }}>
            <FiBell color="#667085" />
          </Flex>
        </Tooltip>
        <Tooltip label="Sair">
          <Flex cursor="pointer" transition="0.12s" _hover={{ filter: 'brightness(0.7)' }} onClick={() => router.push('/logout')}>
            <FiLogOut color="#FDA29B" />
          </Flex>
        </Tooltip>
      </Flex>
    </Flex>
  );
};
