import { SmallModal } from '@/components/Modal/Small';
import { Avatar, Badge, Button, Flex, Text } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa6';
import { OrdersPageView } from '../..';
import { IHubGroup, IHubGroupOrder } from '@/_base/interfaces/group';
import moment from 'moment';
import { useState } from 'react';
import { useAuth } from '@/_base/hooks';

interface IProps {
  onChangeView: (view: OrdersPageView) => void;
  onApproveOrder: (order: IHubGroupOrder) => void;
  group: IHubGroup;
}

export const Orders: React.FC<IProps> = ({ onChangeView, group, onApproveOrder }) => {
  const [order, setOrder] = useState<IHubGroupOrder | null>(null);

  const { user } = useAuth();

  const handleApprove = () => {
    if (!order) return;

    onApproveOrder(order);
    setOrder(null);
  };

  return (
    <Flex direction="column" gap="1.5rem" overflow="auto">
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
          transition="all 0.1s"
          _hover={{ filter: `brightness(0.92)` }}
          onClick={() => onChangeView(`store`)}
        >
          <FaPlus />
          Novo Pedido
        </Flex>
      </Flex>

      {!!group.student_links
        .flatMap((data) => data.metadata.orders?.map((o) => ({ ...o, student: data.user })) || [])
        .filter((data) => !data.approved_at).length && (
        <Flex
          direction="column"
          borderRadius="10px"
          h="fit-content"
          border="1px"
          p="1rem"
          borderColor="gray300"
          overflow="hidden"
          gap="1rem"
          bgColor="warning25"
        >
          {group.student_links
            .flatMap((data) => data.metadata.orders?.map((o) => ({ ...o, student: data.user })) || [])
            .filter((data) => !data.approved_at)
            .map((order) => (
              <Flex
                key={order.id}
                w="100%"
                overflow="auto"
                direction="column"
                _hover={{
                  boxShadow: `md`,
                }}
              >
                <Flex w="100%" justify="space-between" align="center">
                  <Flex align="center" gap="12px" w="14rem">
                    <Avatar
                      size="sm"
                      src="https://images.tcdn.com.br/img/img_prod/650361/10x_cabo_jumper_macho_x_femea_10_cm_de_20_unidades_cada_200_jumpers_no_total_1757_1_20200903185441.jpg"
                    ></Avatar>
                    <Text color="warning700" fontWeight="500">
                      Solicitação de compra
                    </Text>
                  </Flex>
                  <Flex color="warning500" fontSize="14px" flex="1" justify="center">
                    {moment(order.created_at).format(`DD/MM/YYYY`)}
                  </Flex>
                  <Flex w={user.role === `teacher` ? undefined : '12rem'} justify="flex-end" gap="0.75rem">
                    {user.role === `teacher` ? (
                      <>
                        <Button bg="success600" color="white" onClick={() => setOrder(order)}>
                          Aprovar
                        </Button>
                        <Button bg="white" color="gray700" border="1px" borderColor="gray300">
                          Recusar
                        </Button>
                      </>
                    ) : (
                      <Badge bg="yellow.300" color="yellow.700">
                        Aguardando aprovação
                      </Badge>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            ))}
        </Flex>
      )}

      {!!group.student_links.flatMap((data) => data.metadata.orders || []).filter((data) => !!data.approved_at)?.length && (
        <Flex
          w="100%"
          h="auto"
          p="1rem"
          display="flex"
          direction="column"
          bg="white"
          borderRadius="10px"
          border="1px"
          borderColor="gray300"
          gap="1rem"
        >
          {group.student_links
            .flatMap((data) => data.metadata.orders?.map((o) => ({ ...o, student: data.user })) || [])
            .filter((data) => !!data.approved_at)
            .map((order) => (
              <Flex key={order.id} w="100%" h="auto" justify="space-between" align="center">
                <Flex align="center" gap="12px" w="14rem">
                  <Avatar size="sm" src="https://www.makerhero.com/wp-content/uploads/2017/07/1AC01-9-1-min.jpeg"></Avatar>
                  <Text color="gray700" fontWeight="500">
                    Pedido solicitado
                  </Text>
                </Flex>
                <Flex color="gray500" fontSize="14px" flex="1" justify="center">
                  {moment(order.created_at).format(`DD/MM/YYYY`)}
                </Flex>
                <Flex w="12rem" justify="flex-end">
                  <Badge bg="yellow.300" color="yellow.700">
                    Em separação
                  </Badge>
                </Flex>
              </Flex>
            ))}
        </Flex>
      )}
      <SmallModal
        size="lg"
        title="Aprovar Pedido"
        show={!!order}
        onConfirm={handleApprove}
        okText="Aprovar"
        onCancel={() => setOrder(null)}
        topIcon={'checked'}
      >
        <Flex direction="column">
          {(order as any)?.student?.name && <Text mb="1rem">Feito por {(order as any).student?.name}</Text>}
          {order?.items.map((item) => (
            <Flex key={item.id} align="center" gap="0.35rem" borderBottom="1px" borderColor="gray200">
              <Text>{item.quantity}</Text>
              <Text flex="1">{item.name}</Text>
              <Text>R$ {item.price}</Text>
            </Flex>
          ))}
        </Flex>
      </SmallModal>
    </Flex>
  );
};
