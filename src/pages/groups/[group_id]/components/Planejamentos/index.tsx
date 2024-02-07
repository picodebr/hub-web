import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Flex } from '@chakra-ui/react';

import { IHubGroup } from '@/_base/interfaces/group';
import { Kanban } from '@/components/Kanban';
import { KanbanColumnData, kanbanColumnLabel, kanbanColumns } from '@/components/Kanban/interfaces';
import { Gantt } from './components/Gantt';
import { Bill } from './components/Bill';
import { PlanningPageView } from './components/interfaces';

interface IProps {
  group: IHubGroup;
  setGroup: Dispatch<SetStateAction<IHubGroup>>;
  canEdit: boolean;
}

export const Planning: React.FC<IProps> = ({ group, setGroup, canEdit }) => {
  const [kanbanList, setKanbanList] = useState<KanbanColumnData[]>([]);
  const [pageView, setPageView] = useState<PlanningPageView>();

  useEffect(() => {
    const initialList = group.metadata.kanban
      ? (JSON.parse(group.metadata.kanban) as KanbanColumnData[])
      : kanbanColumns.map((column) => ({ type: column, title: kanbanColumnLabel[column], items: [] }));

    setKanbanList(initialList);
    setPageView(`Kanban`);
  }, []);

  const handleUpdateKanbanList = (data: KanbanColumnData[]) => {
    setKanbanList(data);
    setGroup((g) => ({ ...g, metadata: { ...g.metadata, kanban: JSON.stringify(data) } }));
  };

  const PlanningElement: Record<PlanningPageView, React.ReactElement> = {
    Gantt: <Gantt />,
    Orçamentos: <Bill />,
    Kanban: <Kanban initialData={kanbanList} onChange={handleUpdateKanbanList} group={group} canEdit={canEdit} />,
  };

  return (
    <Flex flex="1" overflow="hidden" userSelect="none" gap="1.5rem" mb="-1rem" pb="1rem">
      {/* <TabSwitch
        tabs={planningPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
        onSwitch={(view) => setPageView(view as any)}
        currentTabColor="primary600"
        direction="column"
      /> */}
      {!!pageView && PlanningElement[pageView]}
    </Flex>
  );
};
