import {
  Flex,
  Grid,
  Text,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
  useUpdateEffect,
  Tooltip,
} from '@chakra-ui/react';
import { FiTrash } from 'react-icons/fi';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { FaRegTrashCan } from 'react-icons/fa6';
import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '@chakra-ui/react';
import { FaArrowRightLong } from 'react-icons/fa6';
import { MdAddTask } from 'react-icons/md';
import { motion } from 'framer-motion';

import { IHubGroup } from '@/_base/interfaces/group';
import { SmallModal } from '@/components/Modal/Small';
import { IStockMaker, IStoreMakerItem } from '@/_base/interfaces/storeMaker';
import { useAsyncCallback, useCustomToast } from '@/_base/hooks';
import { formatCoin, formatShortName } from '@/_base/utils';
import { CoinIcon } from '@/components/Logo';
import { dimensions } from '@/styles/global';
import { GroupOrdersPageView } from '@/pages/groups/[group_id]/interfaces';
import { updateProfile } from '@/_base/services/user';
import { IHubUser } from '@/_base/interfaces/user';
import { IoHeartOutline, IoHeartDislikeOutline } from 'react-icons/io5';
import { validateSession } from '@/_base/services/auth';

type CustomStoreItem = IStoreMakerItem & { quantity: number };
interface IProps {
  onChangeView: (view: GroupOrdersPageView) => void;
  onFinishOrder: (data: { id: string; quantity: number }[]) => void;
  canEdit: boolean;
  storeMakerList: IStockMaker[];
  group: IHubGroup;
  cartIsOpened: boolean;
  user: IHubUser;
}

export const Store: React.FC<IProps> = ({ onChangeView, onFinishOrder, storeMakerList: storeList, group, cartIsOpened, user }) => {
  const [cart, setCart] = useState<CustomStoreItem[]>([]);
  const [orderPayload, setOrderPayload] = useState<{ id: string; quantity: number }[] | null>(null);
  const [itemsWithoutStock, setItemsWithoutStock] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>(user.metadata.store_interests || []);

  const storeMakerList = storeList.filter((e) => !e.hub_user_id).map((e) => e.store_item);
  console.log('storeList: ', storeList);

  const toast = useCustomToast();
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: cartIsOpened });

  useEffect(() => {
    if (!group) return;
    (async () => {
      const _user = await validateSession();

      setCart(
        (storeList
          .map((item) => {
            const target = _user.metadata.cart?.[group.id]?.find((cartItem) => item.store_item.id === cartItem.id);

            return target && !!item.quantity ? { ...item.store_item, quantity: target.quantity } : undefined;
          })
          .filter(Boolean) as CustomStoreItem[]) || [],
      );
    })();
  }, [group]);

  useUpdateEffect(() => {
    onOpen();
  }, [cartIsOpened]);

  useUpdateEffect(() => {
    updateProfile({ cart: { ...(user.metadata.cart || {}), [group.id]: cart.map((e) => ({ id: e.id, quantity: e.quantity })) } });
  }, [cart]);

  const addItemInCart = (item: IStoreMakerItem) => {
    const targetItemInCard = cart.find((e) => e.id === item.id);
    const targetStock = storeList.find((e) => e.store_maker_item_id === item.id);

    if ((targetItemInCard?.quantity || 0) + 1 > (targetStock?.quantity || 0)) {
      setItemsWithoutStock((e) => [...e, item.id]);
      toast({ description: `Limite do estoque atingido`, status: `error`, position: `top` });
      return;
    }

    if (targetItemInCard)
      setCart((e) => e.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem)));
    else setCart((e) => [...e, { ...item, quantity: 1 }]);
    toast({ status: `success`, description: `Item adicionado ao carrinho`, position: `top` });
  };

  const showInterestInItem = useAsyncCallback(
    async (item: IStoreMakerItem) => {
      const alreadyItemInterest = interests.find((e) => e === item.id);

      const store_interests = alreadyItemInterest ? interests.filter((e) => e !== item.id) : [...interests, item.id];
      setInterests(store_interests);
      await updateProfile({ store_interests });
      toast({
        status: alreadyItemInterest ? `info` : `success`,
        description: `Item ${alreadyItemInterest ? 'removido da' : 'adicionado à'} lista de interesses`,
        position: `top`,
      });
    },
    [user, interests],
  );

  const totalPrice = useMemo(() => cart.reduce((acc, { price, quantity }) => (acc += Number(price) * quantity), 0), [cart]);

  const haveMemberWithNegativeBalance = !!group.students.find((e) => (e.metadata.coins || 0) <= 0);

  const handleConfirmOrder = useAsyncCallback(async () => {
    if (!orderPayload) return;
    onFinishOrder(orderPayload);
    setOrderPayload(null);
    updateProfile({ cart: { ...(user.metadata.cart || {}), [group.id]: [] } });
    onClose();
    // onChangeView(`Pedidos`);
  }, []);

  return (
    <motion.div
      key={'Store'}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: `flex`, width: `100%`, height: `calc(100% - 3.6rem)` }}
    >
      <Flex overflow="hidden" gap="1rem" flex="1" direction={{ base: `column-reverse`, lg: `row` }}>
        <Flex
          flex="1"
          bgColor="white"
          flexDirection="row"
          borderRadius="12px"
          padding="1rem"
          gap="1rem"
          textAlign="left"
          display="flex"
          overflow="hidden auto"
          border="1px"
          borderColor="gray200"
          transition="ease-in-out 0.3s"
          marginRight={{ base: 0, lg: isOpen ? '20rem' : 0 }}
        >
          <Grid
            gap="1rem"
            gridTemplateColumns={{ base: 'repeat(auto-fill, minmax(10rem, 1fr))', lg: 'repeat(auto-fill, minmax(12rem, 1fr))' }}
            gridTemplateRows="minmax(min-content, max-content)"
            padding="2rem"
            borderRadius="md"
            flex="1"
            overflow="hidden auto"
          >
            {storeMakerList.map((item, i) => {
              const targetItemInStore = storeList.find((e) => e.store_maker_item_id === item.id);
              const alreadyInterest = interests?.find((e) => e === item.id);
              return (
                <Flex key={`${item.id} - ${i}`} position="relative" w="fit-content" h="fit-content">
                  {user.role === `student` && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.75 }}
                      style={{
                        display: `flex`,
                        position: 'absolute',
                        top: '-0.4rem',
                        right: '-0.4rem',
                        width: '28px',
                        height: '28px',
                        backgroundColor: targetItemInStore?.quantity
                          ? cart.find((e) => e.id === item.id)
                            ? `#32D583`
                            : `#FF525C`
                          : alreadyInterest
                            ? `#32D583`
                            : `#529dff`,
                        borderRadius: '6px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: '1',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '1px 1px 0 0 ',
                      }}
                      onClick={() => (targetItemInStore?.quantity ? addItemInCart(item) : showInterestInItem(item))}
                    >
                      {targetItemInStore?.quantity ? (
                        <MdAddTask fontSize="19px" />
                      ) : alreadyInterest ? (
                        <Tooltip label="Remover da lista de desejos" hasArrow>
                          <span>
                            <IoHeartDislikeOutline fontSize="19px" />
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip label="Adicionar à lista de desejos" hasArrow>
                          <span>
                            <IoHeartOutline fontSize="19px" />
                          </span>
                        </Tooltip>
                      )}
                      {/* <TiPin  fontSize="19px" /> */}
                      {!!targetItemInStore?.quantity && (
                        <Flex
                          position="absolute"
                          top="-0.5rem"
                          right="-0.5rem"
                          zIndex="20"
                          border="1px"
                          w="1.1rem"
                          h="1.1rem"
                          justify="center"
                          align="center"
                          borderColor={cart.find((e) => e.id === item.id) ? `success400` : `primary500`}
                          color={cart.find((e) => e.id === item.id) ? `success400` : `primary500`}
                          borderRadius="50%"
                          bg="white"
                        >
                          {cart.find((e) => e.id === item.id)?.quantity || 0}
                        </Flex>
                      )}
                    </motion.button>
                  )}

                  <Flex
                    direction="column"
                    gap="0.5rem"
                    cursor="pointer"
                    fontWeight="500"
                    color="gray700"
                    fontSize="14px"
                    align="center"
                    justify="space-between"
                    height={{ base: `12.5rem`, lg: '14.5rem' }}
                    width={{ base: `10rem`, lg: '12rem' }}
                    border="1px"
                    borderColor={itemsWithoutStock.includes(item.id) || !targetItemInStore?.quantity ? `#f8acb0` : 'gray300'}
                    borderRadius="md"
                    filter={targetItemInStore?.quantity ? `` : `grayscale(0.9)`}
                    overflow="hidden"
                  >
                    {!targetItemInStore?.quantity && (
                      <Text px="0.5rem" fontSize="13px" flex="1" color="gray400">
                        Item em falta
                      </Text>
                    )}
                    <Image src={item.picture} maxHeight={targetItemInStore?.quantity ? { base: `8rem`, lg: `10rem` } : `6rem`} />
                    <Flex display="flex" justify="space-between" align="center" gap="9px" minH="3.5rem" maxH="3.5rem" w="100%">
                      <Text noOfLines={2} px="0.5rem" flex="1">
                        {item.name}
                      </Text>
                      <Flex display="flex" align="center" justify="center" gap="0.25rem" pr="0.5rem">
                        <Image src="/icons/coin.svg" />
                        <Text w="fit-content" fontSize="14px" display="flex" color="primary700" fontWeight="500">
                          R$ {item.price}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              );
            })}
          </Grid>
        </Flex>

        <Drawer isOpen={isOpen && user.role === `student`} placement="right" onClose={onClose}>
          <DrawerOverlay bg="transparent" backdropFilter="blur(2px) " />
          <DrawerContent mt={`calc(${dimensions.header.height} + 1.5rem)`} mb="1.5rem" borderRadius="md" p="0">
            <DrawerCloseButton />
            <DrawerHeader display="flex">
              <Accordion allowMultiple mb="0.75rem" w="100%" mr="1.5rem">
                <AccordionItem border="none" borderBottom="1px" borderColor="gray300" pb="0.25rem">
                  <AccordionButton p="0.25rem">
                    <Flex w="100%" fontSize="15px" gap="0.5rem" direction="column">
                      <Text textAlign="left">Saldo do grupo</Text>
                      <Flex align="center" gap="0.35rem">
                        <CoinIcon size="xs" />
                        <Text>
                          {formatCoin(
                            group.students.reduce(
                              (total, student) => total + ((student.metadata.coins || 0) > 0 ? student.metadata.coins || 0 : 0),
                              0,
                            ),
                          )}
                        </Text>
                      </Flex>
                    </Flex>

                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} w="100%">
                    <Flex direction="column" gap="0.35rem" pt="0.25rem">
                      {group.students.map((student) => (
                        <Flex key={student.id} align="center" gap="0.35rem" w="100%">
                          <Avatar src={student.avatar || undefined} size="xs" />
                          <Text color="gray700" fontSize="13px" fontWeight="500">
                            {formatShortName(student.name, true)}
                          </Text>
                          <Flex
                            align="center"
                            justify="flex-end"
                            flex="1"
                            color={formatCoin(student.metadata.coins).startsWith(`-`) ? `primary500` : undefined}
                          >
                            <Text>{formatCoin(student.metadata.coins)}</Text>
                          </Flex>
                        </Flex>
                      ))}
                    </Flex>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </DrawerHeader>

            <DrawerBody display="flex" flexDirection="column" overflow="hidden auto" gap="0.75rem" py="0.35rem">
              {cart.map((item, i) => (
                <Flex key={`${item.id} - ${i}`} direction="column" gap="12px" border="1px" borderColor="gray300" borderRadius="md" padding=".5rem">
                  <Flex align="center" justify="center" fontWeight="500" fontSize="14px" color="gray700">
                    <Text noOfLines={1} flex="1" fontWeight="400" fontSize="13px">
                      {item.name}
                    </Text>

                    <Flex
                      bgColor="error100"
                      w="25px"
                      h="25px"
                      borderRadius="10px"
                      color="error800"
                      display="flex"
                      justify="center"
                      align="center"
                      fontSize="14px"
                      cursor="pointer"
                      _hover={{ filter: `brightness(0.9)` }}
                      onClick={() => setCart((e) => e.filter((cartItem) => cartItem.id !== item.id))}
                    >
                      <FiTrash />
                    </Flex>
                  </Flex>

                  <Flex justify="space-between" align="end">
                    <Flex display="flex" justify="center" align="center" gap="4px">
                      <CoinIcon size="xs" />
                      <Text w="fit-content" fontSize="15px" display="flex" align="center" gap="9px" color="primary700" fontWeight="500">
                        R$ {item.price}
                      </Text>
                    </Flex>
                    <Flex w="40px" h="40px" bgImage={item.picture} bgSize="cover" bgPosition="center" />

                    <Flex gap="1rem" display="flex" justify="space-between" align="center">
                      <FaMinus
                        fontSize="10px"
                        color="gray300"
                        onClick={() =>
                          setCart((e) =>
                            item.quantity > 1
                              ? e.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem))
                              : e.filter((cartItem) => cartItem.id !== item.id),
                          )
                        }
                      />
                      <Text fontSize="14px" fontWeight="500" color="gray500">
                        {item.quantity}
                      </Text>
                      <FaPlus
                        cursor="pointer"
                        fontSize="10px"
                        color="gray300"
                        onClick={() =>
                          setCart((e) => e.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem)))
                        }
                      />
                    </Flex>
                  </Flex>
                </Flex>
              ))}
            </DrawerBody>

            <DrawerFooter justifyContent="flex-start">
              <Flex direction="column" w="100%">
                <Flex w="100%" justify="flex-end" align="center" gap="0.5rem" py="0.5rem">
                  <Text fontSize="20px">Total</Text>
                  <Image src="/icons/coin.svg" height="40px" />
                  <Text fontSize="40px" fontWeight="700" color="primary900">
                    R$ {totalPrice}
                  </Text>
                </Flex>
                <Flex direction="column" gap="1.35rem">
                  <Flex
                    userSelect="none"
                    cursor={cart.length ? 'pointer' : 'not-allowed'}
                    color="white"
                    bgColor="primary600"
                    p="0.5rem"
                    justify="center"
                    align="center"
                    borderRadius="8px"
                    fontWeight="600"
                    opacity={cart.length ? `1` : `0.8`}
                    _hover={{ filter: `brightness(0.9)` }}
                    onClick={() =>
                      !!cart.length &&
                      setOrderPayload(
                        cart.map((e) => ({
                          id: e.id,
                          quantity: e.quantity,
                        })),
                      )
                    }
                  >
                    Solicitar pedido
                  </Flex>
                  <Flex>
                    <Flex
                      color="gray500"
                      justify="center"
                      align="center"
                      gap="0.25rem"
                      w="fit-content"
                      margin="auto"
                      cursor="pointer"
                      fontSize="14px"
                      _hover={{ filter: `brightness(0.5)` }}
                      onClick={() => setCart([])}
                    >
                      Limpar carrinho
                      <FaRegTrashCan />
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <SmallModal
          size="xl"
          topIcon="checked"
          title="Finalizar pedido"
          show={!!orderPayload}
          onConfirm={handleConfirmOrder}
          onCancel={() => setOrderPayload(null)}
          disableOkButton={haveMemberWithNegativeBalance}
        >
          <Flex direction="column" gap="0.5rem">
            {haveMemberWithNegativeBalance ? (
              <>
                <Text>
                  Um ou mais membros do grupo possuem saldo negativo ou zerado, volte para finalizar o pedido quando todos membros estiverem com saldo
                  positivo.
                </Text>
                <Text>Lembrando que você pode fazer uma doação aos membros caso possua saldo suficiente.</Text>
              </>
            ) : (
              <>
                <Text>{`O total da compra ficou em ${formatCoin(totalPrice)}`}</Text>
                <Text>{`Sendo assim, o valor de ${formatCoin(
                  totalPrice / group.students.length,
                )} será descontado de cada participante do grupo.`}</Text>
              </>
            )}
            <Flex direction="column" gap="6px" m="0.5rem 0 1rem">
              {group.students.map((student) => (
                <Flex key={student.id} w="100%" justify="space-between">
                  <Flex gap="8px">
                    <Avatar size="sm" name={student.name} src={student.avatar || ``} />
                    <Flex align="center">{student.name}</Flex>
                  </Flex>
                  <Flex align="center" fontWeight="600" color={(student.metadata.coins || 0) > 0 ? 'green' : 'red'} gap="6px">
                    <Text>{formatCoin(student.metadata.coins)}</Text>
                    <FaArrowRightLong color="green" />
                    <Text color={(student.metadata.coins || 0) - totalPrice / group.students.length > 0 ? 'gray800' : 'red'}>
                      {formatCoin((student.metadata.coins || 0) - totalPrice / group.students.length)}
                    </Text>
                    <Image src="/icons/coin.svg" />
                  </Flex>
                </Flex>
              ))}
            </Flex>
            <Flex w="100%" justify="space-between" mt="8px">
              Valor total:
              <Flex fontWeight="600">
                {formatCoin(totalPrice)}
                <Image src="/icons/coin.svg" />
              </Flex>
            </Flex>
          </Flex>
        </SmallModal>
      </Flex>
    </motion.div>
  );
};
