import { Flex, Image, ScaleFade, Text, Tooltip, useColorMode, useUpdateEffect } from '@chakra-ui/react';
import { SelectPicker } from 'rsuite';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { FiLogOut } from 'react-icons/fi';
import { persist } from 'zustand/middleware';

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
import { useRouter } from 'next/router';
import { listSchoolGroups, listSchoolsByGroupCode } from '@/_base/services/school';
import { OptionType } from '@/components/Inputs/interfaces';
import { updateChosenSchool } from '@/_base/services/user';

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
  const [schools, setSchools] = useState<IHubUserSchool[]>(user?.schools || []);

  const [notifications, setNotifications] = useState<IHubNotification[]>([]);
  const [stockItems, setStockItems] = useState<IStoreMakerSchool[]>([]);
  const [schoolGroups, setSchoolGroups] = useState<IHubSchoolGroup[]>([]);
  const [selectedSchoolGroup, setSelectedSchoolGroup] = useState<OptionType | null>(null);

  const router = useRouter();
  const { colorMode } = useColorMode();
  const { setSchool, school, setCustomActions } = useSelectedSchool();

  const schoolList = useMemo(() => schools.map((item) => ({ label: item.display_name, value: item.hub_school_id })) || [], [schools]);
  const schoolGroupList = useMemo(() => schoolGroups.map((item) => ({ label: item.display_name, value: item.id })), [schoolGroups]);

  const updateSchoolChoice = useCallback(async (school_id: string) => {
    setIsLoading(true);
    try {
      const updatedUser = await updateChosenSchool(school_id);
      setUser(updatedUser);
      // onUpdateUser(updatedUser);
    } finally {
      router.push(`/profile`);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, []);

  // Set schools and school groups for master users
  useEffect(() => {
    console.log('user: ', user);
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

    if (user?.role !== `student`)
      setCustomActions(
        targetSchool?.hub_school_group?.metadata?.custom_actions?.filter(
          (action) => !action.school_id || action.school_id === targetSchool.hub_school_id,
        ) || [],
      );
    else setCustomActions([]);
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
      maxH={dimensions.header.height}
      minH={dimensions.header.height}
      w="100%"
      alignItems="center"
      justifyContent="space-between"
      padding={{ base: '0 1rem', lg: '0 2rem' }}
      borderRadius="0 0 0.4rem 0.4rem"
      borderColor="primary"
      bg="white"
      userSelect="none"
      position="relative"
      display={{ base: hideOnMobile ? `none` : `flex`, lg: `flex` }}
    >
      <Logo size="md" className="only-desktop" />
      <MobileMenu menuItems={menuItems} page={page} />
      {!!headerLabel && (
        <Flex position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
          <Tooltip label={`Projeto: ${headerLabel}`}>
            <Text fontSize="19px" fontWeight="500">
              {headerLabel}
            </Text>
          </Tooltip>
        </Flex>
      )}
      <Flex gap="1rem" align="center" fontSize="1.75rem">
        {(user?.role === `teacher` || user?.role === `master`) && (
          <>
            {user?.role === `master` && (
              <SelectPicker
                id="master-picker"
                data={schoolGroupList}
                value={selectedSchoolGroup?.value}
                size="sm"
                style={{ paddingBottom: 5, marginRight: 5 }}
                appearance="subtle"
                searchable={false}
                label="Rede"
                cleanable={false}
                onChange={(e) => onSchoolGroupChange(e as string)}
              />
            )}
            <SelectPicker
              id="teacher-picker"
              data={schoolList}
              value={selectedSchool?.value}
              size="sm"
              style={{ paddingBottom: 5 }}
              appearance="subtle"
              searchable={false}
              cleanable={false}
              onChange={(e) => onSchoolChange(e as string)}
            />
          </>
        )}
        <NotificationMenu
          notifications={notifications}
          user={user}
          stockItems={stockItems}
          onNotificationClick={handleNotificationClick}
          onKanbanClick={handleKanbanClick}
          onMarkAllAsRead={handleReadAllNotifications}
          onRemoveAll={handleDeleteAllNotifications}
        />
        <Tooltip label="Sair">
          <Flex
            cursor="pointer"
            transition="0.12s"
            _hover={{ filter: 'brightness(0.7)' }}
            onClick={() => router.push('/logout', `spinner`)}
            className="only-desktop"
          >
            <FiLogOut color="#FDA29B" />
          </Flex>
        </Tooltip>
      </Flex>

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
          pointerEvents: 'none',
          zIndex: '9999',
          opacity: isLoading ? `1` : `0`,
          transition: 'all 0.2s',
        }}
      >
        <Flex height="100%" w="100%" bgColor={`${colorMode === `light` ? `#FDFAFF` : `#18203D`}`} bgRepeat="no-repeat" bgSize="cover">
          <Flex direction="column" margin="auto" gap="1rem" align="center">
            <Image src="/loading/rocket-loading.gif" h="100%" borderRadius="1rem" />
            <Text fontSize="24px" mt="-6rem">
              {selectedSchool?.label}
            </Text>
          </Flex>
        </Flex>
      </ScaleFade>
    </Flex>
  );
};
