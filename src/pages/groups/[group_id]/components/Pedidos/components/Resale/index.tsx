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
} from '@chakra-ui/react';
import { FiTrash } from 'react-icons/fi';
import { FaRegTrashCan } from 'react-icons/fa6';
import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '@chakra-ui/react';
import { FaArrowRightLong } from 'react-icons/fa6';
import { MdAddTask } from 'react-icons/md';
import { motion } from 'framer-motion';

import { IHubGroup } from '@/_base/interfaces/group';
import { SmallModal } from '@/components/Modal/Small';
import { IStoreMakerResale } from '@/_base/interfaces/storeMaker';
import { useAuth, useCustomToast } from '@/_base/hooks';
import { cookieManager, formatCoin, formatShortName } from '@/_base/utils';
import { CoinIcon } from '@/components/Logo';
import { dimensions } from '@/styles/global';
import { GroupOrdersPageView } from '@/pages/groups/[group_id]/interfaces';
import { getStockResales } from '@/_base/services/storeMaker';
import { useSelectedSchool } from '@/components/Page/components/Header';

interface IProps {
  onChangeView: (view: GroupOrdersPageView) => void;
  onFinishResaleOrder: (data: IStoreMakerResale[]) => void;
  canEdit: boolean;
  group: IHubGroup;
  cartIsOpened: boolean;
}

export const Resale: React.FC<IProps> = ({ onChangeView, onFinishResaleOrder, group, cartIsOpened }) => {
  const [storeMakerList, setStoreMakerList] = useState<IStoreMakerResale[]>([]);
  const [cart, setCart] = useState<IStoreMakerResale[]>(cookieManager.getCookie(`resale:${group.id}`, true) || []);
  const [showRequestOrder, setShowRequestOrder] = useState(false);

  const toast = useCustomToast();
  const { school } = useSelectedSchool();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: cartIsOpened || !!cookieManager.getCookie(`resale:${group.id}`) });

  useEffect(() => {
    if (!school?.hub_school_id) return;
    (async () => {
      const results = await getStockResales(school?.hub_school_id || ``);
      setStoreMakerList(results.filter((e) => !e.hub_group_buyer_id && e.metadata.target_buyer === `groups` && !!e.approved_at));
    })();
  }, [school]);

  useUpdateEffect(() => {
    onOpen();
  }, [cartIsOpened]);

  useUpdateEffect(() => {
    cookieManager.setCookie(`resale:${group.id}`, JSON.stringify(cart));
  }, [cart]);

  const addItemInCart = (item: IStoreMakerResale) => {
    const targetItemInCard = cart.find((e) => e.id === item.id);

    if (targetItemInCard) {
      toast({ description: `Item já adicionado ao carrinho`, status: `error`, position: `top` });
      return;
    }

    setCart((e) => [...e, item]);
    toast({ status: `success`, description: `Item adicionado ao carrinho`, position: `top` });
  };

  const totalPrice = useMemo(() => cart.reduce((acc, { price }) => (acc += Number(price)), 0), [cart]);

  const haveMemberWithNegativeBalance = !!group.students.find((e) => (e.metadata.coins || 0) <= 0);

  return (
    <motion.div
      key={'Resale'}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: `flex`, width: `100%`, height: `100%` }}
    >
      <Flex overflow="hidden" gap="1rem" flex="1" direction={{ base: `column-reverse`, lg: `row` }}>
        <Flex
          flex="1"
          bgColor="white"
          flexDirection="row"
          borderRadius="12px"
          padding="20px"
          gap="20px"
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
            {storeMakerList.map((item, i) => (
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
                      backgroundColor: cart.find((e) => e.id === item.id) ? `#32D583` : `#FF525C`,
                      borderRadius: '6px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: '1',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '1px 1px 0 0 ',
                    }}
                    onClick={() => addItemInCart(item)}
                  >
                    <MdAddTask fontSize="19px" />
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
                  height={{ base: `13.5rem`, lg: '15.5rem' }}
                  width={{ base: `11rem`, lg: '13rem' }}
                  border={cart.find((e) => e.id === item.id) ? `2px` : '1px'}
                  borderColor={cart.find((e) => e.id === item.id) ? `primary300` : 'gray300'}
                  borderRadius="md"
                  overflow="hidden"
                >
                  <Image src={item.store_maker_item.picture} maxHeight={{ base: `8rem`, lg: `10rem` }} w="100%" />
                  <Flex direction="column" gap="9px" minH="3.5rem" maxH="3.5rem" w="100%">
                    <Text noOfLines={2} px="0.5rem" flex="1" fontSize="13px" fontWeight="400">
                      {item.store_maker_item.name}
                    </Text>
                    <Flex align="center" justify="space-between" p="0 0.5rem 0 1rem">
                      <Text>{`${item?.quantity || 0} ${item?.quantity === 1 ? 'unidade' : 'unidades'}`}</Text>
                      <Flex align="center" justify="center" gap="0.25rem" pr="0.5rem">
                        <Image src="/icons/coin.svg" />
                        <Text w="fit-content" fontSize="14px" display="flex" color="primary700" fontWeight="500">
                          R$ {item.price}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            ))}
          </Grid>
        </Flex>

        <Drawer isOpen={isOpen && user.role === `student`} placement="right" onClose={onClose}>
          <DrawerOverlay bg="transparent" backdropFilter="blur(3px) " />
          <DrawerContent mt={`calc(${dimensions.header.height} + 1.5rem)`} mb="1.5rem" borderRadius="md" p="0">
            <DrawerCloseButton />
            <DrawerHeader display="flex">
              <Accordion allowMultiple mb="0.75rem" w="100%" mr="1.5rem">
                <AccordionItem border="none" borderBottom="1px" borderColor="gray300" pb="0.25rem">
                  <AccordionButton p="0.25rem">
                    <Flex w="100%" fontSize="15px" gap="0.5rem" align="center" justify="space-between">
                      <Text>Saldo do grupo</Text>
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
                <Flex key={`${item.id} - ${i}`} gap="12px" border="1px" borderColor="gray300" borderRadius="md" padding=".25rem" minH="3.5rem">
                  <Flex w="40px" h="40px" bgImage={item.store_maker_item.picture} bgSize="cover" bgPosition="center" />
                  <Flex flex="1" direction="column" justify="space-between" fontWeight="500" fontSize="14px" color="gray700">
                    <Text>{item.store_maker_item.name}</Text>
                    <Flex align="center" gap="9px" h="18px">
                      <Image src="/icons/coin.svg" />
                      <Text w="fit-content" fontSize="15px" display="flex" align="center" gap="9px" color="primary700" fontWeight="500">
                         R$ {item.price}
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex justify="center" align="center">
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
                    onClick={() => !!cart.length && setShowRequestOrder(true)}
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
          show={!!showRequestOrder}
          onConfirm={() => {
            if (!showRequestOrder) return;
            onFinishResaleOrder(cart);
            setShowRequestOrder(false);
            onChangeView(`Pedidos`);
          }}
          onCancel={() => setShowRequestOrder(false)}
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
