import { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import {
  Flex,
  Link,
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
} from '@chakra-ui/react';

import { logError, cookieManager, formatClassGrade, sortGrades } from '@/_base/utils';
import { TabSwitch } from '@/components/TabSwitch';
import { listBookCategories } from '@/_base/services/book';
import { IHubBook, IHubBookCategory } from '@/_base/interfaces/book';
import { useAuth } from '@/_base/hooks';
import { IHubVideo, IHubVideoCategory } from '@/_base/interfaces/video';
import { listVideoCategories } from '@/_base/services/video';

type BookByGrade = Record<string, IHubBook[]>;
type VideoByGrade = Record<string, IHubVideo[]>;
interface IProps {
  bookCategories: IHubBookCategory[];
  videoCategories: IHubVideoCategory[];
}

const Books: React.FC<IProps> = ({ bookCategories, videoCategories }) => {
  const [bookCategory, setBookCategory] = useState<IHubBookCategory | null>(bookCategories[0]);
  const [videoCategory, setVideoCategory] = useState<IHubVideoCategory | null>(null);
  const [modalVideo, setModalVideo] = useState<IHubVideo | null>(null);

  const { user } = useAuth();

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
          gridTemplateColumns="repeat(auto-fill, minmax(180px, 1fr))"
          gridTemplateRows="minmax(min-content, max-content)"
          padding="2rem"
          borderRadius="md"
          flex="1"
        >
          {booksByGrade[user.hub_class?.grade]?.map((book) => (
            <Link key={book.id} target="_blank" href={book.file}>
              <Flex
                direction="column"
                h="100%"
                w="156px"
                gap="0.5rem"
                overflow="hidden"
                cursor="pointer"
                _hover={{ filter: 'brightness(0.95)' }}
                bg="white"
                border="1px"
                borderColor="gray300"
                borderRadius="md"
              >
                <Flex
                  backgroundImage={book.thumbnail || `/images/book.svg`}
                  backgroundSize="cover"
                  backgroundPosition="center"
                  h="203px"
                  w="156px"
                  borderRadius="4px"
                  p="1rem"
                />
                <Text fontWeight="500" p="0.25rem 0.35rem" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
                  {book.title}
                </Text>
              </Flex>
            </Link>
          ))}
        </Grid>
      ) : (
        // </Flex>
        <Accordion borderColor="gray300" w="100%" h="100%" gridGap={5} allowMultiple>
          {sortGrades(Object.keys(videosByGrade)).map((grade) => (
            <AccordionItem bgColor="white" key={grade} borderRadius="12px" border="1px" borderColor="gray300" mb="1rem">
              <AccordionButton borderRadius="md" h="64px" justifyContent="space-between">
                <Text>{formatClassGrade(grade)}</Text>
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
                        <Text>{video.title}</Text>
                        <Text>{video.description}</Text>
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
                <Text>{formatClassGrade(grade)}</Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Flex gap="2rem" pt="0.5rem">
                  {booksByGrade[grade]?.map((book) => (
                    <Link key={book.id} target="_blank" href={book.file}>
                      <Flex
                        direction="column"
                        h="100%"
                        w="156px"
                        gap="0.5rem"
                        overflow="hidden"
                        cursor="pointer"
                        _hover={{ filter: 'brightness(0.95)' }}
                      >
                        <Flex
                          backgroundImage={book.thumbnail || `/images/book.svg`}
                          backgroundSize="cover"
                          backgroundPosition="center"
                          h="203px"
                          w="156px"
                          borderRadius="4px"
                        />
                        <Text fontWeight="500" p="0.25rem 0.35rem" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
                          {book.title}
                        </Text>
                      </Flex>
                    </Link>
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
    </Flex>
  );
};

export default Books;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'library';

  try {
    cookieManager.updateToken(req);
    const [{ results }, { results: videoCategories }] = await Promise.all([listBookCategories(), listVideoCategories()]);

    return { props: { selectedPage, pageTitle: 'Meus livros', videoCategories, bookCategories: results, showBackButton: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
