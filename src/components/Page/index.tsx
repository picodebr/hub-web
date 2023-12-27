import { PropsWithChildren } from 'react';

import { IPageProps } from '@/_base/hooks/Page/interfaces';
import { Flex, Link, Text, useColorMode } from '@chakra-ui/react';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { FiChevronLeft } from 'react-icons/fi';
import { useRouter } from 'next/router';

const NAKED_PAGES = ['login', 'signup', 'help', 'recover_password'];

export const PageWrapper: React.FC<PropsWithChildren<IPageProps>> = ({ selectedPage, user, children, showBackButton = true }) => {
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
          <Header user={user} />
          <Flex flex="1" padding="32px 112px" gap="32px" overflow="hidden">
            <Navbar page={selectedPage} user={user} />
            <Flex flex="1" height="100%" overflow="hidden" direction="column">
              {showBackButton && (
                <Flex cursor="pointer" fontWeight="600" color="primary700" onClick={() => router.back()}>
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
