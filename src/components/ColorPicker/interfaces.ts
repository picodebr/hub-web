export interface IColorPickerProps {
  onChange: (color: string) => void;
  color?: string;
  label?: string;
  hoverLabel?: string;
  wrapText?: boolean;
  enableInput?: boolean;
  isDisabled?: boolean;
}
