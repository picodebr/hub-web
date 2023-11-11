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
  { name: 'Loja', page: 'campaigns', icon: FaChartLine, permission: { scope: 'campaign', action: 'read' } },
  { name: 'Meus Planejamentos', page: 'publishers', icon: FaImages, permission: { scope: 'publisher', action: 'read' } },
  { name: 'Meus Projetos (CODE)', page: 'agencies', icon: MdHomeWork, permission: { scope: 'agency', action: 'read' } },
  { name: 'Meus Grupos', page: 'advertisers', icon: IoMegaphone, permission: { scope: 'advertiser', action: 'read' } },
  { name: 'Desafio Bônus', page: 'users', icon: FaUsers, permission: { scope: 'admin', action: 'read' } },
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
      bg="primary"
      borderRadius="md"
      minW={dimensions.navbar.width}
      padding="0.5rem"
      gap="0.5rem"
      overflow="hidden"
      margin="auto"
      h="100%"
      userSelect="none"
    >
      {menuItems
        .map((item) => (
          <Flex key={item.name} w="100%" direction="column" >
            <Flex
              align="center"
              padding="4"
              transition="all 0.15s"
              borderRadius="lg"
              cursor="pointer"
              _hover={{ outline: '1px solid white' }}
              bg={page === item.page ? 'white' : 'primary'}
              color={page === item.page ? 'primary' : 'white'}
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
