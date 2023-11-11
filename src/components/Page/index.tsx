import { IPageProps } from '@/_base/hooks/Page/interfaces';
import { Flex, Image } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';

const NAKED_PAGES = ['login', 'signup', 'help', 'recover_password'];

export const PageWrapper: React.FC<PropsWithChildren<IPageProps>> = ({ selectedPage, user: admin, children }) => {
  return (
    <Flex h="100vh" w="100vw" flexDirection="column" bg="bg.primary" position="relative" overflow="hidden">
      {!selectedPage || NAKED_PAGES.includes(selectedPage) ? (
        children
      ) : (
        <>
          <Header user={admin} />
          <Flex flex="1" padding="10px" gap="10px" overflow="hidden">
            <Navbar page={selectedPage} user={admin} />
            <Flex flex="1" height="100%" overflow="hidden">
              {children}
            </Flex>
          </Flex>
        </>
      )}
      <Image src="/patterns/line-pattern.svg" zIndex="-1" h={{ base: '0', lg: '445px' }} position="absolute" left="0" top="11.5rem" />
      <Image src="/patterns/line-pattern.svg" zIndex="-1" h={{ base: '0', lg: '445px' }} position="absolute" bottom="0" right="-5rem" />
    </Flex>
  );
};
