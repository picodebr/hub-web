import { Avatar, Button, Link, Menu, MenuButton, MenuItem, MenuItemOption, MenuList, MenuOptionGroup, Skeleton, useToast } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';

import { logError, cookieManager, formatShortName } from '@/_base/utils';
import { Flex, Text } from '@chakra-ui/react';
import { useAsyncCallback, useInputHandler } from '@/_base/hooks';
import { PageDataType } from '@/_base/interfaces/shared/IPageData';
import { EmptyPageData } from '@/components/EmptyPageData';
import { SmallModal } from '@/components/Modal/Small';
import { TextInput } from '@/components/Inputs/Text';
import { AvatarList } from '@/components/AvatarList';
import { createGroup, listAvailableUsersForGroupByProject, listStudentGroups } from '@/_base/services/group';
import { ICreateHubGroupParams, IHubGroup, createHubGroupSchema } from '@/_base/interfaces/group';
import { listAvailableProjectsForStudent } from '@/_base/services/project';
import { IProject } from '@/_base/interfaces/project';
import { IHubUser } from '@/_base/interfaces/user';
import { IoChevronDownCircleOutline } from 'react-icons/io5';

interface IProps {
  myGroups: IHubGroup[];
}

const Groups: React.FC<IProps> = ({ myGroups }) => {
  const [groups, setGroups] = useState<PageDataType<IHubGroup>>({ data: myGroups });
  const [availableProjects, setAvailableProjects] = useState<IProject[]>([]);
  const [availableStudents, setAvailableStudents] = useState<IHubUser[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const toast = useToast();
  const { errors, onInputChange, data, submit, setData } = useInputHandler<ICreateHubGroupParams>({ schema: createHubGroupSchema });

  const getAvailableProjects = useAsyncCallback(async () => {
    const projects = await listAvailableProjectsForStudent();
    setAvailableProjects(projects);
  }, []);

  useEffect(() => {
    getAvailableProjects();
  }, []);

  const handleChangeProject = useAsyncCallback(async (project_id: string) => {
    setData((e) => ({ ...(e || ({} as any)), hub_project_class_id: project_id, users: [] }));
    const students = await listAvailableUsersForGroupByProject(project_id);
    setAvailableStudents(students);
  }, []);

  const handleAddGroup = useAsyncCallback(
    async () => {
      setGroups((e) => ({ ...e, _isLoading: true }));
      const newGroup = await createGroup(data);
      setGroups((e) => ({ ...e, data: [newGroup, ...e.data] }));
      setOpenModal(false);
      toast({ status: `success`, description: `Grupo adicionado` });
    },
    [],
    undefined,
    () => {
      setGroups((e) => ({ ...e, _isLoading: false }));
    },
  );

  const selectedProject = useMemo<IProject | undefined>(
    () => availableProjects.find((p) => p.id === data.hub_project_class_id),
    [data.hub_project_class_id],
  );

  return (
    <Flex direction="column" w="100%" h="69px" padding="20px 0" gap="20px" textAlign="left" whiteSpace="nowrap">
      <Flex align="center" justify="flex-end" h="fit-content">
        <Flex
          bgColor="white"
          w="fit-content"
          h="fit-content"
          border="1px"
          borderColor="gray300"
          padding="8px 14px"
          align="center"
          gap="8px"
          borderRadius="8px"
          fontSize="16px"
          fontWeight="600"
          color="gray700"
          boxShadow="sm"
          cursor="pointer"
          onClick={() => setOpenModal(true)}
        >
          <FaPlus />
          Adicionar Grupo
        </Flex>
      </Flex>
      {!groups.data.length && !groups._isLoading ? (
        <EmptyPageData />
      ) : (
        groups.data.map((group) => (
          <Skeleton key={group.id} rounded="lg" isLoaded={!groups._isLoading}>
            <Flex
              h="fit-content"
              bgColor="white"
              borderRadius="10px"
              boxShadow="md"
              align="center"
              padding="20px 24px"
              color="primary700"
              gap="16px"
              fontSize="18px"
              minH="5.5rem"
              maxH="5.5rem"
            >
              <Flex flex="1" gap="1rem">
                <Link href={`/groups/${group.id}`} transition="color 0.1s" color="#21E080" _hover={{ color: '#36c27c' }}>
                  <FiUsers fontSize="40px" />
                </Link>
                <Flex display="column" justify="space-between">
                  <Link href={`/groups/${group.id}`}>
                    <Text fontWeight="700" transition="color 0.1s" _hover={{ color: 'indigo600' }}>
                      {group.display_name}
                    </Text>
                  </Link>
                  <AvatarList users={group.students} max={10} />
                </Flex>
              </Flex>
            </Flex>
          </Skeleton>
        ))
      )}
      <SmallModal
        title="Adicionar Grupo"
        show={openModal}
        onConfirm={() => submit(handleAddGroup)}
        okText="Criar"
        onCancel={() => setOpenModal(false)}
        topIcon={'checked'}
      >
        <Flex direction="column" minW="350px" gap="1rem">
          <TextInput
            placeholder="Informe o nome do grupo"
            _placeholder={{ fontSize: '14px' }}
            value={data?.display_name}
            onInputChange={(v) => onInputChange('display_name', v)}
            error={errors.display_name}
          />

          <Menu>
            <MenuButton as={Button} rightIcon={<IoChevronDownCircleOutline />}>
              {availableProjects.find((e) => data.hub_project_class_id === e.id)?.title || `Selecione o projeto`}
            </MenuButton>
            <MenuList>
              {availableProjects.map((project) => (
                <MenuItem key={project.id} onClick={() => handleChangeProject(project.id)}>
                  {project.title}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu closeOnSelect={false}>
            <MenuButton as={Button} rightIcon={<IoChevronDownCircleOutline />}>
              Selecione os membros do grupo
            </MenuButton>
            <MenuList>
              <MenuOptionGroup type="checkbox">
                {availableStudents.map((student) => (
                  <MenuItemOption
                    key={student.id}
                    value={student.id}
                    onClick={() =>
                      onInputChange(
                        `users`,
                        data.users.find((id) => id === student.id) ? data.users.filter((id) => id !== student.id) : [...data.users, student.id],
                      )
                    }
                  >
                    {student.name}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          {!!selectedProject && (
            <Flex direction="column" gap="0.25rem" bg="gray100" p="0.5rem" borderRadius="md" position="relative">
              <Text alignSelf="flex-end" fontSize="14px" color="gray400" position="absolute">
                Professor
              </Text>
              <Flex align="center" gap="0.5rem">
                <Avatar
                  name={formatShortName(selectedProject?.educator?.name || '', true)}
                  title={selectedProject?.educator?.name}
                  src={selectedProject?.educator?.avatar || undefined}
                  cursor="pointer"
                />
                <Text>{formatShortName(selectedProject?.educator?.name || '', true)}</Text>
              </Flex>
            </Flex>
          )}
          <Flex align="center" gap="0.5rem">
            <Text fontSize="15px" fontWeight="500">
              Membros:
            </Text>
            <AvatarList users={availableStudents.filter((e) => data.users.includes(e.id))} max={10} emptyMessage="Nenhum membro adicionado" />
          </Flex>
        </Flex>
      </SmallModal>
    </Flex>
  );
};

export default Groups;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'groups';

  try {
    cookieManager.updateToken(req);

    const myGroups = await listStudentGroups();
    return { props: { selectedPage, pageTitle: 'Meus Grupos', myGroups } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
