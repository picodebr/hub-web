import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

import { Flex, Select, Text, Tooltip } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { cookieManager, logError } from '@/_base/utils';
import { validateSession } from '@/_base/services/auth';
import { HubTable } from '@/components/Table';
import { GenericButton } from '@/components/Buttons/Generic';
import { SmallModal } from '@/components/Modal/Small';
import { useAsyncCallback, useCustomRouter, useCustomToast, useInputHandler } from '@/_base/hooks';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { HubReportType, hubReportTypes } from './[report_id]/interface';

import { Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { EMPTY_CREATE_REPORT_DATA, ICreateHubReportParams, IHubReport, reportSchema } from '@/_base/interfaces/report';
import { createReport, listReports } from '@/_base/services/report';
import { Badge } from 'rsuite';
import moment from 'moment';
import { IoMdArrowUp } from 'react-icons/io';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';

interface IProps {
  reports: IHubReport[];
}

const HubSupport: React.FC<IProps> = ({ reports: _reports }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reports, setReports] = useState<IHubReport[]>(_reports);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [pageView, setPageView] = useState<HubReportType | `Assunto`>('Assunto');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { school } = useSelectedSchool();
  const router = useCustomRouter();
  const toast = useCustomToast();
  const { data, errors, onInputChange, setData, setErrors, submit } = useInputHandler<ICreateHubReportParams>({
    data: EMPTY_CREATE_REPORT_DATA,
    schema: reportSchema,
  });

  const handleCreateReport = useAsyncCallback(
    async () => {
      setIsLoading(true);
      if (fileList.length) {
        const presignedUrls = await Promise.all(
          fileList.map((file) => getPresignedUrl(file.type || `image/png`, 'reports').then((d) => ({ ...d, file }))),
        );
        await Promise.all(presignedUrls.map((response) => uploadFile(response.link, response.file.originFileObj as File)));

        data.files = presignedUrls.map((response) => response.path);
      }
      data.metadata.school_name = school?.display_name || ``;
      const newReport = await createReport(data);
      setReports((e) => [newReport, ...e]);
      toast({ status: 'success', description: 'Erro reportado com sucesso!' });
      clearData();
    },
    [],
    true,
    () => {
      setIsLoading(false);
    },
  );

  const handleChangeContext = (context: HubReportType) => {
    const initialData = { ...EMPTY_CREATE_REPORT_DATA, context };
    if (context === `Plataforma`) initialData.subject = `Plataforma`;

    setPageView(context);
    setErrors({} as any);
    setData(initialData);
  };

  const clearData = () => {
    setData(EMPTY_CREATE_REPORT_DATA);
    setOpenModal(false);
    setErrors({} as any);
  };

  const PageElement: Record<HubReportType, React.ReactElement> = {
    'Kits / Placas': (
      <Flex>
        <Flex w="100%" flex="1" direction="column">
          <TextAreaInput
            label="Qual componente?"
            placeholder="Digite aqui..."
            value={data.subject}
            error={errors.subject}
            onInputChange={(value) => onInputChange(`subject`, value)}
          />
          <TextAreaInput
            label="Descreva o problema"
            placeholder="Digite aqui..."
            value={data.text}
            error={errors.text}
            onInputChange={(value) => onInputChange(`text`, value)}
          />
          <Text fontSize="13.5px" fontWeight="500" color="gray700">
            Anexe imagens do problema
          </Text>
          <UploadInput onFilesChange={setFileList} />
        </Flex>
      </Flex>
    ),
    Plataforma: (
      <Flex>
        <Flex w="100%" flex="1" direction="column">
          <TextAreaInput
            label="Descreva o problema"
            placeholder="Digite aqui..."
            value={data.text}
            error={errors.text}
            onInputChange={(value) => onInputChange(`text`, value)}
          />
          <Text fontSize="13.5px" fontWeight="500" color="gray700">
            Anexe capturas de tela do problema
          </Text>
          <UploadInput onFilesChange={setFileList} />
        </Flex>
      </Flex>
    ),
    Biblioteca: (
      <Flex w="100%" flex="1" direction="column">
        <TextAreaInput
          label="Qual livro?"
          placeholder="Digite aqui..."
          value={data.subject}
          error={errors.subject}
          onInputChange={(value) => onInputChange(`subject`, value)}
        />
        <TextAreaInput
          label="Descreva o problema"
          placeholder="Digite aqui..."
          value={data.text}
          error={errors.text}
          onInputChange={(value) => onInputChange(`text`, value)}
        />
        <Text fontSize="13.5px" fontWeight="500" color="gray700">
          Anexe imagens do problema
        </Text>
        <UploadInput onFilesChange={setFileList} />
      </Flex>
    ),
    Outros: (
      <Flex w="100%" flex="1" direction="column">
        <TextAreaInput
          label="Com o que você precisa de suporte?"
          placeholder="Digite aqui..."
          value={data.subject}
          error={errors.subject}
          onInputChange={(value) => onInputChange(`subject`, value)}
        />
        <TextAreaInput
          label="Descreva o problema"
          placeholder="Digite aqui..."
          value={data.text}
          error={errors.text}
          onInputChange={(value) => onInputChange(`text`, value)}
        />
        <Text fontSize="13.5px" fontWeight="500" color="gray700">
          Anexe arquivos do problema
        </Text>
        <UploadInput onFilesChange={setFileList} />
      </Flex>
    ),
  };

  return (
    <Flex flex="1" direction="column" gap="1.85rem">
      <Flex w="100%" justify="flex-end">
        <GenericButton label="Reportar Erro" borderColor="gray300" leftIcon={<FiPlus />} onClick={() => setOpenModal(true)} />
      </Flex>
      <HubTable
        rows={reports.map((r) => ({
          ...r,
          status: (
            <Badge
              style={{ padding: `0.25rem 0.5rem`, whiteSpace: `nowrap` }}
              color={r.status === 'finished' ? 'green' : 'orange'}
              content={r.status === 'finished' ? `Resolvido` : `Em andamento`}
            />
          ),
          limit_date: <Text fontWeight="500">{r.limit_date ? moment(r.limit_date).format('DD/MM/YYYY') : `-- --`}</Text>,
        }))}
        onRowClick={(e) => router.push(`/reports/${e.id}`)}
        columnSizes={[{ field: 'subject', width: '100%' }]}
        columns={[
          { label: 'Erro Reportado', field: 'subject' },
          {
            label: (
              <Tooltip label="Status">
                <Flex justify="center" gap="8px" align="center">
                  <Text color="gray600" fontSize="16px">
                    Status
                  </Text>
                  <IoMdArrowUp fontSize="14px" />
                </Flex>
              </Tooltip>
            ),
            field: 'status',
          },
          { label: 'Prazo', field: 'limit_date' },
        ]}
      />
      <SmallModal
        size="2xl"
        title="Reportar erro"
        show={!!openModal}
        onConfirm={() => submit(handleCreateReport)}
        onCancel={clearData}
        topIcon="warning"
        okText="Reportar"
        isLoading={isLoading}
      >
        <Flex direction="column" flex="1" minH="12rem">
          <Flex mb="4px">
            <Text fontWeight="500" color="primary700">
              {school?.display_name}
            </Text>
          </Flex>

          <Flex marginBottom="8px">
            <Select placeholder="Assunto" value={pageView} onChange={(e) => handleChangeContext(e.target.value as HubReportType)}>
              {hubReportTypes.map((view) => (
                <option key={view} value={view}>
                  {view}
                </option>
              ))}
            </Select>
          </Flex>
          <Flex direction="column" flex="1">
            {PageElement[pageView as HubReportType]}
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

    // TODO: add in use effect
    const reports = await listReports();

    await validateSession();

    return { props: { selectedPage, pageTitle: 'Suporte', reports, showBackButton: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};

interface IUploadInputProps {
  onFilesChange: (data: UploadFile[]) => void;
}

const UploadInput: React.FC<IUploadInputProps> = ({ onFilesChange }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    onFilesChange(newFileList);
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
      <Upload listType="picture-card" fileList={fileList} onChange={onChange} onPreview={onPreview} accept="image/*">
        {fileList.length < 5 && '+ Upload'}
      </Upload>
    </Flex>
  );
};
