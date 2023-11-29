import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { Flex, Img, Link, Progress, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Header } from 'rsuite';

interface IProducts {
  id: string;
  img: string;
  name: string;
  price: number;
}

const mockProducts: IProducts[] = [
  {
    id: '1',
    img: '',
    name: 'Moletom PiCode',
    price: 60,
  },
  {
    id: '2',
    img: '',
    name: 'Caneca PiCode',
    price: 10,
  },
  {
    id: '3',
    img: '',
    name: 'Boné PiCode',
    price: 0,
  },
];

const Store: React.FC = () => {
  const [myProducts, setMyProducts] = useState<IProducts[]>(mockProducts);
  return (
    <Flex
      bgColor="white"
      direction="column"
      borderRadius="12px"
      boxShadow="md"
      w="100%"
      h="360px"
      padding="20px 0"
      gap="20px"
      textAlign="left"
      whiteSpace="nowrap"
      borderBottom="1px solid gray300"
    >
      <Text borderBottom="1px" borderColor="gray300" padding="0 20px 20px">
        Meus cursos
      </Text>
      <Flex gap="2rem" padding="0 20px">
        {myProducts.map((products) => (
          <Flex
            key={products.id}
            direction="column"
            h="100%"
            w="156px"
            gap="0.5rem"
            overflow="hidden"
            cursor="pointer"
            _hover={{ filter: 'brightness(0.95)' }}
          >
            <Flex backgroundImage={products.img} backgroundSize="cover" backgroundPosition="center" h="203px" w="156px" borderRadius="3px" />
            <Text>{products.name}</Text>
            <Flex align="center" gap="1rem">
              <Text w="fit-content" fontSize="12px">
                {products.price}
              </Text>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default Store;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'store';

  try {
    cookieManager.updateToken(req);

    // await validateSession();

    return { props: { selectedPage, pageTitle: 'Loja' } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
