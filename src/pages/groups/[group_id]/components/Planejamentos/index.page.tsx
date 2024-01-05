import { Button, Flex, Text } from '@chakra-ui/react';

type PageStepsType = 'kanban' | 'ganttChart' | 'budget';

interface IProps {}

export const Planning: React.FC<IProps> = () => {
  return (
    <Flex w="100%" h="100%">
      <Flex w="100%" h="400px" bg="white" border="1px" borderColor="gray300" borderRadius="10px" padding="20px" gap="50px">
        <Text>Bem vindo(a) aos planejamentos</Text>
        <Flex display="flex" direction="column" gap="10px">
          <Button>Kanban</Button>
          <Button>Gráfico de Gantt</Button>
          <Button>Orçamentos</Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
