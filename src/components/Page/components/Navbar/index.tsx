import { IconType } from 'react-icons';
import { FaRegSmile, FaRegStar } from 'react-icons/fa';
import { FiCheckCircle, FiEdit2, FiFileText, FiFolder, FiHeadphones, FiList, FiShoppingBag, FiUsers } from 'react-icons/fi';
import { RiHome2Line } from 'react-icons/ri';

import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { dimensions } from '@/styles/global';
import { IHubUser } from '@/_base/interfaces/user';
import { formatShortName } from '@/_base/utils';
import { Flex, Icon, Image, Img, Progress, Text, useColorMode } from '@chakra-ui/react';

type MenuItemType = { name: string; page: string; icon: IconType };

interface IProps {
  page: string;
  user?: IHubUser;
}

export const Navbar: React.FC<IProps> = ({ page, user }) => {
  const { colorMode } = useColorMode();
  const router = useCustomRouter();

  const menuItems = user?.role === 'student' ? studentMenuItems : teacherMenuItems;

  return (
    <Flex
      direction="column"
      bg="white"
      minW={dimensions.navbar.width}
      maxW={dimensions.navbar.width}
      gap="2rem"
      overflow="hidden"
      h="100%"
      userSelect="none"
      borderRadius="10px"
      border="1px"
      borderColor="gray300"
      justify="space-between"
    >
      <Flex direction="column" gap="2rem">
        <Flex bg={colorMode === 'light' ? 'primary900' : 'primary400'} h="102px" position="relative" borderRadius="10px" minH="102px">
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
            overflow="hidden"
            border="4px"
            borderColor="white"
          >
            <Img src={user?.avatar || '/avatars/default.jpeg'} w="100%" h="100%" />
          </Flex>
        </Flex>

        {/* Informações */}
        <Flex bg="white" display="column" padding="0 2.5rem" gap="0.5rem" h="fit-content" mt="0.65rem">
          <Flex fontSize="18px" fontWeight="600" flex="1 0 0" color="primary900" justify="space-between" align="center">
            {formatShortName(user?.name || '', true)}
            <Flex cursor="pointer" transition="all 0.12s" _hover={{ filter: 'brightness(0.7)' }} onClick={() => router.push('/profile?opened=true')}>
              <FiEdit2 size="1rem" color="#98A2B3" />
            </Flex>
          </Flex>
          <Flex fontSize="12px" fontWeight="400" color="gray400" h="18px" display="column">
            {user?.email}
          </Flex>
          <Flex fontSize="1rem" color="gray600" fontWeight="400" marginTop="0.5rem" maxH="8rem" overflow="auto" opacity={user?.bio ? '1' : '0.5'}>
            {user?.bio || '.'}
          </Flex>
        </Flex>

        {/* Ranking */}
        <Flex bg="white" display="column" padding="0 2.5rem" gap="0.5rem" h="fit-content">
          <Flex align="center" justify="space-between" gap="0.5rem" fontWeight="400" color="gray400">
            <Text w="fit-content">0</Text>
            <Text w="fit-content">5</Text>
          </Flex>
          <Progress value={2} rounded={8} flex="1" min={0} max={5} />
          <Flex
            fontWeight="600"
            marginTop="2.5rem"
            color="white"
            borderColor="primary600"
            bg="primary400"
            justify="center"
            borderRadius="10px"
            w="100%"
          >
            {user?.role === 'student' ? (
              <>
                <Flex align="center" justify="center" padding="1rem 0.5rem">
                  <Image src="/icons/coin.svg" />
                  <Text marginLeft="6px">28</Text>
                </Flex>
                <Flex align="center" justify="center" padding="1rem 0.5rem">
                  <Image src="/icons/medal.svg" />
                  <Text marginLeft="6px">#17</Text>
                </Flex>
                <Flex align="center" justify="center" padding="1rem 0.5rem">
                  <Image src="/icons/cash.svg" />
                  <Text marginLeft="6px">48</Text>
                </Flex>
              </>
            ) : (
              <>
                <Flex align="center" justify="center" padding="1rem 0.5rem">
                  <Image src="/icons/coin.svg" />
                  <Text marginLeft="6px">28</Text>
                </Flex>
                <Flex cursor="pointer" align="center" justify="center" padding="1rem 0.5rem" onClick={() => router.push('/store')}>
                  <Image src="/icons/cash.svg" />
                  <Text marginLeft="6px">48</Text>
                </Flex>
              </>
            )}
          </Flex>
        </Flex>
      </Flex>

      {/* Menu */}
      <Flex
        margin="0 1.25rem 0 0"
        padding="0.5rem 1.25rem 0.5rem 2.5rem "
        direction="column"
        gap="0.5rem"
        overflow="hidden auto"
        align="flex-end"
        mb="2rem"
      >
        {menuItems.map((item) => (
          <Flex key={item.name} w="100%" direction="column" fontWeight="600">
            <Flex
              align="center"
              padding="10px 18px"
              transition="all 0.15s"
              borderRadius="lg"
              cursor="pointer"
              _hover={{ outline: '1px solid #3356B7' }}
              bg={page === item.page ? 'primary50' : 'primary50'}
              color={page === item.page ? 'primary900' : 'primary700'}
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

const studentMenuItems: Array<MenuItemType> = [
  { name: 'Home', page: 'profile', icon: RiHome2Line },
  { name: 'Cursos', page: 'courses', icon: FaRegStar },
  { name: 'Loja', page: 'store', icon: FiShoppingBag },
  { name: 'Meus Planejamentos', page: 'planner', icon: FiFileText },
  { name: 'Meus Projetos', page: 'code', icon: FiFolder },
  { name: 'Meus Grupos', page: 'groups', icon: FiUsers },
  { name: 'Desafio Bônus', page: 'challenge', icon: FiCheckCircle },
];

const teacherMenuItems: Array<MenuItemType> = [
  { name: 'Home', page: 'profile', icon: RiHome2Line },
  { name: 'Cursos', page: 'courses', icon: FaRegStar },
  { name: 'Turmas', page: 'classes', icon: FiUsers },
  { name: 'Loja', page: 'store', icon: FiShoppingBag },
  { name: 'Biblioteca', page: 'library', icon: FiFileText },
  { name: 'Comunidade', page: 'community', icon: FaRegSmile },
  { name: 'Suporte', page: 'support', icon: FiHeadphones },
  { name: 'Eventos', page: 'events', icon: FiList },
];
