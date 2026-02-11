import { Flex, Icon, Image, Spinner, Text, Tooltip, useColorMode, Box } from '@chakra-ui/react';
import NextImage from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { FiEdit2, FiChevronLeft, FiChevronRight } from 'react-icons/fi'; // Adicionado ícones de chevron
import { Uploader } from 'rsuite';
import { motion, Variants } from 'framer-motion';

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
    width: dimensions.navbar.width, // Usa a largura definida no global
    opacity: 1,
    transition: sidebarTransition,
  },
  collapsed: {
    width: '0px', // Colapsa totalmente
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
        setKanbanItemsDue(kanban.flatMap((e) => e.items.filter((k) => k.end_date && new Date(k.end_date).getTime() < Date.now() + ONE_WEEK)));
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

  // Cores dinâmicas para o botão de toggle
  const toggleBg = colorMode === 'light' ? 'white' : 'gray.700';
  const toggleBorder = colorMode === 'light' ? 'gray.200' : 'gray.600';
  const toggleColor = colorMode === 'light' ? 'gray.500' : 'gray.300';

  return (
    <Box position="relative" zIndex={100} display={{ base: `none`, lg: `block` }} pl={isSidebarOpen ? '0' : '1.5rem'}>
      <motion.nav
        initial={defaultOpened ? 'expanded' : 'collapsed'}
        animate={isSidebarOpen ? 'expanded' : 'collapsed'}
        variants={sidebarVariants}
        style={{
          height: '100%',
          margin: isSidebarOpen ? (typeof window !== 'undefined' && window.innerWidth > 1280 ? '1.5rem' : '1rem') : '1rem 0rem', // Ajusta margem para não ocupar espaço quando fechado
          position: 'relative',
          willChange: 'width, opacity',
        }}
      >
        <Flex
          direction="column"
          minW={{ base: `calc(${dimensions.navbar.width} - 3rem)`, xl: dimensions.navbar.width }}
          maxW={{ base: `calc(${dimensions.navbar.width} - 3rem)`, xl: dimensions.navbar.width }}
          gap={{ base: `0.6rem`, xl: '1rem' }}
          overflow="hidden" // Importante: esconde o conteúdo ao fechar
          userSelect="none"
          borderRadius="8px"
          h="fit-content"
        >
          <Flex direction="column" gap={{ base: '0.5rem', xl: '1rem' }}>
            {/* Informações */}
            <Flex direction="column">
              <Flex flex="1" bg="white" padding="1rem" gap="1rem" h="fit-content" borderRadius="8px">
                <Flex position="relative">
                  <Flex
                    title="Trocar foto de perfil"
                    borderRadius="50%"
                    bg="gray300"
                    w={{ base: `4rem`, xl: '5rem' }}
                    h={{ base: `4rem`, xl: '5rem' }}
                    overflow="hidden"
                    border="4px"
                    borderColor="white"
                    flexShrink={0}
                  >
                    <NextImage
                      loader={() => avatar}
                      src={avatar}
                      width={100}
                      height={100}
                      alt=""
                      style={{ opacity: isUpdating ? `0.4` : `1` }}
                      priority
                    />
                  </Flex>
                  {isUpdating && (
                    <Flex
                      borderRadius="50%"
                      position="absolute"
                      w={{ base: `4rem`, xl: '5rem' }}
                      h={{ base: `4rem`, xl: '5rem' }}
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
                        left="0"
                        cursor={'pointer'}
                        _hover={{ filter: `brightness(0.9)` }}
                        top="-0.5rem"
                        onClick={() => e.onClick(e)}
                      >
                        <FiEdit2 size="0.875rem" color="#98A2B3" />
                      </Flex>
                    )}
                  />
                </Flex>
                <Flex direction="column" flex="1" w="100%">
                  <Flex
                    fontSize={{ base: `16px`, xl: '18px' }}
                    fontWeight="600"
                    flex="1 0 0"
                    color="primary900"
                    justify="space-between"
                    align="center"
                  >
                    <Text isTruncated maxW="150px">
                      {formatShortName(user?.name || '', true)}
                    </Text>
                    <Flex
                      cursor="pointer"
                      transition="all 0.12s"
                      _hover={{ filter: 'brightness(0.7)' }}
                      onClick={() => router.push('/profile?opened=true')}
                    >
                      <FiEdit2 size="1rem" color="#98A2B3" />
                    </Flex>
                  </Flex>

                  <Flex
                    fontSize="12px"
                    color="gray600"
                    fontWeight="500"
                    marginTop="0.5rem"
                    maxH="8rem"
                    overflow="auto"
                    opacity={user?.hub_class?.display_name || school ? '1' : '0'}
                  >
                    {user?.role === `student` ? `${user.hub_class?.hub_school?.display_name}` : user.email}
                  </Flex>
                  <Flex
                    fontSize="13px"
                    color="gray600"
                    fontWeight="400"
                    marginTop="0.5rem"
                    maxH="8rem"
                    overflow="auto"
                    opacity={user?.hub_class?.display_name || school ? '1' : '0'}
                  >
                    {user?.role === `student`
                      ? `Turma: ${user.hub_class?.display_name} - ${formatClassGrade(user.hub_class?.grade)}`
                      : school?.display_name || '.'}
                  </Flex>
                  <Tooltip label="Recolher menu" placement="right" hasArrow>
                    <Flex
                      as={motion.div}
                      alignSelf="flex-end"
                      zIndex={101}
                      onClick={() => setIsSidebarOpen(false)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      cursor="pointer"
                      bg={toggleBg}
                      border="1px solid"
                      borderColor={toggleBorder}
                      borderRadius="4px"
                      width="24px"
                      height="24px"
                      align="center"
                      justify="center"
                      boxShadow="0px 2px 6px rgba(0,0,0,0.08)"
                      transition="all 0.2s"
                    >
                      <Icon as={FiChevronLeft} color={toggleColor} fontSize="18px" />
                    </Flex>
                  </Tooltip>
                </Flex>
              </Flex>
            </Flex>

            {/* Ranking */}
            {user?.role === 'student' && (
              <Flex display="column" gap="0.5rem" h="fit-content">
                <Flex
                  fontWeight="600"
                  p={{ base: '0.5rem', xl: '1rem 0.5rem' }}
                  gap="1.25rem"
                  color="white"
                  borderColor="primary600"
                  bg="primary400"
                  borderRadius="10px"
                  justify="center"
                  align="center"
                  w="100%"
                >
                  <>
                    <Flex align="center" justify="center" gap="0.45rem">
                      <Image src="/icons/coin.svg" />
                      <Text>{formatCoin(user.metadata.coins || 0)}</Text>
                    </Flex>
                  </>
                </Flex>
              </Flex>
            )}
          </Flex>

          {/* Menu */}
          <motion.div
            style={{
              display: `flex`,
              flex: `1`,
              padding: '1rem',
              flexDirection: 'column',
              gap: '0.5rem',
              overflow: 'hidden auto',
              alignItems: 'flex-end',
              background: colorMode === `light` ? `white` : `#101828`,
            }}
            animate={isOpen ? 'open' : 'closed'}
            variants={{
              open: {
                clipPath: 'inset(0% 0% 0% 0% round 10px)',
                transition: {
                  type: 'spring',
                  bounce: 0,
                  duration: 0.7,
                  delayChildren: 0.3,
                  staggerChildren: 0.05,
                },
              },
              closed: {
                opacity: 0,
                clipPath: 'inset(10% 50% 90% 50% round 10px)',
                transition: {
                  type: 'spring',
                  bounce: 0,
                  duration: 0.3,
                },
              },
            }}
          >
            {menuItems.map((item) => (
              <motion.div
                key={item.name}
                ref={item.ref as any}
                style={{ width: `100%`, flexDirection: `column`, fontWeight: `600`, position: `relative` }}
                variants={{
                  open: {
                    opacity: 1,
                    y: 0,
                    transition: { type: 'spring', stiffness: 300, damping: 24 },
                  },
                  closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
                }}
              >
                {item.page === `planner` && !!kanbanItemsDue.length && (
                  <Tooltip label="Atividades á vencer" placement="right-end">
                    <Flex w="0.75rem" h="0.75rem" borderRadius="50%" bg="redDot" position="absolute" top="3px" right="3px" />
                  </Tooltip>
                )}
                {item.page === `stock` && !!stockItems?.length && (
                  <Tooltip label="Itens com quantidade crítica" placement="right-end">
                    <Flex w="0.75rem" h="0.75rem" borderRadius="50%" bg="redDot" position="absolute" top="3px" right="3px" />
                  </Tooltip>
                )}
                <Flex
                  align="center"
                  padding="10px 18px"
                  transition="all 0.15s"
                  borderRadius="8px"
                  border={colorMode === 'dark' && page !== item.page ? `1px` : undefined}
                  borderColor="#4E5BA666"
                  fontSize={{ base: `14px`, xl: '15px' }}
                  cursor="pointer"
                  whiteSpace="nowrap"
                  _hover={{ outline: '1px solid #3356B7' }}
                  bg={page === item.page ? 'primary700' : colorMode === 'dark' ? `transparent` : 'primary50'}
                  color={
                    page === item.page && colorMode === 'dark'
                      ? 'primary25'
                      : page !== item.page && colorMode === 'dark'
                        ? 'primary25'
                        : page === item.page && colorMode === 'light'
                          ? 'primary25'
                          : 'primary800'
                  }
                  onClick={() => router.push(`/${item.page}`)}
                >
                  {item.icon && <Icon mr="3" fontSize="16" as={item.icon} />}
                  {item.name}
                </Flex>
              </motion.div>
            ))}
          </motion.div>

          {!!actions.length && (
            <Flex gap="1.25rem" justify="center" align="flex-end">
              {actions.map((action, i) => (
                <motion.a
                  key={action.type + i}
                  href={action.data.link}
                  target="_blank"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  style={{
                    display: `flex`,
                    flexDirection: `column`,
                    alignItems: `center`,
                    justifyContent: `center`,
                    background: colorMode === `light` ? `white` : `#101828`,
                    border: `1px solid ${colorMode === 'light' ? '#d9d5dd88' : '#272352'}`,
                    height: `3.25rem`,
                    minWidth: `4rem`,
                    color: colorMode === `light` ? `#1D2939` : `white`,
                    padding: `0.25rem`,
                    gap: `0.23rem`,
                    borderRadius: `8px`,
                    cursor: `pointer`,
                  }}
                >
                  <Icon fontSize="20" as={iconList[action.data.icon]} />
                  <Text lineHeight="1" noOfLines={1} textAlign="center" letterSpacing={0.5} fontWeight="500">
                    {action.data.label}
                  </Text>
                </motion.a>
              ))}
            </Flex>
          )}
        </Flex>
      </motion.nav>

      {/* Botão de Toggle Lateral - Posicionado fora do fluxo do nav mas visualmente atrelado */}
      <Tooltip label={'Expandir menu'} placement="right" hasArrow>
        <Flex
          display={isSidebarOpen ? 'none' : 'flex'}
          as={motion.div}
          position="absolute"
          right={'6px'}
          top="6.35rem" // Altura alinhada visualmente com a foto ou topo
          zIndex={101}
          onClick={() => setIsSidebarOpen(true)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          cursor="pointer"
          bg={toggleBg}
          border="1px solid"
          borderColor={toggleBorder}
          borderRadius="4px"
          width="24px"
          height={'36px'}
          align="center"
          justify="center"
          boxShadow="0px 2px 6px rgba(0,0,0,0.08)"
          transition="all 0.2s"
        >
          <Icon as={FiChevronRight} color={toggleColor} fontSize="18px" />
        </Flex>
      </Tooltip>
    </Box>
  );
};
