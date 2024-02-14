export interface IScratchNewBlockShared {
  callback: ((...args: any[]) => void) | null;
  mutationRoot: any;
  mutation: any;
}

export interface IScratchNewBlockModalProps {
  onUpdate: () => void;
  procedureCodes: string[];
}
