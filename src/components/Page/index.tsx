import { PropsWithChildren, useState } from 'react';
import { FiFileText, FiHeadphones, FiInbox, FiUsers } from 'react-icons/fi';
import { FaRegSmile, FaRegStar } from 'react-icons/fa';
import { RiHome2Line } from 'react-icons/ri';
import { BsMotherboard } from 'react-icons/bs';

import { IPageProps } from '@/_base/hooks/Page/interfaces';
import { Flex } from '@chakra-ui/react';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
import { Header } from './components/Header';
import { Navbar, useNavbar } from './components/Navbar';
import { RedefinePass } from './components/RedefinePass';
import { MenuItemType } from './interfaces';
import { IStoreMakerSchool } from '@/_base/interfaces/storeMaker';
import { IHubUserSchool } from '@/_base/interfaces/school';
import { TbCircuitResistor } from 'react-icons/tb';
import { dimensions } from '@/styles/global';

export const PageWrapper: React.FC<PropsWithChildren<IPageProps>> = ({ selectedPage, user, children, headerLabel, hideHeaderOnMobile, setUser }) => {
  const [stockItems, setStockItems] = useState<IStoreMakerSchool[]>([]);
  const [school, setSchool] = useState<IHubUserSchool | null>(null);

  const { colorMode } = useDarkMode();
  const { isSidebarOpen } = useNavbar();

  const menuItems = (user?.role === 'student' ? studentMenuItems : teacherMenuItems).filter(
    (e) => user?.role === `master` || e.page !== `vision_lab`,
  );

  return (
    <Flex
      h="100vh"
      w="100vw"
      flexDirection="column"
      position="relative"
      overflow="hidden"
      zIndex="0"
      bg="primary50"
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
          <Flex flex="1" overflow="hidden" gap="1rem">
            <Navbar page={selectedPage} user={user} menuItems={menuItems} stockItems={stockItems} school={school} />
            <RedefinePass user={user} />
            <Flex
              flex="1"
              height="100%"
              overflow="hidden auto"
              direction="column"
              position="relative"
              maxW="100%"
              sx={{
                '& > :last-child': {
                  padding: { base: '1rem', lg: isSidebarOpen ? '2rem 10rem 2rem 10rem' : '1rem 16rem 2rem 16rem' },
                  w: '100%',
                },
              }}
            >
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
  { name: 'Code Lab', page: 'code', icon: BsMotherboard },
  { name: 'Vision Lab', page: 'vision_lab', icon: TbCircuitResistor },

  { name: 'Meus Grupos', page: 'groups', icon: FiUsers },
  // { name: 'Desafio Bônus', page: 'challenge', icon: FiCheckCircle },
];

const teacherMenuItems: Array<MenuItemType> = [
  { name: 'Home', page: 'profile', icon: RiHome2Line },
  { name: 'Cursos', page: 'courses', icon: FaRegStar },
  // { name: 'Avaliações', page: 'exam', icon: PiExamLight },
  { name: 'Turmas', page: 'classes', icon: FiUsers },
  { name: 'Code Lab', page: 'code', icon: BsMotherboard },
  { name: 'Vision Lab', page: 'vision_lab', icon: TbCircuitResistor },

  { name: 'Estoque Maker', page: 'stock', icon: FiInbox },
  // { name: 'Loja', page: 'store', icon: FiShoppingBag },
  { name: 'Biblioteca', page: 'library', icon: FiFileText },
  { name: 'Comunidade', page: 'community', icon: FaRegSmile },
  { name: 'Suporte', page: 'appointments', icon: FiHeadphones },
  // { name: 'Eventos', page: 'events', icon: FiList, },
];
