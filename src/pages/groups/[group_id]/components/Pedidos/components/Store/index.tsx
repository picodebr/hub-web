import { Flex, Grid, Text, Image, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel } from '@chakra-ui/react';
import { OrdersPageView } from '../..';
import { FiShoppingCart, FiTrash } from 'react-icons/fi';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { FaRegTrashCan } from 'react-icons/fa6';
import { useMemo, useState } from 'react';
import { BsArrowLeft } from 'react-icons/bs';
import { IHubGroup } from '@/_base/interfaces/group';
import { SmallModal } from '@/components/Modal/Small';
import { IStockMaker, IStoreMakerItem } from '@/_base/interfaces/storeMaker';
import { useCustomToast } from '@/_base/hooks';
import { Avatar } from '@chakra-ui/react';
import { FaArrowRightLong } from 'react-icons/fa6';
import { formatCoin, formatShortName } from '@/_base/utils';
import { CoinIcon } from '@/components/Logo';

type CustomStoreItem = IStoreMakerItem & { quantity: number };
interface IProps {
  onChangeView: (view: OrdersPageView) => void;
  onFinishOrder: (data: { id: string; quantity: number }[]) => void;
  canEdit: boolean;
  storeMakerList: IStockMaker[];
  group: IHubGroup;
}

export const Store: React.FC<IProps> = ({ onChangeView, onFinishOrder, storeMakerList: storeList, group }) => {
  const [cart, setCart] = useState<CustomStoreItem[]>([]);
  const [orderPayload, setOrderPayload] = useState<{ id: string; quantity: number }[] | null>(null);

  const storeMakerList = storeList.map((e) => e.store_item);

  const toast = useCustomToast();

  const addItemInCart = (item: IStoreMakerItem) => {
    const targetItemInCard = cart.find((e) => e.id === item.id);
    const targetStock = storeList.find((e) => e.store_maker_item_id === item.id);

    if ((targetItemInCard?.quantity || 0) + 1 > (targetStock?.quantity || 0)) {
      toast({ description: `Limite do estoque atingido`, status: `error` });
      return;
    }

    if (targetItemInCard)
      setCart((e) => e.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem)));
    else setCart((e) => [...e, { ...item, quantity: 1 }]);
  };

  const totalPrice = useMemo(() => cart.reduce((acc, { price, quantity }) => (acc += Number(price) * quantity), 0), [cart]);

  const haveMemberWithNegativeBalance = !!group.students.find((e) => (e.metadata.coins || 0) < 0);

  return (
    <Flex overflow="hidden" gap="1rem" flex="1">
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
      >
        <Grid
          gap="1rem"
          gridTemplateColumns="repeat(auto-fill, minmax(12rem, 1fr))"
          gridTemplateRows="minmax(min-content, max-content)"
          padding="2rem"
          borderRadius="md"
          flex="1"
          overflow="hidden auto"
        >
          {storeMakerList.map((item) => (
            <Flex key={item.id} position="relative" w="fit-content" h="fit-content">
              <Flex
                position="absolute"
                top="-0.4rem"
                right="-0.4rem"
                w="24px"
                h="24px"
                bgColor="primary500"
                borderRadius="6px"
                align="center"
                justify="center"
                zIndex="1"
                color="white"
                cursor="pointer"
                _hover={{ filter: `brightness(0.9)` }}
                onClick={() => addItemInCart(item)}
              >
                <FiShoppingCart fontSize="14px" />
              </Flex>

              <Flex
                direction="column"
                gap="0.5rem"
                cursor="pointer"
                fontWeight="500"
                color="gray700"
                fontSize="14px"
                align="center"
                justify="space-between"
                height="14.5rem"
                width="12rem"
                border="1px"
                borderColor="gray300"
                borderRadius="md"
                overflow="hidden"
              >
                <Image src={item.picture} style={{ maxHeight: `10rem`, width: `100%` }} />
                <Flex display="flex" justify="space-between" align="center" gap="9px" minH="3.5rem" maxH="3.5rem" w="100%">
                  <Text noOfLines={2} px="0.5rem" flex="1">
                    {item.name}
                  </Text>
                  <Flex display="flex" align="center" justify="center" gap="0.25rem" pr="0.5rem">
                    <Image src="/icons/coin.svg" />
                    <Text w="fit-content" fontSize="14px" display="flex" color="primary700" fontWeight="500">
                      {item.price}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          ))}
        </Grid>
      </Flex>

      <Flex
        display="column"
        bg="white"
        w="340px"
        gap="2.5rem"
        borderRadius="10px"
        border="1px"
        overflow="hidden"
        justify="space-between"
        borderColor="gray200"
        p="1rem"
        h="100%"
      >
        <Flex direction="column" overflow="hidden" flex="1" h="calc(100% - 10.2rem)">
          <Accordion allowMultiple mb="0.75rem">
            <AccordionItem border="none" borderBottom="1px" borderColor="gray300" pb="0.25rem">
              <AccordionButton p="0.25rem">
                <Flex w="100%" fontSize="15px" gap="0.5rem" align="center" justify="space-between">
                  <Text>Saldo do grupo</Text>
                  <Flex align="center" gap="0.35rem">
                    <CoinIcon size="xs" />
                    <Text>
                      {formatCoin(
                        group.students.reduce((total, student) => total + ((student.metadata.coins || 0) > 0 ? student.metadata.coins || 0 : 0), 0),
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

          <Flex direction="column" overflow="hidden auto" gap="0.75rem" py="0.35rem">
            {cart.map((item) => (
              <Flex key={item.id} gap="12px" border="1px" borderColor="gray300" borderRadius="md" padding=".25rem">
                <Flex w="40px" h="40px" bgImage={item.picture} bgSize="cover" bgPosition="center" />
                <Flex w="97.5px" display="column" align="center" justify="center" gap="9px" fontWeight="500" fontSize="14px" color="gray700">
                  {item.name}
                  <Flex display="flex" align="center" gap="9px" h="18px">
                    <Image src="/icons/cash.svg" />
                    <Text w="fit-content" fontSize="15px" display="flex" align="center" gap="9px" color="primary700" fontWeight="500">
                      {item.price}
                    </Text>
                  </Flex>
                </Flex>
                <Flex display="flex" justify="center" align="center">
                  <Flex w="97.5px" h="40px" display="flex" justify="space-between" align="center">
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
                <Flex display="flex" justify="center" align="center">
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
          </Flex>
        </Flex>

        <Flex direction="column">
          <Flex w="100%" justify="flex-end" align="center" gap="0.5rem" py="0.5rem">
            <Text fontSize="20px">Total</Text>
            <Image src="/icons/coin.svg" height="40px" />
            <Text fontSize="40px" fontWeight="700" color="primary900">
              {totalPrice}
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
                onClick={() => onChangeView(`orders`)}
              >
                <BsArrowLeft />
                Sair da loja
              </Flex>
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
      </Flex>

      <SmallModal
        size="xl"
        topIcon="checked"
        title="Finalizar pedido"
        show={!!orderPayload}
        onConfirm={() => {
          if (!orderPayload) return;
          onFinishOrder(orderPayload);
          setOrderPayload(null);
          onChangeView(`orders`);
        }}
        onCancel={() => setOrderPayload(null)}
        disableOkButton={haveMemberWithNegativeBalance}
      >
        <Flex direction="column" gap="0.5rem">
          {haveMemberWithNegativeBalance ? (
            <>
              <Text>
                Um ou mais membros do grupo possuem saldo negativo, volte para finalizar o pedido quando todos membros estiverem com saldo positivo.
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
  );
};
