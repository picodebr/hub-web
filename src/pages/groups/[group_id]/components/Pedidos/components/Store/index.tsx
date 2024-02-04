import { Flex, Grid, Text, Image } from '@chakra-ui/react';
import { OrdersPageView } from '../..';
import { FiShoppingCart, FiTrash } from 'react-icons/fi';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { FaRegTrashCan } from 'react-icons/fa6';
import { useState } from 'react';
import { IStoreComponentItem } from '@/_base/interfaces/store';
import { storeComponentList } from '@/_base/utils/storeComponentList';
import { BsArrowLeft } from 'react-icons/bs';
import { IHubGroupOrderItem } from '@/_base/interfaces/group';
import { SmallModal } from '@/components/Modal/Small';

type CustomStoreItem = IStoreComponentItem & { quantity: number };
interface IProps {
  onChangeView: (view: OrdersPageView) => void;
  onFinishOrder: (data: IHubGroupOrderItem[]) => void;
}

export const Store: React.FC<IProps> = ({ onChangeView, onFinishOrder }) => {
  const [cart, setCart] = useState<CustomStoreItem[]>([]);
  const [orderPayload, setOrderPayload] = useState<IHubGroupOrderItem[] | null>(null);

  const addItemInCart = (item: IStoreComponentItem) => {
    const targetItemInCard = cart.find((e) => e.id === item.id);

    if (targetItemInCard)
      setCart((e) => e.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem)));
    else setCart((e) => [...e, { ...item, quantity: 1 }]);
  };

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
          {storeComponentList.map((item) => (
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
                <Image src={item.image} style={{ maxHeight: `10rem`, width: `100%` }} />
                <Flex display="flex" justify="space-between" align="center" gap="9px" minH="3.5rem" maxH="3.5rem" w="100%">
                  <Text noOfLines={2} px="0.5rem" flex="1">
                    {item.name}
                  </Text>
                  <Flex display="flex" align="center" justify="center" gap="0.25rem" pr="0.5rem">
                    <Image src="/icons/cash.svg" />
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
        borderColor="gray200"
        p="20px"
        h="100%"
      >
        <Flex display="flex" justify="space-between" w="100%" borderBottom="1px" borderColor="gray300" h="4rem" fontSize="14px" color="gray500">
          <Text>Item</Text>
          <Text>Quantidade</Text>
        </Flex>
        <Flex direction="column" overflow="auto" flex="1" h="calc(100% - 17rem)" gap="0.75rem" py="0.75rem">
          {cart.map((item) => (
            <Flex key={item.id} gap="12px" border="1px" borderColor="gray300" borderRadius="md" padding=".25rem">
              <Flex w="40px" h="40px" bgImage={item.image} bgSize="cover" bgPosition="center" />
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

        <Flex direction="column" h="10rem">
          <Flex pt="24px" pb="24px" w="100%" justify="flex-end" align="center" gap="4px">
            <Image src="/icons/cash.svg" width="60px" />
            <Text fontSize="50px" fontWeight="700" color="primary900">
              {cart.reduce((acc, { price, quantity }) => (acc += price * quantity), 0)}
            </Text>
          </Flex>
          <Flex direction="column" gap="1.35rem">
            <Flex
              cursor="pointer"
              color="white"
              bgColor="primary600"
              p="0.5rem"
              justify="center"
              align="center"
              borderRadius="8px"
              fontWeight="600"
              _hover={{ filter: `brightness(0.9)` }}
              onClick={() =>
                setOrderPayload(
                  cart.map((e) => ({
                    id: e.id,
                    name: e.name,
                    description: e.description,
                    image: e.image,
                    price: `${e.price}`,
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
        title="Finalizar pedido?"
        show={!!orderPayload}
        onConfirm={() => {
          if (!orderPayload) return;
          onFinishOrder(orderPayload);
          setOrderPayload(null);
          onChangeView(`orders`);
        }}
        onCancel={() => setOrderPayload(null)}
      >
        <Flex>Tem certeza de todos os itens?</Flex>
      </SmallModal>
    </Flex>
  );
};
