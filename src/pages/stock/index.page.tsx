import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { Flex, Text, Img } from '@chakra-ui/react';

import { logError, cookieManager } from '@/_base/utils';
import { FaMinus, FaPlus } from 'react-icons/fa';

interface IProducts {
  id: string;
  img: string;
  name: string;
  quantity: number;
}

const mockProducts: IProducts[] = [
  {
    id: '1',
    img: 'https://www.makerhero.com/wp-content/uploads/2017/07/1AC01-9-1-min.jpeg',
    name: 'Arduíno',
    quantity: 1,
  },
  {
    id: '2',
    img: 'https://www.tecnotronics.com.br/wp-content/uploads/2017/03/a122_a.jpg',
    name: 'Jumper',
    quantity: 1,
  },
  {
    id: '3',
    img: 'https://cdn.awsli.com.br/600x700/468/468162/produto/1941435412328b077d.jpg',
    name: 'LED Difuso',
    quantity: 1,
  },
];

const Stock: React.FC = () => {
  const [cart, setCart] = useState<IProducts[]>([]);
  return (
    <Flex w="100%" h="100%" direction="row" gap="8px">
      {mockProducts.map((product) => (
        <Flex
          key={product.id}
          w="300px"
          h="300px"
          borderRadius="8px"
          bgColor="white"
          boxShadow="md"
          border="1px"
          borderColor="gray100"
          direction="column"
          p="20px"
        >
          <Img src={product.img} w="200px" alignSelf="center" justifySelf="center" />
          <Text>{product.name}</Text>
          <Flex display="flex" justify="space-between" align="center">
            <FaMinus fontSize="10px" color="gray300" cursor="pointer" onClick={() => product.quantity - 1} />
            <Text fontSize="14px" fontWeight="500" color="gray500">
              1
            </Text>
            <FaPlus cursor="pointer" fontSize="10px" color="gray300" onClick={() => product.quantity + 1} />
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
};

export default Stock;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'stock';

  try {
    cookieManager.updateToken(req);

    return { props: { selectedPage, pageTitle: 'Estoque', showBackButton: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
