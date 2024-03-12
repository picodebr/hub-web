import { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';

import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { KanbanColumnData, kanbanColumnLabel, kanbanColumns } from './interfaces';
import { Kanban } from '@/components/Kanban';
import { IHubUser } from '@/_base/interfaces/user';
import { Flex, Skeleton, Text } from '@chakra-ui/react';
import { GenericButton } from '@/components/Buttons/Generic';
import { MdWarning } from 'react-icons/md';
import { updateProfile } from '@/_base/services/user';
import { useAsyncCallback, useCustomToast } from '@/_base/hooks';
import { FiMessageCircle } from 'react-icons/fi';

interface IProps {
  user: IHubUser;
}

const Lesson: React.FC<IProps> = ({ user }) => {
  const [kanbanList, setKanbanList] = useState<KanbanColumnData[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState<IHubUser>(user);
  const [savedProfile, setSavedProfile] = useState<IHubUser>(user);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useCustomToast();
  const needSave = useMemo<boolean>(() => JSON.stringify(profile) !== JSON.stringify(savedProfile), [profile, savedProfile]);

  useEffect(() => {
    const initialList = user.metadata.kanban
      ? (JSON.parse(user.metadata.kanban) as KanbanColumnData[])
      : kanbanColumns.map((column) => ({ type: column, title: kanbanColumnLabel[column], items: [] }));

    setKanbanList(initialList);
    setIsMounted(true);
  }, []);

  const handleUpdateKanbanList = (data: KanbanColumnData[]) => {
    setKanbanList(data);
    setProfile((e) => ({ ...e, metadata: { ...e.metadata, kanban: JSON.stringify(data) } }));
  };

  const handleSaveProfile = useAsyncCallback(
    async () => {
      setIsLoading(true);
      if (!needSave) return;
      await updateProfile({ kanban: profile.metadata.kanban });
      setSavedProfile((e) => ({ ...e, metadata: { ...e.metadata, kanban: profile.metadata.kanban } }));
      toast({ status: 'success', description: 'Atualizado com sucesso!' });
    },
    [],
    false,
    () => {
      setIsLoading(false);
    },
  );

  return (
    <Flex direction="column" flex="1" gap="1.5rem">
      <Flex>
        <GenericButton
          label="Salvar"
          onClick={handleSaveProfile}
          border="1px"
          borderColor="gray300"
          isLoading={isLoading}
          bg={needSave ? 'primary500' : 'primary800'}
          color="white"
          boxShadow="sm"
          _hover={{ filter: 'brightness(0.9)' }}
          rightIcon={needSave ? <MdWarning /> : undefined}
        />
      </Flex>
      <Flex>
        <Flex
          w="300px"
          h="400px"
          direction="column"
          bgColor="white"
          boxShadow="md"
          borderRadius="6px"
          mr="1.5rem"
          p="1.5rem"
          border="1px"
          borderColor="gray200"
        >
          <Flex justify="center" direction="row" color="gray300" gap="2px" align="center" fontSize="17px" mb="6px">
            Enunciado
            <FiMessageCircle />
          </Flex>
          <Flex direction="column">
            <Text fontSize="15px">
              Desde o final da Segunda Guerra Mundial, o dólar domina o cenário internacional como moeda referência dos países, seja em cotações,
              transações comerciais, acordos e contratos em geral. Descreva o algoritmo para executar a tarefa
            </Text>
            <Text fontWeight="500" fontSize="15px">
              “Converter Real para Dólar”
            </Text>
          </Flex>
        </Flex>
        {/* {isMounted && <Kanban initialData={kanbanList} onChange={handleUpdateKanbanList} />} */}
      </Flex>
    </Flex>
  );
};

export default Lesson;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'lesson';

  try {
    cookieManager.updateToken(req);

    const user = await validateSession();

    return { props: { selectedPage, pageTitle: 'Lição', user, showBackButton: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
