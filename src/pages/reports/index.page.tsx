import { useState } from 'react';
import { FiClock, FiPlus } from 'react-icons/fi';

import { Badge, Flex, Select, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { cookieManager, logError } from '@/_base/utils';
import { validateSession } from '@/_base/services/auth';
import { HubTable } from '@/components/Table';
import { GenericButton } from '@/components/Buttons/Generic';
import { SmallModal } from '@/components/Modal/Small';
import { useCustomRouter, useCustomToast } from '@/_base/hooks';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { ReportPageView, reportPageViews } from './[report_id]/interface';

import { Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { useSelectedSchool } from '@/components/Page/components/Header';

interface IFileInputProps {
  onChange: (files: File[]) => void;
  fileUrl?: string;
  type?: 'image' | 'video';
}

const HubSupport: React.FC<IFileInputProps> = ({ type, onChange }) => {
  const [newReport, setNewReport] = useState<Record<string, string> | null>(null);
  const [pageView, setPageView] = useState<ReportPageView>('Kits / Placas');
  const { school } = useSelectedSchool();

  const PageElement: Record<ReportPageView, React.ReactElement> = {
    'Kits / Placas': (
      <Flex>
        <Flex w="100%" flex="1" direction="column">
          <TextAreaInput label="Qual componente?" placeholder="Digite aqui..." />
          <TextAreaInput label="Descreva o problema" placeholder="Digite aqui..." />
          <Text fontSize="13.5px" fontWeight="500" color="gray700">
            Anexe imagens do problema
          </Text>
          <UploadInput />
        </Flex>
      </Flex>
    ),
    Plataforma: (
      <Flex>
        <Flex w="100%" flex="1" direction="column">
          <TextAreaInput label="Descreva o problema" placeholder="Digite aqui..." />
          <Text fontSize="13.5px" fontWeight="500" color="gray700">
            Anexe capturas de tela do problema
          </Text>
          <UploadInput />
        </Flex>
      </Flex>
    ),
    Biblioteca: (
      <Flex w="100%" flex="1" direction="column">
        <TextAreaInput label="Qual livro?" placeholder="Digite aqui..." />
        <TextAreaInput label="Descreva o problema" placeholder="Digite aqui..." />
        <Text fontSize="13.5px" fontWeight="500" color="gray700">
          Anexe imagens do problema
        </Text>
        <UploadInput />
      </Flex>
    ),
    Outros: (
      <Flex w="100%" flex="1" direction="column">
        <TextAreaInput label="Com o que você precisa de suporte?" placeholder="Digite aqui..." />
        <TextAreaInput label="Descreva o problema" placeholder="Digite aqui..." />
        <Text fontSize="13.5px" fontWeight="500" color="gray700">
          Anexe arquivos do problema
        </Text>
        <UploadInput />
      </Flex>
    ),
  };

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
        size="2xl"
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
        <Flex direction="column" flex="1">
          <Flex mb="4px">
            <Text fontWeight="500" color="primary700">
              {school?.display_name}
            </Text>
          </Flex>
          <Flex mb="4px">
            <Text>{school?.display_name}</Text>
          </Flex>
          <Flex marginBottom="8px">
            <Select placeholder="Assunto" value={pageView} onChange={(e) => setPageView(e.target.value as ReportPageView)}>
              {reportPageViews.map((view) => (
                <option key={view} value={view}>
                  {view}
                </option>
              ))}
            </Select>
          </Flex>
          <Flex direction="column" flex="1">
            {PageElement[pageView]}
          </Flex>
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

type FileType = Parameters<any>[0];

const UploadInput: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([
    // {
    //   uid: '-1',
    //   name: 'image.png',
    //   status: 'done',
    //   url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    // },
  ]);

  const onChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL((file as any).originFileObj as any);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  return (
    <Flex w="100%" direction="column" gap="4px" mt="8px">
      <Upload
        action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
        listType="picture-card"
        fileList={fileList}
        onChange={onChange}
        onPreview={onPreview}
      >
        {fileList.length < 5 && '+ Upload'}
      </Upload>
    </Flex>
  );
};
