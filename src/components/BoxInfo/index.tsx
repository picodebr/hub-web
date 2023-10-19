import { Flex, FlexProps, Stat, StatArrow, StatHelpText, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface IBoxInfoProps extends FlexProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  stat?: { value: string; type: 'increase' | 'decrease'; color?: string };
}

export const BoxInfo: React.FC<IBoxInfoProps> = ({ label, value, icon, stat, ...rest }) => {
  return (
    <Flex
      direction="column"
      flex="1"
      border="1px"
      borderColor="gray.200"
      h="fit-content"
      maxW="11.5rem"
      maxH="11.5rem"
      borderRadius="0.5rem"
      bg="bg.white"
      transition="all 0.185s"
      _hover={{ boxShadow: 'md' }}
      {...rest}
    >
      <Flex align="center" gap="0.5rem" padding="0.5rem">
        {!!icon && (
          <Flex borderRadius="50%" w="3rem" h="3rem" bg="gray.50" align="center" justify="center" fontSize="1.5rem" color="primaryLight">
            {icon}
          </Flex>
        )}
        <Flex direction="column" flex="1" color="gray.400" fontWeight="600" fontSize="1.1rem">
          {label}
          {!!stat && (
            <Stat>
              <StatHelpText>
                <StatArrow type={stat.type} color={stat.color} />
                {stat.value}
              </StatHelpText>
            </Stat>
          )}
        </Flex>
      </Flex>
      <Text flex="1" color="gray.600" fontSize="1.575rem" textAlign="center" fontWeight="600" paddingBottom="0.5rem">
        {value}
      </Text>
    </Flex>
  );
};
