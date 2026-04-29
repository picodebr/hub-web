import { Flex, Image, ScaleFade, Text, Tooltip, useColorMode, Divider, Box, Icon, Button } from '@chakra-ui/react';
import { SelectPicker } from 'rsuite';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/router';

import { IHubUser } from '@/_base/interfaces/user';
import { Logo } from '@/components/Logo';
import { dimensions } from '@/styles/global';
import { IHubSchool, IHubSchoolGroup, IHubUserSchool } from '@/_base/interfaces/school';
import { MenuItemType } from '../../interfaces';
import { MobileMenu } from '../MobileMenu';
import { CustomActions } from '@/_base/interfaces/customActions';
import { getNotifications, markNotificationAsRead } from '@/_base/services/notifications';
import { IHubNotification } from '@/_base/interfaces/notification';
import NotificationMenu from '@/components/Tailwind/Notifications/NotificationMenu';
import { readAllNotifications } from '@/_base/services/notifications/readAllNotifications';
import { deleteAllNotifications } from '@/_base/services/notifications/deleteAllNotifications';
import { KanbanItemType } from '@/components/Kanban/interfaces';
import { IStoreMakerSchool } from '@/_base/interfaces/storeMaker';
import { listSchoolGroups } from '@/_base/services/school';
import { OptionType } from '@/components/Inputs/interfaces';
import { updateChosenSchool } from '@/_base/services/user';
import { useNavbar } from '../Navbar';
import { HiMenu } from 'react-icons/hi';

interface IProps {
  user?: IHubUser;
  headerLabel?: string;
  menuItems: MenuItemType[];
  page: string;
  hideOnMobile?: boolean;
  setStockItems?: Dispatch<SetStateAction<IStoreMakerSchool[]>>;
  onUpdateSchool: (school: IHubUserSchool) => void;
  onUpdateUser: (user: IHubUser) => void;
}

type TargetSchoolHookType = {
  school: IHubUserSchool | null;
  customActions: CustomActions[];
  setSchool: (school: IHubUserSchool) => void;
  setCustomActions: (customActions: CustomActions[]) => void;
};

export const useSelectedSchool = create<TargetSchoolHookType>((set) => ({
  school: null,
  customActions: [],
  setSchool: (data: IHubUserSchool) => set(() => ({ school: data })),
  setCustomActions: (data: CustomActions[]) => set(() => ({ customActions: data })),
}));

export const Header: React.FC<IProps> = ({
  user: _user,
  headerLabel,
  menuItems,
  page,
  hideOnMobile,
  setStockItems: _setStockItems,
  onUpdateSchool,
  onUpdateUser,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<OptionType | null>(null);
  const [user, setUser] = useState<IHubUser | undefined>(_user);
  const [schools, setSchools] = useState<IHubUserSchool[]>(_user?.schools || []);

  const [notifications, setNotifications] = useState<IHubNotification[]>([]);
  const [stockItems, setStockItems] = useState<IStoreMakerSchool[]>([]);
  const [schoolGroups, setSchoolGroups] = useState<IHubSchoolGroup[]>([]);
  const [selectedSchoolGroup, setSelectedSchoolGroup] = useState<OptionType | null>(null);

  const router = useRouter();
  const { colorMode } = useColorMode();
  const { setSchool, school, setCustomActions } = useSelectedSchool();
  const { setIsSidebarOpen, isSidebarOpen } = useNavbar();

  const schoolList = useMemo(() => schools.map((item) => ({ label: item.display_name, value: item.hub_school_id })) || [], [schools]);
  const schoolGroupList = useMemo(() => schoolGroups.map((item) => ({ label: item.display_name, value: item.id })), [schoolGroups]);

  // CORREÇÃO DO BUG: Sincroniza a prop _user com o estado local ao navegar entre as páginas
  useEffect(() => {
    if (_user) {
      setUser(_user);
      if (_user.role !== 'master') {
        setSchools(_user.schools || []);
      }
    }
  }, [_user]);

  const updateSchoolChoice = useCallback(async (school_id: string) => {
    setIsLoading(true);
    try {
      const updatedUser = await updateChosenSchool(school_id);
      setUser(updatedUser);
    } finally {
      router.push(`/profile`);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, []);

  // Set schools and school groups for master users
  useEffect(() => {
    if (user?.role !== `master` || schoolGroups.length) return;
    listSchoolGroups().then((res) => {
      setSchoolGroups(res);
      const chosenGroup = res.find((e) => e.id === user.metadata.chosen_school_group_id);
      if (chosenGroup) {
        setSelectedSchoolGroup({ label: chosenGroup.display_name, value: chosenGroup.id });
        setSchools(chosenGroup.schools.map((s) => ({ ...s, hub_school_id: s.id, approved_at: new Date() })) || []);
        const targetSchool = chosenGroup.schools.find((s) => s.id === user.chosen_school_id);
        if (targetSchool) {
          setSelectedSchool({ label: targetSchool.display_name, value: targetSchool.id });
          setSchool({ ...targetSchool, hub_school_id: targetSchool.id, approved_at: new Date() });
        }
      }
    });
  }, [user, schoolGroups]);

  // Set selected school based on user choice (for teachers only)
  useEffect(() => {
    if (user?.role !== `teacher`) return;
    const schoolID = user?.chosen_school_id;
    const userSchools = user?.schools || [];
    if (!schoolID || !userSchools.length) return;

    const targetSchool = userSchools.find((e) => e.hub_school_id === schoolID);
    if (!targetSchool) return;

    setSelectedSchool({ label: targetSchool.display_name, value: targetSchool.hub_school_id });
    setSchool(targetSchool);
    onUpdateSchool(targetSchool);
    setSchools(userSchools);
  }, [user]);

  useEffect(() => {
    if (!selectedSchool) return;
    getNotifications(selectedSchool.value).then((res) => {
      const filteredNotifications = res.notifications.results.reduce((acc, e) => {
        const target = acc.find((x) => x.target_id === e.target_id);
        if (target) target.opened_by.push(...e.opened_by);
        else acc.push(e);
        return acc;
      }, [] as IHubNotification[]);
      setNotifications(filteredNotifications);
      setStockItems(res.stocks);
      _setStockItems?.(res.stocks);
    });
  }, [selectedSchool]);

  useEffect(() => {
    if (!user || !schools.length || !selectedSchool) return;

    const targetSchool = schools.find((e) => e.hub_school_id === selectedSchool.value);

    if (user?.role !== `student`) {
      setCustomActions(
        targetSchool?.hub_school_group?.metadata?.custom_actions?.filter(
          (action) => !action.school_id || action.school_id === targetSchool.hub_school_id,
        ) || [],
      );
    } else {
      setCustomActions([]);
    }
  }, [user, schools, selectedSchool]);

  const onSchoolChange = (schoolID: string) => {
    const targetSchool = schools.find((e) => e.hub_school_id === schoolID);
    if (targetSchool) {
      onUpdateSchool(targetSchool);
      updateSchoolChoice(targetSchool.hub_school_id);
    }
  };

  const onSchoolGroupChange = (schoolGroupID: string) => {
    const targetSchoolGroup = schoolGroups.find((e) => e.id === schoolGroupID);
    if (targetSchoolGroup) {
      setSelectedSchoolGroup({ label: targetSchoolGroup.display_name, value: targetSchoolGroup.id });
      setSchools(targetSchoolGroup.schools.map((s) => ({ ...s, hub_school_id: s.id, approved_at: new Date() })) || []);
    }
  };

  const handleNotificationClick = useCallback(
    (notification: IHubNotification) => {
      if (!user) return;
      markNotificationAsRead(notification.id);
      setNotifications((e) => e.map((n) => (n.id === notification.id ? { ...n, opened_by: [...n.opened_by, user.id] } : n)));

      switch (notification.target_type) {
        case `book_added`:
          router.push(`/library?id=${notification.target_id}`);
          break;
        case `course_added`:
          router.push(`/courses/${notification.target_id}?_p=${notification.message}`);
          break;
        default:
          break;
      }
    },
    [user],
  );

  const handleKanbanClick = useCallback(
    (kanban: KanbanItemType) => {
      router.push(`/planner?id=${kanban.id}`);
    },
    [user],
  );

  const handleReadAllNotifications = useCallback(() => {
    if (!user) return;
    readAllNotifications(user.chosen_school_id);
    setNotifications((e) => e.map((n) => (!n.opened_by.includes(user.id) ? { ...n, opened_by: [...n.opened_by, user.id] } : n)));
  }, [user, school]);

  const handleDeleteAllNotifications = useCallback(() => {
    if (!user || !school?.hub_school_id) return;
    deleteAllNotifications(school.hub_school_id);
    setNotifications([]);
  }, [user, school]);

  return (
    <Flex
      as="header"
      maxH={dimensions.header.height}
      minH={dimensions.header.height}
      w="100%"
      alignItems="center"
      justifyContent="space-between"
      padding={{ base: '0 1rem', lg: '0 1rem' }}
      bg={colorMode === 'light' ? 'white' : 'gray.900'}
      borderBottom="1px solid"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      boxShadow="0px 1px 3px rgba(0,0,0,0.02)"
      userSelect="none"
      position="relative"
      display={{ base: hideOnMobile ? `none` : `flex`, lg: `flex` }}
      zIndex={10}
    >
      <Flex align="center" gap="1rem">
        <Button
          className="only-desktop"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          variant="ghost"
          p="0"
          w="30px"
          h="30px"
          borderRadius="lg"
          _hover={{ bg: colorMode === 'light' ? 'gray100' : 'gray800' }}
        >
          <Icon as={HiMenu} fontSize="1.35rem" color={colorMode === 'light' ? 'gray700' : 'gray200'} />
        </Button>
        <Logo size="md" className="only-desktop" />

        <MobileMenu menuItems={menuItems} page={page} />
      </Flex>

      {/* Título do Projeto (Centralizado de forma limpa) */}
      {!!headerLabel && (
        <Flex position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" display={{ base: 'none', md: 'flex' }}>
          <Tooltip label="Projeto Atual">
            <Flex
              bg={colorMode === 'light' ? 'primary.50' : 'primary.900'}
              color={colorMode === 'light' ? 'primary.700' : 'primary.100'}
              px="1.25rem"
              py="0.35rem"
              borderRadius="full"
              align="center"
              gap="0.5rem"
              border="1px solid"
              borderColor={colorMode === 'light' ? 'primary.100' : 'primary.700'}
            >
              <Text fontSize="14px" fontWeight="600" letterSpacing="0.2px">
                {headerLabel}
              </Text>
            </Flex>
          </Tooltip>
        </Flex>
      )}

      {/* Controles à Direita */}
      <Flex gap="1.25rem" align="center" h="100%">
        {/* Agrupamento de Seletores RSuite */}
        {(user?.role === `teacher` || user?.role === `master`) && (
          <Flex
            align="center"
            gap="0.75rem"
            bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
            px="1rem"
            py="0.25rem"
            borderRadius="lg"
            border="1px solid"
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
          >
            {user?.role === `master` && (
              <SelectPicker
                id="master-picker"
                data={schoolGroupList}
                value={selectedSchoolGroup?.value}
                size="sm"
                appearance="subtle"
                searchable={true}
                label="Rede"
                cleanable={false}
                onChange={(e) => onSchoolGroupChange(e as string)}
                style={{ minWidth: '150px' }}
              />
            )}
            <SelectPicker
              id="teacher-picker"
              data={schoolList}
              value={selectedSchool?.value}
              size="sm"
              appearance="subtle"
              searchable={true}
              cleanable={false}
              label={user?.role === 'teacher' ? 'Escola' : undefined}
              onChange={(e) => onSchoolChange(e as string)}
              style={{ minWidth: '150px' }}
            />
          </Flex>
        )}

        {/* Divisória Vertical */}
        <Divider
          orientation="vertical"
          h="28px"
          borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
          display={{ base: 'none', md: 'block' }}
        />

        {/* Notificações e Logout */}
        <Flex align="center" gap="0.5rem">
          <NotificationMenu
            notifications={notifications}
            user={user}
            stockItems={stockItems}
            onNotificationClick={handleNotificationClick}
            onKanbanClick={handleKanbanClick}
            onMarkAllAsRead={handleReadAllNotifications}
            onRemoveAll={handleDeleteAllNotifications}
          />

          <Tooltip label="Sair do sistema" placement="bottom-end">
            <Flex
              className="only-desktop"
              cursor="pointer"
              w="36px"
              h="36px"
              align="center"
              justify="center"
              borderRadius="full"
              color="error.600"
              transition="all 0.2s"
              _hover={{ bg: 'error.50', color: 'error.700', transform: 'scale(1.05)' }}
              onClick={() => router.push('/logout', `spinner`)}
            >
              <Icon as={FiLogOut} fontSize="18px" />
            </Flex>
          </Tooltip>
        </Flex>
      </Flex>

      {/* Tela de Carregamento ao trocar de escola */}
      <ScaleFade
        in={isLoading}
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          bottom: '0',
          right: '0',
          backgroundColor: `${colorMode === `light` ? `#FDFAFF` : `#18203D`}`,
          height: '100%',
          width: '100%',
          pointerEvents: isLoading ? 'auto' : 'none',
          zIndex: '9999',
          opacity: isLoading ? `1` : `0`,
          transition: 'all 0.2s',
        }}
      >
        <Flex height="100%" w="100%" align="center" justify="center">
          <Flex direction="column" gap="1rem" align="center">
            <Image src="/loading/rocket-loading.gif" h="12rem" borderRadius="1rem" />
            <Text fontSize="20px" fontWeight="600" color="primary.700" mt="-3rem">
              Saindo de {selectedSchool?.label}...
            </Text>
          </Flex>
        </Flex>
      </ScaleFade>
    </Flex>
  );
};
