import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import {
  Box,
  Switch,
  Flex,
  Text,
  Grid,
  Icon,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import { FiExternalLink, FiSettings, FiAward, FiMoon, FiHelpCircle, FiFolder } from 'react-icons/fi';
import { Uploader } from 'rsuite';
import NextImage from 'next/image';

import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { IHubUser } from '@/_base/interfaces/user';
import { EditableTextInput } from '@/components/Inputs/EditableText';
import { useAsyncCallback, useAuth, useDarkMode, useCustomRouter } from '@/_base/hooks';
import { updateProfile } from '@/_base/services/user';
import { getMyProjects } from '@/_base/services/project';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { IHubCertificate } from '@/_base/interfaces/certificate';
import { IProject } from '@/_base/interfaces/project';
import { listUserCertificates } from '@/_base/services/certificates';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { useAvatar } from '@/components/Page/hooks';
import moment from 'moment';
import { FaRocket } from 'react-icons/fa6';
import { StudentProfilePage } from './components/StudentProfilePage';

interface IProps {
  user: IHubUser;
}

type GuideType = { label: string; instructions: string };

const guides: GuideType[] = [
  {
    label: 'Como navegar pela plataforma?',
    instructions: 'Você pode navegar pelo Hub utilizando o menu à esquerda e selecionando a sessão que deseja ver.',
  },
  {
    label: 'Como abrir o livro na plataforma?',
    instructions:
      'Para abrir um livro, basta entrar na sessão "Biblioteca" e selecionar, no menu superior, o tipo do livro desejado. Caso deseje consultar um planejamento, este se encontrará em "Materiais Complementares".',
  },
  {
    label: 'Como criar um novo projeto?',
    instructions:
      'Para criar um novo projeto, entre em "Turmas", selecione a turma, navegue até a aba "Projetos" e clique em "Novo Projeto". Você pode usar nossa IA para mapear tudo rapidamente.',
  },
  {
    label: 'Como acessar minhas turmas?',
    instructions: 'Selecione "Turmas" no menu à esquerda. Se não aparecerem, clique em "Adicionar turmas" e selecione as que você é responsável.',
  },
  {
    label: 'O que fazer se meu aluno esquecer a senha?',
    instructions: 'Acesse "Turmas" > Selecione a Turma > Aba "Alunos" > Clique no aluno > Clique no botão "Resetar Senha".',
  },
  {
    label: 'Como pedir um novo produto na loja?',
    instructions: 'Os alunos compram no ambiente do projeto. Você deve aprovar o pedido deles pelo Hub, na sessão "Estoque Maker", aba "Pedidos".',
  },
];

const allDisciplines = [
  'Matemática',
  'Português',
  'História',
  'Geografia',
  'Ciências',
  'Física',
  'Química',
  'Biologia',
  'Inglês',
  'Educação Física',
  'Artes',
  'Robótica',
  'Programação',
  'Informática',
  'Filosofia',
  'Sociologia',
];

const Profile: React.FC<IProps> = ({ user }) => {
  const [certificates, setCertificates] = useState<IHubCertificate[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [profile, setProfile] = useState<IHubUser>(user);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(
    //@ts-ignore
    Array.isArray(user?.metadata?.disciplines) ? user.metadata.disciplines : ['Robótica', 'Programação'],
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const { colorMode, toggleColorMode } = useDarkMode();
  const { setUser, user: authUser } = useAuth();
  const { setAvatar } = useAvatar();
  const router = useCustomRouter();
  const { school } = useSelectedSchool();

  useEffect(() => {
    (async () => {
      const certificatesResponse = await listUserCertificates();
      setCertificates(certificatesResponse);
    })();
  }, []);

  useEffect(() => {
    if ((user.role === 'teacher' || user.role === 'master') && school?.hub_school_id) {
      (async () => {
        const myProjects = school?.id ? await getMyProjects(school?.hub_school_id || '') : [];
        setProjects(myProjects);
      })();
    }
  }, [school, user.role]);

  const handleUpdateProfile = useAsyncCallback(async () => {
    const updatedProfile = await updateProfile({
      name: profile.name,
      username: profile.username,
      bio: profile.bio || undefined,
    });
    setProfile((e) => ({ ...e, ...updatedProfile }));
    setUser({ ...authUser, ...updatedProfile });
  }, []);

  const handleUploadAvatar = async (file?: File) => {
    if (file) {
      setIsUpdating(true);
      try {
        const response = await getPresignedUrl(file.type, 'avatars');
        await uploadFile(response.link, file);
        setTimeout(async () => {
          const updatedUser = await updateProfile({ avatar: response.path });
          setAvatar(updatedUser.avatar || ``);
          setUser({ ...authUser, ...updatedUser });
          setProfile((e) => ({ ...e, avatar: updatedUser.avatar }));
          setIsUpdating(false);
        }, 1000);
      } catch (error) {
        setIsUpdating(false);
      }
    }
  };

  const toggleDiscipline = (discipline: string) => {
    setSelectedDisciplines((prev) => (prev.includes(discipline) ? prev.filter((d) => d !== discipline) : [...prev, discipline]));
  };

  // Se for student, renderiza o novo layout
  if (user.role === 'student') {
    return (
      <Flex direction="column" flex="1" gap="1.5rem" overflowY="auto" overflowX="hidden" py="1.5rem">
        <StudentProfilePage user={user} certificates={certificates} />
      </Flex>
    );
  }

  return (
    <Flex direction="column" flex="1" gap="1.5rem" overflowY="auto" overflowX="hidden">
      {/* SEÇÃO TOP - Boas-vindas + Certificados */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap="1.5rem" w="100%">
        {/* Boas-vindas à PiCode */}
        <Flex
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          direction="column"
          borderRadius="2xl"
          border="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
          boxShadow="sm"
          p="1.5rem"
          minH="300px"
          overflow="hidden"
        >
          <Flex align="center" gap="0.5rem" mb="1rem">
            <Icon as={FaRocket} color="primary.500" fontSize="20px" />
            <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
              Boas-vindas à PiCode
            </Text>
          </Flex>
          <Flex flex="1" borderRadius="xl" overflow="hidden" justify="center" align="center" bg={colorMode === 'dark' ? 'gray.700' : 'blue.50'}>
            <video width="100%" height="100%" controls preload="metadata" style={{ objectFit: 'cover' }}>
              <source src="https://picode-public.s3.amazonaws.com/hub-videos/Apresenta%C3%A7%C3%A3o+professores+com+intro+.mp4" type="video/mp4" />
            </video>
          </Flex>
        </Flex>

        {/* Meus Certificados */}
        <Flex
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          direction="column"
          borderRadius="2xl"
          border="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
          boxShadow="sm"
          p="1.5rem"
          minH="300px"
        >
          <Flex align="center" gap="0.5rem" mb="1.5rem">
            <Icon as={FiAward} color="orange.400" fontSize="20px" />
            <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.900'}>
              Meus Certificados
            </Text>
          </Flex>

          <Flex direction="column" gap="0.75rem" overflowY="auto" flex="1">
            {certificates.length ? (
              certificates.slice(0, 3).map((certificate, index) => (
                <Flex
                  key={certificate.id}
                  align="center"
                  justify="space-between"
                  p="1rem"
                  bg={colorMode === 'light' ? 'white' : 'whiteAlpha.50'}
                  border="1px solid"
                  borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
                  borderLeft="3px solid"
                  borderLeftColor="orange.400"
                  borderRadius="md"
                  transition="all 0.2s ease"
                  _hover={{
                    bg: colorMode === 'light' ? 'gray.50' : 'whiteAlpha.75',
                    borderColor: colorMode === 'dark' ? 'gray.600' : 'gray.300',
                  }}
                >
                  <Flex align="center" gap="0.75rem" flex="1">
                    <Flex
                      bg="orange.400"
                      borderRadius="full"
                      align="center"
                      justify="center"
                      w="40px"
                      h="40px"
                      flexShrink={0}
                      fontSize="16px"
                      fontWeight="700"
                      color="white"
                    >
                      {index + 1}
                    </Flex>
                    <Flex direction="column" gap="0.125rem">
                      <Text fontWeight="600" fontSize="14px" color={colorMode === 'dark' ? 'white' : 'gray.900'}>
                        {certificate.title}
                      </Text>
                      <Text fontSize="12px" color={colorMode === 'dark' ? 'whiteAlpha.600' : 'gray.500'} fontWeight="500">
                        {moment(certificate.created_at).format('DD/MM/YYYY')}
                      </Text>
                    </Flex>
                  </Flex>

                  <Flex align="center" gap="0.75rem">
                    <Button
                      as="a"
                      href={certificate.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      fontSize="12px"
                      fontWeight="600"
                      color="primary.500"
                      display="flex"
                      alignItems="center"
                      gap="0.25rem"
                      h="auto"
                      px="0.75rem"
                      py="0.5rem"
                      _hover={{
                        bg: 'transparent',
                        color: 'primary.700',
                      }}
                      rightIcon={<Icon as={FiExternalLink} fontSize="12px" />}
                    >
                      Visualizar
                    </Button>
                    <Icon as={FiExternalLink} color="gray.300" fontSize="16px" />
                  </Flex>
                </Flex>
              ))
            ) : (
              <Flex direction="column" align="center" justify="center" flex="1" color="gray.400">
                <Icon as={FiAward} fontSize="28px" mb="2" opacity={0.5} />
                <Text fontSize="14px" fontWeight="500">
                  Você ainda não possui certificados
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Grid>

      {/* SEÇÃO PROJETOS - Meus Projetos Recentes */}
      {projects.length > 0 && (
        <Flex
          direction="column"
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          borderRadius="2xl"
          border="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
          boxShadow="sm"
          p="1.5rem"
        >
          <Flex align="center" justify="space-between" mb="1.5rem">
            <Flex align="center" gap="0.5rem">
              <Icon as={FiFolder} color="primary.500" fontSize="18px" />
              <Text fontSize="16px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.900'}>
                Meus Projetos Recentes
              </Text>
            </Flex>
            <Button size="sm" variant="ghost" colorScheme="primary" fontSize="12px" fontWeight="600" onClick={() => router.push('/projects')}>
              Ver todos →
            </Button>
          </Flex>

          <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }} gap="1rem">
            {projects.slice(0, 6).map((project, index) => {
              const colors = ['cyan', 'purple', 'orange', 'green', 'red', 'blue'];
              const colorScheme = colors[index % colors.length];

              return (
                <Flex
                  key={project.id}
                  align="center"
                  gap="0.75rem"
                  p="1rem"
                  bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'white'}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
                  borderLeft="3px solid"
                  borderLeftColor={`${colorScheme}.500`}
                  cursor="pointer"
                  transition="all 0.2s ease"
                  _hover={{
                    bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50',
                  }}
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <Flex w="36px" h="36px" borderRadius="md" bg={`${colorScheme}.500`} align="center" justify="center" flexShrink={0}>
                    <Icon as={FiFolder} color="white" fontSize="16px" />
                  </Flex>

                  <Flex direction="column" gap="0.125rem" flex="1">
                    <Text fontWeight="600" fontSize="13px" color={colorMode === 'dark' ? 'white' : 'gray.900'} noOfLines={1}>
                      {project.title}
                    </Text>
                    <Text fontSize="11px" color={colorMode === 'dark' ? 'whiteAlpha.600' : 'gray.500'} fontWeight="500">
                      {moment(project.updated_at).format('DD/MM/YYYY')}
                    </Text>
                  </Flex>

                  <Icon as={FiExternalLink} color={`${colorScheme}.500`} fontSize="14px" />
                </Flex>
              );
            })}
          </Grid>
        </Flex>
      )}

      {/* SEÇÃO CONFIGURAÇÕES - Guia + Settings */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1.2fr' }} gap="1.5rem" w="100%">
        {/* Guia Rápido */}
        <Flex
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          direction="column"
          borderRadius="2xl"
          border="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
          boxShadow="sm"
          p="1.5rem"
          maxH="500px"
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
                  bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.50'}
                  borderRadius="lg"
                  borderColor={colorMode === 'dark' ? '#2D3748' : '#E2E8F0'}
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

        {/* Configurações */}
        <Flex
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          direction="column"
          borderRadius="2xl"
          border="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
          boxShadow="sm"
          p="1.5rem"
          gap="1.5rem"
        >
          {/* Header com Settings e Modo Noturno */}
          <Flex justify="space-between" align="center">
            <Flex align="center" gap="0.5rem">
              <Icon as={FiSettings} color="primary.500" fontSize="20px" />
              <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                Configurações
              </Text>
            </Flex>
            <Flex
              align="center"
              gap="0.5rem"
              bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'}
              p="0.25rem 0.75rem"
              borderRadius="full"
              border="1px solid"
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
            >
              <Icon as={FiMoon} color="gray.500" />
              <Switch size="sm" onChange={toggleColorMode} isChecked={colorMode === 'dark'} colorScheme="orange" />
            </Flex>
          </Flex>

          {/* Foto de Perfil */}
          <Box>
            <Text fontSize="12px" fontWeight="600" color="gray.500" mb="1rem" textTransform="uppercase">
              Foto de Perfil
            </Text>
            <Flex direction="column" align="center" gap="1rem">
              {/* Avatar */}
              <Flex position="relative">
                <Flex
                  w="80px"
                  h="80px"
                  borderRadius="full"
                  border="3px solid"
                  borderColor={colorMode === 'dark' ? 'gray.600' : 'blue.100'}
                  boxShadow="md"
                  overflow="hidden"
                  bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
                  align="center"
                  justify="center"
                >
                  <NextImage
                    src={profile?.avatar || ''}
                    width={80}
                    height={80}
                    alt="Avatar"
                    style={{ opacity: isUpdating ? 0.4 : 1, borderRadius: '50%', objectFit: 'cover' }}
                    priority
                  />
                  {isUpdating && (
                    <Flex borderRadius="50%" position="absolute" inset="0" align="center" justify="center" bg="rgba(0,0,0,0.3)">
                      <Spinner size="sm" />
                    </Flex>
                  )}
                </Flex>

                {/* Upload Button */}
                <Uploader
                  autoUpload={true}
                  accept={`image/*`}
                  draggable={false}
                  action=""
                  fileListVisible={false}
                  onChange={(e) => handleUploadAvatar(e[0]?.blobFile as File)}
                  toggleAs={(e) => (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      color="white"
                      borderRadius="full"
                      onClick={() => e.onClick(e)}
                      fontSize="13px"
                      fontWeight="600"
                    >
                      Alterar foto
                    </Button>
                  )}
                />
              </Flex>
            </Flex>
          </Box>

          {/* Nome Completo */}
          <Box>
            <Text fontSize="12px" fontWeight="600" color="gray.500" mb="0.5rem" textTransform="uppercase">
              Nome Completo
            </Text>
            <EditableTextInput
              value={profile.name}
              onInputChange={(name) => setProfile((e) => ({ ...e, name }))}
              onOk={handleUpdateProfile}
              onCancel={() => setProfile((e) => ({ ...e, name: user.name }))}
            />
          </Box>

          {/* E-mail */}
          <Box>
            <Text fontSize="12px" fontWeight="600" color="gray.500" mb="0.5rem" textTransform="uppercase">
              E-mail
            </Text>
            <EditableTextInput value={profile.email || ''} onInputChange={() => {}} isDisabled />
          </Box>

          {/* Biografia */}
          <Box>
            <Text fontSize="12px" fontWeight="600" color="gray.500" mb="0.5rem" textTransform="uppercase">
              Biografia
            </Text>
            <EditableTextInput
              placeholder="Adicione uma biografia..."
              value={profile.bio || ''}
              onInputChange={(bio) => setProfile((e) => ({ ...e, bio }))}
              onOk={handleUpdateProfile}
              onCancel={() => setProfile((e) => ({ ...e, bio: user.bio }))}
            />
          </Box>

          {/* Disciplinas */}
          <Box>
            <Flex justify="space-between" align="center" mb="1rem">
              <Text fontSize="12px" fontWeight="600" color="gray.500" textTransform="uppercase">
                Disciplinas que leciono
              </Text>
              <Button size="xs" variant="ghost" fontSize="12px" color="primary.500" fontWeight="600" _hover={{ bg: 'primary.50' }}>
                + Adicionar
              </Button>
            </Flex>

            {/* Disciplinas Selecionadas */}
            {selectedDisciplines.length > 0 && (
              <Flex gap="0.5rem" mb="1rem" wrap="wrap">
                {selectedDisciplines.map((discipline) => (
                  <Badge
                    key={discipline}
                    bg="primary.50"
                    color="primary.700"
                    borderRadius="full"
                    px="0.75rem"
                    py="0.25rem"
                    fontSize="12px"
                    fontWeight="600"
                    border="1px solid"
                    borderColor="primary.200"
                    cursor="pointer"
                    _hover={{ bg: 'primary.100' }}
                    onClick={() => toggleDiscipline(discipline)}
                  >
                    {discipline} ✕
                  </Badge>
                ))}
              </Flex>
            )}

            {/* Grid de Disciplinas Disponíveis */}
            <Grid templateColumns="repeat(3, 1fr)" gap="0.5rem">
              {allDisciplines.map((discipline) => (
                <Badge
                  key={discipline}
                  bg={selectedDisciplines.includes(discipline) ? 'primary.500' : 'gray.100'}
                  color={selectedDisciplines.includes(discipline) ? 'white' : 'gray.700'}
                  borderRadius="full"
                  px="0.75rem"
                  py="0.5rem"
                  fontSize="12px"
                  fontWeight="600"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    bg: selectedDisciplines.includes(discipline) ? 'primary.600' : 'gray.200',
                  }}
                  onClick={() => toggleDiscipline(discipline)}
                  textAlign="center"
                  justifyContent="center"
                >
                  {discipline}
                </Badge>
              ))}
            </Grid>
          </Box>
        </Flex>
      </Grid>
    </Flex>
  );
};

export default Profile;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'profile';
  try {
    cookieManager.updateToken(req);
    const user = await validateSession();
    return { props: { selectedPage, pageTitle: 'Meu perfil', user, showBackButton: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};
