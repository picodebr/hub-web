export const kanbanColumns = <const>['raw', 'ordered'];

export type KanbanColumnType = (typeof kanbanColumns)[number];

export type KanbanColumnData = { type: KanbanColumnType; title: string; items: KanbanItemType[] };

export type KanbanItemType = {
  title: string;
  column: KanbanColumnType;
};
