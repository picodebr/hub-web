import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { FaPlus, FaRegFolder } from 'react-icons/fa';
import { FiMoreVertical, FiUsers } from 'react-icons/fi';
import { Header } from 'rsuite';

import { Avatar, AvatarGroup } from '@chakra-ui/react';
import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { Flex, Img, Link, Progress, Text } from '@chakra-ui/react';

interface IBooks {
  id: string;
  title: string;
  img: string;
}

const mockBooks: IBooks[] = [
  {
    id: '1',
    title: 'Geografia',
    img: 'https://www.editoracrv.com.br/img_produtos/99a54fe727fbda27a1c9676f6884298d.jpg',
  },
  {
    id: '2',
    title: 'Tecnologia',
    img: 'https://www.editoracrv.com.br/img_produtos/f2dbe7bb6cbf23a82bddbc411a60eaf5.jpg',
  },
  {
    id: '3',
    title: 'Matemática',
    img: 'https://portal.utfpr.edu.br/cursos/coordenacoes/graduacao/curitiba/ct-licenciatura-em-matematica/destaques/capalivrodidticaMalu.jpg/@@images/image.jpeg',
  },
];

const Books: React.FC = () => {
  const [myBooks, setMyBooks] = useState<IBooks[]>(mockBooks);
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
        Biblioteca
      </Text>
      <Flex gap="2rem" padding="0 20px">
        {myBooks.map((book) => (
          <Flex
            key={book.id}
            direction="column"
            h="100%"
            w="156px"
            gap="0.5rem"
            overflow="hidden"
            cursor="pointer"
            _hover={{ filter: 'brightness(0.95)' }}
          >
            <Flex backgroundImage={book.img} backgroundSize="cover" backgroundPosition="center" h="203px" w="156px" borderRadius="4px" />
            <Text>{book.title}</Text>
            <Flex align="center" gap="1rem"></Flex>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default Books;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'library';

  try {
    cookieManager.updateToken(req);

    await validateSession();

    return { props: { selectedPage, pageTitle: 'Meus livros' } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
