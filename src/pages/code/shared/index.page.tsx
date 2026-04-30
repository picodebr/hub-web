import { GetServerSideProps } from 'next';
import moment from 'moment';

import { cookieManager, formatShortName } from '@/_base/utils';
import { Avatar, Flex, Skeleton, Text } from '@chakra-ui/react';
import { useCustomRouter, useCustomToast } from '@/_base/hooks';
import { BsMotherboard } from 'react-icons/bs';
import { useEffect, useState } from 'react';
import { getCodeProjectsSharedWithMe } from '@/_base/services/codeProject';
import { ICodeProject } from '@/_base/interfaces/codeProject/IProject';
import { LuSquareDashedBottomCode } from 'react-icons/lu';

const SharedProjects: React.FC = () => {
  const [codeProjects, setCodeProjects] = useState<ICodeProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useCustomToast();
  const router = useCustomRouter();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const projects = await getCodeProjectsSharedWithMe();
        setCodeProjects(projects);
      } catch {
        toast({ status: `error`, description: `Não foi possível listar os projetos disponíveis no momento` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <Flex flex="1" direction="column" gap="20px" textAlign="left" whiteSpace="nowrap" overflow="hidden">
      <Skeleton
        display="grid"
        overflow="hidden auto"
        isLoaded={!isLoading}
        gap="1rem"
        gridTemplateColumns={{ base: 'repeat(auto-fill, minmax(150px, 1fr))', sm: 'repeat(auto-fill, minmax(240px, 1fr))' }}
        gridTemplateRows="minmax(min-content, max-content)"
        borderRadius="md"
        flex="1"
      >
        {codeProjects?.map((project) => (
          <Flex
            key={project.id}
            direction="column"
            bgColor="white"
            borderRadius="10px"
            padding="1rem"
            color="primary700"
            border="1px"
            gap="0.5rem"
            borderColor="gray200"
            fontSize="18px"
            cursor="pointer"
            transition="all 0.1s"
            _hover={{ boxShadow: `md` }}
            onClick={() => router.push(`/code/${project.folder_id}/${project.id}?_p=${project.name}`)}
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
              <Flex align="flex-end">
                <Avatar
                  name={formatShortName(project.folder?.user?.name || ``)}
                  src={project.folder?.user?.avatar || ``}
                  title={project.folder?.user?.name}
                  h="40px"
                  w="40px"
                  border="1px"
                  borderColor="gray200 !important"
                />
              </Flex>
            </Flex>
          </Flex>
        ))}
      </Skeleton>
    </Flex>
  );
};

export default SharedProjects;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const selectedPage = 'code';

  cookieManager.updateToken(req);

  const pageTitle = 'Compartilhados Comigo';

  return { props: { selectedPage, pageTitle } };
};
