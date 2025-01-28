import { Flex, Text } from '@chakra-ui/react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Dispatch, SetStateAction, useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { EditableTextInput } from '@/components/Inputs/EditableText';
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
  onChangeFiles: (data: File[]) => void;
  bnccSkills: IBnccSkill[];
  canEdit: boolean;
}

export const About: React.FC<IProps> = ({ project, setProject, bnccSkills, canEdit }) => {
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
      <motion.div
        key={'About'}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ display: `flex`, overflow: `auto`, flexDirection: `column`, gap: `24px` }}
      >
        <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300">
          <Flex pb={4} direction="column" gap="6px">
            <Text fontSize="14px" fontWeight="500" color="gray800">
              Nome do projeto
            </Text>
            <EditableTextInput
              isDisabled={!canEdit || !!project.project_id}
              value={project.title || ''}
              onInputChange={(title) => setProject((e) => ({ ...e, title }))}
            />
          </Flex>
          <Flex pb={4} direction="column" gap="6px">
            <Text fontSize="14px" fontWeight="500" color="gray800">
              Objetivo
            </Text>
            <EditableTextInput
              isDisabled={!canEdit || !!project.project_id}
              value={project.description || ''}
              onInputChange={(description) => setProject((e) => ({ ...e, description }))}
            />
          </Flex>
        </Flex>
        <Flex gap="0px" direction="column">
          <Flex
            w="100%"
            h="42px"
            bg="primary500"
            p="12px 30px 12px 12px"
            color="white"
            borderTopRadius="10px"
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
          <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderBottomRadius="10px" border="1px" borderColor="gray300">
            {project.metadata.bncc
              ?.reduce(
                (acc, bncc) => {
                  const subject = bnccSkills.find((e) => e.tag === bncc)?.subject || ``;
                  const target = acc.find((e) => e.subject === subject);
                  const listItem = `${bncc} - ${bnccSkills.find((e) => e.tag === bncc)?.title || ''}`;
                  if (target) target.list.push(listItem);
                  else acc.push({ subject, list: [listItem] });
                  return acc;
                },
                [] as Array<{ subject: string; list: string[] }>,
              )
              .map((bncc) => (
                <Flex key={bncc.subject} pb={4} direction="column" gap="6px">
                  <Text fontSize="14px" fontWeight="500" color="gray800">
                    {bncc.subject}
                  </Text>
                  <Flex p="8px" border="1px" borderColor="gray300" borderRadius="8px" color="gray800" direction="column" gap="6px">
                    {bncc.list.map((e) => (
                      <Flex key={e}>{e}</Flex>
                    ))}
                  </Flex>
                </Flex>
              ))}
          </Flex>
        </Flex>
      </motion.div>
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
            selectedRowKeys: (project.metadata.bncc || ([] as any)).map((e: any) => e.tag),
            onChange: (keys) =>
              setProject((e) => ({ ...e, metadata: { ...e.metadata, bncc: bnccSkills.filter((e) => keys.includes(e.tag)).map((e) => e.tag) } })),
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
