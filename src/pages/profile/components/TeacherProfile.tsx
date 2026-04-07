import moment from 'moment';
import { FiFileText, FiHelpCircle, FiFolder } from 'react-icons/fi';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Text,
  useColorMode,
  Grid,
  Icon,
} from '@chakra-ui/react';
import { IProfileComponentProps } from './interfaces';
import { useCustomRouter } from '@/_base/hooks';

type GuideType = { label: string; instructions: string };

export const TeacherProfile: React.FC<IProfileComponentProps> = ({ projects }) => {
  const { colorMode } = useColorMode();
  const router = useCustomRouter();

  const guides: GuideType[] = [
    {
      label: 'Como navegar pela plataforma?',
      instructions: 'Você pode navegar pelo Hub utilizando o menu à esquerda e selecionando a sessão que deseja ver.',
    },
    {
      label: 'Como abrir o livro na plataforma?',
      instructions:
        'Para abrir um livro, basta entrar na sessão "Biblioteca" e selecionar, no menu superior, o tipo do livro desejado. Caso deseje consultar um planejamento, este se encontrará em “Materiais Complementares".',
    },
    {
      label: 'Como criar um novo projeto?',
      instructions:
        'Para criar um novo projeto, entre em "Turmas", selecione a turma, navegue até a aba “Projetos” e clique em “Novo Projeto”. Você pode usar nossa IA para mapear tudo rapidamente.',
    },
    {
      label: 'Como acessar minhas turmas?',
      instructions: 'Selecione "Turmas" no menu à esquerda. Se não aparecerem, clique em “Adicionar turmas” e selecione as que você é responsável.',
    },
    {
      label: 'O que fazer se meu aluno esquecer a senha?',
      instructions: 'Acesse "Turmas" > Selecione a Turma > Aba "Alunos" > Clique no aluno > Clique no botão "Resetar Senha".',
    },
    {
      label: 'Como pedir um novo produto na loja?',
      instructions: 'Os alunos compram no ambiente do projeto. Você deve aprovar o pedido deles pelo Hub, na sessão “Estoque Maker”, aba “Pedidos”.',
    },
  ];

  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  return (
    <Flex w="100%" direction="column" gap="1.5rem">
      {/* Seção Superior: Guia e Vídeo */}
      <Grid templateColumns={{ base: '1fr', xl: '1.25fr 0.75fr' }} gap="1.5rem">
        {/* Guia Rápido (FAQ) */}
        <Flex
          bg={bgCard}
          direction="column"
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="sm"
          p="1.5rem"
          maxH="380px"
          overflow="hidden"
        >
          <Flex align="center" gap="0.5rem" mb="1rem">
            <Icon as={FiHelpCircle} color="primary.500" fontSize="20px" />
            <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
              Guia Rápido
            </Text>
          </Flex>
          <Flex direction="column" flex="1" overflowY="auto" pr="0.5rem">
            <Accordion allowToggle>
              {guides.map((guide, i) => (
                <AccordionItem
                  key={i}
                  border="1px"
                  mb="0.5rem"
                  bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'}
                  borderRadius="lg"
                  borderColor={colorMode === 'light' ? '#E2E8F0' : '#2D3748'}
                >
                  <AccordionButton _hover={{ bg: 'transparent' }} borderRadius="lg">
                    <Box flex="1" textAlign="left" fontWeight="600" fontSize="14px" color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}>
                      {guide.label}
                    </Box>
                    <AccordionIcon color="gray.500" />
                  </AccordionButton>
                  <AccordionPanel pb={4} pt={0} fontSize="13px" color="gray.500" lineHeight="1.6">
                    {guide.instructions}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Flex>
        </Flex>

        {/* Vídeo de Boas Vindas */}
        <Flex
          bg={bgCard}
          direction="column"
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="sm"
          p="1.5rem"
          maxH="380px"
          display={{ base: 'none', xl: 'flex' }}
        >
          <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'} mb="1rem">
            Boas-vindas à PiCode 🚀
          </Text>
          <Flex flex="1" borderRadius="xl" overflow="hidden" justify="center" align="center">
            <video width="100%" height="100%" controls preload="metadata" style={{ objectFit: 'cover' }}>
              <source src="https://picode-public.s3.amazonaws.com/hub-videos/Apresenta%C3%A7%C3%A3o+professores+com+intro+.mp4" type="video/mp4" />
            </video>
          </Flex>
        </Flex>
      </Grid>

      {/* Seção Inferior: Projetos Recentes (Sem Accordion!) */}
      <Flex bg={bgCard} direction="column" borderRadius="2xl" border="1px solid" borderColor={borderColor} boxShadow="sm" p="1.5rem">
        <Flex align="center" gap="0.5rem" mb="1.5rem">
          <Icon as={FiFolder} color="blue.500" fontSize="20px" />
          <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
            Meus Projetos Recentes
          </Text>
        </Flex>

        {projects?.length ? (
          <Flex
            gap="1rem"
            overflowX="auto"
            pb="1rem"
            css={{ '&::-webkit-scrollbar': { height: '6px' }, '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '10px' } }}
          >
            {projects
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .map((project) => (
                <Flex
                  key={project.id}
                  direction="column"
                  justify="space-between"
                  minW="220px"
                  maxW="220px"
                  h="140px"
                  bg={colorMode === 'light' ? 'primary.50' : 'whiteAlpha.100'}
                  p="1.25rem"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={colorMode === 'light' ? 'primary.100' : 'whiteAlpha.200'}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ transform: 'translateY(-4px)', boxShadow: 'md', bg: colorMode === 'light' ? 'primary.100' : 'whiteAlpha.200' }}
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <Flex gap="0.5rem" align="flex-start">
                    <Icon as={FiFileText} color="primary.500" mt="1px" />
                    <Text fontWeight="600" color={colorMode === 'dark' ? 'white' : 'gray.800'} noOfLines={2} lineHeight="1.3">
                      {project.title}
                    </Text>
                  </Flex>
                  <Box>
                    <Text fontSize="11px" fontWeight="600" color="gray.500" textTransform="uppercase">
                      Atualizado em
                    </Text>
                    <Text fontSize="13px" fontWeight="500" color={colorMode === 'light' ? 'primary.700' : 'primary.200'}>
                      {moment(project.updated_at).calendar()}
                    </Text>
                  </Box>
                </Flex>
              ))}
          </Flex>
        ) : (
          <Flex justify="center" align="center" h="100px" border="2px dashed" borderColor={borderColor} borderRadius="xl">
            <Text color="gray.500" fontWeight="500">
              Você ainda não possui nenhum projeto iniciado.
            </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
