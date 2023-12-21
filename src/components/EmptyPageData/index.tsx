import { Flex, FlexProps, Image, Text } from '@chakra-ui/react';

export const EmptyPageData: React.FC<FlexProps> = (props) => (
  <Flex w="100%" minH="calc(100vh - 32rem)" justify="center" align="center" direction="column" {...props}>
    <Image src="/generic/empty.svg" h="26rem" />
    <Text mt="-3rem" fontSize="18px" fontWeight="500">
      Poxa, não encontramos nada por aqui...
    </Text>
  </Flex>
);
