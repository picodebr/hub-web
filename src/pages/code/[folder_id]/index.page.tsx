import { GetServerSideProps } from 'next';
import { FaPlus, FaRegShareSquare } from 'react-icons/fa';
import { FiMoreVertical, FiTrash } from 'react-icons/fi';
import moment from 'moment';

import { cookieManager } from '@/_base/utils';
import { Button, Flex, Menu, MenuButton, MenuItem, MenuItemOption, MenuList, MenuOptionGroup, Skeleton, Text } from '@chakra-ui/react';
import { useAsyncCallback, useCustomRouter, useCustomToast } from '@/_base/hooks';
import { PlusButton } from '@/components/Buttons/Plus';
import { BsMotherboard } from 'react-icons/bs';
import { useEffect, useState } from 'react';
import { IProjectFolder } from '@/_base/interfaces/codeFolder/IProjectFolder';
import { getCodeProjectFolder } from '@/_base/services/codeProjectFolder';
import { removeCodeProject, shareCodeProject } from '@/_base/services/codeProject';
import { ICodeProject } from '@/_base/interfaces/codeProject/IProject';
import { SmallModal } from '@/components/Modal/Small';
import { LuSquareDashedBottomCode } from 'react-icons/lu';
import { IHubUser } from '@/_base/interfaces/user';
import { listRelatedUsers } from '@/_base/services/user';
import { IoChevronDownCircleOutline } from 'react-icons/io5';
import { AvatarList } from '@/components/AvatarList';

interface IProps {
  folderId: string;
}

const CodeProjects: React.FC<IProps> = ({ folderId }) => {
  const [targetFolder, setTargetFolder] = useState<IProjectFolder | null>(null);
  const [targetProjectToRemove, setTargetProjectToRemove] = useState<ICodeProject | null>(null);
  const [targetProjectToShare, setTargetProjectToShare] = useState<ICodeProject | null>(null);
  const [usersToShare, setUsersToShare] = useState<IHubUser[]>([]);
  const [relatedUsers, setRelatedUsers] = useState<IHubUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useCustomToast();
  const router = useCustomRouter();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [projectFolder, relatedUsersRes] = await Promise.all([getCodeProjectFolder(folderId), listRelatedUsers()]);
        if (!projectFolder?.projects.length) router.push(`/code/${folderId}/example`);
        setTargetFolder(projectFolder);
        setRelatedUsers(relatedUsersRes);
      } catch {
        toast({ status: `error`, description: `Não foi possível listar as pastas disponíveis no momento` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const onCloseModal = () => {
    setTargetProjectToRemove(null);
    setTargetProjectToShare(null);
    setUsersToShare([]);
  };

  const handleRemoveProject = useAsyncCallback(
    async () => {
      if (!targetProjectToRemove) return;
      setIsLoading(true);
      await removeCodeProject(targetProjectToRemove.id);
      setTargetFolder((f) => ({ ...(f || ({} as any)), projects: f?.projects.filter((p) => p.id !== targetProjectToRemove.id) || [] }));
      onCloseModal();
    },
    [targetProjectToRemove],
    true,
    () => setIsLoading(false),
  );

  const handleShareProject = useAsyncCallback(
    async () => {
      if (!targetProjectToShare || !usersToShare) return;
      setIsLoading(true);
      await Promise.all(usersToShare.map((u) => shareCodeProject({ hub_user_id: u.id, code_project_id: targetProjectToShare.id })));
      onCloseModal();
    },
    [targetProjectToRemove],
    true,
    () => setIsLoading(false),
  );

  return (
    <Flex flex="1" direction="column" gap="20px" textAlign="left" whiteSpace="nowrap" overflow="hidden">
      <Flex align="center" justify="flex-end" h="fit-content">
        <PlusButton label="Novo projeto" leftIcon={<FaPlus />} onClick={() => router.push(`/code/${folderId}/example`)} />
      </Flex>
      <Skeleton
        display="grid"
        overflow="hidden auto"
        isLoaded={!isLoading}
        gap="1rem"
        gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))"
        gridTemplateRows="minmax(min-content, max-content)"
        borderRadius="md"
        flex="1"
      >
        {targetFolder?.projects?.map((project) => (
          <Flex
            key={project.id}
            direction="column"
            bgColor="white"
            borderRadius="10px"
            boxShadow="sm"
            padding="1rem"
            color="primary700"
            border="1px"
            gap="0.5rem"
            borderColor="gray200"
            fontSize="18px"
            cursor="pointer"
            transition="all 0.1s"
            _hover={{ boxShadow: `md` }}
            onClick={() => router.push(`/code/${folderId}/${project.id}?_p=${project.name}`)}
          >
            <Flex
              border="1px"
              borderColor="gray200"
              borderRadius="md"
              h="8rem"
              w="100%"
              bgImage={project.source_code.mode === `block` ? project.snapshot || `` : `/icons/source-code.svg`}
              bgRepeat="no-repeat"
              bgSize={project.source_code.mode === `block` ? 'cover' : 'contain'}
              bgPosition={project.source_code.mode === `block` ? undefined : `center`}
              bgColor="gray50"
            ></Flex>
            <Flex w="100%" justify="space-between">
              <Flex gap="0.5rem" justify="center" direction="column">
                <Flex gap="16px" align="center">
                  {project.source_code.mode === `block` ? <BsMotherboard fontSize="24px" /> : <LuSquareDashedBottomCode fontSize="29px" />}
                  <Text fontWeight="700">{project.name}</Text>
                </Flex>
                <Text fontSize="14px" fontWeight="400" color="gray500" gap="16px">
                  {moment(project.updated_at).fromNow()}
                </Text>
              </Flex>
              <Menu>
                <MenuButton
                  onClick={(e) => e.stopPropagation()}
                  alignSelf="flex-end"
                  color="gray300"
                  p="0.45rem"
                  borderRadius="50%"
                  transition="0.1s"
                  mr="-0.5rem"
                  mb="-0.5rem"
                  _hover={{ bg: 'gray300', color: 'white' }}
                >
                  <FiMoreVertical cursor="pointer" />
                </MenuButton>
                <MenuList borderColor="gray300" boxShadow="md" color="gray600">
                  <MenuItem
                    gap="0.5rem"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetProjectToRemove(project);
                    }}
                  >
                    <Flex color="red.400">
                      <FiTrash />
                    </Flex>
                    <Text fontSize="15px">Remover</Text>
                  </MenuItem>
                  <MenuItem
                    gap="0.5rem"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetProjectToShare(project);
                    }}
                  >
                    <Flex color="green.400">
                      <FaRegShareSquare />
                    </Flex>
                    <Text fontSize="15px">Compartilhar</Text>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          </Flex>
        ))}
      </Skeleton>

      {/* Remove project modal */}
      <SmallModal
        show={!!targetProjectToRemove}
        topIcon="warning"
        onCancel={onCloseModal}
        onConfirm={handleRemoveProject}
        title="Atenção"
        okText="Confirmar"
        isLoading={isLoading}
      >
        <Flex direction="column" gap="1rem" mt="1rem">
          <Text fontSize="1rem" fontWeight="500" color="gray600">
            Tem certeza que deseja excluir o projeto <b>{targetProjectToRemove?.name}</b> ?
          </Text>
          <Text fontSize="1rem" fontWeight="500" color="gray600">
            Essa ação é <b>irreversível</b>.
          </Text>
        </Flex>
      </SmallModal>

      {/* Share project modal */}
      <SmallModal
        show={!!targetProjectToShare}
        topIcon="checked"
        onCancel={onCloseModal}
        onConfirm={handleShareProject}
        title=" Quem vai ter acesso ao projeto?"
        okText="Confirmar"
        isLoading={isLoading}
      >
        <Flex direction="column" gap="1rem" mt="1rem">
          <Menu closeOnSelect={false} placement="right">
            <MenuButton as={Button} rightIcon={<IoChevronDownCircleOutline />} border="1px" borderColor="gray300" bg="white">
              Selecionar
            </MenuButton>
            <MenuList borderColor="gray300" boxShadow="md">
              <MenuOptionGroup type="checkbox">
                {relatedUsers.length ? (
                  relatedUsers.map((user) => (
                    <MenuItemOption
                      key={user.id}
                      value={user.id}
                      isChecked={!!targetProjectToShare?.share_links?.find((e) => e.hub_user_id === user.id)}
                      onClick={() =>
                        setUsersToShare((data) => (data.find((u) => u.id === user.id) ? data.filter((u) => u.id !== user.id) : [...data, user]))
                      }
                    >
                      {user.name}
                    </MenuItemOption>
                  ))
                ) : (
                  <MenuItem isDisabled>Nenhum membro disponível</MenuItem>
                )}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          <AvatarList
            users={relatedUsers.filter(
              (e) => !!targetProjectToShare?.share_links.find((s) => s.hub_user_id === e.id) || usersToShare.find((u) => u.id === e.id),
            )}
            max={10}
            emptyMessage="-"
          />
        </Flex>
      </SmallModal>
    </Flex>
  );
};

export default CodeProjects;

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  const selectedPage = 'code';

  cookieManager.updateToken(req);

  const folderId = query.folder_id || ``;
  const pageTitle = query._p || 'Meus projetos';

  return { props: { selectedPage, pageTitle, folderId } };
};
