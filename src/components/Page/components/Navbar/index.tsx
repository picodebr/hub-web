import { Flex, Icon, Image, Spinner, Text, useColorMode } from '@chakra-ui/react';
import NextImage from 'next/image';
import { FiCheckCircle, FiEdit2, FiFileText, FiHeadphones, FiList, FiShoppingBag, FiUsers } from 'react-icons/fi';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaRegSmile, FaRegStar } from 'react-icons/fa';
import { RiHome2Line } from 'react-icons/ri';
import { Tour, TourProps } from 'antd';

import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { dimensions } from '@/styles/global';
import { formatShortName } from '@/_base/utils';
import { INavbarProps, MenuItemType } from './interfaces';
import { GenericButton } from '@/components/Buttons/Generic';
import { Uploader } from 'rsuite';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { updateProfile } from '@/_base/services/user';

import { useAvatar, useProfile } from './hooks';
import { BsMotherboard } from 'react-icons/bs';
import { GiCardboardBox } from 'react-icons/gi';

export const Navbar: React.FC<INavbarProps> = ({ page, user: _user, isOpen, stopTour }) => {
  const router = useCustomRouter();
  const { colorMode } = useColorMode();
  const { avatar, setAvatar } = useAvatar();
  const { user, setUser } = useProfile();

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (_user) setUser({ ...user, ..._user });
    setAvatar(_user?.avatar || user.avatar);
  }, [_user]);

  const studentMenuItems: Array<MenuItemType> = [
    {
      name: 'Home',
      page: 'profile',
      icon: RiHome2Line,
      ref: useRef(),
      tourDescription: `Nesta seção, é possível editar suas preferências, visualizar seus certificados e visulizar suas últimas interações na plataforma.`,
    },
    { name: 'Cursos', page: 'courses', icon: FaRegStar, ref: useRef(), tourDescription: `Clique aqui para  ver mais informações sobre` },
    { name: 'Loja', page: 'store', icon: FiShoppingBag, ref: useRef(), tourDescription: `Clique aqui para  ver mais informações sobre` },
    { name: 'Biblioteca', page: 'library', icon: FiFileText, ref: useRef(), tourDescription: `Aqui é onde fica todo o material gráfico da PiCode.` },
    { name: 'Meus Planejamentos', page: 'planner', icon: FiFileText, ref: useRef(), tourDescription: `Clique aqui para  ver mais informações sobre` },
    { name: 'Meus Projetos', page: 'code', icon: BsMotherboard, ref: useRef(), tourDescription: `Clique aqui para  ver mais informações sobre` },
    { name: 'Meus Grupos', page: 'groups', icon: FiUsers, ref: useRef(), tourDescription: `Clique aqui para  ver mais informações sobre` },
    { name: 'Desafio Bônus', page: 'challenge', icon: FiCheckCircle, ref: useRef(), tourDescription: `Clique aqui para  ver mais informações sobre` },
  ];

  const teacherMenuItems: Array<MenuItemType> = [
    {
      name: 'Home',
      page: 'profile',
      icon: RiHome2Line,
      ref: useRef(),
      tourDescription: `Nesta seção, é possível editar suas preferências, visualizar seus certificados e visulizar suas últimas interações na plataforma.`,
    },
    {
      name: 'Cursos',
      page: 'courses',
      icon: FaRegStar,
      ref: useRef(),
      tourDescription: `Aqui é onde fica todo o conteúdo de aprendizagem e capacitação Maker.`,
    },
    { name: 'Turmas', page: 'classes', icon: FiUsers, ref: useRef(), tourDescription: `Clique aqui para ver visualizar ou adicionar uma turma.` },
    { name: 'Meus Projetos', page: 'code', icon: BsMotherboard, ref: useRef(), tourDescription: `Clique aqui para  ver mais informações sobre` },
    { name: 'Estoque', page: 'stock', icon: GiCardboardBox, ref: useRef(), tourDescription: `Clique aqui para  ver mais informações sobre` },
    {
      name: 'Loja',
      page: 'store',
      icon: FiShoppingBag,
      ref: useRef(),
      tourDescription: `Nossa loja onde é possível adquirir produtos exclusivos da PiCode!`,
    },
    { name: 'Biblioteca', page: 'library', icon: FiFileText, ref: useRef(), tourDescription: `Aqui é onde fica todo o material gráfico da PiCode.` },
    {
      name: 'Comunidade',
      page: 'community',
      icon: FaRegSmile,
      ref: useRef(),

      tourDescription: `Nossa comunidade exclusiva para alunos e professores Maker`,
    },
    {
      name: 'Suporte',
      page: 'reports',
      icon: FiHeadphones,
      ref: useRef(),
      tourDescription: `Tem alguma dúvida ou sugestão? Nosso suporte sempre estará disponível para te ajudar.`,
    },
    { name: 'Eventos', page: 'events', icon: FiList, ref: useRef(), tourDescription: `Clique aqui para ver mais informações sobre nossos eventos.` },
  ];

  const menuItems = user?.role === 'student' ? studentMenuItems : teacherMenuItems;

  const headerTourSteps: TourProps['steps'] = menuItems.map((e) => ({
    title: e.name,
    description: e.tourDescription,
    target: () => e.ref?.current as any,
    nextButtonProps: {
      children: <GenericButton label="Próximo" size="sm" w="100%" />,
      style: {
        background: `transparent`,
        color: `#fff !important`,
        border: `none`,
        transition: `all 0`,
        width: `fit-content`,
        height: `fit-content`,
        padding: `0`,
      },
    },
    prevButtonProps: {
      children: <GenericButton label="Anterior" size="sm" btntype="outline" />,
      style: {
        background: `transparent`,
        color: `#fff !important`,
        border: `none`,
        transition: `all 0`,
        width: `fit-content`,
        height: `fit-content`,
        padding: `0`,
      },
    },
  }));

  const handleUploadAvatar = useCallback(async (file?: File) => {
    if (file) {
      setIsUpdating(true);
      const response = await getPresignedUrl(file.type, 'avatars');
      await uploadFile(response.link, file);

      setTimeout(async () => {
        const updatedUser = await updateProfile({ avatar: response.path });
        setAvatar(updatedUser.avatar || ``);
        setIsUpdating(false);
      }, 1000);
    }
  }, []);

  return (
    <Flex
      direction="column"
      bg="white"
      minW={dimensions.navbar.width}
      maxW={dimensions.navbar.width}
      gap="1rem"
      overflow="hidden"
      userSelect="none"
      borderRadius="10px"
      border="1px"
      borderColor="gray300"
      margin="1.5rem"
    >
      <Flex direction="column" gap="1rem">
        <Flex bg={colorMode === 'light' ? 'primary900' : 'primary400'} h="102px" position="relative" borderRadius="10px" minH="102px">
          <Flex
            title="Trocar foto de perfil"
            position="absolute"
            borderRadius="50%"
            bg="gray300"
            bottom="-2rem"
            w="6rem"
            h="6rem"
            left="50%"
            transform="translate(-50%, 0)"
            boxShadow=" 0px 4px 6px -2px"
            overflow="hidden"
            border="4px"
            borderColor="white"
          >
            <NextImage loader={() => avatar} src={avatar} width={100} height={100} alt="" style={{ opacity: isUpdating ? `0.4` : `1` }} />
          </Flex>
          {isUpdating && (
            <Flex
              position="absolute"
              borderRadius="50%"
              bottom="-2rem"
              w="6rem"
              h="6rem"
              left="50%"
              transform="translate(-50%, 0)"
              align="center"
              justify="center"
            >
              <Spinner size="xl" />
            </Flex>
          )}
          <Uploader
            autoUpload={true}
            accept={`img/*`}
            draggable={false}
            action=""
            fileListVisible={false}
            onChange={(e) => {
              handleUploadAvatar(e[0]?.blobFile as File);
            }}
            toggleAs={(e) => (
              <Flex
                border="1px"
                borderColor="gray300"
                borderRadius="50%"
                p="0.25rem"
                bg="white"
                position="absolute"
                left="calc(50% + 2.5rem)"
                transform="translate(-50%, 0)"
                cursor={'pointer'}
                _hover={{ filter: `brightness(0.9)` }}
                bottom="-1.5rem"
                onClick={() => e.onClick(e)}
              >
                <FiEdit2 size="1rem" color="#98A2B3" />
              </Flex>
            )}
          />
        </Flex>

        {/* Informações */}
        <Flex bg="white" display="column" padding="0 2.5rem" gap="0.5rem" h="fit-content" mt="1.5rem">
          <Flex fontSize="18px" fontWeight="600" flex="1 0 0" color="primary900" justify="space-between" align="center">
            {formatShortName(user?.name || '', true)}
            <Flex cursor="pointer" transition="all 0.12s" _hover={{ filter: 'brightness(0.7)' }} onClick={() => router.push('/profile?opened=true')}>
              <FiEdit2 size="1rem" color="#98A2B3" />
            </Flex>
          </Flex>
          <Flex fontSize="12px" fontWeight="400" color="gray400" h="18px" display="column">
            {user?.email}
          </Flex>
          <Flex fontSize="13px" color="gray600" fontWeight="400" marginTop="0.5rem" maxH="8rem" overflow="auto" opacity={user?.bio ? '1' : '0.5'}>
            {user?.bio || '.'}
          </Flex>
        </Flex>

        {/* Ranking */}
        <Flex bg="white" display="column" padding="0 2.5rem" gap="0.5rem" h="fit-content">
          {/* <Flex align="center" justify="space-between" gap="0.5rem" fontWeight="400" color="gray400">
            <Text w="fit-content">0</Text>
            <Text w="fit-content">5</Text>
          </Flex>
          <Progress value={0} rounded={8} flex="1" min={0} max={5} /> */}
          <Flex fontWeight="600" color="white" borderColor="primary600" bg="primary400" justify="center" borderRadius="10px" w="100%">
            {user?.role === 'student' ? (
              <>
                <Flex align="center" justify="center" padding="1rem 0.5rem">
                  <Image src="/icons/coin.svg" />
                  <Text marginLeft="6px">0</Text>
                </Flex>
                <Flex align="center" justify="center" padding="1rem 0.5rem" onClick={() => router.push('/ranking')}>
                  <Image src="/icons/medal.svg" />
                  <Text marginLeft="6px">#0</Text>
                </Flex>
                <Flex align="center" justify="center" padding="1rem 0.5rem">
                  <Image src="/icons/cash.svg" />
                  <Text marginLeft="6px">0</Text>
                </Flex>
              </>
            ) : (
              <>
                <Flex align="center" justify="center" padding="1rem 0.5rem">
                  <Image src="/icons/coin.svg" />
                  <Text marginLeft="6px">0</Text>
                </Flex>
                <Flex cursor="pointer" align="center" justify="center" padding="1rem 0.5rem" onClick={() => router.push('/store')}>
                  <Image src="/icons/cash.svg" />
                  <Text marginLeft="6px">0</Text>
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
          <Flex key={item.name} ref={item.ref as any} w="100%" direction="column" fontWeight="600">
            <Flex
              align="center"
              padding="10px 18px"
              transition="all 0.15s"
              borderRadius="lg"
              cursor="pointer"
              _hover={{ outline: '1px solid #3356B7' }}
              bg={page === item.page ? 'primary50' : 'primary50'}
              color={page === item.page ? 'primary900' : 'primary700'}
              onClick={() => router.push(`/${item.page}`)}
            >
              {item.icon && <Icon mr="3" fontSize="16" as={item.icon} />}
              {item.name}
            </Flex>
          </Flex>
        ))}
      </Flex>

      <Tour open={isOpen} onClose={() => stopTour()} steps={headerTourSteps} />
    </Flex>
  );
};
