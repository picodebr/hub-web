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
import { ScheduleMeeting } from 'react-schedule-meeting';
import { ptBR } from 'date-fns/locale';
import { FaSearch } from 'react-icons/fa';
import { FiChevronLeft, FiHelpCircle } from 'react-icons/fi';
import { GenericButton } from '@/components/Buttons/Generic';
import { useCustomRouter } from '@/_base/hooks';
import { BiSupport } from 'react-icons/bi';
import { VscRequestChanges } from 'react-icons/vsc';
import { MdOutlineSchool } from 'react-icons/md';

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
      instructions: 'Você pode navegar pela plataforma utilizando o menu à esquerda, selecionando a sessão que deseja ver.',
    },
    {
      label: 'Como abrir o livro na plataforma?',
      instructions:
        'Para abrir um livro pela plataforma, basta entrar na sessão "Biblioteca" e selecionar no menu superior o tipo do livro (Professor ou Aluno), logo após será possível selecionar o ano e então aparecerá os livros da opção correspondente',
    },
    {
      label: 'Como criar um novo projeto?',
      instructions:
        'Para criar um novo projeto, basta entrar em "Turmas", após selecionar a turma que deseja criar o projeto, você conseguirá criar um novo projeto na aba "Projetos" na aba superior',
    },
    {
      label: 'Como acessar minhas turmas?',
      instructions:
        'Para acessar suas turmas, certifique-se que está na escola correta (caso lecione em mais de uma), e então selecione "Turmas" no menu à esquerda para visualizar suas turmas',
    },
    {
      label: 'O que fazer se meu aluno esquecer a senha?',
      instructions:
        'Caso algum aluno esquecer sua própria senha, ele pode solicitar a recuperação através da plataforma e o seu professor pode fazer a liberação e alteração de senha através da notificação enviada por email após a solicitação do aluno.',
    },
    {
      label: 'Como começar um novo curso?',
      instructions: 'Basta selecionar no menu à esquerda a sessão "Cursos", selecionar o curso, o módulo e então a lição.',
    },
    {
      label: 'Como entrar em contato com o suporte da PiCode?',
      instructions:
        'A plataforma tem duas opções de canal de contato, estando logado ou não. Sem estar logado em sua conta, você pode solicitar ajuda preenchendo o formulário que aparece na tela de login após clicar no botão "Não estou conseguindo acessar", Caso você esteja conectado em sua conta, você pode solicitar suporte através da sessão do menu à esquerda: "Suporte".',
    },
    {
      label: 'Como pedir um novo produto através da loja?',
      instructions:
        'Os alunos só poderão comprar os itens que estiverem disponíveis aos professores, essa compra é feita quando o grupo estiver criado e já vinculado á um projeto',
    },
  ];

  const availableTimeslots = [0, 1, 2, 3, 4, 5].flatMap((id) => {
    const date = new Date();
    date.setDate(date.getDate() + id);

    // Verifica se o dia da semana é sábado (6) ou domingo (0)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return []; // Retorna um array vazio para pular sábados e domingos
    }

    const morningSlot = {
      id: `${id}-morning`,
      startTime: new Date(date.setHours(9, 0, 0)),
      endTime: new Date(date.setHours(13, 0, 0, 0)),
    };

    const afternoonSlot = {
      id: `${id}-afternoon`,
      startTime: new Date(date.setHours(13, 0, 0, 0)),
      endTime: new Date(date.setHours(17, 0, 0, 0)),
    };

    return [morningSlot, afternoonSlot];
  });

  const goBackStep = () => {
    const currentIndex = stepsOrder.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepsOrder[currentIndex - 1]); // Volta um step
    }
  };

  const PageStepElement: Record<PageStepsType, ReactNode> = {
    HELP: (
      <Flex direction="column" gap="60px">
        <Text borderBottom="1px" borderColor="gray300" padding="0 20px 20px">
          Como podemos te ajudar?
        </Text>
        <Flex direction="column">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input type="tel" placeholder="Procurar por respostas" />
          </InputGroup>
        </Flex>
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
            boxShadow="md"
            overflow="hidden"
          >
            <Flex direction="column" w="100%" borderBottom="1px" borderColor="gray300" justify="center">
              <Flex mb={{ base: '8px', xl: '20px' }} fontSize="14px" color="gray600">
                FAQ
              </Flex>
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
            <Text>Tente abrir um chamado ou marcar uma reunião</Text>
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
          Selecione o assunto da reunião
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
                boxShadow="md"
                onClick={() => setStep('TECH_CALENDAR')}
              >
                <BiSupport />
                Problemas técnicos
                <Flex fontSize="18px" textAlign="center" fontWeight="400">
                  Problemas técnicos referem-se <br /> a erros nas plataformas digitais da PiCode.
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
            boxShadow="md"
            cursor="pointer"
            _hover={{ bgColor: 'error900' }}
            transition="0.2s"
            onClick={() => setStep('PEDAGO_CALENDAR')}
          >
            <MdOutlineSchool />
            Problemas pedagógicos
            <Flex fontSize="18px" textAlign="center" fontWeight="400">
              Problemas pedagógicos referem-se <br /> a materiais físicos e digitais da PiCode.
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    ),
    TECH_CALENDAR: (
      <Flex direction="column" gap="50px">
        <Text borderBottom="1px" borderColor="gray300" padding="0 20px 20px" fontSize="20px" fontWeight="600">
          Selecione o melhor horário disponível para agendar uma reunião com o setor escolhido.
        </Text>
        <ScheduleMeeting
          borderRadius={10}
          primaryColor="#3f5b85"
          backgroundColor={colorMode === 'light' ? '#fff' : '#252D38'}
          eventDurationInMinutes={60}
          availableTimeslots={availableTimeslots}
          onStartTimeSelect={console.log}
          startTimeListStyle="scroll-list"
          // Language props
          lang_cancelButtonText="Cancelar"
          lang_confirmButtonText="Confirmar"
          lang_emptyListText="Sem horários disponíveis"
          lang_goToNextAvailableDayText="Próximo disponível"
          lang_noFutureTimesText="Sem horários disponíveis futuros"
          lang_selectedButtonText="Selecionado:"
          // Date format props
          format_nextFutureStartTimeAvailableFormatString="cccc, LLLL do"
          format_selectedDateDayTitleFormatString="cccc, LLLL do"
          format_selectedDateMonthTitleFormatString="LLLL yyyy"
          format_startTimeFormatString="h:mm a"
          locale={ptBR}
        />
      </Flex>
    ),
    PEDAGO_CALENDAR: (
      <Flex direction="column" gap="50px">
        <Text borderBottom="1px" borderColor="gray300" padding="0 20px 20px" fontSize="20px" fontWeight="600">
          Selecione o melhor horário disponível para agendar uma reunião com o setor escolhido.
        </Text>
        <ScheduleMeeting
          borderRadius={10}
          primaryColor="#3f5b85"
          backgroundColor={colorMode === 'light' ? '#fff' : '#252D38'}
          eventDurationInMinutes={60}
          availableTimeslots={availableTimeslots}
          onStartTimeSelect={console.log}
          startTimeListStyle="scroll-list"
          // Language props
          lang_cancelButtonText="Cancelar"
          lang_confirmButtonText="Confirmar"
          lang_emptyListText="Sem horários disponíveis"
          lang_goToNextAvailableDayText="Próximo disponível"
          lang_noFutureTimesText="Sem horários disponíveis futuros"
          lang_selectedButtonText="Selecionado:"
          // Date format props
          format_nextFutureStartTimeAvailableFormatString="cccc, LLLL do"
          format_selectedDateDayTitleFormatString="cccc, LLLL do"
          format_selectedDateMonthTitleFormatString="LLLL yyyy"
          format_startTimeFormatString="h:mm a"
          locale={ptBR}
        />
      </Flex>
    ),
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
        whiteSpace="nowrap"
        borderBottom="1px solid gray300"
        border="1px"
        borderColor="gray300"
        boxShadow="md"
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
