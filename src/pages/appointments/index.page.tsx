import { validateSession } from '@/_base/services/auth';
import { cookieManager, logError } from '@/_base/utils';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { ReactNode, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { FiChevronLeft, FiHelpCircle } from 'react-icons/fi';
import { GenericButton } from '@/components/Buttons/Generic';
import { useCustomRouter } from '@/_base/hooks';
import { BiSupport } from 'react-icons/bi';
import { VscRequestChanges } from 'react-icons/vsc';
import { MdOutlineSchool } from 'react-icons/md';
import PedagoCalendar from './components/PedagoCalendar';
import TechCalendar from './components/TechCalendar';

type PageStepsType = 'HELP' | 'DOUBT' | 'TECH_CALENDAR' | 'PEDAGO_CALENDAR';
type GuideType = { label: string; instructions: string };

const stepsOrder: PageStepsType[] = ['HELP', 'DOUBT', 'TECH_CALENDAR', 'PEDAGO_CALENDAR'];

const Appointment: React.FC = () => {
  const [step, setStep] = useState<PageStepsType>('HELP');
  const router = useCustomRouter();
  const { colorMode } = useColorMode();
  const guides: GuideType[] = [
    {
      label: 'Como navegar pela plataforma?',
      instructions: 'Você pode navegar pelo Hub utilizando o menu à esquerda e selecionando a sessão que deseja ver.',
    },
    {
      label: 'Como abrir o livro na plataforma?',
      instructions:
        'Para abrir um livro, basta entrar na sessão "Biblioteca" e selecionar, no menu superior, o tipo do livro desejado - Professor ou Aluno. Os livros aparecerão separados por série/ano. Caso deseje consultar um planejamento de aulas, este se encontrará na aba “Materiais Complementares".',
    },
    {
      label: 'Como criar um novo projeto?',
      instructions:
        'Para criar um novo projeto, basta entrar em "Turmas", selecionar a turma em que deseja criar o projeto, navegar até a aba “Projetos” e clicar em “Adicionar novo”. Você poderá criar um projeto manualmente ou usando nossa IA, que te ajudará a mapear ferramentas, planejamentos, tempo e temas.',
    },
    {
      label: 'Como acessar minhas turmas?',
      instructions:
        'Para acessar suas turmas, certifique-se que está na escola correta (caso lecione em mais de uma), e então selecione "Turmas" no menu à esquerda para visualizar suas turmas. Se as turmas não aparecerem, lembre-se: talvez você ainda não tenha adicionado elas. Para isso, basta clicar em “Adicionar turmas” e dar um check nas que você é o professor responsável.',
    },
    {
      label: 'O que fazer se meu aluno esquecer a senha?',
      instructions:
        'Caso algum aluno esqueça a senha, você pode acessar a sessão “Turmas”, entrar na turma desse aluno e clicar na aba “Alunos”. Em seguida, clique no aluno desejado e, ao abrir o perfil, clique no botão “Resetar Senha” para inserir uma nova senha.',
    },
    {
      label: 'Como começar um novo curso?',
      instructions: 'Basta selecionar no menu à esquerda a sessão "Cursos", selecionar o curso, o módulo e então a atividade.',
    },
    {
      label: 'Como entrar em contato com o suporte da PiCode?',
      instructions:
        'A plataforma tem duas opções de canal de contato, estando logado ou não. Se não estiver logado em sua conta, você poderá solicitar ajuda preenchendo o formulário que aparece na tela de login, após clicar no botão "Não estou conseguindo acessar”. Caso você esteja já esteja conectado em sua conta, você poderá solicitar suporte através da sessão "Suporte”, no menu lateral esquerdo.',
    },
    {
      label: 'Como pedir um novo produto através da loja?',
      instructions:
        'Os alunos só poderão comprar os itens que estiverem disponíveis no seu estoque. Para efetuarem a compra, devem acessar o ambiente do projeto (Meus Grupos > Projeto YYYY > Loja Online > Loja PiCode), adicionar os itens no carrinho, finalizar a compra e aguardar sua aprovação.Lembre-se de aprovar o pedido dos grupos no Hub, para que as moedas sejam debitadas/creditadas corretamente! Você pode fazer isso rapidamente pela sessão “Estoque Maker”, na aba “Pedidos”, ou acessando cada grupo individualmente.',
    },
  ];

  const goBackStep = () => {
    if (step === 'PEDAGO_CALENDAR' || step === 'TECH_CALENDAR') {
      setStep('DOUBT');
    } else {
      const currentIndex = stepsOrder.indexOf(step);
      if (currentIndex > 0) {
        setStep(stepsOrder[currentIndex - 1]);
      }
    }
  };

  const PageStepElement: Record<PageStepsType, ReactNode> = {
    HELP: (
      <Flex direction="column">
        <Text borderBottom="1px" borderColor="gray300" padding="0 20px 20px">
          FAQ
        </Text>
        {/* <Flex direction="column">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input type="tel" placeholder="Procurar por respostas" />
          </InputGroup>
        </Flex> */}
        <Flex w="100%" h="fit-content" justify="center" direction="column" gap="20px">
          <Flex
            bg="white"
            p={{ base: `14px`, xl: '20px' }}
            w="100%"
            h="100%"
            display="flex"
            justify="column"
            direction="column"
            gap={{ base: `10px`, xl: '20px' }}
            borderRadius="10px"
            
            overflow="hidden"
          >
            <Flex direction="column" w="100%" borderColor="gray300" justify="center">
            </Flex>
            <Flex direction="column" flex="1" overflow="hidden auto">
              {guides.map((guide) => (
                <Flex key={guide.label} w="100%" _notLast={{ borderBottom: '1px', borderColor: 'gray300' }}>
                  <Flex align="center" direction="column" gap="12px" w="100%" m="7px 0" borderRadius="md" cursor="pointer">
                    <Flex align="center" justify="center" gap="12px" w="100%">
                      <FiHelpCircle fontSize="24px" color={colorMode === 'dark' ? '#FCFCFD' : '#101828'} />
                      <Accordion allowMultiple w="100%" fontWeight="500" color="gray700">
                        <AccordionItem border="none">
                          <h2>
                            <AccordionButton justifyContent="space-between">
                              <Box fontSize={{ base: `15px`, xl: '16px' }}>{guide.label}</Box>
                              <AccordionIcon />
                              {/* <IoChevronForward color={colorMode === 'dark' ? '#FCFCFD' : '#101828'} /> */}
                            </AccordionButton>
                          </h2>
                          <AccordionPanel fontWeight="400">{guide.instructions}</AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Flex>
          <Flex w="100%" justify="center" direction="column" align="center">
            <Text fontSize="30px" fontWeight="700">
              Não achou o que procurava?
            </Text>
            <Text>Tente abrir um chamado ou marcar uma reunião! 😁</Text>
            <Flex gap="15px" mt="20px">
              <GenericButton label="Abrir um chamado" leftIcon={<VscRequestChanges />} onClick={() => router.push('/reports')} />
              <GenericButton label="Marcar uma reunião" leftIcon={<BiSupport />} onClick={() => setStep('DOUBT')} />
            </Flex>
            <Text fontSize="25px" fontWeight="700" mt="15px">
              Horário de atendimento
            </Text>
            <Text mb="20px">Das 07h às 18h (horário de Brasília), de segunda a sexta-feira, exceto feriados.</Text>
          </Flex>
        </Flex>
      </Flex>
    ),
    DOUBT: (
      <Flex direction="column" gap="50px">
        <Flex justify="center" fontSize="30px" fontWeight="700" borderColor="gray300" padding="0 20px 20px">
          Como podemos te ajudar hoje?
        </Flex>
        <Flex w="100%" h="fit-content" justify="center" direction="column">
          <Flex w="100%" h="auto" justify="space-between" align="center">
            <Flex w="100%" justify="center" align="center" direction="column" gap="20px">
              <Flex
                w="400px"
                h="200px"
                direction="column"
                align="center"
                justify="center"
                fontSize="25"
                bgColor="primary700"
                color="white"
                cursor="pointer"
                _hover={{ bgColor: 'primary600' }}
                transition="0.3s"
                borderRadius="8px"
                fontWeight="700"
                
                onClick={() => setStep('TECH_CALENDAR')}
              >
                <BiSupport />
                Suporte técnico
                <Flex fontSize="18px" textAlign="center" fontWeight="400">
                  Aqui, você falará com nossa equipe <br /> responsável pelos kits <br /> físicos e placas eletrônicas!
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex w="100%" justify="center" align="center" gap="20px" direction="column">
          <Flex
            w="400px"
            h="200px"
            direction="column"
            align="center"
            justify="center"
            fontSize="25"
            bgColor="primary500"
            color="white"
            borderRadius="8px"
            fontWeight="700"
            
            cursor="pointer"
            _hover={{ bgColor: 'error900' }}
            transition="0.2s"
            onClick={() => setStep('PEDAGO_CALENDAR')}
          >
            <MdOutlineSchool />
            Suporte pedagógico
            <Flex fontSize="18px" textAlign="center" fontWeight="400">
              Aqui, você falará com um dos nossos <br /> especialistas em educação para tirar dúvidas <br /> sobre o material didático.
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    ),
    TECH_CALENDAR: <TechCalendar />,
    PEDAGO_CALENDAR: <PedagoCalendar />,
  };

  return (
    <Flex w="100%" h="fit-content" direction="column" overflow="auto">
      {step === 'PEDAGO_CALENDAR' || step === 'TECH_CALENDAR' || step === 'DOUBT' ? (
        <Flex width="100%" color="gray300" pt="1.5rem" gap="8px" onClick={goBackStep} cursor="pointer" mb="10px">
          <FiChevronLeft fontSize="20px" style={{ marginTop: '2px' }} />
          <Text textAlign="left">Voltar</Text>
        </Flex>
      ) : null}

      <Flex
        flex="1"
        bgColor="white"
        direction="column"
        borderRadius="12px"
        padding="20px"
        gap="20px"
        textAlign="left"
        whiteSpace="normal"
        wordBreak="break-word"
        maxW="100%"
        borderBottom="1px solid gray300"
        border="1px"
        borderColor="gray300"
        
        color="gray600"
        overflow="auto"
      >
        {PageStepElement[step]}
      </Flex>
    </Flex>
  );
};

export default Appointment;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'appointments';

  try {
    cookieManager.updateToken(req);

    const user = await validateSession();

    return { props: { selectedPage, pageTitle: 'Reuniões', user, showBackButton: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
