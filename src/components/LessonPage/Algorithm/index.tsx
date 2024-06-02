import { useEffect, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Flex } from '@chakra-ui/react';

import { KanbanColumn } from './components/Column';
import { KanbanColumnData, KanbanItemType } from './interfaces';
import { kanbanUtils } from './utils';
import { GenericButton } from '@/components/Buttons/Generic';
import { FaCheck } from 'react-icons/fa6';
import { ILessonPageProps } from '../interfaces';

export const AlgorithmPage: React.FC<ILessonPageProps> = ({ challenge, registerAnswer }) => {
  const [kanbanList, setKanbanList] = useState<KanbanColumnData[]>([]);

  useEffect(() => {
    setKanbanList([
      {
        type: `raw`,
        title: `Ordene o algoritmo`,
        items: challenge.data.algorithm_sequence?.map((e) => ({ column: `raw`, title: e })) || [],
      },
      { type: `ordered`, title: `Resposta final`, items: [] },
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
      <Flex>
        <GenericButton
          label="Finalizar"
          bg="primary700"
          rightIcon={<FaCheck />}
          isDisabled={kanbanList[0]?.items.length !== 0}
          onClick={() => registerAnswer(kanbanList[1].items.map((e) => e.title))}
        />
      </Flex>
    </Flex>
  );
};
