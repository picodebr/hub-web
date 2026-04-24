import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { Box, Img, Switch, useColorMode, Flex, Text, Grid, Icon, Button } from '@chakra-ui/react';
import { FiExternalLink, FiSettings, FiAward, FiMoon } from 'react-icons/fi';

import { TeacherProfile } from './components/TeacherProfile';
import { StudentProfile } from './components/StudentProfile';
import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager, formatDateInput } from '@/_base/utils';
import { IHubUser } from '@/_base/interfaces/user';
import { EditableTextInput } from '@/components/Inputs/EditableText';
import { DateInput } from '@/components/Inputs/Date';
import { useAsyncCallback, useAuth, useCustomRouter } from '@/_base/hooks';
import { getMyProjects } from '@/_base/services/project';
import { IProject } from '@/_base/interfaces/project';
import { updateProfile } from '@/_base/services/user';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { IHubCertificate } from '@/_base/interfaces/certificate';
import { listUserCertificates } from '@/_base/services/certificates';

interface IProps {
  user: IHubUser;
}

const Profile: React.FC<IProps> = ({ user }) => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [certificates, setCertificates] = useState<IHubCertificate[]>([]);
  const [profile, setProfile] = useState<IHubUser>(user);

  const { colorMode, toggleColorMode } = useColorMode();
  const { setUser, user: authUser } = useAuth();
  const router = useCustomRouter();

  const { school } = useSelectedSchool();

  useEffect(() => {
    if ((user.role === `teacher` || user.role === `master`) && school?.hub_school_id)
      (async () => {
        const myProjects = school?.id ? await getMyProjects(school?.hub_school_id || ``) : [];
        setProjects(myProjects);
      })();
  }, [school]);

  useEffect(() => {
    (async () => {
      const certificatesResponse = await listUserCertificates();
      setCertificates(certificatesResponse);
    })();
  }, [school]);

  const handleUpdateProfile = useAsyncCallback(async () => {
    const updatedProfile = await updateProfile({
      name: profile.name,
      username: profile.username,
      bio: profile.bio || undefined,
    });
    setProfile((e) => ({ ...e, ...updatedProfile }));
    setUser({ ...authUser, ...updatedProfile });
  }, []);

  const ComponentUser = user?.role === 'student' ? StudentProfile : TeacherProfile;

  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  return (
    <Flex direction="column" flex="1" gap="1.5rem" overflowY="auto" overflowX="hidden" pb="2rem">
      {/* Dashboard Topo (Professor ou Aluno) */}
      <ComponentUser projects={projects} user={profile} />

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap="1.5rem">
        {/* Painel de Configurações (Meus Dados + Modo Noturno) */}
        <Flex direction="column" bg={bgCard} borderRadius="2xl" border="1px solid" borderColor={borderColor} boxShadow="sm" p="1.5rem">
          <Flex justify="space-between" align="center" mb="1.5rem">
            <Flex align="center" gap="0.5rem">
              <Icon as={FiSettings} color="primary.500" fontSize="20px" />
              <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                Configurações da Conta
              </Text>
            </Flex>
            <Flex
              align="center"
              gap="0.5rem"
              bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'}
              p="0.25rem 0.75rem"
              borderRadius="full"
              border="1px solid"
              borderColor={borderColor}
            >
              <Icon as={FiMoon} color="gray.500" />
              <Switch size="sm" onChange={toggleColorMode} isChecked={colorMode === 'dark'} colorScheme="orange" />
            </Flex>
          </Flex>

          <Flex direction="column" gap="1.25rem">
            <Box>
              <Text fontSize="13px" fontWeight="600" color="gray.500" mb="2px">
                Nome Completo
              </Text>
              <EditableTextInput
                value={profile.name}
                onInputChange={(name) => setProfile((e) => ({ ...e, name }))}
                onOk={handleUpdateProfile}
                onCancel={() => setProfile((e) => ({ ...e, name: user.name }))}
              />
            </Box>
            <Box>
              <Text fontSize="13px" fontWeight="600" color="gray.500" mb="2px">
                Nome de Usuário
              </Text>
              <EditableTextInput
                value={profile.username}
                onInputChange={(username) => setProfile((e) => ({ ...e, username }))}
                onOk={handleUpdateProfile}
                onCancel={() => setProfile((e) => ({ ...e, username: user.username }))}
              />
            </Box>
            <Box>
              <Text fontSize="13px" fontWeight="600" color="gray.500" mb="2px">
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
            <Grid templateColumns="1fr 1fr" gap="1rem">
              <Box>
                <Text fontSize="13px" fontWeight="600" color="gray.500" mb="2px">
                  E-mail
                </Text>
                <EditableTextInput
                  placeholder="Seu e-mail"
                  value={profile.email || ''}
                  onInputChange={(email) => setProfile((e) => ({ ...e, email }))}
                  isDisabled
                />
              </Box>
              <Box>
                <Text fontSize="13px" fontWeight="600" color="gray.500" mb="2px">
                  Nascimento
                </Text>
                <DateInput
                  value={formatDateInput(profile.birthdate)}
                  isDisabled
                  onInputChange={(birthdate) => setProfile((e) => ({ ...e, birthdate: birthdate ? new Date(birthdate) : e.birthdate }))}
                />
              </Box>
            </Grid>
          </Flex>
        </Flex>

        {/* Painel de Certificados */}
        <Flex direction="column" bg={bgCard} borderRadius="2xl" border="1px solid" borderColor={borderColor} boxShadow="sm" p="1.5rem">
          <Flex align="center" gap="0.5rem" mb="1.5rem">
            <Icon as={FiAward} color="orange.500" fontSize="20px" />
            <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
              Meus Certificados
            </Text>
          </Flex>

          <Flex direction="column" gap="0.75rem" overflowY="auto" maxH="350px" pr="0.5rem">
            {certificates.length ? (
              certificates.map((certificate) => (
                <Flex
                  key={certificate.id}
                  align="center"
                  justify="space-between"
                  p="1rem"
                  bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="xl"
                  transition="all 0.2s"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'sm' }}
                >
                  <Flex align="center" gap="1rem">
                    <Flex bg="white" p="0.25rem" borderRadius="md" border="1px solid" borderColor="gray.200">
                      <Img src={certificate.thumbnail} w="32px" h="32px" objectFit="contain" />
                    </Flex>
                    <Text fontWeight="600" fontSize="15px" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                      {certificate.title}
                    </Text>
                  </Flex>
                  <Button
                    as="a"
                    href={certificate.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    borderRadius="full"
                    rightIcon={<FiExternalLink />}
                  >
                    Visualizar
                  </Button>
                </Flex>
              ))
            ) : (
              <Flex
                direction="column"
                align="center"
                justify="center"
                h="150px"
                color="gray.400"
                border="2px dashed"
                borderColor={borderColor}
                borderRadius="xl"
              >
                <Icon as={FiAward} fontSize="28px" mb="2" opacity={0.5} />
                <Text fontSize="14px" fontWeight="500">
                  Você ainda não possui certificados
                </Text>
              </Flex>
            )}
          </Flex>
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
