import moment from 'moment';
import React, { useCallback, useState } from 'react';
import { Badge, Flex, Text, Avatar, Image, useColorMode } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import { SmallModal } from '@/components/Modal/Small';
import { HubOrderStatusType, hubOrderStatusTypes, IHubGroup, IHubGroupOrder } from '@/_base/interfaces/group';
import { useAuth } from '@/_base/hooks';
import { SelectInput } from '@/components/Inputs/Select';
import { formatCoin } from '@/_base/utils';

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
  const { colorMode } = useColorMode();

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

  // Cores dinâmicas
  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  // Variáveis de Animação
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const OrderColumn = ({
    title,
    color,
    orders,
  }: {
    title: string;
    color: 'orange' | 'green' | 'red';
    orders: IHubGroupOrder[];
  }) => {
    const colorMap = {
      orange: { border: '#F59E0B', text: '#D97706', bg: '#FFFBF0' },
      green: { border: '#10B981', text: '#059669', bg: '#F0FDF4' },
      red: { border: '#EF4444', text: '#DC2626', bg: '#FEF2F2' },
    };

    const colors = colorMap[color];

    return (
      <Flex
        direction="column"
        borderRadius="12px"
        border="1px"
        borderColor={borderColor}
        borderTopWidth="4px"
        borderTopColor={colors.border}
        p="1.5rem"
        flex="1"
        overflow="hidden auto"
        gap="1rem"
        bg={bgCard}
        minW="0"
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{ boxShadow: 'md' }}
      >
        {/* Header */}
        <Flex justify="space-between" align="center" pb="1rem" borderBottom="1px" borderColor={borderColor}>
          <Text fontSize="16px" fontWeight="700" color={colors.text}>
            {title}
          </Text>
          <Badge
            colorScheme={color}
            bg={colors.border}
            color="white"
            fontSize="12px"
            px="0.75rem"
            py="0.25rem"
            borderRadius="full"
          >
            {orders.length}
          </Badge>
        </Flex>

        {/* Orders List */}
        {orders.length ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((order) => (
                <motion.div key={order.id} variants={itemVariants}>
                  <Flex
                    direction="column"
                    gap="0.75rem"
                    p="1rem"
                    bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
                    borderRadius="8px"
                    border="1px"
                    borderColor={borderColor}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      bg: colorMode === 'light' ? 'gray.100' : 'gray.600',
                      borderColor: colors.border,
                      transform: 'translateY(-2px)',
                    }}
                    onClick={() => {
                      setOrder(order);
                      setStatus(order.metadata.status || `in_separation`);
                    }}
                  >
                    {/* Row 1: ID + Data */}
                    <Flex justify="space-between" align="center">
                      <Text fontSize="12px" fontWeight="700" color={colors.text}>
                        #{order.readable_id}
                      </Text>
                      <Text fontSize="11px" color="gray.500">
                        {moment(order.created_at).format(`DD MMM 'YY`)}
                      </Text>
                    </Flex>

                    {/* Row 2: Produtos */}
                    <Flex gap="1rem" direction="column">
                      {order.items.slice(0, 2).map((item) => (
                        <Flex key={item.id} gap="0.75rem" align="flex-start">
                          <Image
                            src={item.store_item.picture}
                            w="40px"
                            h="40px"
                            borderRadius="6px"
                            objectFit="cover"
                            flexShrink={0}
                          />
                          <Flex direction="column" flex="1" gap="0.25rem" minW="0">
                            <Text fontSize="12px" fontWeight="600" color={colorMode === 'dark' ? 'white' : 'gray.800'} noOfLines={1}>
                              {item.store_item.name}
                            </Text>
                            <Text fontSize="11px" color="gray.500">
                              {item.quantity} × R$ {item.store_item.price}
                            </Text>
                          </Flex>
                        </Flex>
                      ))}
                      {order.items.length > 2 && (
                        <Text fontSize="11px" color="gray.500" fontStyle="italic">
                          +{order.items.length - 2} item{order.items.length - 2 > 1 ? 'ns' : ''}
                        </Text>
                      )}
                    </Flex>

                    {/* Row 3: Solicitante + Valor */}
                    <Flex justify="space-between" align="center" pt="0.5rem" borderTop="1px" borderColor={borderColor}>
                      <Text fontSize="11px" color="gray.500">
                        por <span style={{ fontWeight: 600, color: colorMode === 'dark' ? '#E2E8F0' : '#374151' }}>{order.student?.name}</span>
                      </Text>
                      <Text fontSize="13px" fontWeight="700" color={colors.text}>
                        R$ {order.total}
                      </Text>
                    </Flex>
                  </Flex>
                </motion.div>
              ))}
          </motion.div>
        ) : (
          <Flex justify="center" align="center" minH="100px">
            <Text fontSize="14px" color="gray.500" fontStyle="italic">
              Nenhum pedido
            </Text>
          </Flex>
        )}
      </Flex>
    );
  };

  return (
    <motion.div
      key={'Orders'}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: `flex`, overflow: `auto`, flexDirection: `column`, userSelect: `none`, height: `100%`, width: '100%' }}
    >
      <Flex w="100%" h="100%" gap="2rem" flex="1" align="stretch" p="1.5rem" pb="0" overflow="auto">
        {/* Pendentes */}
        <OrderColumn
          title="Pendentes"
          color="orange"
          orders={groups
            .flatMap((e) => e.orders.map((o) => ({ ...o, group: e })))
            .filter((data) => !data.approved_at && !data.metadata.denied_at) as any}
        />

        {/* Aprovados */}
        <OrderColumn
          title="Aprovados"
          color="green"
          orders={groups.flatMap((e) => e.orders.map((o) => ({ ...o, group: e }))).filter((data) => !!data.approved_at) as any}
        />

        {/* Negados */}
        <OrderColumn
          title="Negados"
          color="red"
          orders={groups
            .flatMap((e) => e.orders.map((o) => ({ ...o, group: e })))
            .filter((data) => !!data.metadata.denied_at) as any}
        />
      </Flex>

      {/* Modal */}
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
