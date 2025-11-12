import moment from 'moment';
import React, { useCallback, useState } from 'react';
import { Badge, Flex, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import { SmallModal } from '@/components/Modal/Small';
import { HubOrderStatusType, hubOrderStatusTypes, IHubGroup, IHubGroupOrder } from '@/_base/interfaces/group';
import { useAuth } from '@/_base/hooks';
import { SelectInput } from '@/components/Inputs/Select';

interface IProps {
  onApproveOrder: (order: IHubGroupOrder) => void;
  onRejectOrder: (order: IHubGroupOrder) => void;
  onChangeStatus: (order: IHubGroupOrder) => void;
  groups: IHubGroup[];
}

const LABEL_STATUSES: Record<HubOrderStatusType, string> = {
  in_separation: 'Em separação',
  waiting_group: 'Aguardando retirada',
  delivered: 'Entregue',
  forgotten: 'Esquecido',
};
const COLOR_STATUSES: Record<HubOrderStatusType, string> = {
  in_separation: 'yellow',
  waiting_group: 'green',
  delivered: 'blue',
  forgotten: 'gray',
};

export const Orders: React.FC<IProps> = ({ groups, onApproveOrder, onRejectOrder, onChangeStatus }) => {
  const [order, setOrder] = useState<IHubGroupOrder | null>(null);
  const [status, setStatus] = useState<HubOrderStatusType | null>(null);

  const { user } = useAuth();

  const handleStatusChange = useCallback(() => {
    if (!order || !status) return;
    onChangeStatus({ ...order, metadata: { ...order.metadata, status } });
    setOrder(null);
    setStatus(null);
  }, [status]);

  const handleApprove = () => {
    if (!order) return;

    onApproveOrder(order);
    setOrder(null);
  };

  const handleReject = () => {
    if (!order) return;

    if (user.id === order.group.project?.user_id) onRejectOrder(order);
    setOrder(null);
  };

  return (
    <motion.div
      key={'Orders'}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: `flex`, overflow: `auto`, flexDirection: `column`, userSelect: `none`, height: `100%` }}
    >
      <Flex w="100%" h="100%" gap="1.5rem" flex="1" align="stretch">
        {/* Pendentes */}
        <Flex
          direction="column"
          borderRadius="10px"
          border="1px"
          p="1rem"
          flex="1"
          borderColor="gray300"
          overflow="hidden auto"
          gap="1rem"
          bgColor="warning25"
          minW="0"
        >
          <Text fontSize="18px" fontWeight="700" color="warning700" mb="0.5rem">
            Pendentes
          </Text>
          {groups.flatMap((e) => e.orders.map((o) => ({ ...o, group: e }))).filter((data) => !data.approved_at && !data.metadata.denied_at).length ? (
            groups
              .flatMap((e) => e.orders.map((o) => ({ ...o, group: e })))
              .filter((data) => !data.approved_at && !data.metadata.denied_at)
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
                  onClick={() => {
                    setOrder(order);
                    setStatus(order.metadata.status || `in_separation`);
                  }}
                >
                  <Flex align="center" gap="12px" w="14rem">
                    <Flex position="relative" minW="45px" h="45px" align="center">
                      {order.items.slice(0, 3).map((item, idx, arr) => {
                        // Posições: 0 = topo centro, 1 = canto inf. esq., 2 = canto inf. dir.
                        const style: React.CSSProperties = {
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          border: '2px solid #fff',
                          objectFit: 'cover',
                          position: 'absolute',
                          background: '#eee',
                        };
                        if (arr.length <= 1) {
                          style.top = 8;
                        } else if (idx === 0) {
                          style.top = 0;
                          style.left = '50%';
                          style.transform = 'translateX(-50%)';
                          style.zIndex = 3;
                        } else if (idx === 1) {
                          style.bottom = 0;
                          style.left = 0;
                          style.zIndex = 2;
                        } else if (idx === 2) {
                          style.bottom = 0;
                          style.right = 0;
                          style.zIndex = 1;
                        }
                        return <img key={item.id} src={item.store_item.picture} alt={item.store_item.name} style={style} />;
                      })}
                    </Flex>
                    <Text color="gray700" fontSize="13px" fontWeight="500">
                      {`Pedido ${order.readable_id}`}
                    </Text>
                  </Flex>
                  <Flex color="warning500" fontSize="13px" flex="1" justify="center">
                    {moment(order.created_at).format(`DD/MM/YYYY`)}
                  </Flex>
                  <Flex justify="flex-end" pl="0.5rem">
                    <Badge fontSize="10px" bg="yellow.300" color="warning700" p="0.25rem" borderRadius="md">
                      Aguardando aprovação
                    </Badge>
                  </Flex>
                </Flex>
              ))
          ) : (
            <Text fontSize="16px" fontWeight="500" color="warning700">
              Não há pedidos pendentes
            </Text>
          )}
        </Flex>
        {/* Aprovados */}
        <Flex
          direction="column"
          borderRadius="10px"
          border="1px"
          p="1rem"
          flex="1"
          borderColor="gray300"
          overflow="hidden auto"
          gap="1rem"
          bg="white"
          minW="0"
        >
          <Text fontSize="18px" fontWeight="700" color="green.700" mb="0.5rem">
            Aprovados
          </Text>
          {groups.flatMap((e) => e.orders.map((o) => ({ ...o, group: e }))).filter((data) => !!data.approved_at).length ? (
            groups
              .flatMap((e) => e.orders.map((o) => ({ ...o, group: e })))
              .filter((data) => !!data.approved_at)
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
                    <Flex position="relative" minW="45px" h="45px" align="center" justify="center">
                      {order.items.slice(0, 3).map((item, idx, arr) => {
                        // Posições: 0 = topo centro, 1 = canto inf. esq., 2 = canto inf. dir.
                        const style: React.CSSProperties = {
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          border: '2px solid #fff',
                          objectFit: 'cover',
                          position: 'absolute',
                          background: '#eee',
                        };
                        if (arr.length <= 1) {
                          style.top = 8;
                        } else if (idx === 0) {
                          style.top = 0;
                          style.left = '50%';
                          style.transform = 'translateX(-50%)';
                          style.zIndex = 3;
                        } else if (idx === 1) {
                          style.bottom = 0;
                          style.left = 0;
                          style.zIndex = 2;
                        } else if (idx === 2) {
                          style.bottom = 0;
                          style.right = 0;
                          style.zIndex = 1;
                        }
                        return <img key={item.id} src={item.store_item.picture} alt={item.store_item.name} style={style} />;
                      })}
                    </Flex>
                    <Text color="gray700" fontSize="13px" fontWeight="500">
                      {`Pedido ${order.readable_id}`}
                    </Text>
                  </Flex>
                  <Flex color="gray500" fontSize="13px" flex="1" justify="center">
                    {moment(order.created_at).format(`DD/MM/YYYY`)}
                  </Flex>
                  <Flex w="12rem" justify="flex-end">
                    <Badge
                      fontSize="10px"
                      p="0.25rem"
                      borderRadius="md"
                      bg={`${COLOR_STATUSES[order.metadata?.status || 'in_separation']}.300`}
                      color={`${COLOR_STATUSES[order.metadata?.status || 'in_separation']}.700`}
                    >
                      {/* Exibe o status customizado se existir, senão 'Em separação' */}
                      {LABEL_STATUSES[order.metadata?.status || `in_separation`]}
                    </Badge>
                  </Flex>
                </Flex>
              ))
          ) : (
            <Text fontSize="16px" fontWeight="500" color="gray700">
              Não há pedidos aprovados
            </Text>
          )}
        </Flex>
        {/* Negados */}
        <Flex
          direction="column"
          borderRadius="10px"
          border="1px"
          p="1rem"
          flex="1"
          borderColor="gray300"
          overflow="hidden auto"
          gap="1rem"
          bg="red.50"
          minW="0"
        >
          <Text fontSize="18px" fontWeight="700" color="red.700" mb="0.5rem">
            Negados
          </Text>
          {groups.flatMap((e) => e.orders.map((o) => ({ ...o, group: e }))).filter((data) => !!data.metadata.denied_at).length ? (
            groups
              .flatMap((e) => e.orders.map((o) => ({ ...o, group: e })))
              .filter((data) => !!data.metadata.denied_at)
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
                    <Flex position="relative" minW="45px" h="45px" align="center">
                      {order.items.slice(0, 3).map((item, idx, arr) => {
                        // Posições: 0 = topo centro, 1 = canto inf. esq., 2 = canto inf. dir.
                        const style: React.CSSProperties = {
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          border: '2px solid #fff',
                          objectFit: 'cover',
                          position: 'absolute',
                          background: '#eee',
                        };
                        if (arr.length <= 1) {
                          style.top = 8;
                        } else if (idx === 0) {
                          style.top = 0;
                          style.left = '50%';
                          style.transform = 'translateX(-50%)';
                          style.zIndex = 3;
                        } else if (idx === 1) {
                          style.bottom = 0;
                          style.left = 0;
                          style.zIndex = 2;
                        } else if (idx === 2) {
                          style.bottom = 0;
                          style.right = 0;
                          style.zIndex = 1;
                        }
                        return <img key={item.id} src={item.store_item.picture} alt={item.store_item.name} style={style} />;
                      })}
                    </Flex>
                    <Text color="gray700" fontSize="13px" fontWeight="500">
                      {`Pedido ${order.readable_id}`}
                    </Text>
                  </Flex>
                  <Flex color="red.500" fontSize="13px" flex="1" justify="center">
                    {order.metadata.denied_at ? moment(order.metadata.denied_at).format(`DD/MM/YYYY`) : '-'}
                  </Flex>
                  <Flex w="12rem" justify="flex-end">
                    <Badge fontSize="10px" bg="red.300" color="red.700" p="0.25rem" borderRadius="md">
                      Negado
                    </Badge>
                  </Flex>
                </Flex>
              ))
          ) : (
            <Text fontSize="16px" fontWeight="500" color="red.700">
              Não há pedidos negados
            </Text>
          )}
        </Flex>
      </Flex>
      <SmallModal
        size="lg"
        title={`${order?.group.display_name} - ${
          !order?.approved_at && !order?.metadata?.denied_at
            ? 'Aprovar Pedido'
            : order?.approved_at
              ? `Pedido aprovado em ${moment(order.approved_at).format(`DD/MM/YYYY`)}`
              : order?.metadata?.denied_at
                ? `Pedido negado em ${moment(order.metadata.denied_at).format(`DD/MM/YYYY`)}`
                : ''
        }`}
        show={!!order}
        disableOkButton={
          !order?.approved_at && !order?.metadata?.denied_at && (user.role !== `teacher` || order?.group?.project?.user_id !== user.id)
        }
        onConfirm={() => (!order?.approved_at && !order?.metadata?.denied_at ? handleApprove() : status ? handleStatusChange() : setOrder(null))}
        okText={!order?.approved_at && !order?.metadata?.denied_at && user.id === order?.group?.project?.user_id ? 'Aprovar' : 'OK'}
        cancelText={!order?.approved_at && !order?.metadata?.denied_at && user.id === order?.group?.project?.user_id ? 'Rejeitar' : undefined}
        onCancel={!order?.approved_at && !order?.metadata?.denied_at && user.id === order?.group?.project?.user_id ? () => handleReject() : undefined}
        topIcon={order?.approved_at ? 'checked' : order?.metadata?.denied_at ? 'warning' : 'checked'}
        onCloseModal={() => {
          setOrder(null);
          setStatus(null);
        }}
      >
        <Flex direction="column">
          {(order as any)?.student?.name && <Text mb="1rem">Feito por {(order as any).student?.name}</Text>}
          {order?.items.map((item) => (
            <Flex key={item.id} align="center" gap="0.35rem" borderBottom="1px" borderColor="gray200">
              <Text>{item.quantity}</Text>
              <Text flex="1">{item.store_item.name}</Text>
              <Text>R$ {order.metadata?.is_resale ? order.total : item.store_item.price}</Text>
            </Flex>
          ))}
          {/* Se for pedido aprovado, e o professor pertencer ao grupo, mostra o select de status */}
          {order?.approved_at && !order?.metadata?.denied_at && user.id === order?.group?.project?.user_id && (
            <Flex mt="1.5rem" direction="column" gap="0.5rem" minH="15rem">
              <Text fontWeight="500">Status do pedido:</Text>
              <SelectInput
                instanceId="order-status-select"
                options={hubOrderStatusTypes.map((status) => ({ value: status, label: LABEL_STATUSES[status] }))}
                initialValue={[
                  {
                    value: order.metadata?.status || 'in_separation',
                    label: LABEL_STATUSES[order.metadata?.status as HubOrderStatusType] || LABEL_STATUSES['in_separation'],
                  },
                ]}
                onSelectChange={([value]) => setStatus(value as HubOrderStatusType)}
                placeholder="Selecione o status"
                isMultiSelect={false}
                maxMenuHeight={200}
                styles={{ menu: (provided: any) => ({ ...provided, zIndex: 9999 }) }}
              />
            </Flex>
          )}
        </Flex>
      </SmallModal>
    </motion.div>
  );
};
