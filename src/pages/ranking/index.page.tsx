import { Divider, Flex, Image, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { cookieManager, logError } from '@/_base/utils';
import { validateSession } from '@/_base/services/auth';
import { IoIosArrowForward } from 'react-icons/io';

const Ranking: React.FC = () => {
  return (
    <Flex flex="1" direction="column" gap="1.85rem">
      <Flex direction="row" justify="space-between">
        <Flex
          w="48%"
          direction="column"
          h="284px"
          bgColor="white"
          border="1px"
          borderColor="gray300"
          borderRadius="10px"
          padding="20px"
          overflow="auto"
        >
          <Flex w="fit-content" h="30px" direction="row" justify="center" align="center" gap="12px" color="gray600">
            <Image src="/icons/medal.svg" w="24px" h="24px" />
            <Text>Rank da turma</Text>
          </Flex>
          <Divider marginTop="20px" />
          <Flex w="100%" padding="10px 16px" justify="space-between">
            <Text fontWeight="600" color="gray700">
              rafasuffi
            </Text>
            <Text color="gray400">#1</Text>
          </Flex>
          <Flex w="100%" padding="10px 16px" justify="space-between">
            <Text fontWeight="600" color="gray700">
              lucaspiovani
            </Text>
            <Text color="gray400">#2</Text>
          </Flex>
          <Flex w="100%" padding="10px 16px" justify="space-between">
            <Text fontWeight="600" color="gray700">
              giovannimarin
            </Text>
            <Text color="gray400">#3</Text>
          </Flex>
          <Flex w="100%" padding="10px 16px" justify="space-between">
            <Text fontWeight="600" color="gray700">
              adeniltonribeiro
            </Text>
            <Text color="gray400">#4</Text>
          </Flex>
          <Flex w="100%" padding="10px 16px" justify="space-between">
            <Text fontWeight="600" color="gray700">
              flavianmf
            </Text>
            <Text color="gray400">#5</Text>
          </Flex>
        </Flex>
        <Flex w="48%" h="284px" direction="column" bgColor="white" border="1px" borderColor="gray300" borderRadius="10px" padding="20px">
          <Flex w="fit-content" h="30px" direction="row" justify="center" align="center" gap="12px" color="gray600">
            <Image src="/icons/BR.svg" w="24px" h="24px" />
            <Text>Rank Nacional</Text>
          </Flex>
          <Divider marginTop="20px" />
          <Flex w="100%" padding="10px 16px" justify="space-between">
            <Text fontWeight="500" color="gray700">
              andersonfelix
            </Text>
            <Text color="gray400">#1</Text>
          </Flex>
          <Flex w="100%" padding="10px 16px" justify="space-between">
            <Text fontWeight="600" color="gray700">
              anasichieri
            </Text>
            <Text color="gray400">#2</Text>
          </Flex>
        </Flex>
      </Flex>
      <Flex w="100%" h="auto" direction="column" p="20px" border="1px" borderColor="gray300" borderRadius="10px" bgColor="white">
        <Text>Desafiar um amigo</Text>
        <Divider mt="20px" />
        <Flex direction="row" align="center" gap="12px" mt="12px" justify="space-between">
          <Flex w="auto" h="auto" gap="12px">
            <Image src="/avatars/default.jpeg" w="40px" h="40px" borderRadius="50%" />
            <Flex direction="column">
              <Text fontWeight="600">andersonfelix</Text>
              <Text>#1</Text>
            </Flex>
          </Flex>
          <Flex color="primary700" fontWeight="600" align="center" gap="8px" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
            <Text>Desafiar</Text>
            <IoIosArrowForward />
          </Flex>
        </Flex>
        <Flex direction="row" align="center" gap="12px" mt="12px" justify="space-between">
          <Flex w="auto" h="auto" gap="12px">
            <Image src="/avatars/default.jpeg" w="40px" h="40px" borderRadius="50%" />
            <Flex direction="column">
              <Text fontWeight="600">adeniltonribeiro</Text>
              <Text>#4</Text>
            </Flex>
          </Flex>
          <Flex color="primary700" fontWeight="600" align="center" gap="8px" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
            <Text>Desafiar</Text>
            <IoIosArrowForward />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Ranking;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'ranking';

  try {
    cookieManager.updateToken(req);

    await validateSession();

    return { props: { selectedPage, pageTitle: 'Ranking', showBackButton: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
