import { GetServerSideProps } from 'next';

import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Flex } from '@chakra-ui/react';
import { ProjectPageView, projectPageViews } from './interfaces';
import { TabSwitch } from '@/components/TabSwitch';
import { ReactNode, useState } from 'react';

const ProjectPage: React.FC = () => {
  const [pageView, setPageView] = useState<ProjectPageView>('Sobre');

  //TODO: @Ana => implementar as páginas em cada chave desse objeto, da mesma forma que em page steps.
  const PageViewComponent: Record<ProjectPageView, ReactNode> = {
    Sobre: <Flex>Sobre</Flex>,
    Materiais: <Flex>Materiais</Flex>,
    Anotações: <Flex>Anotações</Flex>,
    Grupos: <Flex>Grupos</Flex>,
  };

  return (
    <Flex direction="column" w="100%" h="100%" gap="2rem" overflow="hidden">
      <TabSwitch
        tabs={projectPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
        onSwitch={(view) => setPageView(view as any)}
        currentTabColor="primary700"
      />
      {PageViewComponent[pageView]}
    </Flex>
  );
};

export default ProjectPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'project';

  try {
    cookieManager.updateToken(req);

    const user = await validateSession();

    return { props: { selectedPage, pageTitle: 'Projeto', user } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
