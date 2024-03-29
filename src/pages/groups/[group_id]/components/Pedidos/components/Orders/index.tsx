import moment from 'moment';
import { useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { Avatar, Badge, Flex, Text } from '@chakra-ui/react';

import { SmallModal } from '@/components/Modal/Small';
import { OrdersPageView } from '../..';
import { IHubGroup, IHubGroupOrder } from '@/_base/interfaces/group';
import { useAuth } from '@/_base/hooks';
import { GenericButton } from '@/components/Buttons/Generic';

interface IProps {
  onChangeView: (view: OrdersPageView) => void;
  onApproveOrder: (order: IHubGroupOrder) => void;
  onRejectOrder: (order: IHubGroupOrder) => void;
  canEdit: boolean;
  group: IHubGroup;
}

export const Orders: React.FC<IProps> = ({ onChangeView, group, onApproveOrder, canEdit, onRejectOrder }) => {
  const [order, setOrder] = useState<IHubGroupOrder | null>(null);

  const { user } = useAuth();

  const handleApprove = () => {
    if (!order) return;

    onApproveOrder(order);
    setOrder(null);
  };

  const handleReject = () => {
    if (!order) return;

    if (user.id === group.hub_user_id) onRejectOrder(order);
    setOrder(null);
  };

  return (
    <Flex direction="column" gap="1.5rem" overflow="auto" userSelect="none">
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
          fontWeight="600"
          color="gray700"
          boxShadow="sm"
          cursor={canEdit ? 'pointer' : 'not-allowed'}
          transition="all 0.1s"
          _hover={canEdit ? { filter: `brightness(0.92)` } : undefined}
          onClick={() => canEdit && onChangeView(`store`)}
        >
          <FaPlus />
          Novo Pedido
        </Flex>
      </Flex>

      {!!group.orders.filter((data) => !data.approved_at && !data.metadata.denied_at).length && (
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
          {group.orders
            .filter((data) => !data.approved_at && !data.metadata.denied_at)
            .map((order) => (
              <Flex key={order.id} w="100%" overflow="auto" direction="column" py="0.25rem">
                <Flex w="100%" justify="space-between" align="center">
                  <Flex align="center" gap="12px" w="14rem">
                    <Avatar
                      size="sm"
                      src="https://images.tcdn.com.br/img/img_prod/650361/10x_cabo_jumper_macho_x_femea_10_cm_de_20_unidades_cada_200_jumpers_no_total_1757_1_20200903185441.jpg"
                    ></Avatar>
                    <Badge bg="yellow.300" color="warning700">
                      {`Pedido ${order.readable_id}: Aguardando aprovação`}
                    </Badge>
                  </Flex>
                  <Flex color="warning500" fontSize="14px" flex="1" justify="center">
                    {moment(order.created_at).format(`DD/MM/YYYY`)}
                  </Flex>
                  <Flex w={user.role === `teacher` ? undefined : '12rem'} justify="flex-end" gap="0.75rem">
                    <GenericButton
                      label="Visualizar"
                      size="sm"
                      bg="success600"
                      color="white"
                      onClick={() => setOrder(order)}
                      _hover={{ filter: `brightness(0.9)` }}
                    />
                  </Flex>
                </Flex>
              </Flex>
            ))}
        </Flex>
      )}

      {!!group.orders.filter((data) => !!data.approved_at)?.length && (
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
          {group.orders
            .filter((data) => !!data.approved_at)
            .map((order) => (
              <Flex
                key={order.id}
                w="100%"
                h="auto"
                justify="space-between"
                align="center"
                p="0.25rem 0.5rem"
                borderRadius="5px"
                cursor="pointer"
                transition="all 0.1s"
                _hover={{ bg: `gray200` }}
                onClick={() => setOrder(order)}
              >
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
        title={!order?.approved_at ? 'Aprovar Pedido' : `Pedido aprovado em ${moment(order.approved_at).format(`DD/MM/YYYY`)}`}
        show={!!order}
        disableOkButton={!order?.approved_at && (user.role !== `teacher` || group.hub_user_id !== user.id)}
        onConfirm={() => (!order?.approved_at ? handleApprove() : setOrder(null))}
        okText={!order?.approved_at ? 'Aprovar' : 'OK'}
        cancelText={!order?.approved_at && user.id === group.hub_user_id ? 'Rejeitar' : undefined}
        onCancel={!order?.approved_at ? () => handleReject() : undefined}
        topIcon={'checked'}
        onCloseModal={() => setOrder(null)}
      >
        <Flex direction="column">
          {(order as any)?.student?.name && <Text mb="1rem">Feito por {(order as any).student?.name}</Text>}
          {order?.items.map((item) => (
            <Flex key={item.id} align="center" gap="0.35rem" borderBottom="1px" borderColor="gray200">
              <Text>{item.quantity}</Text>
              <Text flex="1">{item.store_item.name}</Text>
              <Text>R$ {item.store_item.price}</Text>
            </Flex>
          ))}
        </Flex>
      </SmallModal>
    </Flex>
  );
};
