import { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState } from 'react';

import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { KanbanColumnData, kanbanColumnLabel, kanbanColumns } from '@/components/Kanban/interfaces';
import { Kanban } from '@/components/Kanban';
import { IHubUser } from '@/_base/interfaces/user';
import { Flex } from '@chakra-ui/react';
import { GenericButton } from '@/components/Buttons/Generic';
import { MdWarning } from 'react-icons/md';
import { updateProfile } from '@/_base/services/user';
import { useAsyncCallback, useCustomToast } from '@/_base/hooks';

interface IProps {
  user: IHubUser;
  selectedItemId: string;
}

const Planner: React.FC<IProps> = ({ user, selectedItemId }) => {
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
      {isMounted && <Kanban initialData={kanbanList} onChange={handleUpdateKanbanList} selectedItemId={selectedItemId} />}
    </Flex>
  );
};

export default Planner;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const selectedPage = 'planner';

  try {
    cookieManager.updateToken(req);

    const user = await validateSession();

    return { props: { selectedPage, pageTitle: 'Meus planejamentos', user, showBackButton: false, selectedItemId: query?.id || `` } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
