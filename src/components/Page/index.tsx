import { PropsWithChildren, useState } from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { FiFileText, FiHeadphones, FiInbox, FiUsers } from 'react-icons/fi';
import { FaRegSmile, FaRegStar } from 'react-icons/fa';
import { RiHome2Line } from 'react-icons/ri';
import { BsMotherboard } from 'react-icons/bs';

import { IPageProps } from '@/_base/hooks/Page/interfaces';
import { Flex, Text, useColorMode } from '@chakra-ui/react';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { RedefinePass } from './components/RedefinePass';
import { MenuItemType } from './interfaces';
import { IStoreMakerSchool } from '@/_base/interfaces/storeMaker';
import { IHubUserSchool } from '@/_base/interfaces/school';

export const PageWrapper: React.FC<PropsWithChildren<IPageProps>> = ({
  selectedPage,
  user,
  children,
  headerLabel,
  showBackButton = true,
  backButtonPath,
  hideHeaderOnMobile,
  fullScreenOnMobile,
  setUser,
}) => {
  const [stockItems, setStockItems] = useState<IStoreMakerSchool[]>([]);
  const [school, setSchool] = useState<IHubUserSchool | null>(null);

  const { colorMode } = useColorMode();
  const router = useRouter();

  const menuItems = user?.role === 'student' ? studentMenuItems : teacherMenuItems;

  return (
    <Flex
      h="100vh"
      w="100vw"
      flexDirection="column"
      bg="primary50"
      position="relative"
      overflow="hidden"
      zIndex="0"
      bgImg={`/patterns/background-${colorMode}.svg`}
      bgRepeat="no-repeat"
      bgSize="cover"
    >
      {!selectedPage || NAKED_PAGES.includes(selectedPage) ? (
        children
      ) : (
        <>
          <Header
            user={user}
            headerLabel={headerLabel}
            menuItems={menuItems}
            page={selectedPage}
            hideOnMobile={hideHeaderOnMobile}
            setStockItems={setStockItems}
            onUpdateSchool={setSchool}
            onUpdateUser={setUser}
          />
          <Flex flex="1" overflow="hidden">
            <Navbar page={selectedPage} user={user} menuItems={menuItems} stockItems={stockItems} school={school} />
            <RedefinePass user={user} />
            <Flex
              flex="1"
              height="100%"
              overflow="hidden"
              direction="column"
              position="relative"
              p={{ base: fullScreenOnMobile ? undefined : `1rem`, lg: '1rem 1rem 1rem 0', xl: '1.5rem 1.5rem 1.5rem 0' }}
            >
              {showBackButton && (
                <Flex
                  userSelect="none"
                  cursor="pointer"
                  fontWeight="600"
                  color={colorMode === 'light' ? 'primary700' : 'primary300'}
                  onClick={() => (backButtonPath ? router.push(backButtonPath) : router.back())}
                  pb="0.5rem"
                  w="fit-content"
                >
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

const NAKED_PAGES = ['login', 'signup', 'help', 'recover_password'];
const studentMenuItems: Array<MenuItemType> = [
  { name: 'Home', page: 'profile', icon: RiHome2Line },
  { name: 'Cursos', page: 'courses', icon: FaRegStar },
  // { name: 'Loja', page: 'store', icon: FiShoppingBag,  },
  // { name: 'Avaliações', page: 'exam', icon: PiExamLight },
  { name: 'Biblioteca', page: 'library', icon: FiFileText },
  { name: 'Meus Planejamentos', page: 'planner', icon: FiFileText },
  { name: 'Meus Códigos', page: 'code', icon: BsMotherboard },
  { name: 'Meus Grupos', page: 'groups', icon: FiUsers },
  // { name: 'Desafio Bônus', page: 'challenge', icon: FiCheckCircle },
];

const teacherMenuItems: Array<MenuItemType> = [
  { name: 'Home', page: 'profile', icon: RiHome2Line },
  { name: 'Cursos', page: 'courses', icon: FaRegStar },
  // { name: 'Avaliações', page: 'exam', icon: PiExamLight },
  { name: 'Turmas', page: 'classes', icon: FiUsers },
  { name: 'Meus Códigos', page: 'code', icon: BsMotherboard },
  { name: 'Estoque Maker', page: 'stock', icon: FiInbox },
  // { name: 'Loja', page: 'store', icon: FiShoppingBag },
  { name: 'Biblioteca', page: 'library', icon: FiFileText },
  { name: 'Comunidade', page: 'community', icon: FaRegSmile },
  { name: 'Suporte', page: 'appointments', icon: FiHeadphones },
  // { name: 'Eventos', page: 'events', icon: FiList, },
];
