import { Flex } from '@chakra-ui/react';
import { Droppable } from 'react-beautiful-dnd';

import { KanbanColumnData } from '../../interfaces';
import { KanbanItem } from '../Item';

interface IProps {
  column: KanbanColumnData;
  index: number;
}

export const KanbanColumn: React.FC<IProps> = ({ column, index }) => {
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
          overflow="hidden"
          boxShadow={snapshot.isDraggingOver ? `lg` : 'md'}
          {...provided.droppableProps}
        >
          <Flex
            bg={`primary${index === 0 ? 700 : index === 1 ? 800 : 300}`}
            color="white"
            p="0.5rem 1rem"
            borderRadius="md"
            fontWeight="500"
            mb="0.25rem"
            align="center"
            justify="center"
            textTransform="uppercase"
          >
            {column.title}
          </Flex>
          <Flex className="KANBAN-LIST" direction="column" flex="1" gap="1rem" overflow="hidden auto">
            {column.items.map((item, index) => (
              <KanbanItem key={item.title} item={item} index={index} columnType={column.type} />
            ))}
          </Flex>

          {provided.placeholder}
        </Flex>
      )}
    </Droppable>
  );
};
