import { Flex, Text } from '@chakra-ui/react';
import { Draggable } from 'react-beautiful-dnd';
import React from 'react';
import moment from 'moment';

import { KanbanColumnType, KanbanItemType } from '../../interfaces';
import { AvatarList } from '@/components/AvatarList';
import { IHubGroup } from '@/_base/interfaces/group';
import { isColorLight } from '@/_base/utils';
import { IHubUser } from '@/_base/interfaces/user';
import { FaCheckCircle } from 'react-icons/fa';

interface IProps {
  item: KanbanItemType;
  index: number;
  group?: IHubGroup;
  onItemClick: (item: KanbanItemType) => void;
  columnType: KanbanColumnType;
}

export const KanbanItem: React.FC<IProps> = ({ item, group, index, onItemClick, columnType }) => {
  return (
    <Draggable draggableId={item.id} index={index}>
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
          onClick={() => onItemClick(item)}
          transition="all 0.1s"
          _hover={{ boxShadow: 'md' }}
        >
          <Flex direction="column" gap="0.25rem" justify="space-between">
            <Flex align="center" gap="0.25rem">
              {columnType === `finished` && (
                <Flex fontSize="1.15rem" color={!item.bgcolor ? `primary300` : isColorLight(item.bgcolor) ? `#4d4b5f` : `#fff`}>
                  <FaCheckCircle />
                </Flex>
              )}
              <Text flex="1" noOfLines={1}>
                {item.title}
              </Text>
            </Flex>
            <Text noOfLines={1} fontSize="12px" minH="1.3rem">
              {item.end_date && moment(item.end_date).format(`DD/MM/YYYY`)}
            </Text>
          </Flex>
          {!!group && (
            <Flex align="center" gap="0.5rem">
              <AvatarList
                users={item.users.map((studentId) => group?.students.find((e) => e.id === studentId) as IHubUser).filter((e) => e)}
                max={4}
                showMessage={false}
              />
            </Flex>
          )}
        </Flex>
      )}
    </Draggable>
  );
};
