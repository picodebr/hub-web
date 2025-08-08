import { Flex, HTMLChakraProps } from '@chakra-ui/react';
import { ITabSwitchProps } from './interfaces';

export const TabSwitch: React.FC<ITabSwitchProps & Partial<HTMLChakraProps<'div'>>> = ({
  tabs,
  onSwitch,
  currentTabColor = 'primary300',
  direction = `row`,
  ...rest
}) => {
  return (
    <Flex
      minH="52px"
      maxH={direction === `row` ? '52px' : undefined}
      h="fit-content"
      border="1px"
      borderColor="gray300"
      align="center"
      padding="0.65rem"
      bg="white"
      w="fit-content"
      borderRadius="lg"
      gap="0.65rem"
      userSelect="none"
      direction={direction}
      overflow="auto hidden"
      sx={{
        '&::-webkit-scrollbar': {
          height: '3px',
        },
        '&::-webkit-scrollbar-track': {
          margin: '0 1rem',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#C1DCFF',
          borderRadius: '24px',
        },
      }}
      {...rest}
    >
      {tabs.map((tab) => (
        <Flex
          key={tab.key}
          bg={tab.isSelected ? currentTabColor : 'transparent'}
          color={tab.isSelected ? 'white' : 'gray700'}
          padding="0.35rem 1rem"
          borderRadius="lg"
          fontWeight="500"
          w={direction === `row` ? 'fit-content' : `100%`}
          cursor="pointer"
          onClick={() => onSwitch(tab.key)}
          _hover={!tab.isSelected ? { bg: 'gray100' } : undefined}
        >
          {tab.label}
        </Flex>
      ))}
    </Flex>
  );
};
