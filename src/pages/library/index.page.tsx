import { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { BiLeftArrowAlt } from 'react-icons/bi';
import { Flex, Text, Grid, Modal, ModalContent, ModalOverlay, Image, Button, Spinner, Box, Divider, Icon } from '@chakra-ui/react';
import { FiDownload, FiPlay, FiBook, FiVideo } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { formatClassGrade, sortGrades } from '@/_base/utils';
import { TabSwitch } from '@/components/TabSwitch';
import { listBookCategories } from '@/_base/services/book';
import { IHubBook, IHubBookCategory } from '@/_base/interfaces/book';
import { useAsyncCallback, useAuth, useDarkMode } from '@/_base/hooks';
import { IHubVideo, IHubVideoCategory } from '@/_base/interfaces/video';
import { listVideoCategories } from '@/_base/services/video';
import { InternalPageHeader } from '@/components/InternalPageHeader';
import { BookOpen, Search } from 'lucide-react';

type BookByGrade = Record<string, IHubBook[]>;
type VideoByGrade = Record<string, IHubVideo[]>;

interface IProps {
  bookCategories: IHubBookCategory[];
  videoCategories: IHubVideoCategory[];
  selectedItemId: string;
}

const Books: React.FC<IProps> = ({ selectedItemId }) => {
  const { colorMode } = useDarkMode();
  const { user } = useAuth();

  const [bookCategories, setBookCategories] = useState<IHubBookCategory[]>([]);
  const [videoCategories, setVideoCategories] = useState<IHubVideoCategory[]>([]);
  const [bookCategory, setBookCategory] = useState<IHubBookCategory | null>(null);
  const [videoCategory, setVideoCategory] = useState<IHubVideoCategory | null>(null);
  const [modalVideo, setModalVideo] = useState<IHubVideo | null>(null);
  const [targetBook, setTargetBook] = useState<IHubBook | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- BUSCA INICIAL DE DADOS ---
  const getBooks = useAsyncCallback(
    async () => {
      setIsLoading(true);
      const [{ results: bookCategoryRes }, { results: videoCategoryRes }] = await Promise.all([listBookCategories(), listVideoCategories()]);

      setBookCategories(bookCategoryRes);
      setVideoCategories(videoCategoryRes);

      // Seta a primeira aba como ativa e busca vídeos correspondentes
      if (bookCategoryRes.length > 0) {
        const firstCat = bookCategoryRes[0];
        setBookCategory(firstCat);
        const matchingVideoCat = videoCategoryRes.find((v) => v.display_name === firstCat.display_name);
        setVideoCategory(matchingVideoCat || null);
      }
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

  // --- CORREÇÃO DO BUG DAS ABAS DE VÍDEO ---
  const handleCategoryView = (key: string) => {
    const targetBookCategory = bookCategories.find((e) => e.id === key);
    setBookCategory(targetBookCategory || null);

    if (targetBookCategory) {
      // Procura a categoria de vídeo que tem exatamente o mesmo nome da categoria de livro
      const matchingVideoCat = videoCategories.find((v) => v.display_name === targetBookCategory.display_name);
      setVideoCategory(matchingVideoCat || null);
    } else {
      setVideoCategory(null);
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

  // Combina todas as séries disponíveis para criar as sessões
  const allGrades = Array.from(new Set([...Object.keys(booksByGrade), ...Object.keys(videosByGrade)]));
  const sortedAllGrades = sortGrades(allGrades);

  // Cores Dinâmicas
  const bgCard = colorMode === 'light' ? 'white' : 'gray800';
  const borderColor = colorMode === 'light' ? 'gray200' : 'gray700';

  // --- RENDER DOS CARDS ---
  const renderVideoCard = (video: IHubVideo) => (
    <Flex
      key={video.id}
      onClick={() => setModalVideo(video)}
      direction="column"
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      cursor="pointer"
      transition="all 0.2s"
      bg={bgCard}
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg', borderColor: 'primary400' }}
    >
      <Flex bgImage={`url(${video.thumbnail})`} bgSize="cover" bgPosition="center" h="160px" position="relative" align="center" justify="center">
        <Flex
          bg="blackAlpha.600"
          w="50px"
          h="50px"
          borderRadius="full"
          align="center"
          justify="center"
          backdropFilter="blur(4px)"
          transition="all 0.2s"
          _hover={{ transform: 'scale(1.1)' }}
        >
          <Icon as={FiPlay} color="white" boxSize="6" ml="1" />
        </Flex>
      </Flex>
      <Flex direction="column" p="1rem">
        <Text fontWeight="600" color={colorMode === 'light' ? 'gray800' : 'white'} noOfLines={1} fontSize="15px">
          {video.title}
        </Text>
        <Text fontSize="13px" color="gray500" noOfLines={2} mt="1">
          {video.description}
        </Text>
      </Flex>
    </Flex>
  );

  const renderBookCard = (book: IHubBook) => (
    <Flex
      key={book.id}
      onClick={() => showBookFile(book)}
      direction="column"
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      cursor="pointer"
      transition="all 0.2s"
      bg={bgCard}
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg', borderColor: 'primary400' }}
    >
      <Flex
        backgroundImage={`url(${book.thumbnail || '/images/book.svg'})`}
        backgroundSize="cover"
        backgroundPosition="center"
        h="220px"
        w="100%"
        borderBottom="1px solid"
        borderColor={borderColor}
      />
      <Flex align="center" p="0.75rem 1rem" gap="0.5rem">
        <Icon as={FiBook} color="gray500" />
        <Text fontWeight="500" fontSize="14px" color={colorMode === 'light' ? 'gray700' : 'gray200'} noOfLines={1} title={book.title}>
          {book.title}
        </Text>
      </Flex>
    </Flex>
  );

  return (
    <Flex w="100%" h="100%" direction="column" gap="1.5rem">
      <InternalPageHeader
        title="Biblioteca"
        description="Acesse seus livros, guias e materiais didáticos"
        icon={<BookOpen className="w-6 h-6 text-primary" />}
        actions={[
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: `2.25rem` }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>,
        ]}
      />
      {/* Abas Superiores */}
      <Box flexShrink={0}>
        <TabSwitch
          tabs={bookCategories.map((cat) => ({
            isSelected: bookCategory?.id === cat.id,
            key: cat.id,
            label: cat.display_name,
          }))}
          onSwitch={handleCategoryView}
        />
      </Box>

      {/* Conteúdo com Scroll */}
      <Flex direction="column" flex="1" pb="2rem" pr="0.5rem">
        {!allGrades.length ? (
          <Flex direction="column" align="center" justify="center" h="100%" color="gray400" gap="1rem">
            <Icon as={FiBook} boxSize="3rem" opacity={0.5} />
            <Text>Nenhum conteúdo disponível nesta categoria.</Text>
          </Flex>
        ) : (
          <Flex direction="column" gap="3rem">
            {/* Renderização Condicional: Visão do Aluno vs Visão do Educador */}
            {user.role === `student` ? (
              <Box>
                {/* Seção de Vídeos do Aluno */}
                {videosByGrade[user.hub_class?.grade]?.length > 0 && (
                  <Box mb="2rem">
                    <Flex align="center" gap="0.5rem" mb="1rem">
                      <Icon as={FiVideo} color="primary500" fontSize="1.2rem" />
                      <Text fontSize="16px" fontWeight="700" color="gray600" textTransform="uppercase">
                        Vídeos
                      </Text>
                    </Flex>
                    <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap="1.5rem">
                      {videosByGrade[user.hub_class?.grade].map(renderVideoCard)}
                    </Grid>
                  </Box>
                )}

                {/* Seção de Livros do Aluno */}
                {booksByGrade[user.hub_class?.grade]?.length > 0 && (
                  <Box>
                    <Flex align="center" gap="0.5rem" mb="1rem">
                      <Icon as={FiBook} color="primary500" fontSize="1.2rem" />
                      <Text fontSize="16px" fontWeight="700" color="gray600" textTransform="uppercase">
                        Livros e Materiais
                      </Text>
                    </Flex>
                    <Grid templateColumns="repeat(auto-fill, minmax(180px, 1fr))" gap="1.5rem">
                      {booksByGrade[user.hub_class?.grade].map(renderBookCard)}
                    </Grid>
                  </Box>
                )}
              </Box>
            ) : (
              // Visão do Educador: Itera por todas as séries
              sortedAllGrades
                .filter(
                  (grade) =>
                    booksByGrade[grade]?.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase())).length ||
                    videosByGrade[grade]?.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase())).length,
                )
                .map((grade) => (
                  <motion.div key={grade} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Box
                      bg={colorMode === 'light' ? 'gray50' : 'whiteAlpha.50'}
                      p="1.5rem"
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      {/* Cabeçalho da Série */}
                      <Text fontSize="22px" fontWeight="800" color="primary700" mb="0.5rem">
                        {formatClassGrade(grade)}
                      </Text>
                      <Divider borderColor={borderColor} mb="1.5rem" />

                      <Flex direction="column" gap="2.5rem">
                        {/* Grid de Vídeos da Série */}
                        {videosByGrade[grade]?.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                          <Box>
                            <Flex align="center" gap="0.5rem" mb="1rem">
                              <Icon as={FiVideo} color="gray500" fontSize="1.2rem" />
                              <Text fontSize="14px" fontWeight="700" color="gray500" textTransform="uppercase">
                                Vídeos Relacionados
                              </Text>
                            </Flex>
                            <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap="1.5rem">
                              {videosByGrade[grade].filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase())).map(renderVideoCard)}
                            </Grid>
                          </Box>
                        )}

                        {/* Grid de Livros da Série */}
                        {booksByGrade[grade]?.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                          <Box>
                            <Flex align="center" gap="0.5rem" mb="1rem">
                              <Icon as={FiBook} color="gray500" fontSize="1.2rem" />
                              <Text fontSize="14px" fontWeight="700" color="gray500" textTransform="uppercase">
                                Livros e Materiais
                              </Text>
                            </Flex>
                            <Grid templateColumns="repeat(auto-fill, minmax(180px, 1fr))" gap="1.5rem">
                              {booksByGrade[grade].filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase())).map(renderBookCard)}
                            </Grid>
                          </Box>
                        )}
                      </Flex>
                    </Box>
                  </motion.div>
                ))
            )}
          </Flex>
        )}
      </Flex>

      {/* Modal do Player de Vídeo Cinematográfico */}
      <Modal isOpen={!!modalVideo} onClose={() => setModalVideo(null)} size="5xl" isCentered>
        <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.700" />
        <ModalContent bg="transparent" boxShadow="none" overflow="hidden" borderRadius="xl">
          {modalVideo && (
            <video
              controls
              autoPlay
              controlsList="nodownload"
              poster={modalVideo.thumbnail}
              style={{ width: '100%', borderRadius: '1rem', outline: 'none' }}
            >
              <source src={modalVideo.file} type="video/mp4" />
            </video>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Leitor de Livro/PDF */}
      <Modal isOpen={!!targetBook} onClose={() => setTargetBook(null)} size="full" scrollBehavior="inside">
        <ModalContent bg="#f0f2f5" overflow="hidden">
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
            bg="#f0f2f5"
            w="100%"
            h="100%"
            zIndex={9999}
            direction="column"
          >
            <Image src="/loading/rocket-picode.gif" h="19rem" />
            <Spinner size="lg" color="primary500" />
          </Flex>

          {/* Botões Flutuantes Leitor */}
          <Button
            onClick={() => setTargetBook(null)}
            position="fixed"
            top="2rem"
            left="2rem"
            zIndex={9999}
            bg="white"
            color="gray800"
            boxShadow="lg"
            borderRadius="full"
            p="0.5rem 1rem"
            leftIcon={<BiLeftArrowAlt fontSize="1.25rem" />}
            _hover={{ bg: 'gray50' }}
          >
            Voltar
          </Button>

          <Button
            position="fixed"
            top="2rem"
            right="2rem"
            zIndex={9999}
            bg="primary600"
            color="white"
            colorScheme="blue"
            boxShadow="lg"
            borderRadius="full"
            gap="0.5rem"
            p="0.5rem 1.5rem"
            onClick={() => targetBook && downloadBook(targetBook.file, targetBook?.title)}
          >
            <FiDownload fontSize="1.25rem" />
            Baixar Material
          </Button>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Books;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      selectedPage: 'library',
      pageTitle: 'Biblioteca',
      showBackButton: false,
      selectedItemId: query?.id || ``,
    },
  };
};
