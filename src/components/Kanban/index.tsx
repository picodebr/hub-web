import { useEffect, useRef, useState } from 'react';
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
  VStack,
  HStack,
  Box,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { FaRegTrashCan } from 'react-icons/fa6';
import { IoChevronDownCircleOutline } from 'react-icons/io5';
import { FiUsers, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { SmallModal } from '@/components/Modal/Small';
import { IHubUser } from '@/_base/interfaces/user';
import { AvatarList } from '@/components/AvatarList';
import { IHubGroup } from '@/_base/interfaces/group';
import { TextInput } from '@/components/Inputs/Text';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { ColorPicker } from '@/components/ColorPicker';
import { useInputHandler } from '@/_base/hooks';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
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
  selectedItemId?: string;
}

export const Kanban: React.FC<IProps> = ({ initialData, onChange, group, canEdit = true, selectedItemId }) => {
  const [kanbanList, setKanbanList] = useState<KanbanColumnData[]>(initialData);
  const [itemToRemove, setItemToRemove] = useState<KanbanItemType | null>(null);
  const { colorMode } = useDarkMode();

  const { errors, onInputChange, data, setData, setErrors, submit } = useInputHandler<KanbanItemType>({
    data: EMPTY_KANBAN_ITEM,
    schema: kanbanItemSchema,
  });

  useEffect(() => {
    initialData.forEach((e) => {
      const target = e.items.find((x) => x.id === selectedItemId);
      if (target) setData(target);
    });
  }, [selectedItemId]);

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
    if (!destination) return;

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
    <Flex flex="1" overflow={{ base: 'auto hidden', md: 'hidden' }} userSelect="none" gap="1.5rem" mb="-1rem" pb="1rem">
      <DragDropContext onDragEnd={canEdit ? onDragEnd : () => ({})}>
        {kanbanList.map((column, index) => (
          <KanbanColumn key={column.type} column={column} group={group} index={index} onItemClick={setData} canEdit={canEdit} />
        ))}
      </DragDropContext>

      {/* UPDATE/CREATE MODAL */}
      <SmallModal
        title={data.id ? 'Editar Tarefa' : 'Nova Tarefa'}
        show={!!data?.column}
        onConfirm={() => submit(handleUpdateKanbanList)}
        onCancel={clearStates}
        onClose={clearStates}
        disableOkButton={!canEdit}
        size="2xl"
      >
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
          <VStack spacing="1.5rem" align="stretch" mt="2">
            {/* LINHA 1: Título e Data */}
            <Flex gap="1.5rem" direction={{ base: 'column', md: 'row' }} align="flex-start">
              <Box flex="2" w="100%">
                <TextInput
                  isDisabled={!canEdit}
                  color={colorMode === `dark` ? `#FFF` : `#1D2939`}
                  label="Título da Tarefa"
                  placeholder="Ex: Desenvolver nova landing page"
                  _placeholder={{ fontSize: '14px', color: 'gray.400' }}
                  error={errors.title}
                  value={data?.title || ``}
                  onInputChange={(value) => onInputChange('title', value)}
                />
              </Box>
              <Box flex="1" w="100%">
                <DateInput
                  isDisabled={!canEdit}
                  label="Data limite"
                  color={colorMode === `dark` ? `#FFF` : `#1D2939`}
                  value={formatDateInput(data.end_date)}
                  error={errors.end_date}
                  onInputChange={(value) => onInputChange('end_date', value ? new Date(value).toString() : '')}
                />
              </Box>
            </Flex>

            {/* LINHA 2: Descrição */}
            <Box>
              <TextAreaInput
                label="Descrição detalhada"
                isDisabled={!canEdit}
                placeholder="Informe o que precisa ser feito nesta tarefa..."
                color={colorMode === `dark` ? `#FFF` : `#1D2939`}
                _placeholder={{ fontSize: '14px', color: 'gray.400' }}
                error={errors.content}
                value={data?.content || ``}
                onInputChange={(value) => onInputChange('content', value)}
                rows={5}
              />
            </Box>

            <Divider borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200'} />

            {/* LINHA 3: Configurações Extras (Membros e Cor) */}
            <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="1rem">
              {/* Box de Atribuição (Design mais integrado) */}
              {!!group && (
                <Flex
                  align="center"
                  gap="1rem"
                  p="0.75rem"
                  borderRadius="lg"
                  bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.50'}
                  border="1px solid"
                  borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.200'}
                  flex="1"
                >
                  <Icon as={FiUsers} color="gray.500" fontSize="1.2rem" />
                  <Box flex="1">
                    <Text fontSize="12px" fontWeight="600" color="gray.500" mb="1">
                      Atribuído a:
                    </Text>
                    <Flex align="center" gap="0.75rem">
                      <Menu closeOnSelect={false} placement="top-start" isOpen={canEdit ? undefined : false}>
                        <MenuButton
                          as={Button}
                          size="sm"
                          variant="outline"
                          rightIcon={<IoChevronDownCircleOutline />}
                          bg="white"
                          color="gray.700"
                          _hover={{ bg: 'gray.100' }}
                        >
                          Adicionar
                        </MenuButton>
                        <MenuList borderColor="gray300" maxH="250px" overflow="auto" zIndex={10}>
                          <MenuOptionGroup type="checkbox">
                            {group.students.length ? (
                              group.students.map((student) => (
                                <MenuItemOption
                                  key={student.id}
                                  value={student.id}
                                  color={colorMode === `dark` ? `#FFF` : `#1D2939`}
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
                      <Box minH="32px" display="flex" alignItems="center">
                        <AvatarList
                          users={data.users?.map((studentId) => group.students.find((e) => e.id === studentId) as IHubUser).filter((e) => e) || []}
                          emptyMessage="Ninguém"
                        />
                      </Box>
                    </Flex>
                  </Box>
                </Flex>
              )}

              {/* Controles da Direita (Cor e Lixeira) */}
              <Flex align="center" gap="1.5rem" ml="auto">
                <Flex align="center" gap="0.5rem">
                  <Text fontSize="14px" fontWeight="500" color={colorMode === `dark` ? `gray.300` : `gray.600`}>
                    Cor
                  </Text>
                  <ColorPicker onChange={(value) => onInputChange('bgcolor', value)} enableInput={false} color={data?.bgcolor} />
                </Flex>

                {!!data.id && canEdit && (
                  <>
                    <Divider orientation="vertical" h="2rem" borderColor={colorMode === 'dark' ? 'whiteAlpha.300' : 'gray.300'} />
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      leftIcon={<FaRegTrashCan />}
                      onClick={() => setItemToRemove(data)}
                      _hover={{ bg: 'red.50', transform: 'scale(1.05)' }}
                      transition="all 0.2s"
                    >
                      Excluir
                    </Button>
                  </>
                )}
              </Flex>
            </Flex>
          </VStack>
        </motion.div>
      </SmallModal>

      {/* CONFIRM DELETE MODAL */}
      <AlertDialog isOpen={!!itemToRemove} leastDestructiveRef={cancelRef} onClose={() => setItemToRemove(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="red.500">
              Excluir Tarefa
            </AlertDialogHeader>

            <AlertDialogBody color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
              Você tem certeza que deseja remover esta tarefa? Essa ação não poderá ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setItemToRemove(null)} variant="ghost">
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleRemoveItem} ml={3} borderRadius="md">
                Sim, Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
};
