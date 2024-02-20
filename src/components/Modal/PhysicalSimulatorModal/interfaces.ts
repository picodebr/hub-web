export interface IPhysicalSimulatorModalProps {
  show: boolean;
  loadingProgress: number;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  iframeUrl: string;
  onClose: (state: false) => void;
  onLoad: () => void;
}
