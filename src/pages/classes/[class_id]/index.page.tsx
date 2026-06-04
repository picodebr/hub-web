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
  Badge,
  Icon,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { FaGraduationCap, FaPlus } from 'react-icons/fa6';
import { FiCalendar, FiFileText } from 'react-icons/fi';
import { CiUser } from 'react-icons/ci';
import moment from 'moment';
import { motion } from 'framer-motion';

import { generateProjectWithAI, generateProjectToolsWithAI } from '@/_base/classes/gpt';
import { formatCoin, formatShortName, statusLabelMapper } from '@/_base/utils';
import { getClassData } from '@/_base/services/class';
import { TabSwitch } from '@/components/TabSwitch';
import { ClassPageView, classPageViews } from './interfaces';
import { HubTable } from '@/components/Table';
import { useAsyncCallback, useAuth, useCustomRouter, useCustomToast } from '@/_base/hooks';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
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
import { AttendanceList } from './components/AttendanceList';
import { Exam } from './components/Exam';
import { ClassLoading } from './components/ClassLoading';
import { InternalPageHeader } from '@/components/InternalPageHeader';
import { PageLoading } from '@/components/PageLoading';

export type StudentTableType = { id: string; avatar: ReactNode; name: ReactNode; groups: ReactNode; coins: ReactNode };
const StudentTable = HubTable<StudentTableType>;

type ProjectTableType = { id: string; user_avatar: ReactNode; name: ReactNode; status: ReactNode; thumbnail?: string; created_at: ReactNode };
const ProjectTable = HubTable<ProjectTableType>;

interface IProps {
  classId: string;
  pageTitle: string;
}

type ModalStep = 'creation_type' | 'creation_topic' | 'man_project_name' | 'man_task_quantity' | 'man_task_naming' | 'edit_draft';

// Variáveis de animação
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const Class: React.FC<IProps> = ({ classId, pageTitle }) => {
  const { colorMode } = useDarkMode();
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

  const sortedProjects = projects?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Mapeamento de Cores para Status (Chakra Nativo)
  const getStatusColorScheme = (status: string) => {
    if (status === 'running') return 'green';
    if (status === 'stopped') return 'red';
    return 'blue';
  };

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
                  color="primary500"
                  bg={colorMode === 'light' ? 'white' : 'gray800'}
                  borderRadius="full"
                  border="2px solid"
                  borderColor="gray200"
                  h="36px"
                  w="36px"
                  justify="center"
                  align="center"
                  boxShadow="sm"
                >
                  <Image src="/logo/pi-logo-dark.svg" maxH="1.25rem" minH="1.25rem" title="Projeto da PiCode" />
                </Flex>
                <Flex
                  position="absolute"
                  right="-4px"
                  bottom="-4px"
                  bg="white"
                  color="primary500"
                  border="1px solid"
                  borderColor="gray200"
                  borderRadius="full"
                  p="0.2rem"
                  cursor="pointer"
                  transition="0.2s"
                  _hover={{ bg: 'primary500', color: 'white', transform: 'scale(1.1)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFactoryProjectToStart(project);
                  }}
                >
                  <FaPlus size="10px" />
                </Flex>
              </>
            ) : (
              <Avatar
                name={formatShortName(project.educator.name || ``)}
                src={project.educator.avatar || ``}
                title={project.educator.name}
                size="sm"
                border="2px solid"
                borderColor="white"
                boxShadow="sm"
              />
            )}
          </Flex>
        ) as any,
        name: (
          <Flex align="center" gap="1rem">
            <Text color={colorMode === 'dark' ? 'white' : 'gray800'} fontWeight="600" noOfLines={2}>
              {project.title}
            </Text>
          </Flex>
        ),
        status: (
          <Menu>
            <MenuButton as={Button} size="sm" variant="ghost" onClick={(e) => e.stopPropagation()} disabled={project.user_id !== user.id} px="2">
              <Badge colorScheme={getStatusColorScheme(project.status || 'stopped')} borderRadius="full" px="3" py="1" textTransform="capitalize">
                {statusLabelMapper[project.status || 'stopped']}
              </Badge>
            </MenuButton>
            <MenuList zIndex={10} borderColor={colorMode === 'dark' ? 'gray700' : 'gray200'}>
              {hubStatuses.map((status) => (
                <MenuItem
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateProjectStatus(project.id, status);
                  }}
                >
                  <Badge colorScheme={getStatusColorScheme(status)} borderRadius="full" px="3" py="1" textTransform="capitalize">
                    {statusLabelMapper[status]}
                  </Badge>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        ),
        created_at: (
          <Flex gap="0.5rem" align="center" color="gray500">
            <FiCalendar />
            <Text fontWeight="500" fontSize="14px">
              {moment(project.created_at).format('DD/MM/YYYY')}
            </Text>
          </Flex>
        ),
      })) || [],
    [projects, colorMode, user.id, handleUpdateProjectStatus],
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
    const newTools = await generateProjectToolsWithAI({ tools: oldTools, previousResponse: JSON.stringify(resultIA.response.content) });
    const iaSteps = resultIA.response.content.steps;
    setNewProjectSteps(
      iaSteps.map((step) => ({ title: step.title || '', description: step.description || null, position: step.position, parent: `default` })),
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
      metadata: { steps: iaSteps, bncc: resultIA.response.content.bnccTags, tools: resultIA.response.content.materials },
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
      metadata: { steps: newProject?.metadata.steps, bncc: newProject?.metadata.bncc },
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
    setModalStep('edit_draft');
  }, []);

  const students: StudentTableType[] =
    hubClass?.students.map((student) => ({
      id: student.id,
      name: (
        <Flex direction="column" minW="0">
          <Text fontWeight="600" color={colorMode === 'dark' ? 'white' : 'gray800'} isTruncated>
            {student.name}
          </Text>
          <Text fontSize="13px" color="gray500" isTruncated>
            @{student.username}
          </Text>
        </Flex>
      ),
      avatar: (<Avatar name={formatShortName(student.name, true)} title={student.name} src={student.avatar || ``} size="sm" />) as any,
      groups: (
        <Flex align="center" gap="0.5rem" wrap="wrap">
          {student.groups.length > 0 ? (
            student.groups.map((group) => (
              <Badge key={group.id} colorScheme="purple" variant="subtle" borderRadius="md" px="2" py="0.5" textTransform="none">
                {group.display_name}
              </Badge>
            ))
          ) : (
            <Text color="gray400" fontSize="13px" fontStyle="italic">
              -
            </Text>
          )}
        </Flex>
      ),
      coins: (
        <Flex
          align="center"
          gap="0.35rem"
          bg="warning50"
          w="10rem"
          px="0.75rem"
          py="0.15rem"
          borderRadius="full"
          border="1px solid"
          borderColor="warning200"
          justify="space-between"
        >
          <Text fontSize="14px" fontWeight="700" color="warning700">
            {formatCoin(student.metadata.coins || 0)}
          </Text>
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

  const bgCard = colorMode === 'light' ? 'white' : 'gray800';
  const borderColor = colorMode === 'light' ? 'gray200' : 'gray700';

  const PageView: Record<ClassPageView, ReactNode> = {
    'Lista de Presença': <AttendanceList hub_class={hubClass} />,
    Alunos: (
      <Box borderRadius="xl" boxShadow="sm" pb="2rem" bg="transparent">
        <StudentTable
          rows={students}
          onRowClick={(e) => router.push(`/students/${e.id}`)}
          columnSizes={[
            { field: 'avatar', width: '3rem' },
            { field: 'coins', width: '8rem' },
          ]}
          columns={[
            {
              label: (
                <Tooltip label="Aluno">
                  <Flex justify="center">
                    <Icon as={CiUser} fontSize="1.2rem" />
                  </Flex>
                </Tooltip>
              ),
              field: 'avatar',
            },
            { label: 'Nome do Aluno', field: 'name' },
            { label: 'Grupos', field: 'groups' },
            { label: 'Saldo (Moedas)', field: 'coins' },
          ]}
        />
      </Box>
    ),
    Projetos: (
      <Box flex="1" px="2px" pb="2rem">
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <Grid gap="1.5rem" gridTemplateColumns="repeat(auto-fill, minmax(260px, 1fr))">
            {dataProjects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <Flex
                  direction="column"
                  h="100%"
                  w="100%"
                  cursor="pointer"
                  bg={bgCard}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="2xl"
                  boxShadow="sm"
                  transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{ transform: 'translateY(-6px)', boxShadow: 'xl', borderColor: 'primary300' }}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  overflow="hidden"
                >
                  {/* Thumbnail Area - CORREÇÃO: url() aplicada ao background-image */}
                  <Flex
                    backgroundImage={`url(${project.thumbnail || '/images/book.svg'})`}
                    backgroundSize="cover"
                    backgroundPosition={project.thumbnail ? 'bottom' : 'center'}
                    backgroundRepeat="no-repeat"
                    h="160px"
                    w="100%"
                    // bg={colorMode === 'light' ? 'gray50' : 'gray900'}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    position="relative"
                  >
                    <Box position="absolute" top="10px" right="10px" onClick={(e) => e.stopPropagation()}>
                      {project.status}
                    </Box>
                  </Flex>

                  {/* Content Area */}
                  <Flex direction="column" p="1.25rem" gap="1rem" flex="1" justify="space-between">
                    {project.name}
                    <Flex justify="space-between" align="center" pt="0.5rem" borderTop="1px solid" borderColor={borderColor}>
                      {project.created_at}
                      <Flex>{project.user_avatar}</Flex>
                    </Flex>
                  </Flex>
                </Flex>
              </motion.div>
            ))}
          </Grid>
        </motion.div>
      </Box>
    ),
    Avaliações: <Exam hub_class={hubClass} />,
  };

  return (
    <Flex direction="column" gap="1.5rem" h="100%">
      <PageLoading
        content={
          <Text fontSize="15px" textAlign="center" maxW="350px">
            Aguarde enquanto os dados da turma{' '}
            <Text as="span" fontWeight="700" color="primary500">
              {hubClass?.display_name}
            </Text>{' '}
            são carregados.
          </Text>
        }
        isLoading={isLoading}
        CustomIcon={FaGraduationCap}
      />
      {/* HEADER DE ABAS E BOTÃO PRINCIPAL */}
      <InternalPageHeader
        title={hubClass?.display_name || ``}
        description={`${hubClass?.students?.length || `0`} ${hubClass?.students?.length === 1 ? 'aluno' : 'alunos'} • ${hubClass?.projects?.length || `0`} ${hubClass?.projects?.length === 1 ? 'projeto' : 'projetos'} #${hubClass?.code || ''}`}
        buttons={
          pageView === 'Projetos' ? [{ label: `Novo Projeto`, leftIcon: <FaPlus />, onClick: () => setNewProject(EMPTY_PROJECT_DATA) }] : undefined
        }
      />

      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="1rem">
        <TabSwitch
          tabs={classPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
          onSwitch={(view) => setPageView(view as any)}
        />
      </Flex>

      {/* CONTEÚDO PRINCIPAL (RENDERIZAÇÃO CONDICIONAL) */}
      {PageView[pageView]}

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
        <Text color="gray500" fontSize="15px">
          Antes de começarmos, você tem a opção de escolher como deseja criar o projeto. Selecione uma das opções abaixo:
        </Text>
      </SmallModal>

      <SmallModal
        title="Selecione o tópico do projeto"
        show={!!newProject && modalStep === 'creation_topic'}
        onConfirm={() => handleCreateProjectWithIA(`${newProject?.topic}`)}
        onCancel={() => setModalStep('creation_type')}
        onCloseModal={handleCloseModal}
        okText={isLoadingIa ? 'Criando...' : 'Criar com IA'}
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
        title="Revise os dados gerados pela IA"
        show={!!newProject && modalStep === 'edit_draft'}
        onConfirm={() => saveDraftProject()}
        onCancel={() => setModalStep('creation_type')}
        onCloseModal={handleCloseModal}
        okText="Salvar e criar projeto"
        disableOkButton={isLoadingIa}
        cancelText="Cancelar"
        topIcon="ray"
        size="2xl"
      >
        <Flex direction="column" gap="1rem" maxH="60vh" overflowY="auto" pr="2">
          <Button w="fit-content" size="sm" leftIcon={<TbReload />} onClick={() => setModalStep('creation_topic')}>
            Gerar novamente
          </Button>
          <Flex direction="column" gap="1">
            <Text color="gray500" fontSize="14px" fontWeight="600">
              Título do Projeto
            </Text>
            <TextInput value={newProject?.title || ''} onInputChange={(title) => setNewProject((e) => ({ ...(e || ({} as any)), title }))} />
          </Flex>
          <Flex direction="column" gap="1">
            <Text color="gray500" fontSize="14px" fontWeight="600">
              Descrição
            </Text>
            <TextAreaInput
              value={newProject?.description || ''}
              onInputChange={(description) => setNewProject((e) => ({ ...(e || ({} as any)), description }))}
            />
          </Flex>
          <Flex direction="column" gap="1">
            <Text color="gray500" fontSize="14px" fontWeight="600">
              Materiais
            </Text>
            <TextInput value={newProject?.metadata.tools?.join(', ') || ''} />
          </Flex>
          <Flex direction="column" gap="3" mt="2">
            <Text color="gray500" fontSize="14px" fontWeight="600">
              Etapas do Projeto
            </Text>
            {newProjectSteps.map((step) => (
              <Flex
                direction="column"
                key={step.position}
                gap="2"
                p="3"
                bg={colorMode === 'light' ? 'gray50' : 'whiteAlpha.50'}
                borderRadius="md"
                border="1px solid"
                borderColor={borderColor}
              >
                <TextInput
                  label={`Etapa ${step.position}`}
                  value={step.title}
                  onInputChange={(title) => setNewProjectSteps((e) => e.map((s) => (s.position === step.position ? { ...s, title } : s)))}
                />
                <Textarea
                  value={step.description || ''}
                  onChange={(event) =>
                    setNewProjectSteps((prevSteps) =>
                      prevSteps.map((s) => (s.position === step.position ? { ...s, description: event.target.value } : s)),
                    )
                  }
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </Flex>
            ))}
          </Flex>
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
            Forneça um nome e uma descrição para o seu projeto e, em seguida, você poderá adicionar detalhes.
          </Text>
          <TextInput
            placeholder="Nome do Projeto"
            value={newProject?.title || ''}
            onInputChange={(title) => setNewProject((e) => ({ ...(e || ({} as any)), title }))}
          />
          <TextAreaInput
            placeholder="Descreva a ideia..."
            value={newProject?.description || ''}
            onInputChange={(description) => setNewProject((e) => ({ ...(e || ({} as any)), description }))}
          />
        </Flex>
      </SmallModal>

      <SmallModal
        title="Configuração das etapas"
        show={!!newProject && modalStep === 'man_task_quantity'}
        onCancel={handleCloseModal}
        onCloseModal={handleCloseModal}
        onConfirm={() => setModalStep('man_task_naming')}
        okText="Prosseguir"
        topIcon="ray"
      >
        <Flex direction="column" gap="1rem">
          <Text color="gray500" fontSize="15px">
            Quantas etapas comporão o seu projeto?
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
        title="Nomes das etapas"
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
            Informe os nomes das etapas do seu projeto.
          </Text>
          <Flex direction="column" gap="0.5rem">
            {newProjectSteps.map((step) => (
              <TextInput
                key={step.position}
                label={`Etapa ${step.position}`}
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
        <Text color="gray600" fontSize="15px">
          Você está prestes a iniciar o projeto <b>{factoryProjectToStart?.title}</b>. Mantenha a consistência com sua turma.
        </Text>
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
