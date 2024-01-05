import { Avatar, Button, Divider, Flex, Text } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';

interface IProps {}

export const GroupRequests: React.FC<IProps> = () => {
  return (
    <Flex direction="column" gap="24px" overflow="auto">
      <Flex align="center" justify="flex-end" h="fit-content">
        <Flex
          bgColor="white"
          w="fit-content"
          h="fit-content"
          border="1px"
          borderColor="gray300"
          padding="8px 14px"
          align="center"
          gap="8px"
          borderRadius="8px"
          fontSize="16px"
          fontWeight="600"
          color="gray700"
          boxShadow="sm"
          cursor="pointer"
        >
          <FaPlus />
          Novo Pedido
        </Flex>
      </Flex>
      <Flex w="100%" overflow="auto" direction="column" gap="24px" bgColor="warning25" borderRadius="10px" boxShadow="md">
        <Flex w="100%" h="108px" p="12px 32px" justify="space-between" align="center">
          <Flex align="center" gap="12px">
            <Avatar
              size="sm"
              src="https://images.tcdn.com.br/img/img_prod/650361/10x_cabo_jumper_macho_x_femea_10_cm_de_20_unidades_cada_200_jumpers_no_total_1757_1_20200903185441.jpg"
            ></Avatar>
            <Text color="warning700" fontWeight="500">
              Solicitação de compra
            </Text>
          </Flex>
          <Flex color="warning500" fontSize="14px">
            19/11/2023
          </Flex>
          <Flex h="100%" align="center" gap="12px">
            <Button bg="success600" color="white">
              Aprovar
            </Button>
            <Button bg="white" color="gray700" border="1px" borderColor="gray300">
              Recusar
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300">
        <Flex w="100%" h="auto" p="12px" justify="space-between" align="center">
          <Flex align="center" gap="12px">
            <Avatar size="sm" src="https://www.makerhero.com/wp-content/uploads/2017/07/1AC01-9-1-min.jpeg"></Avatar>
            <Text color="gray700" fontWeight="500">
              Compra realizada
            </Text>
          </Flex>
          <Flex color="gray500" fontSize="14px">
            19/11/2023
          </Flex>
        </Flex>
        <Divider></Divider>
        <Flex w="100%" h="auto" p="12px" justify="space-between" align="center">
          <Flex align="center" gap="12px">
            <Avatar size="sm" src="https://www.makerhero.com/wp-content/uploads/2017/07/1AC01-9-1-min.jpeg"></Avatar>
            <Text color="gray700" fontWeight="500">
              Compra realizada
            </Text>
          </Flex>
          <Flex color="gray500" fontSize="14px">
            21/10/2023
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
