import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button, Flex, Image, Menu, MenuButton, MenuItem, MenuItemOption, MenuList, MenuOptionGroup, Text } from '@chakra-ui/react';
import { uuid } from 'uuidv4';

import { KanbanColumnType, PlanningPageView, kanbanColumnLabel, kanbanColumns, planningPageViews } from './components/interfaces';
import { TabSwitch } from '@/components/TabSwitch';
import { SmallModal } from '@/components/Modal/Small';
import { IHubUser } from '@/_base/interfaces/user';
import { FaPlusCircle } from 'react-icons/fa';
import { AvatarList } from '@/components/AvatarList';
import { IHubGroup } from '@/_base/interfaces/group';
import { IoChevronDownCircleOutline } from 'react-icons/io5';
import { TextInput } from '@/components/Inputs/Text';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { ColorPicker } from '@/components/ColorPicker';
import { isColorLight } from '@/_base/utils';

const EMPTY_KANBAN_ITEM: KanbanItemType = { id: `1`, title: ``, local: true, content: ``, users: [], column: `todo`, bgcolor: `` };

type KanbanColumnData = { type: KanbanColumnType; title: string; items: KanbanItemType[] };

type KanbanItemType = { id: string; title: string; users: IHubUser[]; content: string; local?: boolean; column: KanbanColumnType; bgcolor: string };

interface IProps {
  group: IHubGroup;
}

export const Planning: React.FC<IProps> = ({ group }) => {
  const [kanbanList, setKanbanList] = useState<Array<KanbanColumnData>>([]);
  const [pageView, setPageView] = useState<PlanningPageView>('Kanban');
  const [kanbanItem, setKanbanItem] = useState<KanbanItemType | null>(null);

  useEffect(() => {
    setKanbanList(kanbanColumns.map((column) => ({ type: column, title: kanbanColumnLabel[column], items: [] })));
  }, []);

  const handleAddNewItem = () => {
    if (!kanbanItem) return;
    setKanbanList((e) =>
      e.map((column) =>
        column.type === kanbanItem.column ? { ...column, items: [{ ...kanbanItem, id: `${column.items.length + 1}` }, ...column.items] } : column,
      ),
    );
    setKanbanItem(null);
  };

  function onDragEnd(result: { source: any; destination: any }) {
    const { source, destination } = result;

    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(kanbanList[sInd].items, source.index, destination.index) as KanbanItemType[];
      const newState = [...kanbanList];
      newState[sInd] = { ...newState[sInd], items };
      setKanbanList(newState);
    } else {
      const result = move(kanbanList[sInd].items, kanbanList[dInd].items, source, destination);
      const newState = [...kanbanList];
      newState[sInd] = { ...newState[sInd], items: result[sInd] || [] };
      newState[dInd] = { ...newState[dInd], items: result[dInd] || [] };

      setKanbanList(newState);
    }
  }

  return (
    <Flex flex="1" overflow="auto" userSelect="none" padding="0.5rem">
      {/* <TabSwitch
        tabs={planningPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
        onSwitch={(view) => setPageView(view as any)}
        currentTabColor="primary600"
        direction="column"
      /> */}
      {pageView === `Kanban` ? (
        <DragDropContext onDragEnd={onDragEnd}>
          {kanbanList.map((el, ind) => (
            <Droppable key={ind} droppableId={`${ind}`}>
              {(provided, snapshot) => (
                <Flex
                  flex="1"
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
                  onClick={() => {}}
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
                  <Flex className="KANBAN-LIST" direction="column" flex="1" gap="1rem">
                    <Flex
                      className="ADD-ITEM"
                      border="1px"
                      borderColor="gray300"
                      p="0.75rem"
                      m="0 0.75rem"
                      justify="space-between"
                      align="center"
                      gap="0.5rem"
                      borderRadius="md"
                      bg="white"
                      mb="1rem"
                      transition="0.1s"
                      cursor="pointer"
                      _hover={{ boxShadow: 'sm', borderColor: 'gray400' }}
                      onClick={() => setKanbanItem({ ...EMPTY_KANBAN_ITEM, column: el.type })}
                    >
                      <Text>Adicionar</Text>
                      <Flex color={`primary${ind === 0 ? 700 : ind === 1 ? 800 : 500}`}>
                        <FaPlusCircle />
                      </Flex>
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
                            bg={item.bgcolor || `white`}
                            color={item.bgcolor ? (isColorLight(item.bgcolor) ? `#4d4b5f` : `#fff`) : `primary800`}
                            onClick={() => setKanbanItem(item)}
                            transition="all 0.1s"
                            _hover={{ boxShadow: 'md' }}
                          >
                            {item.content}
                            <Flex align="center">
                              <AvatarList users={item.users} max={4} />
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
                  </Flex>

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
      <SmallModal
        show={!!kanbanItem}
        onConfirm={handleAddNewItem}
        onCancel={() => setKanbanItem(null)}
        onClose={() => setKanbanItem(null)}
        size="2xl"
      >
        <Flex direction="column" gap="1rem" flex="1">
          <TextInput
            label="Titulo"
            placeholder="Informe o nome do grupo"
            _placeholder={{ fontSize: '14px' }}
            value={kanbanItem?.title || ``}
            onInputChange={(title) => setKanbanItem((e) => ({ ...(e || ({} as any)), title }))}
          />
          <TextAreaInput
            label="Descrição da tarefa"
            value={kanbanItem?.content || ``}
            onInputChange={(content) => setKanbanItem((e) => ({ ...(e || ({} as any)), content }))}
            rows={5}
          />
          <Flex align="center" justify="space-between" gap="2rem">
            <Flex gap="1rem" align="center">
              <Text fontWeight="500">Cor de fundo</Text>
              <ColorPicker
                onChange={(bgcolor) => setKanbanItem((e) => ({ ...(e || ({} as any)), bgcolor }))}
                enableInput={false}
                color={kanbanItem?.bgcolor}
              />
            </Flex>
            <Menu closeOnSelect={false} placement="bottom">
              <MenuButton as={Button} rightIcon={<IoChevronDownCircleOutline />} border="1px" borderColor="gray300" bg="white" flex="1">
                Atribuido à
              </MenuButton>
              <MenuList borderColor="gray300" boxShadow="md">
                <MenuOptionGroup type="checkbox">
                  {group.students.length ? (
                    group.students.map((student) => (
                      <MenuItemOption
                        key={student.id}
                        value={student.id}
                        onClick={() => setKanbanItem((e) => ({ ...(e || ({} as any)), users: [student, ...(e?.users || [])] }))}
                      >
                        {student.name}
                      </MenuItemOption>
                    ))
                  ) : (
                    <MenuItem isDisabled>Nenhum membro disponível</MenuItem>
                  )}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          </Flex>
          <Flex minH="3rem">
            <AvatarList users={kanbanItem?.users || []} emptyMessage="Nenhum membro atribuído" />
          </Flex>
        </Flex>
      </SmallModal>
    </Flex>
  );
};

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

  const result: Record<string, KanbanItemType[]> = {};
  result[droppableSource.droppableId] = (sourceClone as KanbanItemType[]) || [];
  result[droppableDestination.droppableId] = (destClone as KanbanItemType[]) || [];

  return result;
};
