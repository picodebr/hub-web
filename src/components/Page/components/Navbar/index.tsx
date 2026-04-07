import { Flex, Icon, Image, Spinner, Text, Tooltip, useColorMode, Box, Avatar, Divider } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { FiEdit2, FiChevronLeft, FiChevronRight, FiCamera } from 'react-icons/fi';
import { Uploader } from 'rsuite';
import { motion, Variants } from 'framer-motion';
import NextImage from 'next/image';

import { dimensions } from '@/styles/global';
import { formatClassGrade, formatCoin, formatShortName } from '@/_base/utils';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { updateProfile } from '@/_base/services/user';
import { useAvatar, useProfile } from '../../hooks';
import { IHubUser } from '@/_base/interfaces/user';
import { MenuItemType } from '../../interfaces';
import { iconList } from '@/_base/config/iconList';
import { useSelectedSchool } from '../Header';
import { CustomActions } from '@/_base/interfaces/customActions';
import { KanbanColumnData, KanbanItemType } from '@/components/Kanban/interfaces';
import { IStoreMakerSchool } from '@/_base/interfaces/storeMaker';
import { useRouter } from 'next/router';
import { IHubUserSchool } from '@/_base/interfaces/school';
import { create } from 'zustand';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

export interface INavbarProps {
  page: string;
  user?: IHubUser;
  menuItems: MenuItemType[];
  stockItems?: IStoreMakerSchool[];
  school: IHubUserSchool | null;
  defaultOpened?: boolean;
}

const sidebarTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

const sidebarVariants: Variants = {
  expanded: {
    width: dimensions.navbar.width,
    opacity: 1,
    transition: sidebarTransition,
  },
  collapsed: {
    width: '0px',
    opacity: 0,
    transition: {
      ...sidebarTransition,
      opacity: { duration: 0.2 },
    },
  },
};

type NavbarHookType = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (opened: boolean) => void;
};

export const useNavbar = create<NavbarHookType>((set) => ({
  isSidebarOpen: true,
  setIsSidebarOpen: (opened) => set(() => ({ isSidebarOpen: opened })),
}));

const MotionFlex = motion(Flex);

export const Navbar: React.FC<INavbarProps> = ({ page, user: _user, menuItems, stockItems, school, defaultOpened = true }) => {
  const router = useRouter();
  const { colorMode } = useColorMode();
  const { avatar, setAvatar } = useAvatar();
  const { user, setUser } = useProfile();
  const { customActions } = useSelectedSchool();
  const { isSidebarOpen, setIsSidebarOpen } = useNavbar();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [actions, setActions] = useState<CustomActions[]>([]);
  const [kanbanItemsDue, setKanbanItemsDue] = useState<KanbanItemType[]>([]);

  useEffect(() => {
    if (_user) setUser({ ...user, ..._user });
    setAvatar(_user?.avatar || user.avatar);

    try {
      const kanban: KanbanColumnData[] = JSON.parse(_user?.metadata?.kanban || user?.metadata?.kanban || `[]`);

      if (kanban?.length)
        setKanbanItemsDue(
          kanban.flatMap((e) =>
            e.items.filter((k) => k.column !== 'finished' && k.end_date && new Date(k.end_date).getTime() < Date.now() + ONE_WEEK),
          ),
        );
    } catch (err) {
      console.error(`Individual kanban parse error`, err);
    }
  }, [_user]);

  useEffect(() => {
    setActions(customActions);
  }, [_user, customActions]);

  useEffect(() => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 1000);
  }, [avatar]);

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

  useEffect(() => {
    setTimeout(() => {
      setIsOpen(true);
    }, 250);
  }, []);

  const toggleBg = 'white';
  const toggleBorder = 'gray200';
  const toggleColor = 'gray500';

  return (
    <Box position="relative" zIndex={100} display={{ base: `none`, lg: `block` }} pl={isSidebarOpen ? '0' : '1.5rem'} mb="3rem">
      <motion.nav
        initial={defaultOpened ? 'expanded' : 'collapsed'}
        animate={isSidebarOpen ? 'expanded' : 'collapsed'}
        variants={sidebarVariants}
        style={{
          height: '100%',
          position: 'relative',
          willChange: 'width, opacity',
          display: 'flex',
          flexDirection: 'column',
          margin: isSidebarOpen ? (typeof window !== 'undefined' && window.innerWidth > 1280 ? '1.5rem' : '1rem') : '1rem 0rem',
        }}
      >
        {isSidebarOpen ? (
          <Flex
            direction="column"
            minW={{ base: `calc(${dimensions.navbar.width} - 3rem)`, xl: dimensions.navbar.width }}
            maxW={{ base: `calc(${dimensions.navbar.width} - 3rem)`, xl: dimensions.navbar.width }}
            bg="white" // Fundo único para unificar a barra lateral
            borderRadius="16px"
            border="1px solid"
            borderColor="gray200"
            boxShadow="0px 4px 12px rgba(0,0,0,0.03)" // Sombra leve para destacar do fundo da página
            overflow="hidden"
            userSelect="none"
            h="100%"
          >
            {/* 1. SEÇÃO DE PERFIL */}
            <Flex direction="column" p="1.25rem" position="relative" gap="1rem" flexShrink={0}>
              {/* Botão de Fechar Menu */}
              <Tooltip label="Recolher menu" placement="right" hasArrow>
                <Flex
                  as={motion.div}
                  position="absolute"
                  top="1.25rem"
                  right="1.25rem"
                  zIndex={101}
                  onClick={() => setIsSidebarOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  cursor="pointer"
                  color="gray400"
                  _hover={{ color: 'primary500' }}
                  transition="all 0.2s"
                >
                  <Icon as={FiChevronLeft} fontSize="20px" />
                </Flex>
              </Tooltip>

              <Flex align="center" gap="1rem" w="100%" pr="1.5rem">
                {/* Avatar & Uploader */}
                <Flex position="relative">
                  <NextImage
                    loader={() => avatar}
                    src={avatar}
                    width={80}
                    height={80}
                    alt=""
                    style={{ opacity: isUpdating ? `0.4` : `1`, borderRadius: `50%` }}
                    priority
                  />
                  {isUpdating && (
                    <Flex borderRadius="50%" position="absolute" inset="0" align="center" justify="center">
                      <Spinner size="sm" color="primary500" />
                    </Flex>
                  )}
                  <Uploader
                    autoUpload={true}
                    accept={`img/*`}
                    draggable={false}
                    action=""
                    fileListVisible={false}
                    onChange={(e) => handleUploadAvatar(e[0]?.blobFile as File)}
                    toggleAs={(e) => (
                      <Flex
                        border="1px solid"
                        borderColor="gray200"
                        borderRadius="50%"
                        p="0.3rem"
                        bg="white"
                        position="absolute"
                        bottom="-2px"
                        right="-2px"
                        cursor="pointer"
                        boxShadow="sm"
                        transition="all 0.2s"
                        _hover={{ transform: 'scale(1.1)', color: 'primary500' }}
                        color="gray500"
                        onClick={() => e.onClick(e)}
                      >
                        <FiCamera size="0.75rem" />
                      </Flex>
                    )}
                  />
                </Flex>

                {/* Info do Usuário */}
                <Flex direction="column" flex="1" overflow="hidden" gap="2px">
                  <Flex align="center" gap="0.5rem">
                    <Text fontSize="16px" fontWeight="700" color="primary900" isTruncated>
                      {formatShortName(user?.name || '', true)}
                    </Text>
                    <Tooltip label="Editar Perfil" placement="top">
                      <Flex
                        cursor="pointer"
                        transition="all 0.2s"
                        color="gray400"
                        _hover={{ color: 'primary500' }}
                        onClick={() => router.push('/profile?opened=true')}
                      >
                        <FiEdit2 size="0.85rem" />
                      </Flex>
                    </Tooltip>
                  </Flex>

                  <Text fontSize="12px" color="gray500" fontWeight="500" isTruncated>
                    {user?.role === `student` ? `${user.hub_class?.hub_school?.display_name}` : user?.email}
                  </Text>

                  {user?.role === `student` && (
                    <Text fontSize="11px" color="gray400" fontWeight="400" isTruncated>
                      Turma: {user.hub_class?.display_name} - {formatClassGrade(user.hub_class?.grade)}
                    </Text>
                  )}

                  {/* Moedas integradas de forma limpa abaixo da classe */}
                  {user?.role === 'student' && (
                    <Flex
                      align="center"
                      gap="0.3rem"
                      mt="4px"
                      bg="warning50"
                      w="fit-content"
                      px="0.5rem"
                      py="0.1rem"
                      borderRadius="full"
                      border="1px solid"
                      borderColor="warning200"
                    >
                      <Image src="/icons/coin.svg" alt="Moedas" w="12px" h="12px" />
                      <Text fontSize="11px" fontWeight="700" color="warning700">
                        {formatCoin(user.metadata.coins || 0)}
                      </Text>
                    </Flex>
                  )}
                </Flex>
              </Flex>
            </Flex>

            <Divider borderColor="gray200" opacity={0.6} />

            {/* 2. MENU DE NAVEGAÇÃO */}
            <MotionFlex
              direction="column"
              flex="1"
              p="1rem 0.75rem"
              gap="0.25rem"
              overflowY="auto"
              overflowX="hidden"
              animate={isOpen ? 'open' : 'closed'}
              variants={{
                open: { transition: { type: 'spring', bounce: 0, duration: 0.6, delayChildren: 0.1, staggerChildren: 0.05 } },
                closed: { opacity: 0 },
              }}
              css={{
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#D0D5DD', borderRadius: '4px' },
              }}
            >
              {menuItems.map((item) => {
                const isActive = page === item.page;

                return (
                  <motion.div
                    key={item.name}
                    ref={item.ref as any}
                    style={{ width: `100%`, position: `relative`, flexShrink: 0 }}
                    variants={{
                      open: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
                      closed: { opacity: 0, y: 10, transition: { duration: 0.2 } },
                    }}
                  >
                    {item.page === `planner` && !!kanbanItemsDue.length && (
                      <Tooltip label="Atividades a vencer" placement="right-end">
                        <Flex
                          w="10px"
                          h="10px"
                          borderRadius="full"
                          bg="redDot"
                          border="2px solid"
                          borderColor="white"
                          position="absolute"
                          top="12px"
                          right="12px"
                          zIndex={2}
                        />
                      </Tooltip>
                    )}
                    {item.page === `stock` && !!stockItems?.length && (
                      <Tooltip label="Itens com quantidade crítica" placement="right-end">
                        <Flex
                          w="10px"
                          h="10px"
                          borderRadius="full"
                          bg="redDot"
                          border="2px solid"
                          borderColor="white"
                          position="absolute"
                          top="12px"
                          right="12px"
                          zIndex={2}
                        />
                      </Tooltip>
                    )}

                    <Flex
                      align="center"
                      padding="10px 14px"
                      borderRadius="10px"
                      cursor="pointer"
                      whiteSpace="nowrap"
                      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                      fontSize="14px"
                      fontWeight={isActive ? '700' : '500'}
                      bg={isActive ? 'primary700' : 'transparent'}
                      color={isActive ? 'primary25' : 'gray600'}
                      _hover={{
                        bg: isActive ? 'primary700' : 'primary50',
                        transform: isActive ? 'none' : 'translateX(4px)',
                        color: isActive ? 'primary25' : 'primary700',
                      }}
                      onClick={() => router.push(`/${item.page}`)}
                    >
                      <Icon mr="3" fontSize="18px" as={item.icon} opacity={isActive ? 1 : 0.7} />
                      {item.name}
                    </Flex>
                  </motion.div>
                );
              })}
            </MotionFlex>

            {/* 3. AÇÕES CUSTOMIZADAS (WIDGETS INFERIORES) */}
            {!!actions.length && (
              <>
                <Divider borderColor="gray200" opacity={0.6} />
                <Flex p="1rem" gap="0.75rem" justify="space-between" align="center" wrap="wrap" flexShrink={0}>
                  {actions.map((action, i) => (
                    <motion.a
                      key={action.type + i}
                      href={action.data.link}
                      target="_blank"
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      style={{
                        display: `flex`,
                        flexDirection: `column`,
                        alignItems: `center`,
                        justifyContent: `center`,
                        flex: 1,
                        border: `1px solid`,
                        borderColor: `#EAECF0`, // gray200
                        height: `4.5rem`,
                        minWidth: `4rem`,
                        padding: `0.5rem`,
                        gap: `0.3rem`,
                        borderRadius: `12px`,
                        cursor: `pointer`,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        background: '#F9FAFB', // gray50 para destacar suavemente na barra branca
                      }}
                    >
                      <Icon fontSize="22px" as={iconList[action.data.icon]} color="primary700" />
                      <Text fontSize="11px" lineHeight="1" noOfLines={1} textAlign="center" fontWeight="600" color="text" mt="1">
                        {action.data.label}
                      </Text>
                    </motion.a>
                  ))}
                </Flex>
              </>
            )}
          </Flex>
        ) : null}
      </motion.nav>

      {/* Botão de Expandir Lateral (Quando Colapsado) */}
      <Tooltip label={'Expandir menu'} placement="right" hasArrow>
        <Flex
          display={isSidebarOpen ? 'none' : 'flex'}
          as={motion.div}
          position="absolute"
          right={'12px'}
          top="2.5rem"
          zIndex={101}
          onClick={() => setIsSidebarOpen(true)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          cursor="pointer"
          bg={toggleBg}
          border="1px solid"
          borderColor={toggleBorder}
          borderRadius="full"
          width="36px"
          height={'36px'}
          align="center"
          justify="center"
          boxShadow="md"
          transition="all 0.2s"
        >
          <Icon as={FiChevronRight} color={toggleColor} fontSize="20px" />
        </Flex>
      </Tooltip>
    </Box>
  );
};
