import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { Progress } from 'antd';
import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { PiShootingStar } from 'react-icons/pi';
import { motion } from 'framer-motion';
import { useAsyncCallback } from '@/_base/hooks';
import { IHubFactoryProject } from '@/_base/interfaces/project/IHubFactoryProject';
import { IHubUser } from '@/_base/interfaces/user';
import { getStudent } from '@/_base/services/user';
import { cookieManager, formatCoin, formatShortName, logError } from '@/_base/utils';
import { CoinIcon } from '@/components/Logo';
import { Header } from '@/components/Tailwind/HubForm/components/Header';
import AnnouncementSection from '@/components/Tailwind/HubForm/components/AnnouncementSection';
import { AssessmentSection } from '@/components/Tailwind/HubForm/components/AssessmentSection';

type TempProject = { project: IHubFactoryProject; students: Array<{ name: string; id: string }> };
type TempStudent = IHubUser & { project: IHubFactoryProject };

const Exam: React.FC = () => {
  const [projects, setProjects] = useState<TempProject[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<TempStudent | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const _projects: TempProject[] = Object.keys(localStorage)
      .filter((k) => k.startsWith(`pending_forms::`))
      .map((k) => JSON.parse(localStorage.getItem(k) || `{}`));

    setProjects(_projects);
  }, []);

  const handleSelectStudent = useAsyncCallback(async (studentId: string, project: IHubFactoryProject) => {
    const student = await getStudent(studentId);
    if (student) setSelectedStudent({ ...student, project });
  }, []);

  return (
    <Flex flex="1" direction="column" gap="1rem">
      <Flex h="150px" w="100%" justify="space-between" gap="1rem">
        <Flex border="1px" flex="1" borderColor="gray300" borderRadius="8px" bg="white" padding="20px" gap="32px" align="center" h="100%">
          <Avatar size="xl" name={formatShortName(selectedStudent?.name || '', true)} title={selectedStudent?.name} />

          <Flex h="fit-content" direction="column" justify="end">
            <Text fontSize="18px" fontWeight="600" color="primary500">
              {selectedStudent?.name || ``}
            </Text>
            <Text fontSize="12px" color="gray400">
              @{selectedStudent?.username || ``}
            </Text>
            <Text fontSize="14px" margin="8px 0 8px 0" color="gray600">
              {selectedStudent?.bio || `.`}
            </Text>
          </Flex>
          <Flex direction="column" align="flex-end" justify="space-between" h="100%" gap="0.5rem" flex="1">
            <Flex align="center" justify="space-between" gap="0.5rem" fontWeight="400" color="gray400">
              <CoinIcon />
              <Text fontSize="1rem">{formatCoin(selectedStudent?.metadata.coins)}</Text>
            </Flex>
            <Button gap="0.5rem" onClick={onOpen} hidden={!selectedStudent}>
              <Text>Avaliar</Text>
              <PiShootingStar fontSize="22px" />
            </Button>
          </Flex>
        </Flex>
        <Flex border="1px" borderColor="gray300" w="150px" h="100%" bg="white" borderRadius="8px" justify="center" align="center">
          <Progress
            type="circle"
            // percent={Math.ceil((finishedLessons.length / lessons.length) * 100)}
            percent={0}
            format={() => <Text color="text">{`${0}/${projects.length}`}</Text>}
          />
        </Flex>
      </Flex>
      <Flex flex="1" border="1px" borderColor="gray300" bg="white" borderRadius="8px" overflow="hidden auto" maxH="calc(100vh - 19.5rem)">
        {projects.map(({ project, students }) => (
          <Accordion allowMultiple w="100%" fontWeight="500" color="gray700">
            <AccordionItem>
              <h2>
                <AccordionButton justifyContent="space-between">
                  <Box fontSize={{ base: `15px`, xl: '16px' }}>{project.title}</Box>
                  <AccordionIcon />
                  {/* <IoChevronForward color={colorMode === 'dark' ? '#FCFCFD' : '#101828'} /> */}
                </AccordionButton>
              </h2>
              <AccordionPanel fontWeight="400" display="flex" flexDirection="column" gap="1rem" overflow="hidden">
                {students.map(({ name, id }) => (
                  <Flex
                    key={id}
                    border="1px"
                    borderColor="gray300"
                    borderRadius="8px"
                    align="center"
                    gap="0.5rem"
                    p="0.5rem"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ boxShadow: `md ` }}
                    onClick={() => handleSelectStudent(id, project)}
                  >
                    <Avatar key={id} name={formatShortName(name || '', true)} title={name} />
                    <Text fontSize="18px" fontWeight="500">
                      {name}
                    </Text>
                    <Flex flex="1" justify="flex-end" align="center">
                      <Tooltip label="Avaliar" placement="left">
                        <Button p="0" onClick={onOpen}>
                          <PiShootingStar fontSize="24px" />
                        </Button>
                      </Tooltip>
                    </Flex>
                  </Flex>
                ))}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        ))}
      </Flex>
      <Drawer size="full" isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />

          <DrawerBody>
            <Flex direction="column">
              <motion.div className="min-h-screen bg-gray-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ overflow: `hidden auto` }}>
                <Header />

                <div className="container max-w-4xl mx-auto px-4 py-6">
                  <AnnouncementSection />
                  <AssessmentSection />

                  <motion.footer
                    className="mt-16 mb-8 text-center text-gray-500 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <p>© 2025 EduQuest - Sistema de Avaliações Online</p>
                    <p className="mt-1">Desenvolvido para proporcionar a melhor experiência educacional</p>
                  </motion.footer>
                </div>
              </motion.div>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default Exam;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'exam';

  try {
    cookieManager.updateToken(req);

    return { props: { selectedPage, pageTitle: 'Avalições' } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
