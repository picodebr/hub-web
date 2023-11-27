import { Flex, Icon } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { FaChartLine, FaHome, FaUsers } from 'react-icons/fa';
import { FaImages } from 'react-icons/fa6';
import { IoMegaphone } from 'react-icons/io5';
import { MdHomeWork } from 'react-icons/md';

import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { dimensions } from '@/styles/global';
import { IHubUser } from '@/_base/interfaces/user';

type MenuItemType = { name: string; page: string; icon: IconType; permission?: { scope: string; action: string } };

const menuItems: Array<MenuItemType> = [
  { name: 'Cursos', page: 'home', icon: FaHome },
  { name: 'Loja', page: 'store', icon: FaChartLine, permission: { scope: 'store', action: 'read' } },
  { name: 'Meus Planejamentos', page: 'planner', icon: FaImages, permission: { scope: 'planner', action: 'read' } },
  { name: 'Meus Projetos (CODE)', page: 'code', icon: MdHomeWork, permission: { scope: 'code', action: 'read' } },
  { name: 'Meus Grupos', page: 'groups', icon: IoMegaphone, permission: { scope: 'groups', action: 'read' } },
  { name: 'Desafio Bônus', page: 'challenge', icon: FaUsers, permission: { scope: 'challenge', action: 'read' } },
];

interface IProps {
  page: string;
  user?: IHubUser;
}

export const Navbar: React.FC<IProps> = ({ page }) => {
  const router = useCustomRouter();
  return (
    <Flex
      direction="column"
      bg="white"
      borderRadius="md"
      minW={dimensions.navbar.width}
      padding="0.5rem"
      gap="0.5rem"
      overflow="hidden"
      margin="auto"
      h="100%"
      userSelect="none"
    >
      {menuItems.map((item) => (
        <Flex key={item.name} w="100%" direction="column">
          <Flex
            align="center"
            padding="4"
            transition="all 0.15s"
            borderRadius="lg"
            cursor="pointer"
            _hover={{ outline: '1px solid white' }}
            bg={page === item.page ? 'white' : 'primary900'}
            color={page === item.page ? 'primary900' : 'white'}
            fontSize="1rem"
            onClick={() => router.push(`/${item.page}`)}
          >
            {item.icon && <Icon mr="3" fontSize="16" as={item.icon} />}
            {item.name}
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
};
