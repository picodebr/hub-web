import { useState } from 'react';
import { FiClock, FiPlus } from 'react-icons/fi';

import { Badge, Button, Flex, Select, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { cookieManager, logError } from '@/_base/utils';
import { validateSession } from '@/_base/services/auth';
import { HubTable } from '@/components/Table';
import { GenericButton } from '@/components/Buttons/Generic';
import { SmallModal } from '@/components/Modal/Small';
import { useCustomRouter, useCustomToast } from '@/_base/hooks';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { FaPaperclip } from 'react-icons/fa';
import { Uploader } from 'rsuite';

type MenuItemType = { name: string; ref?: any };

interface IFileInputProps {
  onChange: (files: File[]) => void;
  fileUrl?: string;
  type?: 'image' | 'video';
}

// interface MyUploaderProps {
//   yourFileInputProps: IFileInputProps;
// }

// const ImageList: React.FC<{ images: File[] }> = ({ images }) => {
//   return (
//     <div>
//       <h2>Lista de Imagens:</h2>
//       <ul>
//         {images.map((image, index) => (
//           <li key={index}>
//             <img src={URL.createObjectURL(image)} alt={`Imagem ${index}`} />
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

const HubSupport: React.FC<IFileInputProps> = ({ type, onChange }) => {
  const [newReport, setNewReport] = useState<Record<string, string> | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

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
        <Flex mb="4px">
          <Text fontWeight="500" color="primary700">
            Rede de Escola (do usuário abrindo o chamado)
          </Text>
        </Flex>
        <Flex mb="4px">
          <Text>Escola (do usuário abrindo o chamado)</Text>
        </Flex>
        <Flex marginBottom="8px">
          <Select placeholder="Assunto">
            <option value="kits">Kits / Placas</option>
            <option value="plataform">Plataforma</option>
            <option value="library">Biblioteca</option>
            <option value="others">Outros</option>
          </Select>
        </Flex>
        <TextAreaInput placeholder="Fale sobre o problema..." borderColor="gray300" rows={8} w="20rem" />
        <Flex w="100%" justify="center">
          <Uploader
            autoUpload={false}
            accept={`${type}/*`}
            draggable
            action=""
            multiple
            onChange={(e) => {
              onChange(e.map((file) => file.blobFile as File));
            }}
            toggleAs={(e) => (
              <Button w="100%" mt="8px" gap="8px" onClick={() => e.onClick(e)}>
                <FaPaperclip />
                Anexar arquivo
              </Button>
            )}
          />
          {/* <ImageList images={uploadedImages} /> */}
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
