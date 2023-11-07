export interface INavbarProps {
  page?: string;
}

type MenuItemType = {
  page?: string;
  children?: MenuItemType[];
};

interface MenuItemProps {
  items: MenuItemType[];
}

export type MenuItem = Required<MenuItemProps>['items'][number];
