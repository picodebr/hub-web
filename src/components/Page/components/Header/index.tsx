import { Flex, Image, ScaleFade, Text, Tooltip, useColorMode, useUpdateEffect } from '@chakra-ui/react';
import { SelectPicker } from 'rsuite';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { create } from 'zustand';
import { FiLogOut } from 'react-icons/fi';
import { persist } from 'zustand/middleware';

import { IHubUser } from '@/_base/interfaces/user';
import { Logo } from '@/components/Logo';
import { dimensions } from '@/styles/global';
import { IHubUserSchool } from '@/_base/interfaces/school';
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

interface IProps {
  user?: IHubUser;
  headerLabel?: string;
  menuItems: MenuItemType[];
  page: string;
  hideOnMobile?: boolean;
  setStockItems?: Dispatch<SetStateAction<IStoreMakerSchool[]>>;
}

type TargetSchoolHookType = {
  school: IHubUserSchool | null;
  customActions: CustomActions[];
  setSchool: (school: IHubUserSchool) => void;
  setCustomActions: (customActions: CustomActions[]) => void;
};
export const useSelectedSchool = create<TargetSchoolHookType>(
  persist(
    (set) => ({
      school: null,
      customActions: [],
      setSchool: (data: IHubUserSchool) => set(() => ({ school: data })),
      setCustomActions: (data: CustomActions) => set(() => ({ customActions: data })),
    }),
    { name: `context-storage` },
  ) as any,
);

export const Header: React.FC<IProps> = ({ user, headerLabel, menuItems, page, hideOnMobile, setStockItems: _setStockItems }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(user?.schools?.map((item) => ({ label: item.display_name, value: item.id }))[0]);
  const [notifications, setNotifications] = useState<IHubNotification[]>([]);
  const [stockItems, setStockItems] = useState<IStoreMakerSchool[]>([]);

  const router = useRouter();
  const { colorMode } = useColorMode();
  const { setSchool, school, setCustomActions } = useSelectedSchool();

  const data = user?.schools.map((item) => ({ label: item.display_name, value: item.id })) || [];

  useEffect(() => {
    if (!school?.hub_school_id) return;
    getNotifications(school.hub_school_id || ``).then((res) => {
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
  }, [school]);

  useUpdateEffect(() => {
    setIsLoading(true);
    const target = user?.schools.find((e) => e.id === selectedSchool?.value);

    if (target) {
      setSchool(target);
      if (user?.role === `teacher`)
        setCustomActions(
          target?.hub_school_group?.metadata?.custom_actions?.filter((action) => !action.school_id || action.school_id === target.hub_school_id) ||
            [],
        );
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  }, [selectedSchool]);

  useEffect(() => {
    const storage = JSON.parse(localStorage.getItem(`context-storage`) || `{}`);
    const target: IHubUserSchool = user?.schools.find((e) => e.id === selectedSchool?.value) || user?.schools[0] || storage?.state?.school;

    if (!school && target) {
      setSchool(target);
      if (user?.role === `teacher`)
        setCustomActions(
          target?.hub_school_group?.metadata?.custom_actions?.filter((action) => !action.school_id || action.school_id === target.hub_school_id) ||
            [],
        );
      else setCustomActions([]);
    }
  }, [user]);

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
    if (!user || !school?.hub_school_id) return;
    readAllNotifications(school.hub_school_id);
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
        {user?.role === `teacher` && (
          <SelectPicker
            data={data}
            value={selectedSchool?.value || school?.id}
            size="sm"
            style={{ paddingBottom: 5 }}
            appearance="subtle"
            searchable={false}
            cleanable={false}
            onChange={(e) => setSelectedSchool(data.find((d) => d.value === e))}
          />
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
            <Image src="/loading/rocket-loading.gif" h="100%" borderRadius="1rem"  />
            <Text fontSize="24px" mt="-6rem">
              {selectedSchool?.label}
            </Text>
          </Flex>
        </Flex>
      </ScaleFade>
    </Flex>
  );
};
