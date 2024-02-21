import { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import { Flex, Link, Text, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, Grid } from '@chakra-ui/react';

import { logError, cookieManager, formatClassGrade, sortGrades } from '@/_base/utils';
import { TabSwitch } from '@/components/TabSwitch';
import { listBookCategories } from '@/_base/services/book';
import { IHubBook, IHubBookCategory } from '@/_base/interfaces/book';
import { EmptyPageData } from '@/components/EmptyPageData';
import { useAuth } from '@/_base/hooks';

type BookByGrade = Record<string, IHubBook[]>;
interface IProps {
  bookCategories: IHubBookCategory[];
}

const Books: React.FC<IProps> = ({ bookCategories }) => {
  const [selectedCategory, setSelectedCategory] = useState<IHubBookCategory>(bookCategories[0]);

  const { user } = useAuth();

  const handleCategoryView = (key: string) => {
    const targetCategory = bookCategories.find((e) => e.id === key);

    if (targetCategory) setSelectedCategory(targetCategory);
  };

  const booksByGrade = useMemo<BookByGrade>(
    () =>
      selectedCategory?.books?.reduce((acc, book) => {
        book.grades.forEach((grade) => {
          if (acc[grade]?.length) acc[grade].push(book);
          else acc[grade] = [book];
        });
        return acc;
      }, {} as BookByGrade) || {},
    [selectedCategory],
  );

  return !Object.keys(booksByGrade).length ? (
    <Flex>
      <TabSwitch
        tabs={bookCategories.map((cat) => ({ isSelected: selectedCategory.id === cat.id, key: cat.id, label: cat.display_name }))}
        onSwitch={handleCategoryView}
      />
    </Flex>
  ) : (
    <Flex w="100%" h="100%" direction="column" gap="24px" overflow="hidden auto">
      {!!bookCategories?.length && user.role !== `student` && (
        <TabSwitch
          tabs={bookCategories.map((cat) => ({ isSelected: selectedCategory.id === cat.id, key: cat.id, label: cat.display_name }))}
          onSwitch={handleCategoryView}
        />
      )}
      {user.role === `student` ? (
        // <Flex gap="1rem" pt="0.5rem" flex="1" bg="transparentBG" padding="1rem" borderRadius="md" >
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
    const { results } = await listBookCategories();

    return { props: { selectedPage, pageTitle: 'Meus livros', bookCategories: results, showBackButton: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
