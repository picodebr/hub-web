import { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Img, Switch, useColorMode } from '@chakra-ui/react';

import { TeacherProfile } from './components/TeacherProfile';
import { StudentProfile } from './components/StudentProfile';
import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager, formatDateInput } from '@/_base/utils';
import { Flex, Text } from '@chakra-ui/react';
import { IHubUser } from '@/_base/interfaces/user';
import { EditableTextInput } from '@/components/Inputs/EditableText';
import { DateInput } from '@/components/Inputs/Date';
import { useAsyncCallback, useAuth, useCustomRouter } from '@/_base/hooks';
import { getMyProjects } from '@/_base/services/project';
import { IProject } from '@/_base/interfaces/project';
import { updateProfile } from '@/_base/services/user';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { listUserCertificates } from '@/_base/services/certificates';
import { IHubCertificate } from '@/_base/interfaces/certificate';
import { FiExternalLink } from 'react-icons/fi';

interface IProps {
  user: IHubUser;
}

const Profile: React.FC<IProps> = ({ user }) => {
  const [eventIsClicked, setEventIsClicked] = useState(false);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [certificates, setCertificates] = useState<IHubCertificate[]>([]);

  const [profile, setProfile] = useState<IHubUser>(user);

  const { colorMode, toggleColorMode } = useColorMode();
  const { setUser, user: authUser } = useAuth();
  const router = useCustomRouter();
  const isOpened = useMemo<boolean>(() => !!router.query.opened, [router]);

  const { school } = useSelectedSchool();

  useEffect(() => {
    if (user.role === `teacher` && school?.hub_school_id)
      (async () => {
        const myProjects = school?.id ? await getMyProjects(school?.hub_school_id || ``) : [];
        setProjects(myProjects);
      })();
  }, [school]);

  useEffect(() => {
    (async () => {
      // const certificatesResponse = await listUserCertificates();
      const certificatesResponse: IHubCertificate[] = [
        {
          id: '1',
          title: 'Formação Maker',
          hub_course_id: 'Anderson',
          hub_user_id: 'Anderson',
          thumbnail:
            'https://acdn.mitiendanube.com/stores/001/901/585/products/certificado-escolar-ensino-fundamental-curso-infantil-divertido-ilustrado-amarelo-e6177a9dbd399dae7717089997398567-1024-1024.png',
          link: '/certificate/pdf.pdf',
        },
        {
          id: '2',
          title: 'Formação Maker',
          hub_course_id: 'Anderson',
          hub_user_id: 'Anderson',
          thumbnail:
            'https://acdn.mitiendanube.com/stores/001/901/585/products/certificado-escolar-ensino-fundamental-curso-infantil-divertido-ilustrado-amarelo-e6177a9dbd399dae7717089997398567-1024-1024.png',
          link: '/certificate/pdf.pdf',
        },
        {
          id: '3',
          title: 'Formação Maker',
          hub_course_id: 'Anderson',
          hub_user_id: 'Anderson',
          thumbnail:
            'https://acdn.mitiendanube.com/stores/001/901/585/products/certificado-escolar-ensino-fundamental-curso-infantil-divertido-ilustrado-amarelo-e6177a9dbd399dae7717089997398567-1024-1024.png',
          link: '/certificate/pdf.pdf',
        },
      ];
      setCertificates(certificatesResponse);
    })();
  }, [school]);

  useEffect(() => {
    setTimeout(() => {
      const el = document.getElementsByClassName(`my-data-btn`);
      if (el[0] && isOpened && !eventIsClicked) {
        (el[0] as any).click();
        setEventIsClicked(true);
      }
    }, 250);
  }, [isOpened]);

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

  return (
    <Flex direction="column" flex="1" gap="24px" overflow="auto">
      <ComponentUser projects={projects} user={profile} />
      <Flex
        bgColor="white"
        flexDirection="column"
        borderRadius="10px"
        boxShadow="md"
        w="100%"
        gap="1.25rem"
        textAlign="left"
        display="column"
        justify="center"
        color="gray600"
      >
        <Accordion allowMultiple>
          <AccordionItem border="none" borderRadius="10px">
            <AccordionButton className="my-data-btn" borderRadius="md">
              <Text flex="1" textAlign="left" padding="0.65rem 0.35rem" fontSize={{ base: `15px`, xl: '16px' }}>
                Meus dados
              </Text>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Flex pb={5} direction="column">
                <Text>Nome Completo</Text>
                <EditableTextInput
                  onInputChange={(name) => setProfile((e) => ({ ...e, name }))}
                  value={profile.name}
                  onOk={handleUpdateProfile}
                  onCancel={() => setProfile((e) => ({ ...e, name: user.name }))}
                />
              </Flex>
              <Flex pb={5} direction="column">
                <Text>Nome de Usuário</Text>
                <EditableTextInput
                  onInputChange={(username) => setProfile((e) => ({ ...e, username }))}
                  value={profile.username}
                  onOk={handleUpdateProfile}
                  onCancel={() => setProfile((e) => ({ ...e, username: user.username }))}
                />
              </Flex>
              <Flex pb={5} direction="column">
                <Text>Biografia</Text>
                <EditableTextInput
                  placeholder="Biografia"
                  onInputChange={(bio) => setProfile((e) => ({ ...e, bio }))}
                  value={profile.bio || ''}
                  onOk={handleUpdateProfile}
                  onCancel={() => setProfile((e) => ({ ...e, bio: user.bio }))}
                />
              </Flex>
              <Flex pb={5} direction="column">
                <Text>E-mail (opcional)</Text>
                <EditableTextInput
                  placeholder="Seu e-mail"
                  onInputChange={(email) => setProfile((e) => ({ ...e, email }))}
                  value={profile.email || ''}
                  isDisabled
                />
              </Flex>
              <Flex direction="column">
                <Text>Data de Nascimento</Text>
                <DateInput
                  value={formatDateInput(profile.birthdate)}
                  isDisabled
                  onInputChange={(birthdate) => setProfile((e) => ({ ...e, birthdate: birthdate ? new Date(birthdate) : e.birthdate }))}
                />
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Flex>
      <Flex
        bgColor="white"
        flexDirection="column"
        borderRadius="10px"
        boxShadow="md"
        w="100%"
        h="fit-content"
        gap="1.25rem"
        textAlign="left"
        color="gray600"
        userSelect="none"
      >
        <Accordion allowMultiple w="100%">
          <AccordionItem border="none">
            <AccordionButton borderRadius="md">
              <Text flex="1" textAlign="left" padding="0.65rem 0.35rem" fontSize={{ base: `15px`, xl: '16px' }}>
                Certificados
              </Text>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {certificates.length ? (
                <Flex direction="column" gap="1rem">
                  {certificates.map((certificate) => (
                    <Flex
                      key={certificate.id}
                      justify="space-between"
                      align="center"
                      gap="0.5rem"
                      w="100%"
                      _notLast={{ borderBottom: '1px', borderColor: '#4B4F5C33', paddingBottom: '1rem' }}
                    >
                      <Flex align="center" gap="20px">
                        <Img src={certificate.thumbnail} w="40px" />
                        <Text fontWeight="500" fontSize="15px">
                          {certificate.title}
                        </Text>
                      </Flex>
                      <Box
                        as="a"
                        href={certificate.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        bgColor="primary"
                        borderRadius="5px"
                        cursor="pointer"
                        textAlign="center"
                      >
                        <FiExternalLink fontSize="22px" />
                      </Box>
                    </Flex>
                  ))}
                </Flex>
              ) : (
                <Text color="gray500">Você ainda não possui nenhum certificado</Text>
              )}
            </AccordionPanel>

            {/* <AccordionPanel pb={4}>
              <Flex w="100%" justify="space-between" p="20px" borderTop="1px" borderBottom="1px" borderColor="gray300">
                <Flex align="center" gap="20px">
                  <Img src="/icons/medal.svg" w="40px" />
                  <Text fontWeight="500" fontSize="15px">
                    JavaScript
                  </Text>
                </Flex>
                <CircularProgress value={100}>
                  <CircularProgressLabel>100%</CircularProgressLabel>
                </CircularProgress>
              </Flex>
              <Flex w="100%" justify="space-between" p="20px" borderBottom="1px" borderColor="gray300">
                <Flex align="center" gap="20px">
                  <Img src="/icons/medal.svg" w="40px" />
                  <Text fontWeight="500" fontSize="15px">
                    SQL
                  </Text>
                </Flex>
                <CircularProgress value={50}>
                  <CircularProgressLabel>50%</CircularProgressLabel>
                </CircularProgress>
              </Flex>
              <Flex w="100%" justify="space-between" p="20px">
                <Flex align="center" gap="20px">
                  <Img src="/icons/medal.svg" w="40px" />
                  <Text fontWeight="500" fontSize="15px">
                    Python
                  </Text>
                </Flex>
                <CircularProgress value={60}>
                  <CircularProgressLabel>60%</CircularProgressLabel>
                </CircularProgress>
              </Flex>
            </AccordionPanel> */}
          </AccordionItem>
        </Accordion>
      </Flex>
      <Flex
        bgColor="white"
        flexDirection="column"
        borderRadius="10px"
        boxShadow="md"
        w="100%"
        h="fit-content"
        padding="1.25rem"
        gap="1.25rem"
        textAlign="left"
        display="column"
        justify="space-between"
        color="gray600"
      >
        <Flex display="flex" justify="space-between" direction="row">
          <Text>Modo noturno</Text>
          <Switch onChange={toggleColorMode} isChecked={colorMode === 'dark'} colorScheme="yellow" />
        </Flex>
      </Flex>
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
