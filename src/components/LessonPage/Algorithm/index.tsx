import { useEffect, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Flex } from '@chakra-ui/react';

import { KanbanColumn } from './components/Column';
import { KanbanColumnData, KanbanItemType } from './interfaces';
import { kanbanUtils } from './utils';
import { ILessonPageProps } from '../interfaces';
import { ISendAlgorithmParams } from '@/_base/interfaces/challenges';

export const AlgorithmPage: React.FC<Omit<ILessonPageProps, `onPageChange` | `onFinish`>> = ({ challenge, registerAnswer, answers }) => {
  const [kanbanList, setKanbanList] = useState<KanbanColumnData[]>([]);

  useEffect(() => {
    if (!kanbanList[1]?.items) return;

    registerAnswer({ hub_challenge_id: challenge.id, sequence: kanbanList[1].items.map((e) => e.title) });
  }, [kanbanList]);

  useEffect(() => {
    const targetAnswer = answers.find((e) => e.hub_challenge_id === challenge.id) as ISendAlgorithmParams;

    setKanbanList([
      {
        type: `raw`,
        title: `Ordene o algoritmo`,
        items:
          challenge.data.algorithm_sequence?.filter((e) => !(targetAnswer?.sequence || []).includes(e))?.map((e) => ({ column: `raw`, title: e })) ||
          [],
      },
      { type: `ordered`, title: `Resposta final`, items: targetAnswer?.sequence?.map((e) => ({ title: e, column: `ordered` })) || [] },
    ]);
  }, [challenge]);

  function onDragEnd(result: { source: any; destination: any }) {
    const { source, destination } = result;

    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = kanbanUtils.reorder(kanbanList[sInd].items, source.index, destination.index) as KanbanItemType[];
      const newState = [...kanbanList];
      newState[sInd] = { ...newState[sInd], items };
      setKanbanList(newState);
    } else {
      const result = kanbanUtils.move(kanbanList[sInd].items, kanbanList[dInd].items, source, destination);
      const newState = [...kanbanList];
      newState[sInd] = { ...newState[sInd], items: result[sInd] || [] };
      newState[dInd] = { ...newState[dInd], items: result[dInd] || [] };

      newState.forEach((s) => s.items.forEach((i) => (i.column = s.type)));

      setKanbanList(newState);
    }
  }

  return (
    <Flex
      flex="1"
      p="2rem"
      bgImage="/patterns/sprinkle.svg"
      bgPosition="bottom"
      bgSize="cover"
      borderRadius="md"
      justify="center"
      userSelect="none"
      gap="2rem"
      mb="-1rem"
      pb="1rem"
      overflow="hidden"
    >
      <DragDropContext onDragEnd={onDragEnd}>
        {kanbanList.map((column, index) => (
          <KanbanColumn key={column.type} column={column} index={index} />
        ))}
      </DragDropContext>
    </Flex>
  );
};
