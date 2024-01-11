import { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Flex,
  Link,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
} from '@chakra-ui/react';

import { logError, cookieManager, formatClassGrade } from '@/_base/utils';
import { TabSwitch } from '@/components/TabSwitch';
import { listBookCategories } from '@/_base/services/book';
import { IHubBook, IHubBookCategory } from '@/_base/interfaces/book';
import { GenericButton } from '@/components/Buttons/Generic';
import { EmptyPageData } from '@/components/EmptyPageData';

type BookByGrade = Record<string, IHubBook[]>;
interface IProps {
  bookCategories: IHubBookCategory[];
}

const Books: React.FC<IProps> = ({ bookCategories }) => {
  const [selectedCategory, setSelectedCategory] = useState<IHubBookCategory>(bookCategories[0]);

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
    [],
  );

  return !Object.keys(booksByGrade).length ? (
    <EmptyPageData />
  ) : (
    <Flex w="100%" h="100%" direction="column" gap="24px">
      {!!bookCategories?.length && (
        <TabSwitch
          tabs={bookCategories.map((cat) => ({ isSelected: selectedCategory.id === cat.id, key: cat.id, label: cat.display_name }))}
          onSwitch={handleCategoryView}
        />
      )}
      <Accordion borderColor="gray300" w="100%" h="100%" gridGap={5}>
        {Object.keys(booksByGrade).map((grade) => (
          <AccordionItem bgColor="white" key={grade} borderRadius="12px" border="1px" borderColor="gray300" mb="1rem">
            <AccordionButton borderRadius="md" h="64px" justifyContent="space-between">
              <Text>{formatClassGrade(grade)}</Text>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Flex gap="2rem" pt="0.5rem">
                {booksByGrade[grade]?.map((book) => (
                  <Popover key={book.id + grade}>
                    <PopoverTrigger>
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
                    </PopoverTrigger>
                    <PopoverContent border="none" boxShadow="md" bg="gray50">
                      <PopoverArrow />
                      <PopoverBody>
                        <Flex direction="column" gap="0.5rem">
                          <Flex w="100%" fontSize="15px" color="gray500" gap="0.25rem">
                            <Text fontWeight="500" mt="5px">
                              Título:
                            </Text>
                            <Text flex="1" mt="5px">
                              {book.title}
                            </Text>
                            <Link key={book.id} href={book.file} target="_blank" w="fit-content">
                              <GenericButton label="Visualizar" size="sm" btntype="outline" />
                            </Link>
                          </Flex>

                          {!!book.description && (
                            <Flex w="100%" fontSize="15px" color="gray500" gap="0.25rem">
                              <Text>{book.description}</Text>
                            </Flex>
                          )}
                        </Flex>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                ))}
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Flex>
  );
};

export default Books;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'library';

  try {
    cookieManager.updateToken(req);
    const { results } = await listBookCategories();

    return { props: { selectedPage, pageTitle: 'Meus livros', bookCategories: results } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
