export interface IScratchNewVariableModalProps {
  show: boolean;
  variables: string[];
  onClose: (variable?: string) => void;
}
