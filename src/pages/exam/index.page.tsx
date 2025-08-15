import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Avatar, Box, Button, Flex, Text, Tooltip } from '@chakra-ui/react';
import { Progress } from 'antd';
import { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { PiShootingStar } from 'react-icons/pi';
import { useAsyncCallback, useCustomRouter } from '@/_base/hooks';
import { IHubFactoryProject } from '@/_base/interfaces/project/IHubFactoryProject';
import { IHubUser } from '@/_base/interfaces/user';
import { getStudent } from '@/_base/services/user';
import { cookieManager, formatCoin, formatShortName, logError } from '@/_base/utils';
import { CoinIcon } from '@/components/Logo';
import { HiOutlineShieldCheck } from 'react-icons/hi';
import { RatingQuestionProps } from '@/components/Tailwind/HubForm/components/RatingQuestion';

type TempProject = { project: IHubFactoryProject; students: Array<{ name: string; id: string }> };
type TempStudent = IHubUser & { project: IHubFactoryProject };
type TempFinishedForms = { student_id: string; project_id: string; questions: (Omit<RatingQuestionProps, 'onRatingChange'> & { type: 'rating' })[] };

const Exam: React.FC = () => {
  const [projects, setProjects] = useState<TempProject[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<TempStudent | null>(null);
  const [finishedForms, setFinishedForms] = useState<TempFinishedForms[]>([]);

  const router = useCustomRouter();

  const studentProgress = useMemo(() => {
    return Math.ceil(
      ((finishedForms.find((e) => e.student_id === selectedStudent?.id)?.questions.reduce((acc, v) => (acc += v.rating || 0), 0) || 0) /
        ((finishedForms.find((e) => e.student_id === selectedStudent?.id)?.questions?.length || 0) * 5 || 0)) *
        100 || 0,
    );
  }, [finishedForms, selectedStudent]);

  useEffect(() => {
    const finished = JSON.parse(localStorage.getItem(`finished_forms`) || `[]`);
    const _projects: TempProject[] = Object.keys(localStorage)
      .filter((k) => k.startsWith(`pending_forms::`))
      .map((k) => JSON.parse(localStorage.getItem(k) || `{}`));

    setFinishedForms(finished);
    setProjects(_projects);

    if (_projects.length && _projects[0].students[0]) handleSelectStudent(_projects[0].students[0].id, _projects[0].project);
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

          <Flex h="fit-content" direction="column" justify="end" hidden={!selectedStudent}>
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
            <Flex align="center" justify="space-between" gap="0.5rem" fontWeight="400" color="gray400" hidden={!selectedStudent}>
              <CoinIcon />
              <Text fontSize="1rem">{formatCoin(selectedStudent?.metadata.coins)}</Text>
            </Flex>

            {finishedForms.find((e) => e.project_id === selectedStudent?.project.id && e.student_id === selectedStudent?.id) ? (
              <Flex color="primary300" align="center" gap="0.5rem" hidden={!selectedStudent}>
                <Text color="gray400">Aluno já avaliado</Text>
                <HiOutlineShieldCheck fontSize="22px" />
              </Flex>
            ) : (
              <Button
                gap="0.5rem"
                onClick={() => router.push(`/exam/${selectedStudent?.project.id}?p=${selectedStudent?.project.title}&s=${selectedStudent?.id}`)}
                hidden={!selectedStudent}
              >
                <Text>Avaliar</Text>
                <PiShootingStar fontSize="22px" />
              </Button>
            )}
          </Flex>
        </Flex>
        <Flex border="1px" borderColor="gray300" w="150px" h="100%" bg="white" borderRadius="8px" justify="center" align="center">
          <Progress
            type="circle"
            percent={studentProgress}
            format={() => (
              <Flex direction="column" gap="0.1rem">
                <Text color="text">
                  {`${!studentProgress ? 0 : studentProgress === 100 ? 10 : (studentProgress / 10).toFixed(1)}`.replace(`.`, `,`)}
                </Text>
                <Text fontSize="13px" color="gray500">
                  Média
                </Text>
              </Flex>
            )}
          />
        </Flex>
      </Flex>
      <Flex flex="1" border="1px" borderColor="gray300" bg="white" borderRadius="8px" overflow="hidden auto" maxH="calc(100vh - 19.5rem)">
        {projects.map(({ project, students }) => (
          <Accordion key={project.id} allowMultiple w="100%" fontWeight="500" color="gray700" defaultIndex={projects.length === 1 ? 0 : undefined}>
            <AccordionItem>
              <h2>
                <AccordionButton justifyContent="space-between">
                  <Box fontSize={{ base: `15px`, xl: '16px' }}>{project.title}</Box>
                  <AccordionIcon />
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
                      {finishedForms.find((e) => e.project_id === project.id && e.student_id === id) ? (
                        <Flex color="primary300" align="center" gap="0.5rem">
                          <Text color="gray400">Aluno já avaliado</Text>
                          <HiOutlineShieldCheck fontSize="22px" />
                        </Flex>
                      ) : (
                        <Tooltip label="Avaliar" placement="left">
                          <Button p="0" onClick={() => router.push(`/exam/${project.id}?p=${project.title}&s=${id}`)}>
                            <PiShootingStar fontSize="24px" />
                          </Button>
                        </Tooltip>
                      )}
                    </Flex>
                  </Flex>
                ))}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        ))}
      </Flex>
    </Flex>
  );
};

export default Exam;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'exam';

  try {
    cookieManager.updateToken(req);

    return { props: { selectedPage, pageTitle: 'Avaliações' } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
