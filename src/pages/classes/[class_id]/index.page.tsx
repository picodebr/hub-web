import {
  Avatar,
  Box,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Tooltip,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { ReactNode, useState } from 'react';
import { CiUser } from 'react-icons/ci';

import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager, formatShortName, statusLabelMapper } from '@/_base/utils';
import { Flex, Text } from '@chakra-ui/react';
import { getClassData } from '@/_base/services/class';

import { TabSwitch } from '@/components/TabSwitch';
import { ClassPageView, classPageViews } from './interfaces';
import { IoArrowUpCircleOutline } from 'react-icons/io5';
import { HubTable } from '@/components/Table';
import { useAsyncCallback, useAuth, useCustomRouter } from '@/_base/hooks';
import { Badge } from 'rsuite';
import moment from 'moment';
import { IoMdArrowUp } from 'react-icons/io';
import { FiCalendar, FiFileText } from 'react-icons/fi';
import { IHubClass } from '@/_base/interfaces/class';
import { EMPTY_PROJECT_DATA, IHubProjectStep, IProject } from '@/_base/interfaces/project';
import { SmallModal } from '@/components/Modal/Small';
import { TextInput } from '@/components/Inputs/Text';
import { addProject } from '@/_base/services/project';
import { TextAreaInput } from '@/components/Inputs/TextArea';

const makeRowTable = (data: IProject): ProjectTableType => ({
  id: data.id,
  user_avatar: (
    <Avatar name={formatShortName(data.educator.name)} src={data.educator.avatar || undefined} title={data.educator.name} h="40px" w="40px" />
  ) as any,
  name: (
    <Flex direction="column">
      <Text color="gray800">{data.title}</Text>
    </Flex>
  ),
  status: (
    <Badge
      color={data.status === 'running' ? 'green' : data.status === 'stopped' ? 'red' : 'blue'}
      content={statusLabelMapper[data.status || 'stopped']}
    />
  ),
  created_at: (
    <Flex gap="8px" align="center">
      <FiCalendar />
      <Text fontWeight="500">{moment(data.created_at).format('DD/MM/YYYY')}</Text>
    </Flex>
  ),
});

type StudentTableType = { id: string; avatar: ReactNode; name: ReactNode; engagement: ReactNode; xp: ReactNode };
const StudentTable = HubTable<StudentTableType>;

type ProjectTableType = { id: string; user_avatar: ReactNode; name: ReactNode; status: ReactNode; created_at: ReactNode };
const ProjectTable = HubTable<ProjectTableType>;

interface IProps {
  hubClass: IHubClass;
}

type ModalStep = 'creation_type' | 'man_project_name' | 'man_task_quantity' | 'man_task_naming';

const Class: React.FC<IProps> = ({ hubClass }) => {
  const [pageView, setPageView] = useState<ClassPageView>('Alunos');
  const [newProject, setNewProject] = useState<IProject | null>(null);
  const [modalStep, setModalStep] = useState<ModalStep>('creation_type');
  const [newProjectSteps, setNewProjectSteps] = useState<IHubProjectStep[]>([]);
  const [dataProjects, setDataProjects] = useState<ProjectTableType[]>(hubClass.projects.map((project) => makeRowTable(project)));

  const router = useCustomRouter();
  const { user } = useAuth();

  const handleCreateProject = useAsyncCallback(async () => {
    if (!newProject) return;

    const project = await addProject({
      title: newProject.title,
      class_id: hubClass.id,
      description: newProject.description,
      metadata: { steps: newProjectSteps },
    });
    project.educator = user;
    setDataProjects((e) => [makeRowTable(project), ...e]);

    setModalStep('creation_type');
    setNewProjectSteps([]);
    setNewProject(null);
  }, []);

  const students: StudentTableType[] = hubClass.students.map((student) => ({
    id: student.id,
    name: (
      <Flex direction="column">
        <Text color="gray800">{student.name}</Text>
        <Text color="gray500">@{student.username}</Text>
      </Flex>
    ),
    avatar: (<Avatar name={formatShortName(student.name, true)} title={student.name} h="40px" w="40px" />) as any,
    engagement: (
      <Flex align="center" gap="0.25rem">
        <Text fontWeight="500">0</Text>
        <Box borderRadius="50%" color="primary700" fontSize="1.75rem">
          <IoArrowUpCircleOutline />
        </Box>
      </Flex>
    ),
    xp: (
      <Flex align="center" gap="0.25rem">
        <Text fontWeight="500">0</Text>
        <Box borderRadius="50%" color="primary300" fontSize="1.75rem">
          <IoArrowUpCircleOutline />
        </Box>
      </Flex>
    ),
  }));

  return (
    <Flex direction="column" w="100%" h="100%" gap="2rem" overflow="hidden">
      <Flex justify="space-between">
        <TabSwitch
          tabs={classPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
          onSwitch={(view) => setPageView(view as any)}
        />
        {pageView === 'Projetos' && (
          <Flex
            minH="52px"
            maxH="52px"
            border="1px"
            borderColor="gray300"
            align="center"
            px="1rem"
            bg="white"
            w="fit-content"
            borderRadius="lg"
            boxShadow="sm"
            gap="0.65rem"
            cursor="pointer"
            transition="all 0.1s"
            _hover={{ bg: 'gray50' }}
            onClick={() => setNewProject(EMPTY_PROJECT_DATA)}
          >
            Adicionar projeto
          </Flex>
        )}
      </Flex>
      {pageView === 'Alunos' ? (
        <StudentTable
          rows={students}
          onRowClick={(e) => router.push(`/students/${e.id}`)}
          columnSizes={[{ field: 'avatar', width: '2rem' }]}
          columns={[
            {
              label: (
                <Tooltip label="Aluno">
                  <Flex justify="center" fontSize="1.25rem">
                    <CiUser />
                  </Flex>
                </Tooltip>
              ),
              field: 'avatar',
            },
            { label: 'Nome', field: 'name' },
            { label: 'Engajamento', field: 'engagement' },
            { label: 'XP', field: 'xp' },
          ]}
        />
      ) : (
        <ProjectTable
          rows={dataProjects}
          onRowClick={(e) => router.push(`/projects/${e.id}`)}
          columnSizes={[{ field: 'user_avatar', width: '2rem' }]}
          columns={[
            { label: 'Nome do projeto', field: 'name' },
            {
              label: (
                <Tooltip label="Status">
                  <Flex justify="center" gap="8px" align="center">
                    <Text color="gray600" fontSize="16px">
                      Status
                    </Text>
                    <IoMdArrowUp fontSize="14px" />
                  </Flex>
                </Tooltip>
              ),
              field: 'status',
            },
            {
              label: (
                <Tooltip label="Educador">
                  <Flex justify="center" gap="8px">
                    <Text color="gray600" fontSize="16px">
                      Educador
                    </Text>
                    <CiUser fontSize="17px" />
                  </Flex>
                </Tooltip>
              ),
              field: 'user_avatar',
            },
            { label: 'Data de criação', field: 'created_at' },
          ]}
        />
      )}
      <SmallModal
        title="Método de criação do projeto"
        show={!!newProject && modalStep === 'creation_type'}
        onConfirm={() => setNewProject(null)}
        onCancel={() => setModalStep('man_project_name')}
        okText="Inteligência Artificial"
        disableOkButton
        cancelText="Manual"
        topIcon="ray"
      >
        <Flex direction="column" gap="1rem">
          <Text color="gray500" fontSize="15px">
            Antes de começarmos, você tem a opção de escolher como deseja criar o projeto. Selecione uma das opções abaixo:
          </Text>
        </Flex>
      </SmallModal>
      <SmallModal
        title="Criação manual do projeto"
        show={!!newProject && modalStep === 'man_project_name'}
        onCancel={() => setNewProject(null)}
        onConfirm={() => setModalStep('man_task_quantity')}
        okText="Enviar"
        topIcon="warning"
        disableOkButton={!newProject?.title}
      >
        <Flex direction="column" gap="1rem">
          <Text color="gray500" fontSize="15px">
            Vamos começar a criar o projeto manualmente! Por favor, forneça um nome e uma descrição para o seu projeto e, em seguida, você poderá
            adicionar detalhes e elementos conforme desejar.
          </Text>
          <TextInput
            placeholder="Informe o nome"
            leftElement={<FiFileText />}
            value={newProject?.title || ''}
            onInputChange={(title) => setNewProject((e) => ({ ...(e || ({} as any)), title }))}
          />
          <TextAreaInput
            placeholder="Descreva a ideia do seu projeto"
            value={newProject?.description || ''}
            onInputChange={(description) => setNewProject((e) => ({ ...(e || ({} as any)), description }))}
          />
        </Flex>
      </SmallModal>
      <SmallModal
        title="Configuração das etapas do projeto"
        show={!!newProject && modalStep === 'man_task_quantity'}
        onCancel={() => setNewProject(null)}
        onConfirm={() => setModalStep('man_task_naming')}
        okText="Prosseguir"
        topIcon="ray"
      >
        <Flex direction="column" gap="1rem">
          <Text color="gray500" fontSize="15px">
            Antes de iniciar, precisamos saber quantas etapas comporão o seu projeto. Por favor, informe o número de etapas que você planeja incluir.
            Isso ajudará na organização e no acompanhamento do progresso.
          </Text>
          <NumberInput
            defaultValue={1}
            min={1}
            max={6}
            onChange={(_, length) => setNewProjectSteps(Array.from({ length }, (_, i) => ({ title: '', description: null, position: i + 1 })))}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Flex>
      </SmallModal>
      <SmallModal
        title="Nomes das etapas do projeto"
        show={!!newProject && modalStep === 'man_task_naming'}
        onCancel={() => setNewProject(null)}
        onConfirm={handleCreateProject}
        okText="Finalizar"
        topIcon="checked"
        disableOkButton={!!newProjectSteps.find((e) => !e.title)}
      >
        <Flex direction="column" gap="1rem">
          <Text color="gray500" fontSize="15px">
            Informe os nomes das etapas do seu projeto. Liste uma a uma para que possamos personalizar a jornada do seu projeto.
          </Text>
          <Flex direction="column" gap="0.5rem">
            {newProjectSteps.map((step) => (
              <TextInput
                key={step.position}
                label={`Etapa ${step.position}`}
                placeholder={`Nome da etapa`}
                p="0.35rem 0.65rem"
                fontSize="15px"
                value={step.title}
                onInputChange={(title) => setNewProjectSteps((e) => e.map((s) => (s.position === step.position ? { ...s, title } : s)))}
              />
            ))}
          </Flex>
        </Flex>
      </SmallModal>
    </Flex>
  );
};

export default Class;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const selectedPage = 'classes';

  try {
    cookieManager.updateToken(req);
    const hubClass = await getClassData(`${query.class_id}`);

    const user = await validateSession();

    return { props: { selectedPage, pageTitle: hubClass.display_name, user, hubClass } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
