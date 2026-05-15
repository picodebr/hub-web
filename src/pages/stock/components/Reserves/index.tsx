import { Flex, Grid, Text, Image, Tooltip } from '@chakra-ui/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

import { IHubGroup, IHubGroupOrder, IHubGroupOrderItem, IHubGroupOrderItemMetadata } from '@/_base/interfaces/group';
import { SmallModal } from '@/components/Modal/Small';
import { IStoreMakerItem } from '@/_base/interfaces/storeMaker';
import { useAsyncCallback, useAuth, useCustomToast } from '@/_base/hooks';
import { NumberInput } from '@/components/Inputs/Number';
import { formatCurrency, formatDateInput } from '@/_base/utils';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { TabSwitch } from '@/components/TabSwitch';
import { DateInput } from '@/components/Inputs/Date';
import { updateOrderItem } from '@/_base/services/group';
import { FaCheckDouble } from 'react-icons/fa6';

type CustomStoreItem = IStoreMakerItem &
  IHubGroupOrderItem &
  IHubGroupOrder & {
    hub_group_order_item_id: string;
    consumed_at?: Date | null;
    consumed_quantity?: number;
    order_item_metadata: IHubGroupOrderItemMetadata;
    order_item_id: string;
    order_id: string;
    group: IHubGroup;
  };

interface IProps {
  groups: IHubGroup[];
  refreshStock: () => void;
}

export const Reserves: React.FC<IProps> = ({ groups, refreshStock }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [itemToUpdate, setItemToUpdate] = useState<CustomStoreItem | null>(null);
  const [tab, setTab] = useState<'consumables' | 'services'>('services');

  const { user } = useAuth();

  const storeMakerList = groups
    .flatMap((e) => e.orders.map((o) => ({ ...o, group: e })))
    .filter((o) => !!o.approved_at)
    .flatMap((order) =>
      order.items.map((orderItem) => ({
        ...order,
        ...orderItem,
        ...orderItem.store_item,
        hub_group_order_item_id: orderItem.id,
        order_item_metadata: orderItem.metadata,
        order_id: order.id,
        order_item_id: orderItem.id,
        group: order.group,
      })),
    )
    .reduce((acc, v) => {
      if (!v.quantity) return acc;
      const target = acc.find((e) => e.id === v.id);
      if (target) target.quantity += v.quantity || 1;
      else acc.push(v as CustomStoreItem);

      return acc;
    }, [] as CustomStoreItem[]);

  // Separar itens por tipo
  const consumableItems = storeMakerList.filter((item) => !item.store_item?.metadata?.is_service);
  const serviceItems = storeMakerList.filter((item) => !!item.store_item?.metadata?.is_service);
  const tabList = [
    { key: 'services', label: 'Serviços', isSelected: tab === 'services' },
    { key: 'consumables', label: 'Consumíveis', isSelected: tab === 'consumables' },
  ];

  const toast = useCustomToast();

  const handleUpdateItem = useAsyncCallback(
    async () => {
      if (!itemToUpdate) return;
      if (!((itemToUpdate?.quantity || 0) - (itemToUpdate?.order_item_metadata?.service_consumed_quantity || 0))) return;
      setIsLoading(true);
      await updateOrderItem({
        item_id: itemToUpdate.order_item_id,
        order_id: itemToUpdate.order_id,
        service_consumed_at: itemToUpdate.consumed_at,
        service_consumed_quantity: itemToUpdate.consumed_quantity,
      });
      refreshStock();
      handleCloseModal();
      toast({ status: `success`, title: `Consumo do item atualizado`, position: `top` });
    },
    [itemToUpdate],
    true,
    () => setIsLoading(false),
  );

  const handleCloseModal = () => {
    setItemToUpdate(null);
  };

  return (
    <motion.div
      key={'GroupItems'}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: `flex`, width: `100%`, height: `100%` }}
    >
      <Flex direction="column" gap="1.5rem" flex="1">
        <Flex gap="1rem" flex="1" direction={{ base: `column-reverse`, lg: `row` }}>
          <Flex
            flex="1"
            bgColor="white"
            direction="column"
            borderRadius="12px"
            p="0.5rem"
            textAlign="left"
            display="flex"
            border="1px"
            gap="0.5rem"
            borderColor="gray200"
            transition="ease-in-out 0.3s"
          >
            <Flex justify="center">
              <TabSwitch tabs={tabList} onSwitch={(key) => setTab(key as 'consumables' | 'services')} currentTabColor="primary700" border="none" />
            </Flex>
            <Flex
              flex="1"
              bgColor="white"
              flexDirection="row"
              padding="0.5rem"
              gap="0.5rem"
              textAlign="left"
              display="flex"
              p="1rem"
              borderTop="1px"
              borderColor="gray200"
              transition="ease-in-out 0.3s"
            >
              {tab === 'consumables' && !consumableItems.length ? (
                <Flex w="100%" textAlign="center" justify="center" h="100%" pt="2rem">
                  <Text>Nenhum item encontrado.</Text>
                </Flex>
              ) : tab === 'services' && !serviceItems.length ? (
                <Flex w="100%" textAlign="center" justify="center" h="100%" pt="2rem">
                  <Text>Nenhum item encontrado.</Text>
                </Flex>
              ) : (
                <Grid
                  gap="1rem"
                  gridTemplateColumns={{ base: 'repeat(auto-fill, minmax(12rem, 1fr))', lg: 'repeat(auto-fill, minmax(14rem, 1fr))' }}
                  gridTemplateRows="minmax(min-content, max-content)"
                  borderRadius="md"
                  flex="1"
                  overflow="hidden auto"
                >
                  {(tab === 'consumables' ? consumableItems : serviceItems).map((item, i) => (
                    <Flex
                      key={`${item.id} - ${i}`}
                      direction="column"
                      gap="0.5rem"
                      cursor="pointer"
                      fontWeight="500"
                      color="gray700"
                      fontSize="14px"
                      align="center"
                      justify="space-between"
                      height={{ base: `15.5rem`, lg: '17.5rem' }}
                      width={{ base: `13rem`, lg: '15rem' }}
                      border="1px"
                      borderColor="gray300"
                      pb="0.5rem"
                      borderRadius="md"
                      overflow="hidden"
                      position="relative"
                    >
                      {!((item?.quantity || 0) - (item?.order_item_metadata?.service_consumed_quantity || 0)) && (
                        <Flex position="absolute" top="0.5rem" right="0.5rem" color="primary300">
                          <FaCheckDouble fontSize="20px" />
                        </Flex>
                      )}
                      <Tooltip label={item.name}>
                        <Image src={item.picture} maxHeight={{ base: `8rem`, lg: `10rem` }} />
                      </Tooltip>
                      <Flex display="flex" align="center" w="100%" h="4.35rem">
                        <Flex direction="column" gap="0.75rem" justify="space-between" h="100%" overflow="hidden" flex="1">
                          <Text noOfLines={2} px="0.5rem" flex="1" fontSize="13px">
                            {item.name}
                          </Text>
                          <Text noOfLines={1} px="0.5rem" h="min-content" py="0" fontWeight="400" fontSize="11px">
                            {`${item.quantity || 0} ${item.store_item?.metadata?.is_service ? 'reserva' : 'unidade'}`.concat(
                              item.quantity === 1 ? `` : `s`,
                            )}
                          </Text>
                        </Flex>
                        <Flex direction="column" justify="space-between" align="flex-end" h="100%" flex="1">
                          <Text px="0.5rem" fontSize="12px" fontWeight="400" whiteSpace="nowrap" textAlign="right">
                            {item.group.display_name}
                          </Text>
                          <Flex align="center" gap="0.5rem" flex="1">
                            <Image src="/icons/coin.svg" />
                            <Text noOfLines={1} px="0.5rem" flex="1" fontWeight="400">
                              {formatCurrency(item.quantity * Number(item.price))}
                            </Text>
                          </Flex>
                          <Text noOfLines={1} px="0.5rem" fontWeight="400" fontSize="10px">
                            {`${formatCurrency(item.price)} / ${item.store_item?.metadata?.is_service ? 'reserva' : 'unidade'}`}
                          </Text>
                        </Flex>
                      </Flex>
                      {!!item.store_item?.metadata?.is_service && (
                        <Flex>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.75 }}
                            style={{
                              display: `flex`,
                              background: (item?.quantity || 0) - (item?.order_item_metadata?.service_consumed_quantity || 0) ? `#3356B7` : `#05AD7D`,
                              color: `#fff`,
                              borderRadius: `6px`,
                              padding: `0.15rem 0.75rem`,
                              alignItems: `center`,
                              gap: `0.15rem`,
                            }}
                            onClick={() => {
                              setItemToUpdate(item);
                            }}
                          >
                            {item.store_item?.metadata?.is_service ? <FaCheckDouble fontSize="16px" /> : <MdOutlineShoppingCart fontSize="16px" />}

                            {item.store_item?.metadata?.is_service
                              ? !!((item?.quantity || 0) - (item?.order_item_metadata?.service_consumed_quantity || 0))
                                ? `Atualizar`
                                : `Finalizado`
                              : `Vender`}
                          </motion.button>
                        </Flex>
                      )}
                    </Flex>
                  ))}
                </Grid>
              )}
            </Flex>
          </Flex>

          {/* Update Order Item Modal */}
          <SmallModal
            title={itemToUpdate?.name}
            show={!!itemToUpdate}
            onConfirm={handleUpdateItem}
            onCloseModal={() => setItemToUpdate(null)}
            onCancel={() => setItemToUpdate(null)}
            cancelText="Voltar"
            showCloseButton
            okText="Atualizar"
            size="md"
            isLoading={isLoading}
            disableOkButton={user.role === `student` || !itemToUpdate?.consumed_quantity}
            disableCancelButton={user.role === `student`}
          >
            <Flex direction="column" gap="1rem" w="25rem" maxW="25rem" align="center" overflow="hidden">
              <Flex
                bgImage={itemToUpdate?.picture}
                bgPosition="center"
                bgRepeat="no-repeat"
                bgSize="cover"
                w="15rem"
                h="15rem"
                border="1px"
                borderRadius="md"
                borderColor="gray300"
              />

              <Text textAlign="center" fontSize="13px">
                Defina o consumo do item
              </Text>
              <Flex justify="space-between" align="flex-end" w="100%">
                <Flex direction="column" alignSelf="start">
                  <Text>Data do consumo</Text>
                  <DateInput
                    value={formatDateInput(
                      itemToUpdate?.consumed_at?.toString() || itemToUpdate?.order_item_metadata?.service_consumed_at?.toString(),
                    )}
                    onInputChange={(input) => setItemToUpdate((e) => ({ ...(e || ({} as any)), consumed_at: input ? new Date(input) : null }))}
                  />
                </Flex>
                <Text whiteSpace="nowrap">{`${itemToUpdate?.order_item_metadata?.service_consumed_quantity || 0} ${(itemToUpdate?.store_item.metadata.unit || `hora`).concat(itemToUpdate?.order_item_metadata?.service_consumed_quantity === 1 ? `` : `s`)} usadas`}</Text>
              </Flex>
              {!!((itemToUpdate?.quantity || 0) - (itemToUpdate?.order_item_metadata?.service_consumed_quantity || 0)) && (
                <Flex display="flex" align="center" gap="8px" justify="space-between" w="100%">
                  <Text whiteSpace="nowrap">Descontar</Text>
                  <Flex>
                    <NumberInput
                      value={itemToUpdate?.consumed_quantity || `0`}
                      min={0}
                      max={(itemToUpdate?.quantity || 0) - (itemToUpdate?.order_item_metadata?.service_consumed_quantity || 0)}
                      onInputChange={(value) =>
                        Number(value) <= (itemToUpdate?.quantity || 1) &&
                        setItemToUpdate((e) => ({ ...(e || ({} as any)), consumed_quantity: value }))
                      }
                    />
                  </Flex>
                  <Text whiteSpace="nowrap">{`${(itemToUpdate?.store_item.metadata.unit || `hora`).concat((itemToUpdate?.quantity || 0) - (itemToUpdate?.order_item_metadata?.service_consumed_quantity || 0) === 1 ? `` : `s`)} do total de ${(itemToUpdate?.quantity || 0) - (itemToUpdate?.order_item_metadata?.service_consumed_quantity || 0)} ${(itemToUpdate?.store_item.metadata.unit || `hora`).concat((itemToUpdate?.quantity || 0) - (itemToUpdate?.order_item_metadata?.service_consumed_quantity || 0) === 1 ? `` : `s`)}`}</Text>
                </Flex>
              )}
            </Flex>
          </SmallModal>
        </Flex>
      </Flex>
    </motion.div>
  );
};
