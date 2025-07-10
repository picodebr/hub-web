import { LuRocket } from 'react-icons/lu';
import { GetServerSideProps } from 'next';
import { Button, Flex, Text } from '@chakra-ui/react';
import { FaRegClock } from 'react-icons/fa';

import { CommingSoon } from '@/components/CommingSoon';

const Events: React.FC = () => {
  return (
    <Flex direction="column" w="100%" h="69px" padding="20px 0" gap="20px" textAlign="left" whiteSpace="nowrap">
      <CommingSoon />
      <Flex align="center" justify="flex-end" h="fit-content"></Flex>
      <Flex
        bgColor="white"
        display="flex"
        flexDirection="column"
        justify="center"
        align="center"
        h="fit-content"
        borderRadius="10px"
        
        color="primary700"
        gap="16px"
        fontSize="18px"
        p="96px 128px"
      >
        {/* <Img src="https://media.newyorker.com/photos/64629d9ca8c7816949e96e85/1:1/w_1910,h_1910,c_limit/Dillon-Blur-11.jpg"></Img> */}
        <Flex display="flex" flexDirection="column" align="center" justify="center" gap="8px" fontSize="20px" fontWeight="600" color="primary800">
          <FaRegClock size="26px" />
          Tempo restante para o desafio
        </Flex>
        <Flex color="gray600" fontSize="16px" gap="8px" textAlign="center">
          Fique atento(a)! O desafio está em andamento, e o tempo está passando. Você tem o seguinte período para completar o desafio
        </Flex>

        <Text fontSize="14px" color="gray600">
          Use cada momento valioso para dar o seu melhor. Boa sorte!
        </Text>
        <Button bgColor="primary600" gap="8px" color="white" p="12px">
          Iniciar Desafio
          <LuRocket />
        </Button>
      </Flex>
    </Flex>
  );
};

export default Events;

export const getServerSideProps: GetServerSideProps = async () => {
  const selectedPage = 'events';

  return { props: { selectedPage, pageTitle: 'Eventos', showBackButton: false } };
};
