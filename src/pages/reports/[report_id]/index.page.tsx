import { GetServerSideProps } from 'next';
import { Flex, Grid, Text } from '@chakra-ui/react';
import { Badge } from 'rsuite';
import moment from 'moment';
import { Image } from 'antd';

import { logError, cookieManager } from '@/_base/utils';
import { showReport } from '@/_base/services/report';
import { IHubReport } from '@/_base/interfaces/report';
import { useSelectedSchool } from '@/components/Page/components/Header';

interface IProps {
  report: IHubReport;
}

const ReportPage: React.FC<IProps> = ({ report }) => {
  const { school } = useSelectedSchool();

  return (
    <Flex direction="column" w="100%" h="100%" overflow="auto">
      <Flex
        direction="column"
        bg="white"
        border="1px"
        borderColor="gray300"
        p="20px"
        h="fit-content"
        position="relative"
        borderRadius="10px"
        gap="14px"
      >
        <Badge
          style={{ padding: `0.25rem 0.5rem`, whiteSpace: `nowrap`, fontWeight: 500 }}
          color={report.status === 'finished' ? 'green' : 'orange'}
          content={report.status === 'finished' ? `Resolvido` : `Em andamento`}
        />
        <Flex>
          <Flex w="100%" fontSize="27px" color="orange.700" fontWeight="600">
            Chamado #{report.readable_id}
          </Flex>
          <Flex fontSize="14px" flex="1" gap="0.25rem">
            <Text whiteSpace="nowrap">Solicitado em</Text>
            <Text whiteSpace="nowrap">{moment(report.created_at).format(`DD/MM/YYYY`)}</Text>
            <Text whiteSpace="nowrap">ás</Text>
            <Text whiteSpace="nowrap">{moment(report.created_at).format(`HH:mm`)}</Text>
          </Flex>
        </Flex>
        <Flex direction="column" fontWeight="500">
          Rede de Escola:
          <Text fontWeight="400">{school?.hub_school_group?.display_name}</Text>
        </Flex>
        <Flex direction="column" fontWeight="500">
          Escola:
          <Text fontWeight="400">{report.metadata.school_name}</Text>
        </Flex>
        <Flex direction="column" fontWeight="500">
          Assunto:
          <Text fontWeight="400">{report.context}</Text>
        </Flex>
        <Flex direction="column" fontWeight="500">
          Descrição:
          {report.context !== `Plataforma` && <Text fontWeight="400">{report.subject}</Text>}
          <Text fontWeight="400">{report.text}</Text>
        </Flex>
        <Grid
          gap="1rem"
          gridTemplateColumns="repeat(auto-fill, minmax(450px, 1fr))"
          gridTemplateRows="minmax(min-content, max-content)"
          borderRadius="md"
          flex="1"
        >
          {report.files.map((file, i) => (
            <Image key={file + i} src={file} height="300px" />
          ))}
        </Grid>
      </Flex>
    </Flex>
  );
};

export default ReportPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const selectedPage = 'reports';

  try {
    cookieManager.updateToken(req);

    // TODO: add in use effect
    const report = await showReport(`${query.report_id}`);

    return { props: { selectedPage, pageTitle: `Chamado ${report.readable_id}`, report } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
