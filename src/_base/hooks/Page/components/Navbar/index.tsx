import { Flex, Icon } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { FaChartLine, FaHome, FaSignOutAlt, FaUsers } from 'react-icons/fa';
import { FaImages, FaUserLock } from 'react-icons/fa6';
import { IoMegaphone } from 'react-icons/io5';
import { MdHomeWork } from 'react-icons/md';

import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { IAdmin } from '@/_base/interfaces/admin';
import { dimensions } from '@/styles/global';
import { BiSolidReport } from 'react-icons/bi';

type MenuItemType = { name: string; page: string; icon: IconType; permission?: { scope: string; action: string } };

const menuItems: Array<MenuItemType> = [
  { name: 'Home', page: 'home', icon: FaHome },
  { name: 'Campaigns', page: 'campaigns', icon: FaChartLine, permission: { scope: 'campaign', action: 'read' } },
  { name: 'Publishers', page: 'publishers', icon: FaImages, permission: { scope: 'publisher', action: 'read' } },
  { name: 'Agencies', page: 'agencies', icon: MdHomeWork, permission: { scope: 'agency', action: 'read' } },
  { name: 'Advertisers', page: 'advertisers', icon: IoMegaphone, permission: { scope: 'advertiser', action: 'read' } },
  { name: 'Users', page: 'users', icon: FaUsers, permission: { scope: 'admin', action: 'read' } },
  { name: 'Permission Groups', page: 'permission_groups', icon: FaUserLock, permission: { scope: 'permission_group', action: 'read' } },
  { name: 'Reports', page: 'reports', icon: BiSolidReport },
  { name: 'Logout', page: 'logout', icon: FaSignOutAlt },
];

interface IProps {
  page: string;
  admin: IAdmin;
}

export const Navbar: React.FC<IProps> = ({ page, admin }) => {
  const adminPermissions = admin.permission_group?.permissions || admin.permissions;
  const router = useCustomRouter();
  return (
    <Flex
      direction="column"
      bg="#2a075d"
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
        .filter(({ permission }) =>
          admin?.id ? !permission?.scope || (adminPermissions as any)[permission.scope || '']?.includes(permission.action) : true,
        )
        .map((item) => (
          <Flex key={item.name} w="100%" direction="column" _last={{ flex: '1', justifyContent: 'flex-end' }}>
            <Flex
              align="center"
              padding="4"
              transition="all 0.15s"
              borderRadius="lg"
              cursor="pointer"
              _hover={{ outline: '1px solid white' }}
              bg={page === item.page ? 'white' : '#2a075d'}
              color={page === item.page ? '#2a075d' : 'white'}
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
