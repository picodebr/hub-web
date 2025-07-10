import moment from 'moment';
import { FiFileText, FiHelpCircle } from 'react-icons/fi';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Flex, Text, useColorMode } from '@chakra-ui/react';

import { IProfileComponentProps } from './interfaces';
import { useCustomRouter } from '@/_base/hooks';

type GuideType = { label: string; instructions: string };

export const TeacherProfile: React.FC<IProfileComponentProps> = ({ projects }) => {
  const { colorMode } = useColorMode();
  const router = useCustomRouter();

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

  return (
    <Flex w="100%" display="flex" direction="column" gap="24px">
      <Flex
        direction={{ base: `column`, md: 'row' }}
        w="100%"
        h="fit-content"
        gap="32px"
        maxH={{ base: '280px', xl: '330px' }}
        minH={{ base: '280px', xl: '330px' }}
      >
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
          <Flex direction="column" w="100%" borderBottom="1px" borderColor="gray300" justify="center">
            <Flex mb={{ base: '8px', xl: '20px' }} fontSize="14px" color="gray600">
              Guia Rápido
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
          marginBottom="1.25rem"
          
          overflow="hidden"
          className="only-desktop"
        >
          <Flex direction="column" w="100%" h="fit-content" borderBottom="1px" borderColor="gray300" justify="center">
            <Flex fontSize="0.875rem" color="gray600" mb={{ base: '8px', xl: '20px' }}>
              Boas vindas à PiCode 🚀
            </Flex>
          </Flex>
          <Flex flex="1" align="center" gap="0.75rem" w="100%" pb="1.25rem">
            <video width="100%" height="100%" controls preload="true" style={{ maxHeight: `230px`, borderRadius: `10px` }}>
              <source src="https://picode-public.s3.amazonaws.com/hub-videos/Apresenta%C3%A7%C3%A3o+professores+com+intro+.mp4" type="video/mp4" />
            </video>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        bgColor="white"
        flexDirection="column"
        borderRadius="10px"
        
        w="100%"
        gap="1.25rem"
        textAlign="left"
        display="column"
        justify="center"
        color="gray600"
      >
        <Accordion allowMultiple>
          <AccordionItem border="none">
            <AccordionButton borderRadius="md">
              <Text flex="1" textAlign="left" p="0.65rem 0.5rem" fontSize={{ base: `15px`, xl: '16px' }}>
                Projetos
              </Text>
              <AccordionIcon />
            </AccordionButton>
            {projects?.length ? (
              <AccordionPanel pb={4} display="flex" gap="8px">
                {projects
                  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                  .map((project) => (
                    <Flex
                      key={project.id}
                      
                      bgColor="primary50"
                      borderRadius="10px"
                      w="207px"
                      h="183px"
                      p="12px"
                      direction="column"
                      gap="8px"
                    >
                      <Flex
                        direction="row"
                        align="center"
                        gap="4px"
                        color="primary500"
                        fontWeight="500"
                        cursor="pointer"
                        transition="all 0.1s"
                        _hover={{ filter: `brightness(0.9)` }}
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        <FiFileText />
                        <Text>{project.title}</Text>
                      </Flex>
                      <Flex direction="column">
                        <Text fontSize="11px" fontWeight="500">
                          Atualizado em
                        </Text>
                        <Text fontSize="12px">{moment(project.updated_at).calendar()}</Text>
                      </Flex>
                    </Flex>
                  ))}
              </AccordionPanel>
            ) : (
              <AccordionPanel pb={4}>
                <Text color="gray500">Você ainda não possui nenhum projeto</Text>
              </AccordionPanel>
            )}
          </AccordionItem>
        </Accordion>
      </Flex>
    </Flex>
  );
};
