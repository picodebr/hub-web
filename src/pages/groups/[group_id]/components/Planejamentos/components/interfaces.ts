export const planningPageViews = <const>['Kanban', 'Gantt', 'Orçamentos'];

export type PlanningPageView = (typeof planningPageViews)[number];

export const kanbanColumns = <const>['todo', 'doing', 'finished'];

export type KanbanColumnType = (typeof kanbanColumns)[number];

export const kanbanColumnLabel: Record<KanbanColumnType, string> = {
  todo: `A Fazer`,
  doing: `Em andamento`,
  finished: `Feito`,
};
