import { KanbanItemType } from '../interfaces';

export const kanbanUtils = {
  move: (source: any, destination: any, droppableSource: any, droppableDestination: any) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result: Record<string, KanbanItemType[]> = {};
    result[droppableSource.droppableId] = (sourceClone as KanbanItemType[]) || [];
    result[droppableDestination.droppableId] = (destClone as KanbanItemType[]) || [];

    return result;
  },
  reorder: (list: any, startIndex: any, endIndex: any) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  },
};
