import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { Flex, Img, Link, Progress, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Header } from 'rsuite';

interface ICourse {
  id: string;
  img: string;
  name: string;
  percent: number;
}

const mockCourses: ICourse[] = [
  {
    id: '1',
    img: 'https://assets-global.website-files.com/616d40df2ab95b424def1e10/64678e4b202d786e594d520f_isaac-ilustra-maker.png',
    name: 'Programação',
    percent: 60,
  },
  {
    id: '2',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR8Q-QYyvLg4l4rvvnacVU7RcU2ey4UDd-h0bfNicuIdyeGGP1y9QcCXdGyXewfsDcHRU&usqp=CAU',
    name: 'Introdução à tecnologia',
    percent: 10,
  },
  {
    id: '3',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXAufehYrBgkUrORvN8CDV57WpOm78xRofbwauRh2eqBqJAtvybMR7ExidQIkVJfpRntg&usqp=CAU',
    name: 'Matemática',
    percent: 0,
  },
];

const Home: React.FC = () => {
  const [myCourses, setMyCourses] = useState<ICourse[]>(mockCourses);
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
      border="1px"
      borderColor="gray300"
      color="gray600"
    >
      <Text borderBottom="1px" borderColor="gray300" padding="0 20px 20px">
        Meus cursos
      </Text>
      <Flex gap="2rem" padding="0 20px">
        {myCourses.map((course) => (
          <Flex
            key={course.id}
            direction="column"
            h="100%"
            w="156px"
            gap="0.5rem"
            overflow="hidden"
            cursor="pointer"
            _hover={{ filter: 'brightness(0.95)' }}
          >
            <Flex backgroundImage={course.img} backgroundSize="cover" backgroundPosition="center" h="203px" w="156px" borderRadius="3px" />
            <Text>{course.name}</Text>
            <Flex align="center" gap="1rem">
              <Progress size="sm" colorScheme="green" value={course.percent} rounded={8} flex="1" min={0} max={100} />
              <Text w="fit-content" fontSize="12px">
                {course.percent}%
              </Text>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'courses';

  try {
    cookieManager.updateToken(req);

    await validateSession();

    return { props: { selectedPage, pageTitle: 'Meus cursos' } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
