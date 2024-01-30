import { useRef, useState } from 'react';
import { FiClock, FiPlus } from 'react-icons/fi';

import { Badge, Button, Flex, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { cookieManager, logError } from '@/_base/utils';
import { validateSession } from '@/_base/services/auth';
import { HubTable } from '@/components/Table';
import { GenericButton } from '@/components/Buttons/Generic';
import { SmallModal } from '@/components/Modal/Small';
import { useCustomRouter, useCustomToast } from '@/_base/hooks';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { IoChevronDownCircleOutline } from 'react-icons/io5';
import { MdOutlineCloudUpload } from 'react-icons/md';

type MenuItemType = { name: string; ref?: any };

const HubSupport: React.FC = () => {
  const [newReport, setNewReport] = useState<Record<string, string> | null>(null);

  const router = useCustomRouter();
  const toast = useCustomToast();

  const students = [
    {
      id: '1',
      subject: <Text color="primary500">Kits / Placas</Text>,
      status: (
        <Badge bg="green.300" color="green.700">
          Resolvido
        </Badge>
      ),
      term: (
        <Flex fontWeight="500" align="center" ml="1rem">
          -
        </Flex>
      ),
    },
    {
      id: '2',
      subject: <Text color="primary500">Livro</Text>,
      status: (
        <Badge bg="orange.300" color="orange.700">
          {' '}
          Em Andamento
        </Badge>
      ),
      term: (
        <Flex gap="0.35rem" ml="-1rem" fontWeight="500" align="center">
          <FiClock /> 30 horas
        </Flex>
      ),
    },
  ];

  return (
    <Flex flex="1" direction="column" gap="1.85rem">
      <Flex w="100%" justify="flex-end">
        <GenericButton
          label="Reportar Erro"
          bgColor="white"
          btntype="outline"
          borderColor="gray300"
          leftIcon={<FiPlus />}
          onClick={() => setNewReport({})}
        />
      </Flex>
      <HubTable
        rows={students}
        onRowClick={(e) => router.push(`/reports/${e.id}`)}
        columns={[
          { label: 'Erro Reportado', field: 'subject' },
          { label: 'Status', field: 'status' },
          { label: 'Prazo', field: 'term' },
        ]}
      />
      <SmallModal
        title="Reportar erro"
        show={!!newReport}
        onConfirm={() => {
          setNewReport(null);
          toast({ status: 'success', description: 'Erro reportado com sucesso!' });
        }}
        onCancel={() => setNewReport(null)}
        topIcon="warning"
        okText="Reportar"
      >
        <Flex marginBottom="8px">
          <Menu>
            <MenuButton as={Button} rightIcon={<IoChevronDownCircleOutline />} w="100%">
              Assuntos
            </MenuButton>
            <MenuList>
              <MenuItem>Kit / Placas</MenuItem>
              <MenuItem>Plataforma</MenuItem>
              <MenuItem>Biblioteca</MenuItem>
              <MenuItem>Outros</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        <TextAreaInput placeholder="Fale sobre o problema..." rows={8} w="20rem" />
        <Flex w="100%">
          <Button m="8px 0 8px 0" gap="4px">
            <MdOutlineCloudUpload />
            Enviar arquivo
          </Button>
        </Flex>
      </SmallModal>
    </Flex>
  );
};

export default HubSupport;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'reports';

  try {
    cookieManager.updateToken(req);

    await validateSession();

    return { props: { selectedPage, pageTitle: 'Suporte', showBackButton: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
