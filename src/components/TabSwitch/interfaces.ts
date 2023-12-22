export interface ITabSwitchProps {
  tabs: TabSwitchType[];
  onSwitch: (key: string) => void;
  currentTabColor?: string;
}

export type TabSwitchType = { key: string; label: string; isSelected: boolean };
