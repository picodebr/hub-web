import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { Box, Button, Container, Heading, Image, Stack, Text } from '@chakra-ui/react';

const NotFound: React.FC = () => {
  const router = useCustomRouter();

  return (
    <Container maxW={'3xl'}>
      <Stack as={Box} textAlign={'center'} spacing={{ base: 8, md: 10 }} align={'center'}>
        <Image src="/not-found.jpg" alt="not found image" h="350px" w="350px" />
        <Heading fontWeight={600} fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }} lineHeight={'110%'}>
          Page not found <br />
        </Heading>
        <Text color={'gray.500'}>The page you are looking for does not exist.</Text>
        <Stack direction={'column'} spacing={3} align={'center'} alignSelf={'center'} position={'relative'}>
          <Button
            colorScheme={'green'}
            bg={'green.400'}
            rounded={'full'}
            px={6}
            _hover={{
              bg: 'green.500',
            }}
            onClick={() => router.push('/home')}
          >
            Back to home
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default NotFound;
