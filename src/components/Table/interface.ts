import { ReactNode } from 'react';

export interface IHubTableProps<T = object> {
  columnSizes?: HubTableColumnSize<T>[];
  columns: HubTableColumnType<T>[];
  rows: T[];
  onRowClick: (row: T) => void;
}

export type HubTableColumnType<T> = { label: ReactNode; field: keyof T };
export type HubTableColumnSize<T> = { width: string; field: keyof T };
