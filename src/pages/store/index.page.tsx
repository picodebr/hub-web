import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { FiHelpCircle, FiShoppingCart, FiTrash } from 'react-icons/fi';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { FaRegTrashCan } from 'react-icons/fa6';

import { Flex, Image, Text, Checkbox } from '@chakra-ui/react';
import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { CommingSoon } from '@/components/CommingSoon';

interface IProducts {
  id: string;
  img: string;
  name: string;
  price: number;
  quantity: number;
}

const mockProducts: IProducts[] = [
  {
    id: '1',
    img: '',
    name: 'Moletom PiCode',
    price: 60,
    quantity: 1,
  },
  {
    id: '2',
    img: '',
    name: 'Caneca PiCode',
    price: 10,
    quantity: 1,
  },
  {
    id: '3',
    img: '',
    name: 'Boné PiCode',
    price: 0,
    quantity: 1,
  },
  {
    id: '4',
    img: '',
    name: 'Regata PiCode',
    price: 50,
    quantity: 1,
  },
  {
    id: '5',
    img: '',
    name: 'Blusa T-Shirt PiCode',
    price: 50,
    quantity: 1,
  },
  {
    id: '6',
    img: '',
    name: 'Regata PiCode',
    price: 50,
    quantity: 1,
  },
  {
    id: '7',
    img: '',
    name: 'Regata PiCode',
    price: 50,
    quantity: 1,
  },
  {
    id: '8',
    img: '',
    name: 'Regata PiCode',
    price: 50,
    quantity: 1,
  },
];

const Store: React.FC = () => {
  const [cart, setCart] = useState<IProducts[]>([]);
  const removeFromCart = (productId: any) => {
    setCart((state) => state.filter((product) => product.id !== productId));
  };
  const [myProducts] = useState<IProducts[]>(mockProducts);
  return (
    <Flex display="flex" justify="center" flexDirection="row" flexWrap="wrap" gap="32px">
      <CommingSoon />

      <Flex h="60px" w="100%" display="flex" align="center" gap="8px" justify="end">
        <Flex w="280px" h="60px" display="flex" align="center" p="16px 20px" borderRadius="10px" gap="32px" bg="primary400" justify="space-between">
          <Text color="gray500" fontSize="14px">
            Seu saldo:
          </Text>
          <Flex gap="12px">
            <Image src="/icons/cash.svg" w="20px" />
            <Text fontSize="18px" fontWeight="600" color="primary700">
              48
            </Text>
          </Flex>
          <FiHelpCircle fontSize="16px" color="#98A2B3" />
        </Flex>
      </Flex>
      <Flex
        bgColor="white"
        flexDirection="row"
        borderRadius="12px"
        boxShadow="md"
        w="762px"
        h="658px"
        padding="20px"
        gap="20px"
        textAlign="left"
        display="flex"
        justify="center"
      >
        {/* Product Card */}
        <Flex flexDirection="row" flexWrap="wrap" display="flex" gap="32px">
          {myProducts.map((product) => (
            <Flex
              key={product.id}
              direction="column"
              h="auto"
              w="156px"
              gap="0.5rem"
              cursor="pointer"
              fontWeight="500"
              color="gray700"
              fontSize="14px"
              align="center"
              position="relative"
            >
              <Flex
                position="absolute"
                top="-0.4rem"
                right="-0.4rem"
                gap="9px"
                w="24px"
                h="24px"
                bgColor="primary500"
                borderRadius="6px"
                align="center"
                justify="center"
                color="white"
                onClick={() => setCart((state) => [...state, product])}
              >
                <FiShoppingCart fontSize="14px" />
              </Flex>
              <Flex backgroundColor="gray200" backgroundSize="cover" backgroundPosition="center" h="203px" w="156px" borderRadius="5px" />
              <Flex display="flex" justify="space-between" align="center" gap="9px">
                <Text>{product.name}</Text>
                <Flex display="flex" align="center" justify="center" gap="9px">
                  <Image src="/icons/cash.svg" />
                  <Text w="fit-content" fontSize="15px" display="flex" align="center" gap="9px" color="primary700" fontWeight="500">
                    {product.price}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Flex>
      {/* Shopping Cart */}
      <Flex
        display="column"
        overflow="auto"
        overflowX="hidden"
        justify="center"
        bg="white"
        w="384px"
        h="auto"
        gap="2.5rem"
        borderRadius="10px"
        boxShadow="md"
        p="20px"
      >
        <Flex
          display="flex"
          justify="space-between"
          w="100%"
          borderBottom="1px"
          borderColor="gray300"
          h="fit-content"
          marginBottom="0.5rem"
          fontSize="14px"
          color="gray500"
        >
          <Text>Item</Text>
          <Text>Quantidade</Text>
        </Flex>
        {cart.map((product) => (
          <>
            <Flex w="344px" gap="12px" paddingBottom="24px">
              <Checkbox defaultChecked>
                <Flex w="40px" h="40px" paddingRight="32px" borderRadius="4px" bgColor="gray200" display="flex" direction="row" />
              </Checkbox>
              <Flex w="97.5px" h="66px" display="column" align="center" justify="center" gap="9px" fontWeight="500" fontSize="14px" color="gray700">
                {product.name}
                <Flex display="flex" align="center" gap="9px" h="18px">
                  <Image src="/icons/cash.svg" />
                  <Text w="fit-content" fontSize="15px" display="flex" align="center" gap="9px" color="primary700" fontWeight="500">
                    {product.price}
                  </Text>
                </Flex>
              </Flex>
              <Flex display="flex" justify="center" align="center">
                <Flex w="97.5px" h="40px" display="flex" justify="space-between" align="center">
                  <FaMinus fontSize="10px" color="gray300" />
                  <Text fontSize="14px" fontWeight="500" color="gray500">
                    {product.quantity}
                  </Text>
                  <FaPlus cursor="pointer" fontSize="10px" color="gray300" onClick={() => product.quantity + 1} />
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
                  onClick={() => removeFromCart(product.id)}
                >
                  <FiTrash />
                </Flex>
              </Flex>
            </Flex>
          </>
        ))}
        <Flex pt="24px" pb="24px" w="100%" justify="flex-end" align="center" gap="4px">
          <Image src="/icons/cash.svg" w="60px" />
          <Text fontSize="50px" fontWeight="700" color="primary900">
            150
          </Text>
        </Flex>
        <Flex direction="column" gap="10px">
          <Flex
            cursor="pointer"
            color="white"
            bgColor="primary600"
            w="344px"
            h="44px"
            p="18px"
            justify="center"
            align="center"
            borderRadius="8px"
            fontWeight="600"
          >
            Finalizar Compra
          </Flex>
          <Flex color="gray500" justify="center" align="center" gap="2px" cursor="pointer" onClick={() => setCart([])}>
            Limpar
            <FaRegTrashCan />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Store;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'store';

  try {
    cookieManager.updateToken(req);

    await validateSession();

    return { props: { selectedPage, pageTitle: 'Loja', showBackButton: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
