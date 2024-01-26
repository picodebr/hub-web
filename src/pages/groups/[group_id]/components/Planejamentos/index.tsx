import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Flex, Image } from '@chakra-ui/react';
import { uuid } from 'uuidv4';

import { PlanningPageView, planningPageViews } from './components/interfaces';
import { TabSwitch } from '@/components/TabSwitch';

type ItemType = { id: string; content: string; avatar: string };

export const Planning: React.FC = () => {
  const [state, setState] = useState<Array<{ title: string; items: ItemType[] }>>([]);
  const [pageView, setPageView] = useState<PlanningPageView>('Kanban');

  useEffect(() => {
    setState([
      { title: `A Fazer`, items: getItems([`Projeto Maker`, `Aula do Code (Buzzer)`]) },
      { title: `Em andamento`, items: getItems([`Aula do Code (LED)`, `Cidade inteligente`]) },
      { title: `Feito`, items: getItems([`Onboarding`, `Componentes da loja`]) },
    ]);
  }, []);

  function onDragEnd(result: { source: any; destination: any }) {
    const { source, destination } = result;

    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd].items, source.index, destination.index) as ItemType[];
      const newState = [...state];
      newState[sInd] = { ...newState[sInd], items };
      setState(newState);
    } else {
      const result = move(state[sInd].items, state[dInd].items, source, destination);
      const newState = [...state];
      newState[sInd] = { ...newState[sInd], items: result[sInd] };
      newState[dInd] = { ...newState[dInd], items: result[dInd] };

      setState(newState.filter((group) => group.items.length));
    }
  }

  return (
    <Flex flex="1" overflow="auto">
      {/* <TabSwitch
        tabs={planningPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
        onSwitch={(view) => setPageView(view as any)}
        currentTabColor="primary600"
        direction="column"
      /> */}
      {pageView === `Kanban` ? (
        <DragDropContext onDragEnd={onDragEnd}>
          {state.map((el, ind) => (
            <Droppable key={ind} droppableId={`${ind}`}>
              {(provided, snapshot) => (
                <Flex
                  direction="column"
                  ref={provided.innerRef}
                  transition="boxShadow 0.15s"
                  bg="white"
                  margin="0 1rem"
                  padding="0.5rem"
                  borderRadius="md"
                  gap="0.65rem"
                  minW="15rem"
                  boxShadow={snapshot.isDraggingOver ? `lg` : 'md'}
                  {...provided.droppableProps}
                >
                  <Flex
                    bg={`primary${ind === 0 ? 700 : ind === 1 ? 800 : 500}`}
                    color="white"
                    p="0.5rem 1rem"
                    borderRadius="md"
                    fontWeight="500"
                    mb="0.45rem"
                  >
                    {el.title}
                  </Flex>
                  {el.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <Flex
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          border="1px"
                          borderColor="gray300"
                          p="1rem 0.875rem"
                          justify="space-between"
                          align="center"
                          w="100%"
                          gap="0.5rem"
                          borderRadius="md"
                          boxShadow={snapshot.isDragging ? `lg` : undefined}
                          bg="white"
                        >
                          {item.content}
                          <Flex align="center">
                            <Image borderRadius="50%" h="2.5rem" src={item.avatar} />
                          </Flex>
                          {/* <Flex
                          align="center"
                          onClick={() => {
                            const newState = [...state];
                            newState[ind]?.items.splice(index, 1);
                            setState(newState.filter((group) => group.items.length));
                          }}
                          color="primary500"
                        >
                          <FaRegTrashCan />
                        </Flex> */}
                        </Flex>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Flex>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      ) : (
        <Flex align="center" justify="center" fontWeight="500" flex="1" bg="gray50" boxShadow="md" borderRadius="md" margin="4rem">
          Em Construção
        </Flex>
      )}
    </Flex>
  );
};

const getItems = (items: string[]): ItemType[] =>
  items.map((content) => ({
    id: uuid(),
    content,
    avatar: `/avatars/${Math.random() > 0.5 ? (Math.random() > 0.5 ? 'purple' : 'yellow') : Math.random() > 0.5 ? 'orange' : 'blue'}-character.png`,
  }));

const reorder = (list: any, startIndex: any, endIndex: any) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const move = (source: any, destination: any, droppableSource: any, droppableDestination: any) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: Record<string, ItemType[]> = {};
  result[droppableSource.droppableId] = sourceClone as ItemType[];
  result[droppableDestination.droppableId] = destClone as ItemType[];

  return result;
};
