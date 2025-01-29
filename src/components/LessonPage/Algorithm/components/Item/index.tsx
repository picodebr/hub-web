import { Flex, Text } from '@chakra-ui/react';
import { Draggable } from 'react-beautiful-dnd';
import React from 'react';

import { KanbanColumnType, KanbanItemType } from '../../interfaces';
import { FaQuestion } from 'react-icons/fa6';

interface IProps {
  item: KanbanItemType;
  index: number;
  columnType: KanbanColumnType;
}

export const KanbanItem: React.FC<IProps> = ({ item, index, columnType }) => {
  return (
    <Draggable draggableId={item.title} index={index}>
      {(provided, snapshot) => (
        <Flex ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} w="100%" minH="4.25rem" gap="0.5rem">
          <Flex align="center" justify="center" w="1rem">
            {columnType === `raw` ? (
              <FaQuestion fontSize="18px" />
            ) : (
              <Text fontWeight={700} fontSize="16px">
                {index + 1}.
              </Text>
            )}
          </Flex>
          <Flex
            flex="1"
            border="1px"
            borderColor="gray300"
            p="0.5rem 0.75rem"
            justify="space-between"
            align="center"
            gap="0.5rem"
            borderRadius="md"
            transition="all 0.1s"
            boxShadow={snapshot.isDragging ? `lg` : undefined}
            _hover={{ boxShadow: 'md' }}
            bg={`white`}
            color={`primary800`}
          >
            <Text flex="1" whiteSpace="wrap">
              {item.title}
            </Text>
          </Flex>
        </Flex>
      )}
    </Draggable>
  );
};
