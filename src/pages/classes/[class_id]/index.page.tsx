import { Avatar, Box, Tooltip } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { ReactNode, useState } from 'react';
import { CiUser } from 'react-icons/ci';

import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Flex, Text } from '@chakra-ui/react';
import { getClassData } from '@/_base/services/class';

import { TabSwitch } from '@/components/TabSwitch';
import { ClassPageView, classPageViews } from './interfaces';
import { IoArrowUpCircleOutline } from 'react-icons/io5';
import { HubTable } from '@/components/Table';
import { useCustomRouter } from '@/_base/hooks';
import { Badge, FlexboxGrid } from 'rsuite';
import moment from 'moment';
import { IoMdArrowUp } from 'react-icons/io';
import { FiCalendar } from 'react-icons/fi';

type StudentTableType = { id: string; avatar: ReactNode; name: ReactNode; engagement: ReactNode; xp: ReactNode };
const StudentTable = HubTable<StudentTableType>;

type ProjectTableType = { id: string; user_avatar: ReactNode; name: ReactNode; status: ReactNode; created_at: ReactNode };
const ProjectTable = HubTable<ProjectTableType>;

const Classes: React.FC = () => {
  const [pageView, setPageView] = useState<ClassPageView>('Alunos');

  const router = useCustomRouter();

  const students: StudentTableType[] = [
    {
      id: '1',
      name: (
        <Flex direction="column">
          <Text color="gray800">Matheus Silva Rodrigues</Text>
          <Text color="gray500">@mathalegria</Text>
        </Flex>
      ),
      avatar: (<Avatar name="Matheus Silva" title="Matheus Silva Rodrigues" h="40px" w="40px" />) as any,
      engagement: (
        <Flex align="center" gap="0.25rem">
          <Text fontWeight="500">50</Text>
          <Box borderRadius="50%" color="primary700" fontSize="1.75rem">
            <IoArrowUpCircleOutline />
          </Box>
        </Flex>
      ),
      xp: (
        <Flex align="center" gap="0.25rem">
          <Text fontWeight="500">180</Text>
          <Box borderRadius="50%" color="primary300" fontSize="1.75rem">
            <IoArrowUpCircleOutline />
          </Box>
        </Flex>
      ),
    },
    {
      id: '2',
      name: (
        <Flex direction="column">
          <Text color="gray800">Marina Almeida Santos</Text>
          <Text color="gray500">@marialmeida</Text>
        </Flex>
      ),
      avatar: (<Avatar name="Marina Almeida" title="Marina Almeida Santos" h="40px" w="40px" />) as any,
      engagement: (
        <Flex align="center" gap="0.25rem">
          <Text fontWeight="500">10</Text>
          <Box borderRadius="50%" color="primary500" fontSize="1.75rem">
            <IoArrowUpCircleOutline />
          </Box>
        </Flex>
      ),
      xp: (
        <Flex align="center" gap="0.25rem">
          <Text fontWeight="500">200</Text>
          <Box borderRadius="50%" color="primary300" fontSize="1.75rem">
            <IoArrowUpCircleOutline />
          </Box>
        </Flex>
      ),
    },
  ];

  const projects: ProjectTableType[] = [
    {
      id: '1',
      user_avatar: (<Avatar name="Anderson Felix" src={undefined} title="Anderson Felix" h="40px" w="40px" />) as any,
      name: (
        <Flex direction="column">
          <Text color="gray800">Energia solar</Text>
        </Flex>
      ),
      status: <Badge color="green" content="Em execução" />,
      created_at: (
        <Flex gap="8px" align="center">
          <FiCalendar />
          <Text fontWeight="500">{moment(new Date()).format('DD/MM/YYYY')}</Text>
        </Flex>
      ),
    },
    {
      id: '2',
      user_avatar: (<Avatar name="Ana Sichieri" title="Ana Sichieri" h="40px" w="40px" />) as any,
      name: (
        <Flex direction="column">
          <Text color="gray800">Cidade inteligente</Text>
        </Flex>
      ),
      status: <Badge color="red" content="Pausado" />,
      created_at: (
        <Flex gap="8px" align="center">
          <FiCalendar />
          <Text fontWeight="500">{moment(new Date()).format('DD/MM/YYYY')}</Text>
        </Flex>
      ),
    },
  ];

  return (
    <Flex direction="column" w="100%" h="100%" gap="2rem" overflow="hidden">
      <Flex justify="space-between">
        <TabSwitch
          tabs={classPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
          onSwitch={(view) => setPageView(view as any)}
        />
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
        >
          Adicionar projeto
        </Flex>
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
          rows={projects}
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
    </Flex>
  );
};

export default Classes;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const selectedPage = 'class';

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
