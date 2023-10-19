import { Flex, StackDivider, Tooltip, VStack } from '@chakra-ui/react';

import { ISimpleFormProps } from './interfaces';

export const SimpleForm: React.FC<ISimpleFormProps> = ({ items, itemHeight }) => {
  return (
    <Flex direction="column" rowGap="1rem" w="100%">
      <VStack
        divider={<StackDivider borderColor="gray.300" />}
        spacing={0}
        align="stretch"
        border="1px solid"
        borderColor="gray.300"
        borderRadius="md"
        overflow="hidden"
      >
        {items.map((item, index) => (
          <Flex minH={itemHeight || '3rem'} key={`${index}`}>
            <Flex
              padding="0 1rem"
              align="center"
              flex="1"
              borderRight="1px solid"
              borderRightColor="gray.300"
              color="black.100"
              bg="gray.50"
              _after={item.required ? { content: '"*"', color: 'red.500', paddingLeft: '0.15rem' } : {}}
            >
              {item.label}
            </Flex>
            <Tooltip isDisabled={!item.tooltip} placement="left" closeOnClick={false} hasArrow {...(item.tooltip || {})}>
              <Flex padding="0 1rem" align="center" flex="2" bg="white">
                {item.children}
              </Flex>
            </Tooltip>
          </Flex>
        ))}
      </VStack>
    </Flex>
  );
};
