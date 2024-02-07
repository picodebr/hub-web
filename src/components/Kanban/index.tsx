import { useRef, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { uuid } from 'uuidv4';
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
import { FaRegTrashCan } from 'react-icons/fa6';
import { IoChevronDownCircleOutline } from 'react-icons/io5';

import { SmallModal } from '@/components/Modal/Small';
import { IHubUser } from '@/_base/interfaces/user';
import { AvatarList } from '@/components/AvatarList';
import { IHubGroup } from '@/_base/interfaces/group';
import { TextInput } from '@/components/Inputs/Text';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { ColorPicker } from '@/components/ColorPicker';
import { useInputHandler } from '@/_base/hooks';
import { DateInput } from '@/components/Inputs/Date';
import { KanbanColumn } from './components/Column';
import { EMPTY_KANBAN_ITEM, KanbanColumnData, KanbanItemType, kanbanItemSchema } from './interfaces';
import { kanbanUtils } from './utils';
import { formatDateInput } from '@/_base/utils';

interface IProps {
  initialData: KanbanColumnData[];
  onChange: (data: KanbanColumnData[]) => void;
  group?: IHubGroup;
  canEdit?: boolean;
}

export const Kanban: React.FC<IProps> = ({ initialData, onChange, group, canEdit = true }) => {
  const [kanbanList, setKanbanList] = useState<KanbanColumnData[]>(initialData);
  const [itemToRemove, setItemToRemove] = useState<KanbanItemType | null>(null);

  const { errors, onInputChange, data, setData, setErrors, submit } = useInputHandler<KanbanItemType>({
    data: EMPTY_KANBAN_ITEM,
    schema: kanbanItemSchema,
  });

  const handleUpdateKanbanList = (_item?: KanbanItemType) => {
    const kanbanItem = _item || data;

    if (!kanbanItem) return;
    setKanbanList((e) => {
      const res = e.map((column) =>
        column.type === kanbanItem.column
          ? {
              ...column,
              items: kanbanItem.id
                ? column.items.map((item) => (item.id === kanbanItem.id ? { ...item, ...kanbanItem } : item))
                : [{ ...kanbanItem, id: uuid() }, ...column.items],
            }
          : column,
      );

      onChange(res);

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

      onChange(res);

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
      onChange(newState);
    }
  }

  const cancelRef = useRef<any>();

  return (
    <Flex flex="1" overflow="hidden" userSelect="none" gap="1.5rem" mb="-1rem" pb="1rem">
      <DragDropContext onDragEnd={canEdit ? onDragEnd : () => ({})}>
        {kanbanList.map((column, index) => (
          <KanbanColumn key={column.type} column={column} group={group} index={index} onItemClick={setData} canEdit={canEdit} />
        ))}
      </DragDropContext>

      {/* UPDATE/CREATE MODAL */}
      <SmallModal
        show={!!data?.column}
        onConfirm={() => submit(handleUpdateKanbanList)}
        onCancel={() => setData({} as any)}
        onClose={() => setData({} as any)}
        disableOkButton={!canEdit}
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
              onClick={() => canEdit && setItemToRemove(data)}
            >
              <FaRegTrashCan fontSize="1rem" />
            </Flex>
          </Flex>
        )}
        <Flex direction="column" gap="1rem" flex="1">
          <Flex gap="1rem" align="flex-end">
            <TextInput
              isDisabled={!canEdit}
              flex="1"
              label="Título"
              placeholder="Informe o título da tarefa"
              _placeholder={{ fontSize: '14px' }}
              error={errors.title}
              value={data?.title || ``}
              onInputChange={(value) => onInputChange('title', value)}
            />
            <DateInput
              isDisabled={!canEdit}
              label="Data limite"
              value={formatDateInput(data.end_date)}
              error={errors.end_date}
              onInputChange={(value) => onInputChange('end_date', value ? new Date(value).toString() : '')}
            />
            {!group && (
              <Flex gap="1rem" align="center" mb="0.45rem">
                <ColorPicker onChange={(value) => onInputChange('bgcolor', value)} enableInput={false} color={data?.bgcolor} />
                <Text fontWeight="500" whiteSpace="nowrap">
                  Cor de fundo
                </Text>
              </Flex>
            )}
          </Flex>
          <TextAreaInput
            label="Descrição da tarefa"
            isDisabled={!canEdit}
            placeholder="Informe a descrição da tarefa"
            _placeholder={{ fontSize: '14px' }}
            error={errors.content}
            value={data?.content || ``}
            onInputChange={(value) => onInputChange('content', value)}
            rows={5}
          />
          {!!group && (
            <>
              <Flex align="center" justify="space-between" gap="2rem">
                <Flex gap="1rem" align="center">
                  <Text fontWeight="500">Cor de fundo</Text>
                  <ColorPicker onChange={(value) => onInputChange('bgcolor', value)} enableInput={false} color={data?.bgcolor} />
                </Flex>
                <Menu closeOnSelect={false} placement="bottom" isOpen={canEdit ? undefined : false}>
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
            </>
          )}
        </Flex>
      </SmallModal>

      {/* COFIRM DELETE MODAL */}
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
