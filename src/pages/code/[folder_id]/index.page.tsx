import { GetServerSideProps } from 'next';
import { FaPlus } from 'react-icons/fa';
import { FiMoreVertical, FiTrash } from 'react-icons/fi';
import moment from 'moment';

import { cookieManager } from '@/_base/utils';
import { Flex, Menu, MenuButton, MenuItem, MenuList, Skeleton, Text } from '@chakra-ui/react';
import { useAsyncCallback, useCustomRouter, useCustomToast } from '@/_base/hooks';
import { PlusButton } from '@/components/Buttons/Plus';
import { BsMotherboard } from 'react-icons/bs';
import { useEffect, useState } from 'react';
import { IProjectFolder } from '@/_base/interfaces/codeFolder/IProjectFolder';
import { getCodeProjectFolder } from '@/_base/services/codeProjectFolder';
import { removeCodeProject } from '@/_base/services/codeProject';
import { ICodeProject } from '@/_base/interfaces/codeProject/IProject';
import { SmallModal } from '@/components/Modal/Small';

interface IProps {
  folderId: string;
}

const CodeProjects: React.FC<IProps> = ({ folderId }) => {
  const [targetFolder, setTargetFolder] = useState<IProjectFolder | null>(null);
  const [targetProjectToRemove, setTargetProjectToRemove] = useState<ICodeProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useCustomToast();
  const router = useCustomRouter();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [projectFolder] = await Promise.all([getCodeProjectFolder(folderId)]);
        setTargetFolder(projectFolder);
      } catch {
        toast({ status: `error`, description: `Não foi possível listar as pastas disponíveis no momento` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const onCloseModal = () => {
    setTargetProjectToRemove(null);
  };

  const handleRemoveFolder = useAsyncCallback(
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

  return (
    <Flex flex="1" direction="column" gap="20px" textAlign="left" whiteSpace="nowrap" overflow="hidden">
      <Flex align="center" justify="flex-end" h="fit-content">
        <PlusButton label="Novo projeto" leftIcon={<FaPlus />} onClick={() => router.push(`/code/${folderId}/example`)} />
      </Flex>
      <Skeleton display="flex" flexDirection="column" gap="1rem" overflow="hidden auto" isLoaded={!isLoading}>
        {targetFolder?.projects.length ? (
          targetFolder.projects.map((project) => (
            <Flex
              key={project.id}
              h="69px"
              justify="space-between"
              bgColor="white"
              borderRadius="10px"
              boxShadow="sm"
              align="center"
              padding="20px 24px"
              color="primary700"
              border="1px"
              borderColor="gray200"
              gap="16px"
              fontSize="18px"
              cursor="pointer"
              transition="all 0.1s"
              _hover={{ boxShadow: `md` }}
              onClick={() => router.push(`/code/${folderId}/${project.id}?_p=${project.name}`)}
            >
              <Flex gap="16px" align="center">
                <BsMotherboard fontSize="29px" />
                <Text fontWeight="700">{project.name}</Text>
                <Text fontSize="14px" fontWeight="400" color="gray500" gap="16px">
                  {moment(project.updated_at).fromNow()}
                </Text>
              </Flex>
              <Menu>
                <MenuButton
                  onClick={(e) => e.stopPropagation()}
                  color="gray300"
                  p="0.45rem"
                  borderRadius="50%"
                  transition="0.1s"
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
                    <Flex color="gray400">
                      <FiTrash />
                    </Flex>
                    <Text fontSize="15px">Remover</Text>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          ))
        ) : (
          <Flex flex="1" justify="center" pt="1rem">
            <Text fontSize="1rem" fontWeight="500" color="gray600">
              Lista vazia
            </Text>
          </Flex>
        )}
      </Skeleton>

      {/* Remove folder modal */}
      <SmallModal
        show={!!targetProjectToRemove}
        topIcon="warning"
        onCancel={onCloseModal}
        onConfirm={handleRemoveFolder}
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
