import { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { BiLeftArrowAlt } from 'react-icons/bi';
import { MdOutlineZoomIn, MdOutlineZoomOut } from 'react-icons/md';
import {
  Flex,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Grid,
  Modal,
  ModalContent,
  ModalOverlay,
  Image,
  Button,
  Spinner,
} from '@chakra-ui/react';

import { formatClassGrade, sortGrades } from '@/_base/utils';
import { TabSwitch } from '@/components/TabSwitch';
import { listBookCategories } from '@/_base/services/book';
import { IHubBook, IHubBookCategory } from '@/_base/interfaces/book';
import { useAsyncCallback, useAuth } from '@/_base/hooks';
import { IHubVideo, IHubVideoCategory } from '@/_base/interfaces/video';
import { listVideoCategories } from '@/_base/services/video';
import { FiDownload } from 'react-icons/fi';

type BookByGrade = Record<string, IHubBook[]>;
type VideoByGrade = Record<string, IHubVideo[]>;
interface IProps {
  bookCategories: IHubBookCategory[];
  videoCategories: IHubVideoCategory[];
  selectedItemId: string;
}

const Books: React.FC<IProps> = ({ selectedItemId }) => {
  const [bookCategories, setBookCategories] = useState<IHubBookCategory[]>([]);
  const [videoCategories, setVideoCategories] = useState<IHubVideoCategory[]>([]);
  const [bookCategory, setBookCategory] = useState<IHubBookCategory | null>(null);
  const [videoCategory, setVideoCategory] = useState<IHubVideoCategory | null>(null);
  const [modalVideo, setModalVideo] = useState<IHubVideo | null>(null);
  const [targetBook, setTargetBook] = useState<IHubBook | null>(null);
  const [PDFPages, setPDFPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();

  const getBooks = useAsyncCallback(
    async () => {
      setIsLoading(true);
      const [{ results: bookCategoryRes }, { results: videoCategoryRes }] = await Promise.all([listBookCategories(), listVideoCategories()]);
      setBookCategory(bookCategoryRes[0]);
      setVideoCategories(videoCategoryRes);
      setBookCategories(bookCategoryRes);
    },
    [],
    true,
    () => setIsLoading(false),
    false,
  );

  useEffect(() => {
    getBooks();
  }, []);

  useEffect(() => {
    if (!selectedItemId) return;

    const target = bookCategories.flatMap((e) => e.books).find((e) => e.id === selectedItemId);
    if (target) setTargetBook(target);
  }, [selectedItemId, bookCategories]);

  const handleCategoryView = (key: string) => {
    const targetBookCategory = bookCategories.find((e) => e.id === key);

    if (targetBookCategory?.display_name.match(`Materiais complementares`)) {
      const targetVideoCategory = videoCategories
        .filter((e) => !!e.display_name.match(`Materiais complementares`))
        .reduce((acc, v) => ({ ...acc, ...v, videos: [...v.videos, ...acc.videos] }), { videos: [] as any } as IHubVideoCategory);
      if (targetVideoCategory?.id) setVideoCategory(targetVideoCategory);
    } else setVideoCategory(null);

    if (targetBookCategory) {
      setBookCategory(targetBookCategory);
    }
  };

  const booksByGrade = useMemo<BookByGrade>(
    () =>
      bookCategory?.books?.reduce((acc, book) => {
        book.grades.forEach((grade) => {
          if (acc[grade]?.length) acc[grade].push(book);
          else acc[grade] = [book];
        });
        return acc;
      }, {} as BookByGrade) || {},
    [bookCategory],
  );

  const videosByGrade = useMemo<VideoByGrade>(
    () =>
      videoCategory?.videos?.reduce((acc, video) => {
        video.grades.forEach((grade) => {
          if (acc[grade]?.length) acc[grade].push(video);
          else acc[grade] = [video];
        });
        return acc;
      }, {} as VideoByGrade) || {},
    [videoCategory],
  );

  const showBookFile = (book: IHubBook) => {
    setIsLoading(true);
    setTargetBook(book);
  };

  const downloadBook = (file: string, title: string) => {
    const link = document.createElement('a');
    link.setAttribute(`target`, `_blank`);
    link.href = file;
    link.download = `${title}.pdf`;
    link.click();
  };

  return ![...Object.keys(booksByGrade), ...Object.keys(videosByGrade)].length ? (
    <Flex>
      <TabSwitch
        tabs={bookCategories.map((cat) => ({
          isSelected: bookCategory?.id === cat.id,
          key: cat.id,
          label: cat.display_name,
        }))}
        onSwitch={handleCategoryView}
      />
    </Flex>
  ) : (
    <Flex w="100%" h="100%" direction="column" gap="24px" overflow="hidden auto">
      {user.role !== `student` && (
        <TabSwitch
          tabs={bookCategories.map((cat) => ({
            isSelected: bookCategory?.id === cat.id,
            key: cat.id,
            label: cat.display_name,
          }))}
          onSwitch={handleCategoryView}
        />
      )}
      {user.role === `student` ? (
        <Grid
          gap="1rem"
          gridTemplateColumns="repeat(auto-fill, minmax(210px, 1fr))"
          gridTemplateRows="minmax(min-content, max-content)"
          padding="2rem"
          borderRadius="md"
          flex="1"
        >
          {booksByGrade[user.hub_class?.grade]?.map((book) => (
            <Flex
              key={book.id}
              direction="column"
              h="100%"
              w="210px"
              gap="0.5rem"
              overflow="hidden"
              cursor="pointer"
              _hover={{ filter: 'brightness(0.95)' }}
              bg="white"
              border="1px"
              borderColor="gray300"
              borderRadius="md"
              p="1rem"
              onClick={() => showBookFile(book)}
            >
              <Flex
                backgroundImage={book.thumbnail || `/images/book.svg`}
                backgroundSize="contain"
                backgroundPosition="center"
                backgroundRepeat="no-repeat"
                h="250px"
                borderRadius="4px"
              />
              <Text fontWeight="500" p="0.25rem 0.35rem" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden" color="gray600">
                {book.title}
              </Text>
            </Flex>
          ))}
        </Grid>
      ) : (
        // </Flex>
        <Accordion borderColor="gray300" w="100%" h="100%" gridGap={5} allowMultiple>
          {sortGrades(Object.keys(videosByGrade)).map((grade) => (
            <AccordionItem bgColor="white" key={grade} borderRadius="12px" border="1px" borderColor="gray300" mb="1rem">
              <AccordionButton borderRadius="md" h="64px" justifyContent="space-between" color="gray600">
                <Text color="gray600">{formatClassGrade(grade)}</Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Flex gap="2rem" pt="0.5rem">
                  {videosByGrade[grade]?.map((video) => (
                    <Flex
                      key={video.id}
                      onClick={() => setModalVideo(video)}
                      direction="column"
                      maxW="24rem"
                      h="20rem"
                      gap="0.5rem"
                      border="1px"
                      borderRadius="md"
                      borderColor="gray200"
                      overflow="hidden"
                      cursor="pointer"
                      transition="0.1s"
                      _hover={{ boxShadow: `md` }}
                    >
                      <Flex bgImage={video.thumbnail} flex="1" bgSize="cover" />
                      <Flex direction="column" gap="0.5rem" h="7rem" p="0 0.65rem 0.65rem" overflow="hidden auto">
                        <Text color="gray600">{video.title}</Text>
                        <Text color="gray600">{video.description}</Text>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              </AccordionPanel>
            </AccordionItem>
          ))}
          {sortGrades(Object.keys(booksByGrade)).map((grade) => (
            <AccordionItem bgColor="white" key={grade} borderRadius="12px" border="1px" borderColor="gray300" mb="1rem">
              <AccordionButton borderRadius="md" h="64px" justifyContent="space-between">
                <Text color="gray600">{formatClassGrade(grade)}</Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Flex gap="2rem" pt="0.5rem">
                  {booksByGrade[grade]?.map((book) => (
                    <Flex
                      key={book.id}
                      direction="column"
                      h="100%"
                      w="156px"
                      gap="0.5rem"
                      overflow="hidden"
                      cursor="pointer"
                      _hover={{ filter: 'brightness(0.95)' }}
                      onClick={() => showBookFile(book)}
                    >
                      <Flex
                        backgroundImage={book.thumbnail || `/images/book.svg`}
                        backgroundSize="cover"
                        backgroundPosition="center"
                        h="203px"
                        w="156px"
                        borderRadius="4px"
                      />
                      <Text fontWeight="500" p="0.25rem 0.35rem" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden" color="gray600">
                        {book.title}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </AccordionPanel>
            </AccordionItem>
          ))}
          <Modal isOpen={!!modalVideo} onClose={() => setModalVideo(null)} size="4xl">
            <ModalOverlay />
            <ModalContent w="100%">
              <video controls preload="false" autoPlay controlsList="nodownload" poster={modalVideo?.thumbnail}>
                <source src={modalVideo?.file} type="video/mp4" />
              </video>
            </ModalContent>
          </Modal>
        </Accordion>
      )}
      <Modal isOpen={!!targetBook} onClose={() => setTargetBook(null)} size="full" scrollBehavior="inside">
        <ModalContent
          display="flex"
          alignItems="center"
          bg="#eeefff"
          overflow="hidden auto"
          sx={{
            '&::-webkit-scrollbar': {
              width: '12px',
            },
            '&::-webkit-scrollbar-track': {
              width: '20px',
              margin: `1rem`,
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'primary700',
              width: '100px !important',
              height: `80px`,
              borderRadius: '9px',
              borderRight: `4px`,
              borderColor: `#7197ff`,
            },
          }}
        >
          <iframe
            src={targetBook?.file}
            title={targetBook?.title}
            style={{ width: '100%', height: '100vh', border: 'none' }}
            onLoad={() => setIsLoading(false)}
          />
          <Flex
            display={isLoading ? `flex` : `none`}
            align="center"
            justify="center"
            position="fixed"
            bg="#eeefff"
            w="100%"
            h="100%"
            zIndex={9999}
            direction="column"
          >
            <Image src="/loading/rocket-picode.gif" h="19rem" />
            <Spinner size="lg" />
          </Flex>
          <Button
            onClick={() => setTargetBook(null)}
            position="fixed"
            top="4rem"
            left="2rem"
            zIndex={9999}
            bg="primary700"
            color="white"
            colorScheme="blue"
            p="1rem 1rem 1rem 0.5rem"
            leftIcon={<BiLeftArrowAlt fontSize="1.5rem" />}
          >
            Voltar
          </Button>

          <Flex direction="column" gap="0.5rem" position="fixed" top="4rem" right="2rem" zIndex={9999}>
            <Button
              bg="primary700"
              color="white"
              colorScheme="blue"
              gap="0.5rem"
              p="0.5rem 1rem"
              onClick={() => targetBook && downloadBook(targetBook.file, targetBook?.title)}
            >
              <FiDownload fontSize="1.5rem" />
              Baixar livro
            </Button>
          </Flex>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Books;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const selectedPage = 'library';

  try {
    return {
      props: {
        selectedPage,
        pageTitle: 'Meus livros',
        showBackButton: false,
        selectedItemId: query?.id || ``,
      },
    };
  } catch (err: any) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};
