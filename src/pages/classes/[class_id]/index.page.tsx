import {
  Avatar,
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Tooltip,
  Flex,
  Text,
  Skeleton,
  Image,
  Textarea,
  Button,
  Grid,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { IoMdArrowUp } from 'react-icons/io';
import { FaPlus } from 'react-icons/fa6';
import { FiCalendar, FiFileText } from 'react-icons/fi';
import { CiUser } from 'react-icons/ci';
import { Badge } from 'rsuite';
import moment from 'moment';

import { generateProjectWithAI, generateProjectToolsWithAI } from '@/_base/classes/gpt';
import { formatCoin, formatShortName, statusLabelMapper } from '@/_base/utils';
import { getClassData } from '@/_base/services/class';
import { TabSwitch } from '@/components/TabSwitch';
import { ClassPageView, classPageViews } from './interfaces';
import { HubTable } from '@/components/Table';
import { useAsyncCallback, useAuth, useCustomRouter, useCustomToast } from '@/_base/hooks';
import { IHubClass } from '@/_base/interfaces/class';
import { IHubUser } from '@/_base/interfaces/user';
import { EMPTY_PROJECT_DATA, IHubProjectStep, IProject } from '@/_base/interfaces/project';
import { SmallModal } from '@/components/Modal/Small';
import { TextInput } from '@/components/Inputs/Text';
import { addProject, updateProject } from '@/_base/services/project';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { HubStatus, hubStatuses } from '@/_base/interfaces/shared';
import { TbReload } from 'react-icons/tb';
import { CoinIcon } from '@/components/Logo';

type StudentTableType = { id: string; avatar: ReactNode; name: ReactNode; groups: ReactNode; coins: ReactNode };
const StudentTable = HubTable<StudentTableType>;

type ProjectTableType = { id: string; user_avatar: ReactNode; name: ReactNode; status: ReactNode; thumbnail?: string; created_at: ReactNode };
const ProjectTable = HubTable<ProjectTableType>;

interface IProps {
  classId: string;
}

type ModalStep = 'creation_type' | 'creation_topic' | 'man_project_name' | 'man_task_quantity' | 'man_task_naming' | 'edit_draft';

const Class: React.FC<IProps> = ({ classId }) => {
  const [pageView, setPageView] = useState<ClassPageView>('Projetos');
  const [newProject, setNewProject] = useState<IProject | null>(null);
  const [modalStep, setModalStep] = useState<ModalStep>('creation_type');
  const [newProjectSteps, setNewProjectSteps] = useState<IHubProjectStep[]>([]);
  const [projects, setProjects] = useState<IProject[]>();
  const [factoryProjectToStart, setFactoryProjectToStart] = useState<IProject | null>(null);
  const [hubClass, setHubClass] = useState<IHubClass | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingIa, setIsLoadingIa] = useState(false);

  const router = useCustomRouter();
  const toast = useCustomToast();
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const hubClassData = await getClassData(classId);
        setHubClass(hubClassData);
        setProjects(hubClassData.projects);
      } catch {
        toast({ status: `error`, description: `Não foi possível exibir detalhes da turma` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleUpdateProjectStatus = useAsyncCallback(async (id: string, status: HubStatus) => {
    const updated = await updateProject({ id, status });
    setProjects((e) => e?.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    setFactoryProjectToStart(null);
  }, []);

  const sortedProjects = projects?.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const dataProjects = useMemo<ProjectTableType[]>(
    () =>
      sortedProjects?.map((project) => ({
        id: project.id,
        thumbnail: project.project?.metadata?.thumbnail,
        user_avatar: (
          <Flex position="relative">
            {!project.educator.id && project.project_id ? (
              <>
                <Flex
                  color="primary300"
                  bg="#ffffff55"
                  borderRadius="50%"
                  border="1px"
                  borderColor="gray200"
                  h="30px"
                  w="30px"
                  justify="center"
                  align="center"
                >
                  <Image src="/logo/pi-logo-dark.svg" maxH="1.65rem" minH="1.65rem" title="Projeto da PiCode" />
                </Flex>
                <Flex
                  position="absolute"
                  color="primary300"
                  right="-5px"
                  bottom="-5px"
                  border="1px"
                  bg="white"
                  borderRadius="4px"
                  p="0.15rem"
                  transition="0.1s"
                  _hover={{ borderColor: 'primary300', bg: 'primary300', color: 'white' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFactoryProjectToStart(project);
                  }}
                >
                  <FaPlus />
                </Flex>
              </>
            ) : (
              <Avatar
                name={formatShortName(project.educator.name || ``)}
                src={project.educator.avatar || ``}
                title={project.educator.name}
                h="30px"
                w="30px"
                border="1px"
                borderColor="gray200 !important"
              />
            )}
          </Flex>
        ) as any,
        name: (
          <Flex align="center" gap="1rem">
            {!!project.project_id && <Image src="/logo/pi-logo-dark.svg" maxH="1.5rem" minH="1.5rem" title="Projeto da PiCode" />}
            <Text color="gray800" fontWeight={project.project_id ? `500` : `400`}>
              {project.title}
            </Text>
          </Flex>
        ),
        status: (
          <Menu>
            <MenuButton
              onClick={(e) => e.stopPropagation()}
              p="0.35rem 1rem"
              display="flex"
              alignItems="center"
              justifyContent="center"
              disabled={project.user_id !== user.id}
            >
              <Badge
                style={{ padding: `0.25rem 0.5rem`, whiteSpace: `nowrap` }}
                color={project.status === 'running' ? 'green' : project.status === 'stopped' ? 'red' : 'blue'}
                content={statusLabelMapper[project.status || 'stopped']}
              />
            </MenuButton>
            <MenuList borderColor="gray300" >
              {hubStatuses.map((status) => (
                <MenuItem
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateProjectStatus(project.id, status);
                  }}
                >
                  <Badge
                    style={{ padding: `0.25rem 0.5rem` }}
                    color={status === 'running' ? 'green' : status === 'stopped' ? 'red' : 'blue'}
                    content={statusLabelMapper[status || 'stopped']}
                  />
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        ),
        created_at: (
          <Flex gap="8px" align="center">
            <FiCalendar color="gray800" />
            <Text color="gray800" fontWeight="500">
              {moment(project.created_at).format('DD/MM/YYYY')}
            </Text>
          </Flex>
        ),
      })) || [],
    [projects],
  );

  const handleCreateProject = useAsyncCallback(async () => {
    if (!newProject) return;

    const project = await addProject({
      title: newProject.title,
      class_id: hubClass?.id || ``,
      description: newProject.description,
      metadata: { steps: newProjectSteps },
    });
    project.educator = user;
    setProjects((e) => [project, ...(e || [])]);

    setModalStep('creation_type');
    setNewProjectSteps([]);
    setNewProject(null);
  }, []);

  const getIAResponse = async (y: string) => {
    const argToObject = { grade: classId, topic: y };
    const resultIA = await generateProjectWithAI(argToObject);
    const oldTools = resultIA.response.content.materials.slice(0, 2);
    const newTools = await generateProjectToolsWithAI({
      tools: oldTools,
      previousResponse: JSON.stringify(resultIA.response.content),
    });
    // eslint-disable-next-line no-console
    console.log(oldTools);
    // eslint-disable-next-line no-console
    console.log(newTools);
    const iaSteps = resultIA.response.content.steps;
    setNewProjectSteps(
      iaSteps.map((step) => ({
        title: step.title || '',
        description: step.description || null,
        position: step.position,
        parent: `default`,
      })),
    );
    const draftProject: IProject = {
      id: '',
      project_id: 'default_project_id',
      user_id: 'user_id_example',
      status: 'running' as HubStatus,
      created_at: new Date(),
      updated_at: new Date(),
      title: resultIA.response.content.title,
      class_id: classId,
      description: resultIA.response.content.objective,
      metadata: {
        steps: iaSteps,
        bncc: resultIA.response.content.bnccTags,
        tools: resultIA.response.content.materials,
      },
      groups: [],
      annotations: [],
      educator: {} as IHubUser,
      hub_class: {} as IHubClass,
    };

    return draftProject;
  };

  const saveDraftProject = useAsyncCallback(async () => {
    const classId = hubClass?.id ?? '';

    const response = await addProject({
      title: newProject?.title ?? '',
      class_id: classId,
      description: newProject?.description,
      metadata: {
        steps: newProject?.metadata.steps,
        bncc: newProject?.metadata.bncc,
      },
    });

    if (response) {
      const hubClassData = await getClassData(classId);
      setHubClass(hubClassData);
      setProjects(hubClassData.projects);
      setNewProject(null);
      setIsLoadingIa(false);
    }
  }, []);

  const handleCreateProjectWithIA = useAsyncCallback(async (y: string) => {
    setIsLoadingIa(true);
    const resultIA = await getIAResponse(y);

    setNewProject(null);
    setNewProject(resultIA);
    setIsLoadingIa(false);
    ////TODO
    setModalStep('edit_draft');
  }, []);

  const students: StudentTableType[] =
    hubClass?.students.map((student) => ({
      id: student.id,
      name: (
        <Flex direction="column">
          <Text color="gray800">{student.name}</Text>
          <Text color="gray500">@{student.username}</Text>
        </Flex>
      ),
      avatar: (<Avatar name={formatShortName(student.name, true)} title={student.name} h="40px" w="40px" />) as any,
      groups: (
        <Flex align="center" gap="0.25rem">
          <Text noOfLines={1}>{student.groups.map((group) => group.display_name).join(', ')}</Text>
        </Flex>
      ),
      coins: (
        <Flex align="center" gap="0.25rem">
          <Text fontSize="1rem">{formatCoin(student.metadata.coins)}</Text>
          <Box>
            <CoinIcon />
          </Box>
        </Flex>
      ),
    })) || [];

  const handleCloseModal = () => {
    setNewProject(null);
    setModalStep('creation_type');
  };
  return (
    <Flex direction="column" w="100%" h="100%" gap="2rem" overflow="hidden">
      <Flex justify="space-between">
        <TabSwitch
          tabs={classPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
          onSwitch={(view) => setPageView(view as any)}
        />
        {pageView === 'Projetos' && (
          <Flex
            color="gray800"
            minH="52px"
            maxH="52px"
            border="1px"
            borderColor="gray300"
            align="center"
            px="1rem"
            bg="white"
            w="fit-content"
            borderRadius="lg"
            
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
          columnSizes={[
            { field: 'avatar', width: '2rem' },
            { field: 'coins', width: '2rem' },
          ]}
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
            { label: 'Grupos', field: 'groups' },
            { label: 'Moedas', field: 'coins' },
          ]}
        />
      ) : pageView === 'Projetos' ? (
        <Grid gap="1rem" overflow="auto" gridTemplateColumns="repeat(auto-fill, minmax(210px, 1fr))" padding="2rem" borderRadius="md" flex="1">
          {dataProjects.map((project) => (
            <Flex
              key={project.id}
              direction="column"
              h="100%"
              maxH="340px"
              w="210px"
              gap="0.5rem"
              cursor="pointer"
              bg="white"
              border="1px"
              borderColor="gray300"
              borderRadius="md"
              p="1rem"
              
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <Flex
                backgroundImage={project.thumbnail || '/images/book.svg'}
                backgroundSize={project.thumbnail ? `cover` : `contain`}
                backgroundPosition="center"
                backgroundRepeat="no-repeat"
                h="250px"
                borderRadius="4px"
              />
              <Flex justify="space-between">
                <Text fontWeight="500" p="0.25rem 0.35rem" textOverflow="ellipsis" whiteSpace="wrap" overflow="hidden" color="gray600">
                  {project.name}
                </Text>
                <Flex>{project?.user_avatar}</Flex>
              </Flex>
            </Flex>
          ))}
        </Grid>
      ) : (
        <ProjectTable
          rows={dataProjects}
          onRowClick={(e) => router.push(`/projects/${e.id}`)}
          columnSizes={[{ field: 'name', width: '100%' }]}
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

      {isLoading && <Skeleton isLoaded={false} h="4.5rem" w="100%" />}

      <SmallModal
        title="Método de criação do projeto"
        show={!!newProject && modalStep === 'creation_type'}
        onConfirm={() => setModalStep('creation_topic')}
        onCancel={() => setModalStep('man_project_name')}
        onCloseModal={handleCloseModal}
        okText="Inteligência Artificial"
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
        title="Selecione o tópico do projeto"
        show={!!newProject && modalStep === 'creation_topic'}
        onConfirm={() => handleCreateProjectWithIA(`${newProject?.topic}`)}
        onCancel={() => setModalStep('creation_type')}
        onCloseModal={handleCloseModal}
        okText={isLoadingIa ? 'Criando Projeto...' : 'Criar com IA'}
        disableOkButton={isLoadingIa}
        cancelText="Cancelar"
        topIcon="ray"
      >
        <Flex direction="column" gap="1rem">
          <Text color="gray500" fontSize="15px">
            Escreva o tópico do seu projeto
          </Text>
          <TextInput
            placeholder="(Ex: Biologia, Ecossistema)"
            leftElement={<FiFileText />}
            value={newProject?.topic || ''}
            onInputChange={(topic) => setNewProject((e) => ({ ...(e || ({} as any)), topic }))}
          />
        </Flex>
      </SmallModal>

      <SmallModal
        title="Revise os dados gerados pela Inteligencia Artificial"
        show={!!newProject && modalStep === 'edit_draft'}
        onConfirm={() => saveDraftProject()}
        onCancel={() => setModalStep('creation_type')}
        onCloseModal={handleCloseModal}
        okText="Salvar edição e criar projeto"
        disableOkButton={isLoadingIa}
        cancelText="Cancelar"
        topIcon="ray"
        size="2xl"
      >
        <Flex direction="column" gap="1rem">
          <Flex>
            <Button gap="1rem" onClick={() => setModalStep('creation_topic')}>
              <TbReload />
              Gerar novamente
            </Button>
          </Flex>
          <Flex>
            <Text color="gray500" fontSize="15px">
              Título do Projeto
            </Text>
            <TextInput
              placeholder={newProject?.title || ''}
              leftElement={<FiFileText />}
              value={newProject?.title || ''}
              onInputChange={(title) => setNewProject((e) => ({ ...(e || ({} as any)), title }))}
            />
          </Flex>
          <Flex>
            <Text color="gray500" fontSize="15px">
              Descrição do Projeto
            </Text>
            <TextAreaInput
              placeholder={newProject?.description || ''}
              leftElement={<FiFileText />}
              value={newProject?.description || ''}
              onInputChange={(description) => setNewProject((e) => ({ ...(e || ({} as any)), description }))}
            />
          </Flex>
          <Flex>
            <Text color="gray500" fontSize="15px">
              Materiais do projeto
            </Text>
            <TextInput
              placeholder={newProject?.metadata.tools?.join(', ') || ''}
              leftElement={<FiFileText />}
              value={newProject?.metadata.tools?.join(', ') || ''}
            />
          </Flex>
          <Flex direction="column" gap="1rem">
            <Text color="gray500" fontSize="15px">
              Etapas do Projeto
            </Text>
            {newProjectSteps.map((step) => (
              <Flex direction="column" key={step.position} gap="4px">
                <TextInput
                  label={`Etapa ${step.position}`}
                  placeholder="Nome da etapa"
                  p="0.35rem 0.65rem"
                  fontSize="15px"
                  value={step.title}
                  onInputChange={(title) => setNewProjectSteps((e) => e.map((s) => (s.position === step.position ? { ...s, title } : s)))}
                />
                <Textarea
                  placeholder="Descrição da etapa"
                  p="0.35rem 0.65rem"
                  fontSize="15px"
                  value={step.description || ''}
                  onChange={(event) =>
                    setNewProjectSteps((prevSteps) =>
                      prevSteps.map((s) => (s.position === step.position ? { ...s, description: event.target.value } : s)),
                    )
                  }
                  style={{
                    minHeight: '100px',
                    resize: 'vertical',
                    borderColor: 'lightgrey',
                  }}
                />
              </Flex>
            ))}
          </Flex>
          {/* <Flex>
            <Text color="gray500" fontSize="15px">
              BNCC
            </Text>
            {newProject?.metadata?.bncc?.map((bnccItem, index) => (
              <Flex key={`bncc-${index}`} direction="column" gap="1rem">
                <TextInput
                  key={`bncc-item-${index}`}
                  label={`BNCC ${index + 1}`}
                  placeholder="Código BNCC"
                  p="0.35rem 0.65rem"
                  fontSize="15px"
                  value={bnccItem}
                  //onInputChange={'jj'}
                />
              </Flex>
            ))}
          </Flex> */}
        </Flex>
      </SmallModal>

      <SmallModal
        title="Criação manual do projeto"
        show={!!newProject && modalStep === 'man_project_name'}
        onCancel={handleCloseModal}
        onCloseModal={handleCloseModal}
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
        onCancel={handleCloseModal}
        onCloseModal={handleCloseModal}
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
        onCancel={handleCloseModal}
        onCloseModal={handleCloseModal}
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

      <SmallModal
        title="Iniciar projeto PiCode"
        show={!!factoryProjectToStart}
        onCancel={() => setFactoryProjectToStart(null)}
        onCloseModal={handleCloseModal}
        onConfirm={() => handleUpdateProjectStatus(factoryProjectToStart?.id || ``, `running`)}
        okText="Iniciar o projeto"
        topIcon="checked"
      >
        <Flex direction="column" gap="1rem">
          <Text color="gray500" fontSize="16px">
            Você está prestes a iniciar o projeto {factoryProjectToStart?.title}
          </Text>
          <Text color="gray500" fontSize="16px">
            É de sua resposabilidade realizar o projeto com a turma até o fim, mantendo a <b>consistência</b> e <b>boas práticas</b>.
          </Text>
        </Flex>
      </SmallModal>
    </Flex>
  );
};

export default Class;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const selectedPage = 'classes';

  const pageTitle = `${query._p || `Turma`}`;

  return { props: { selectedPage, pageTitle, classId: `${query.class_id}` } };
};
