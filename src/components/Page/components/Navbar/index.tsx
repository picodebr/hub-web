import { IconType } from 'react-icons';
import { FaRegStar } from 'react-icons/fa';
import { FiCheckCircle, FiEdit2, FiFileText, FiFolder, FiShoppingBag, FiUsers } from 'react-icons/fi';
import { RiCopperCoinFill } from 'react-icons/ri';

import { Box, Flex, Icon, Progress, Text } from '@chakra-ui/react';
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
        <Flex
          position="absolute"
          borderRadius="50%"
          bg="gray300"
          bottom="-2rem"
          w="6rem"
          h="6rem"
          left="50%"
          boxShadow=" 0px 4px 6px -2px"
          transform="translate(-50%, 0)"
        ></Flex>
      </Flex>
      {/* Informações */}
      <Flex bg="white" display="column" padding="0.5rem 2.5rem 2.5rem" gap="0.5rem" h="fit-content">
        <Flex fontSize="18px" fontWeight="600" flex="1 0 0" color="primary900" justify="space-between" align="center">
          Anderson Felix
          <FiEdit2 size="1rem" color="gray400" />
        </Flex>
        <Flex fontSize="12px" fontWeight="400" color="gray400" h="18px" display="column">
          anderson-felix@picode.com
        </Flex>
        <Flex fontSize="1rem" color="gray600" font-weight="400" marginTop="0.5rem">
          Entusiasta da tecnologia em busca de conhecimento e inovação. Apaixonado por música, viagens e aprendizado contínuo.
        </Flex>
      </Flex>
      {/* Ranking */}
      <Flex bg="white" display="column" padding="0.5rem 2.5rem 2.5rem" gap="0.5rem" h="fit-content">
        <Flex align="center" justify="space-between" gap="0.5rem">
          <Text w="fit-content">0</Text>
          <Text w="fit-content">5</Text>
        </Flex>
        <Progress value={2} rounded={8} flex="1" min={0} max={5} />
        <Flex marginTop="2.5rem" border="1px" color="primary900" bg="primary50" justify="space-between" borderRadius="10px" w="100%" h="60px">
          <Flex>
            <RiCopperCoinFill />
            <Text></Text>
          </Flex>
        </Flex>
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
