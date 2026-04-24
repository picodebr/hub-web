import { Flex, Grid, Text, Image, Tooltip } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { IHubGroup, IHubGroupOrder, IHubGroupOrderItem, IHubGroupOrderItemMetadata } from '@/_base/interfaces/group';
import { SmallModal } from '@/components/Modal/Small';
import { IStoreMakerItem } from '@/_base/interfaces/storeMaker';
import { useAsyncCallback, useAuth, useCustomToast, useInputHandler } from '@/_base/hooks';
import { NumberInput } from '@/components/Inputs/Number';
import { EMPTY_RESALE_STOCK_ITEM, IResaleStockParams, resaleStockSchema } from '@/_base/interfaces/storeMaker/IResaleStockMakerParams';
import { resaleStockItem } from '@/_base/services/storeMaker';
import { useSelectedSchool } from '@/components/Page/components/Header';
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
  };

interface IProps {
  group: IHubGroup;
  refreshStock: () => void;
}

type ModalStepType = 'default' | 'sell.teacher' | 'sell.group';

export const GroupItems: React.FC<IProps> = ({ group, refreshStock }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStepType | null>(null);
  const [selectedStoreItem, setSelectedStoreItem] = useState<CustomStoreItem | null>(null);
  const [itemToUpdate, setItemToUpdate] = useState<CustomStoreItem | null>(null);
  const [tab, setTab] = useState<'consumables' | 'services'>('consumables');

  const recommendedPrice = useMemo(
    () => Math.round(Number(selectedStoreItem?.price || 0) - Number(selectedStoreItem?.price || 0) * (modalStep?.endsWith(`teacher`) ? 0.2 : 0.1)),
    [selectedStoreItem, modalStep],
  );
  const { school } = useSelectedSchool();
  const { user } = useAuth();

  const storeMakerList = group.orders
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
    { key: 'consumables', label: 'Consumíveis', isSelected: tab === 'consumables' },
    { key: 'services', label: 'Serviços', isSelected: tab === 'services' },
  ];

  const toast = useCustomToast();
  const { data, onInputChange, submit, errors, setData } = useInputHandler<IResaleStockParams>({
    schema: resaleStockSchema,
    data: { ...EMPTY_RESALE_STOCK_ITEM, hub_group_seller_id: group.id },
  });

  useEffect(() => {
    setData((e) => ({
      ...e,
      store_maker_item_id: selectedStoreItem?.store_item?.id || ``,
      hub_group_order_item_id: selectedStoreItem?.hub_group_order_item_id || ``,
      hub_school_id: school?.hub_school_id || ``,
      price: `${Math.round(Number(selectedStoreItem?.price) - Number(selectedStoreItem?.price) * (modalStep?.endsWith(`teacher`) ? 0.2 : 0.1))}`,
    }));
  }, [selectedStoreItem, school, modalStep]);

  const handleResaleItem = useAsyncCallback(
    async () => {
      if (!itemToUpdate) return;
      setIsLoading(true);
      await resaleStockItem({
        ...data,
        price: (data.quantity * Number(data.price)).toFixed(2),
        metadata: { target_buyer: modalStep?.endsWith(`teacher`) ? `teacher` : `groups` },
      });
      refreshStock();
      handleCloseModal();
      toast({ status: `success`, title: `O professor vai aprovar a sua solicitação de revenda`, position: `top` });
    },
    [modalStep, recommendedPrice, data],
    true,
    () => setIsLoading(false),
  );

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
    setSelectedStoreItem(null);
    setModalStep(null);
    setItemToUpdate(null);
  };

  return (
    <motion.div
      key={'GroupItems'}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: `flex`, width: `100%`, height: `100%`, overflow: `hidden` }}
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
            overflow="hidden auto"
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
              overflow="hidden auto"
              borderTop="1px"
              borderColor="gray200"
              transition="ease-in-out 0.3s"
            >
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
                        {!item.store_item?.metadata?.is_service && (
                          <Text px="0.5rem" fontSize="12px" fontWeight="400" whiteSpace="nowrap" textAlign="right">
                            Patrimônio acumulado
                          </Text>
                        )}
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
                    {((user.role === `student` && !item.store_item?.metadata?.is_service) ||
                      (user.role === `teacher` && item.store_item?.metadata?.is_service)) && (
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
                            if (item.store_item?.metadata?.is_service) setItemToUpdate(item);
                            else {
                              setSelectedStoreItem(item);
                              setData((e) => ({
                                ...e,
                                price: `${Math.round(Number(item?.price) - Number(item?.price) * (modalStep?.endsWith(`teacher`) ? 0.2 : 0.1))}`,
                              }));
                              setModalStep(`default`);
                            }
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
            </Flex>
          </Flex>

          {/* Resale Order Item Modal 1 */}
          <SmallModal
            title={selectedStoreItem?.name}
            show={!!selectedStoreItem && modalStep === `default`}
            onConfirm={() => setModalStep(`sell.group`)}
            onCancel={() => setModalStep(`sell.teacher`)}
            onCloseModal={handleCloseModal}
            cancelText="Revender para o professor"
            okText="Revender para o grupo"
            size="lg"
            isLoading={isLoading}
            disableOkButton={user.role !== `student`}
            disableCancelButton={user.role !== `student`}
          >
            <Flex direction="column" gap="1rem" w="100%" minW="25rem" align="center">
              <Flex
                bgImage={selectedStoreItem?.picture}
                bgPosition="center"
                bgRepeat="no-repeat"
                bgSize="cover"
                w="15rem"
                h="15rem"
                border="1px"
                borderRadius="md"
                borderColor="gray300"
              />
              <Text fontSize="13px" fontWeight="500">
                {`${selectedStoreItem?.quantity || 0} ${selectedStoreItem?.quantity === 1 ? 'unidade' : 'unidades'} em estoque`}
              </Text>
            </Flex>
          </SmallModal>

          {/* Resale Order Item Modal 2 */}
          <SmallModal
            title={selectedStoreItem?.name}
            show={!!selectedStoreItem && !!modalStep?.startsWith(`sell`)}
            onConfirm={() => submit(handleResaleItem)}
            onCloseModal={handleCloseModal}
            onCancel={() => setModalStep(`default`)}
            cancelText="Voltar"
            showCloseButton
            okText="Revender"
            size="md"
            isLoading={isLoading}
            disableOkButton={user.role !== `student`}
            disableCancelButton={user.role !== `student`}
          >
            <Flex direction="column" gap="1rem" w="25rem" maxW="25rem" align="center" overflow="hidden">
              <Flex
                bgImage={selectedStoreItem?.picture}
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
                {`O valor de revenda para o ${modalStep?.endsWith(`teacher`) ? `professor` : `grupo`} tem depreciação de ${
                  modalStep?.endsWith(`teacher`) ? 20 : 10
                }% do valor original`}
              </Text>
              <Flex align="center" justify="space-between" p="1rem" border="1px" borderColor="gray300" gap="3rem" borderRadius="md">
                <Flex display="flex" direction="column" align="center">
                  <Text fontSize="15px" display="flex" align="center" gap="9px">
                    Valor original
                  </Text>
                  <Flex align="center">
                    <Text w="fit-content" fontSize="15px" display="flex" align="center" gap="9px" color="primary700" fontWeight="500">
                      {selectedStoreItem?.price}
                    </Text>
                    <Image src="/icons/coin.svg" />
                  </Flex>
                </Flex>
                <Flex display="flex" direction="column" align="center">
                  <Text fontSize="15px" display="flex" align="center" gap="9px">
                    Valor recomendado
                  </Text>
                  <Flex align="center">
                    <Text w="fit-content" fontSize="15px" display="flex" align="center" gap="9px" color="primary700" fontWeight="500">
                      {Math.round(Number(selectedStoreItem?.price) - Number(selectedStoreItem?.price) * (modalStep?.endsWith(`teacher`) ? 0.2 : 0.1))}
                    </Text>
                    <Image src="/icons/coin.svg" />
                  </Flex>
                </Flex>
              </Flex>
              <Text textAlign="center" fontSize="13px">
                Quantos <i>"{selectedStoreItem?.name}"</i> você deseja vender e por qual valor?
              </Text>
              <Flex display="flex" align="center" gap="4px">
                <Flex gap="1rem">
                  <NumberInput
                    value={data.quantity}
                    error={errors.quantity}
                    min={1}
                    max={selectedStoreItem?.quantity}
                    onInputChange={(value) => Number(value) <= (selectedStoreItem?.quantity || 1) && onInputChange('quantity', Number(value))}
                    label="Quantidade"
                  />
                  <NumberInput
                    value={data.price}
                    error={errors.price}
                    min={1}
                    max={recommendedPrice}
                    onInputChange={(value) => Number(value) <= recommendedPrice && onInputChange('price', value)}
                    label="Valor"
                  />
                </Flex>
              </Flex>
              <Flex>
                <Text fontSize="15px" display="flex" align="center" gap="9px" fontWeight="500" mr="0.75rem">
                  Valor final da venda
                </Text>
                <Text fontSize="15px" display="flex" align="center" gap="9px" color="primary700" fontWeight="500" mr="0.2rem">
                  {(Number(data?.price || 0) * (data?.quantity || 0)).toFixed(2)}
                </Text>
                <Image src="/icons/coin.svg" />
              </Flex>
            </Flex>
          </SmallModal>

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
