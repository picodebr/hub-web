import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text,
} from '@chakra-ui/react';
import { uuid } from 'uuidv4';

import { KanbanColumnType, PlanningPageView, kanbanColumnLabel, kanbanColumns, planningPageViews } from './components/interfaces';
import { TabSwitch } from '@/components/TabSwitch';
import { SmallModal } from '@/components/Modal/Small';
import { IHubUser } from '@/_base/interfaces/user';
import { FaPlusCircle } from 'react-icons/fa';
import { AvatarList } from '@/components/AvatarList';
import { IHubGroup, IHubGroupMetadata } from '@/_base/interfaces/group';
import { IoChevronDownCircleOutline } from 'react-icons/io5';
import { TextInput } from '@/components/Inputs/Text';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { ColorPicker } from '@/components/ColorPicker';
import { isColorLight } from '@/_base/utils';
import { ZodCustomSchema } from '@/_base/interfaces/zod';
import { z } from 'zod';
import { zodSchemaErrors } from '@/_base/errors/zodSchemaErrors';
import { useInputHandler } from '@/_base/hooks';
import { FaRegTrashCan } from 'react-icons/fa6';
import { DateInput } from '@/components/Inputs/Date';
import { formatDateInput } from '@/pages/signup/index.page';
import moment from 'moment';

const EMPTY_KANBAN_ITEM: KanbanItemType = { id: ``, title: ``, local: true, content: ``, users: [], column: `` as any, bgcolor: `` };

type KanbanColumnData = { type: KanbanColumnType; title: string; items: KanbanItemType[] };

type KanbanItemType = {
  id: string;
  title: string;
  content: string;
  end_date?: string;
  local?: boolean;
  column: KanbanColumnType;
  bgcolor?: string;
  users: string[];
};

const kanbanItemSchema: ZodCustomSchema<KanbanItemType> = z.object({
  id: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim(),
  title: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).min(1, { message: zodSchemaErrors.REQUIRED_FIELD }).trim(),
  content: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).min(1, { message: zodSchemaErrors.REQUIRED_FIELD }).trim(),
  column: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).min(1, { message: zodSchemaErrors.REQUIRED_FIELD }).trim(),
  end_date: z.string().optional(),
  local: z.boolean(),
  bgcolor: z.string(),
  users: z.array(z.any()).default([]),
});

interface IProps {
  group: IHubGroup;
  setGroup: Dispatch<SetStateAction<IHubGroup>>;
}

export const Planning: React.FC<IProps> = ({ group, setGroup }) => {
  const [kanbanList, setKanbanList] = useState<KanbanColumnData[]>([]);
  const [pageView, setPageView] = useState<PlanningPageView>('Kanban');
  const [itemToRemove, setItemToRemove] = useState<KanbanItemType | null>(null);

  const { errors, onInputChange, data, setData, setErrors, submit } = useInputHandler<KanbanItemType>({
    data: EMPTY_KANBAN_ITEM,
    schema: kanbanItemSchema,
  });

  useEffect(() => {
    const initialList = group.metadata.kanban
      ? (JSON.parse(group.metadata.kanban) as KanbanColumnData[])
      : kanbanColumns.map((column) => ({ type: column, title: kanbanColumnLabel[column], items: [] }));

    setKanbanList(initialList);

    setData(EMPTY_KANBAN_ITEM);
  }, []);

  const handleUpdateKanbanList = () => {
    if (!data) return;
    setKanbanList((e) => {
      const res = e.map((column) =>
        column.type === data.column
          ? {
              ...column,
              items: data.id
                ? column.items.map((item) => (item.id === data.id ? { ...item, ...data } : item))
                : [{ ...data, id: uuid() }, ...column.items],
            }
          : column,
      );

      setGroup((g) => ({ ...g, metadata: { ...g.metadata, kanban: JSON.stringify(res) } }));

      return res;
    });
    clearStates();
  };

  const handleRemoveItem = () => {
    if (!itemToRemove) return;
    setKanbanList((e) => {
      const res = e.map((column) =>
        column.type === itemToRemove.column
          ? {
              ...column,
              items: column.items.filter((item) => item.id !== itemToRemove.id),
            }
          : column,
      );

      setGroup((g) => ({ ...g, metadata: { ...g.metadata, kanban: JSON.stringify(res) } }));

      return res;
    });
    clearStates();
  };

  const clearStates = () => {
    setData({} as any);
    setErrors({} as any);
    setItemToRemove(null);
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

      newState.forEach((s) => s.items.forEach((i) => (i.column = s.type)));

      setKanbanList(newState);
      setGroup((g) => ({ ...g, metadata: { ...g.metadata, kanban: JSON.stringify(newState) } }));
    }
  }

  const cancelRef = useRef<any>();

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
                      onClick={() => setData({ ...EMPTY_KANBAN_ITEM, column: el.type })}
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
                            p="0rem 0.75rem"
                            justify="space-between"
                            align="center"
                            w="100%"
                            minH="4.25rem"
                            gap="0.5rem"
                            borderRadius="md"
                            boxShadow={snapshot.isDragging ? `lg` : undefined}
                            bg={item.bgcolor || `white`}
                            color={item.bgcolor ? (isColorLight(item.bgcolor) ? `#4d4b5f` : `#fff`) : `primary800`}
                            onClick={() => setData(item)}
                            transition="all 0.1s"
                            _hover={{ boxShadow: 'md' }}
                          >
                            <Flex direction="column" gap="0.25rem" justify="space-between">
                              <Text flex="1" noOfLines={1}>
                                {item.title}
                              </Text>
                              <Text noOfLines={1} fontSize="12px" minH="1.3rem">
                                {item.end_date && moment(item.end_date).format(`DD/MM/YYYY`)}
                              </Text>
                            </Flex>
                            <Flex align="center">
                              <AvatarList
                                users={item.users.map((studentId) => group.students.find((e) => e.id === studentId) as IHubUser).filter((e) => e)}
                                max={4}
                                showMessage={false}
                              />
                            </Flex>
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
        show={!!data?.column}
        onConfirm={() => submit(handleUpdateKanbanList)}
        onCancel={() => setData({} as any)}
        onClose={() => setData({} as any)}
        size="2xl"
      >
        {!!data.id && (
          <Flex justify="flex-end" m="-0.5rem 1.5rem 0">
            <Flex
              align="center"
              justify="center"
              color="primary500"
              border="1px"
              borderColor="gray300"
              p=".35rem .35rem .38rem .38rem"
              cursor="pointer"
              borderRadius="50%"
              transition="0.1s"
              _hover={{
                borderColor: `primary500`,
              }}
              onClick={() => setItemToRemove(data)}
            >
              <FaRegTrashCan fontSize="1rem" />
            </Flex>
          </Flex>
        )}
        <Flex direction="column" gap="1rem" flex="1">
          <Flex gap="1rem">
            <TextInput
              label="Titulo"
              placeholder="Informe o nome do grupo"
              _placeholder={{ fontSize: '14px' }}
              error={errors.title}
              value={data?.title || ``}
              onInputChange={(value) => onInputChange('title', value)}
            />
            <DateInput
              label="Data da entrega"
              value={formatDateInput(data.end_date)}
              error={errors.end_date}
              onInputChange={(value) => onInputChange('end_date', value ? new Date(value).toString() : '')}
            />
          </Flex>
          <TextAreaInput
            label="Descrição da tarefa"
            error={errors.content}
            value={data?.content || ``}
            onInputChange={(value) => onInputChange('content', value)}
            rows={5}
          />
          <Flex align="center" justify="space-between" gap="2rem">
            <Flex gap="1rem" align="center">
              <Text fontWeight="500">Cor de fundo</Text>
              <ColorPicker onChange={(value) => onInputChange('bgcolor', value)} enableInput={false} color={data?.bgcolor} />
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
                        onClick={(e) =>
                          onInputChange(
                            'users',
                            data.users.includes(e.currentTarget.value)
                              ? data.users.filter((id) => id !== e.currentTarget.value)
                              : [e.currentTarget.value, ...data.users],
                          )
                        }
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
            <AvatarList
              users={data.users?.map((studentId) => group.students.find((e) => e.id === studentId) as IHubUser).filter((e) => e) || []}
              emptyMessage="Nenhum membro atribuído"
            />
          </Flex>
        </Flex>
      </SmallModal>

      <AlertDialog isOpen={!!itemToRemove} leastDestructiveRef={cancelRef} onClose={() => setItemToRemove(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Tarefa
            </AlertDialogHeader>

            <AlertDialogBody>Você tem certeza que deseja remover essa tarefa?</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setItemToRemove(null)}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleRemoveItem} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
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
