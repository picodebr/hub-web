export interface ISerialMonitorModalProps {
  show: boolean;
  usbFilters: SerialPortFilter[];
  onClose: () => void;
}
