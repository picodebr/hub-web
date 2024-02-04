import { Flex, Text } from '@chakra-ui/react';
import { Droppable } from 'react-beautiful-dnd';
import { FaPlusCircle } from 'react-icons/fa';

import { EMPTY_KANBAN_ITEM, KanbanColumnData, KanbanItemType } from '../../interfaces';
import { KanbanItem } from '../Item';
import { IHubGroup } from '@/_base/interfaces/group';

interface IProps {
  column: KanbanColumnData;
  index: number;
  group?: IHubGroup;
  onItemClick: (item: KanbanItemType) => void;
}

export const KanbanColumn: React.FC<IProps> = ({ column, index, group, onItemClick }) => {
  return (
    <Droppable droppableId={`${index}`}>
      {(provided, snapshot) => (
        <Flex
          flex="1"
          direction="column"
          ref={provided.innerRef}
          transition="boxShadow 0.15s"
          bg="white"
          padding="0.5rem"
          border="1px"
          borderColor="gray200"
          borderRadius="md"
          gap="0.65rem"
          minW="15rem"
          boxShadow={snapshot.isDraggingOver ? `lg` : 'md'}
          {...provided.droppableProps}
        >
          <Flex
            bg={`primary${index === 0 ? 700 : index === 1 ? 800 : 300}`}
            color="white"
            p="0.5rem 1rem"
            borderRadius="md"
            fontWeight="500"
            mb="0.45rem"
          >
            {column.title}
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
              onClick={() => onItemClick({ ...EMPTY_KANBAN_ITEM, column: column.type })}
            >
              <Text>Adicionar</Text>
              <Flex color={`primary${index === 0 ? 700 : index === 1 ? 800 : 300}`}>
                <FaPlusCircle />
              </Flex>
            </Flex>
            {column.items.map((item, index) => (
              <KanbanItem key={item.id} item={item} index={index} group={group} onItemClick={onItemClick} />
            ))}
          </Flex>

          {provided.placeholder}
        </Flex>
      )}
    </Droppable>
  );
};
