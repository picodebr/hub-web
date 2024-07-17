import { Flex, Image, ScaleFade, Text, Tooltip, useColorMode, useUpdateEffect } from '@chakra-ui/react';
import { SelectPicker } from 'rsuite';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { FiBell, FiLogOut } from 'react-icons/fi';
import { persist } from 'zustand/middleware';

import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { IHubUser } from '@/_base/interfaces/user';
import { Logo } from '@/components/Logo';
import { dimensions } from '@/styles/global';
import { IHubUserSchool } from '@/_base/interfaces/school';
import { MenuItemType } from '../../interfaces';
import { MobileMenu } from '../MobileMenu';

interface IProps {
  user?: IHubUser;
  headerLabel?: string;
  menuItems: MenuItemType[];
  page: string;
  hideOnMobile?: boolean;
}

type TargetSchoolHookType = { school: IHubUserSchool | null; setSchool: (school: IHubUserSchool) => void };

export const useSelectedSchool = create<TargetSchoolHookType>(
  persist(
    (set) => ({
      school: null,
      setSchool: (data: IHubUserSchool) => set(() => ({ school: data })),
    }),
    { name: `context-storage` },
  ) as any,
);

export const Header: React.FC<IProps> = ({ user, headerLabel, menuItems, page, hideOnMobile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(user?.schools?.map((item) => ({ label: item.display_name, value: item.id }))[0]);

  const router = useCustomRouter();
  const { colorMode } = useColorMode();
  const { setSchool, school } = useSelectedSchool();

  const data = user?.schools.map((item) => ({ label: item.display_name, value: item.id })) || [];
  useUpdateEffect(() => {
    setIsLoading(true);
    const target = user?.schools.find((e) => e.id === selectedSchool?.value);

    if (target) {
      setSchool(target);
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  }, [selectedSchool]);

  useEffect(() => {
    const storage = JSON.parse(localStorage.getItem(`context-storage`) || `{}`);
    const target = user?.schools.find((e) => e.id === selectedSchool?.value) || user?.schools[0] || storage?.state?.school;

    if (target) setSchool(target);
  }, [user]);

  return (
    <Flex
      maxH={dimensions.header.height}
      minH={dimensions.header.height}
      w="100%"
      alignItems="center"
      justifyContent="space-between"
      padding={{ base: '0 1rem', lg: '0 2rem' }}
      borderRadius="0 0 0.4rem 0.4rem"
      borderColor="primary"
      bg="white"
      userSelect="none"
      boxShadow="md"
      position="relative"
      display={{ base: hideOnMobile ? `none` : `flex`, lg: `flex` }}
    >
      <Logo size="md" className="only-desktop" />
      <MobileMenu menuItems={menuItems} page={page} />
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
        {user?.role === `teacher` && (
          <SelectPicker
            data={data}
            value={selectedSchool?.value || school?.id}
            size="sm"
            style={{ paddingBottom: 5 }}
            appearance="subtle"
            searchable={false}
            cleanable={false}
            onChange={(e) => setSelectedSchool(data.find((d) => d.value === e))}
          />
        )}
        <Tooltip label="Notificações">
          <Flex cursor="pointer" transition="0.12s" _hover={{ filter: 'brightness(0.7)' }}>
            <FiBell color="#667085" />
          </Flex>
        </Tooltip>
        <Tooltip label="Sair">
          <Flex
            cursor="pointer"
            transition="0.12s"
            _hover={{ filter: 'brightness(0.7)' }}
            onClick={() => router.push('/logout', `spinner`)}
            className="only-desktop"
          >
            <FiLogOut color="#FDA29B" />
          </Flex>
        </Tooltip>
      </Flex>

      <ScaleFade
        in={isLoading}
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          bottom: '0',
          right: '0',
          background: 'white',
          backgroundImage: `/patterns/bg-${colorMode}.svg`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          height: '100%',
          width: '100%',
          pointerEvents: 'none',
          zIndex: '9999',
          opacity: isLoading ? `1` : `0`,
          transition: 'all 0.2s',
        }}
      >
        <Flex height="100%" w="100%" bg="white" bgImg={`/patterns/bg-${colorMode}.svg`} bgRepeat="no-repeat" bgSize="cover">
          <Flex direction="column" margin="auto" gap="1rem" align="center">
            <Image src="/loading/rocket-loading.gif" h="100%" borderRadius="1rem" boxShadow="md" />
            <Text fontSize="24px" mt="-6rem">
              {selectedSchool?.label}
            </Text>
          </Flex>
        </Flex>
      </ScaleFade>
    </Flex>
  );
};
