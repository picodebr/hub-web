import { Box, Flex, Icon } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { FaRegStar } from 'react-icons/fa';
import { FiCheckCircle, FiFileText, FiFolder, FiShoppingBag, FiUsers } from 'react-icons/fi';

import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { dimensions } from '@/styles/global';
import { IHubUser } from '@/_base/interfaces/user';

type MenuItemType = { name: string; page: string; icon: IconType; permission?: { scope: string; action: string } };

const menuItems: Array<MenuItemType> = [
  { name: 'Cursos', page: 'home', icon: FaRegStar },
  { name: 'Loja', page: 'store', icon: FiShoppingBag, permission: { scope: 'store', action: 'read' } },
  { name: 'Meus Planejamentos', page: 'planner', icon: FiFileText, permission: { scope: 'planner', action: 'read' } },
  { name: 'Meus Projetos (CODE)', page: 'code', icon: FiFolder, permission: { scope: 'code', action: 'read' } },
  { name: 'Meus Grupos', page: 'groups', icon: FiUsers, permission: { scope: 'groups', action: 'read' } },
  { name: 'Desafio Bônus', page: 'challenge', icon: FiCheckCircle, permission: { scope: 'challenge', action: 'read' } },
];

interface IProps {
  page: string;
  user?: IHubUser;
}

export const Navbar: React.FC<IProps> = ({ page }) => {
  const router = useCustomRouter();
  return (
    <Flex direction="column" bg="white" minW={dimensions.navbar.width} gap="0.5rem" overflow="hidden" h="auto" userSelect="none" borderRadius="10px">
      <Flex bg="primary900" h="102px" position="relative" borderRadius="10px" marginBottom="2rem">
        <Flex position="absolute" borderRadius="50%" bg="gray300" bottom="-2rem" w="6rem" h="6rem" left="50%" transform="translate(-50%, 0)"></Flex>
      </Flex>
      <Flex padding="0.5rem" direction="column" gap="0.5rem">
        {menuItems.map((item) => (
          <Flex key={item.name} w="100%" direction="column">
            <Flex
              align="center"
              padding="4"
              transition="all 0.15s"
              borderRadius="lg"
              cursor="pointer"
              _hover={{ outline: '1px solid white' }}
              bg={page === item.page ? 'primary50' : 'primary50'}
              color={page === item.page ? 'primary900' : 'primary900'}
              fontSize="1rem"
              onClick={() => router.push(`/${item.page}`)}
            >
              {item.icon && <Icon mr="3" fontSize="16" as={item.icon} />}
              {item.name}
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};
