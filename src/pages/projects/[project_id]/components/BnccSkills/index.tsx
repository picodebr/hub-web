import { Flex, Text } from '@chakra-ui/react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Dispatch, SetStateAction, useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';

import { IProject } from '@/_base/interfaces/project';
import { IBnccSkill } from '@/_base/interfaces/shared/IBnccSkill';
import { SmallModal } from '@/components/Modal/Small';

interface DataType {
  key: React.Key;
  tag: string;
  subject: string;
  grade: string;
  description: string;
}

interface IProps {
  project: IProject;
  setProject: Dispatch<SetStateAction<IProject>>;
  bnccSkills: IBnccSkill[];
  canEdit: boolean;
}

export const BnccSkills: React.FC<IProps> = ({ project, setProject, bnccSkills, canEdit }) => {
  const [showModal, setShowModal] = useState(false);

  const columns: ColumnsType<DataType> = [
    {
      title: 'Habilidade',
      dataIndex: 'tag',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: 'Matéria',
      dataIndex: 'subject',
    },
    {
      title: 'Ano/Faixa',
      dataIndex: 'grade',
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
    },
  ];

  const dataSource: DataType[] = bnccSkills.map((bncc) => ({ ...bncc, key: bncc.tag, description: `${bncc.title} - ${bncc.description || ''}` }));

  return (
    <>
      <Flex gap="0px" direction="column" w="100%" h="auto" borderRadius="10px" border="1px" borderColor="gray300" overflow="hidden">
        <Flex
          w="100%"
          h="42px"
          bg="primary500"
          p="12px 20px"
          color="white"
          fontWeight="500"
          align="center"
          justify="space-between"
        >
          Habilidades BNCC
          <Flex
            onClick={() => canEdit && !project.project_id && setShowModal(true)}
            border={canEdit && !project.project_id ? '1px' : undefined}
            borderColor="white"
            borderRadius="4px"
            p="2px"
            cursor={canEdit && !project.project_id ? 'pointer' : undefined}
            _hover={{ filter: 'brightness(0.8)' }}
          >
            {canEdit && !project.project_id && <FiEdit2 color="white" fontSize="16px" />}
          </Flex>
        </Flex>
        <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" gap="12px">
          {project.metadata.bncc && project.metadata.bncc.length > 0 ? (
            project.metadata.bncc.map((bncc) => {
              const skill = bnccSkills.find((e) => e.tag === bncc);
              return (
                <Flex key={bncc} direction="column" gap="4px" pb="12px" borderBottom="1px" borderColor="gray300" _last={{ borderBottom: 'none', pb: '0px' }}>
                  <Text fontSize="14px" fontWeight="600" color="gray800">
                    {bncc}
                  </Text>
                  <Text fontSize="13px" color="gray600">
                    {skill?.title || ''} {skill?.description ? `- ${skill.description}` : ''}
                  </Text>
                </Flex>
              );
            })
          ) : (
            <Text fontSize="14px" color="gray500">
              Nenhuma habilidade BNCC selecionada
            </Text>
          )}
        </Flex>
      </Flex>
      <SmallModal
        size="6xl"
        title="Habilidades BNCC"
        show={showModal}
        onConfirm={() => setShowModal(false)}
        okText={'Confirmar'}
        onCancel={() => setShowModal(false)}
        topIcon="warning"
      >
        <Table
          rowSelection={{
            type: `checkbox`,
            selectedRowKeys: (project.metadata.bncc || ([] as any)).map((e: any) => e),
            onChange: (keys) =>
              setProject((e) => ({ ...e, metadata: { ...e.metadata, bncc: keys as string[] } })),
          }}
          columns={columns}
          dataSource={dataSource}
          style={{ fontFamily: `'Inter' - sans-serif`, height: 'fit-content' }}
          pagination={{ pageSize: 25 }}
        />
      </SmallModal>
    </>
  );
};
