import { ReactNode } from 'react';

export type AppTableColumns = { label: string; key: string };

export type AppTableValues = Record<AppTableColumns['key'], ReactNode> & { key: string };

export interface IAppTableProps {
  columns: AppTableColumns[];
  dataSource: AppTableValues[];
  deleteButtonDisabled?: boolean;
  onView?: (key: string) => void;
  onDelete?: (key: string) => void;
  onTagView?: (key: string) => void;
}
