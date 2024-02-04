import { PropsWithChildren } from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import { useRouter } from 'next/router';

import { IPageProps } from '@/_base/hooks/Page/interfaces';
import { Flex, Text, useColorMode } from '@chakra-ui/react';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { RedefinePass } from './components/RedefinePass';

const NAKED_PAGES = ['login', 'signup', 'help', 'recover_password'];

export const PageWrapper: React.FC<PropsWithChildren<IPageProps>> = ({
  selectedPage,
  user,
  children,
  headerLabel,
  showBackButton = true,
  isOpen = false,
  stopTour,
}) => {
  const { colorMode } = useColorMode();
  const router = useRouter();

  return (
    <Flex
      h="100vh"
      w="100vw"
      flexDirection="column"
      bg="primary50"
      position="relative"
      overflow="hidden"
      zIndex="0"
      bgImg={`/patterns/bg-${colorMode}.svg`}
      bgRepeat="no-repeat"
      bgSize="cover"
    >
      {!selectedPage || NAKED_PAGES.includes(selectedPage) ? (
        children
      ) : (
        <>
          <Header user={user} headerLabel={headerLabel} />
          <Flex flex="1" overflow="hidden">
            <Navbar page={selectedPage} user={user} isOpen={isOpen} stopTour={stopTour} />
            <RedefinePass user={user} />
            <Flex flex="1" height="100%" overflow="hidden" direction="column" position="relative" p="1.5rem 1.5rem 1.5rem 0">
              {showBackButton && (
                <Flex cursor="pointer" fontWeight="600" color="primary700" onClick={() => router.back()} pb="0.5rem" w="fit-content">
                  <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
                  <Text textAlign="left">Voltar</Text>
                </Flex>
              )}
              {children}
            </Flex>
          </Flex>
        </>
      )}
    </Flex>
  );
};
