import { Flex, Grid, Link, Text } from '@chakra-ui/react';
import { Image, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Dispatch, SetStateAction, useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import mimetype from 'mime';

import { EditableTextInput } from '@/components/Inputs/EditableText';
import { IProject } from '@/_base/interfaces/project';
import { IBnccSkill } from '@/_base/interfaces/shared/IBnccSkill';
import { SmallModal } from '@/components/Modal/Small';
import { FileInput } from '@/components/Inputs/File';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { TbFileText } from 'react-icons/tb';
import { FiTrash } from 'react-icons/fi';

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
}

export const About: React.FC<IProps> = ({ project, setProject, bnccSkills, onChangeFiles }) => {
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
      <Flex direction="column" gap="24px" overflow="auto">
        <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300">
          <Flex pb={4} direction="column" gap="6px">
            <Text fontSize="14px" fontWeight="500">
              Nome do projeto
            </Text>
            <EditableTextInput value={project.title || ''} onInputChange={(title) => setProject((e) => ({ ...e, title }))} />
          </Flex>
          <Flex pb={4} direction="column" gap="6px">
            <Text fontSize="14px" fontWeight="500">
              Objetivo
            </Text>
            <EditableTextInput value={project.description || ''} onInputChange={(description) => setProject((e) => ({ ...e, description }))} />
          </Flex>
        </Flex>
        <Flex gap="0px" direction="column">
          <Flex w="100%" h="42px" bg="primary300" p="12px" color="white" borderTopRadius="10px" fontWeight="500" align="center">
            Etapas
          </Flex>
          <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderBottomRadius="10px" border="1px" borderColor="gray300">
            {project.metadata?.steps?.map((step) => (
              <Flex key={step.title} pb={4} direction="column" gap="6px">
                <Text fontSize="14px" fontWeight="500">
                  {step.title}
                </Text>
                <EditableTextInput value={step.description || ``} />
              </Flex>
            ))}
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
              onClick={() => setShowModal(true)}
              border="1px"
              borderColor="white"
              borderRadius="4px"
              p="2px"
              cursor="pointer"
              _hover={{ filter: 'brightness(0.8)' }}
            >
              <FiEdit2 color="white" fontSize="16px" />
            </Flex>
          </Flex>
          <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderBottomRadius="10px" border="1px" borderColor="gray300">
            {project.metadata.bncc?.map((bncc) => (
              <Flex key={bncc.tag} pb={4} direction="column" gap="6px">
                <Text fontSize="14px" fontWeight="500">
                  {bncc.subject}
                </Text>
                <Flex p="8px" border="1px" borderColor="gray300" borderRadius="8px">
                  {`${bncc.tag} - ${bncc.title}`}
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Flex gap="0px" direction="column">
          <Flex w="100%" h="42px" bg="primary400" p="12px" color="white" borderTopRadius="10px" fontWeight="500" align="center">
            Apresentação
          </Flex>
          <Flex
            w="100%"
            h="auto"
            p="20px"
            display="flex"
            direction="column"
            bg="white"
            borderBottomRadius="10px"
            border="1px"
            borderColor="gray300"
            gap="1rem"
          >
            <TextAreaInput
              w="100%"
              rows={6}
              value={project.metadata.presentation || ``}
              onInputChange={(presentation) => setProject((e) => ({ ...e, metadata: { ...e.metadata, presentation } }))}
            />
            <FileInput onChange={onChangeFiles} />

            <Grid gap="1rem" gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))" gridTemplateRows="minmax(min-content, max-content)">
              {project.metadata.attachments?.map((attachment, i) => (
                <Flex key={attachment} borderRadius="md" overflow="hidden" position="relative">
                  <Flex
                    position="absolute"
                    top="0.25rem"
                    right="0.25rem"
                    color="primary500"
                    zIndex="99"
                    cursor="pointer"
                    _hover={{ filter: 'brightness(0.9)' }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setProject((e) => ({
                        ...e,
                        metadata: { ...e.metadata, attachments: e.metadata.attachments?.filter((e) => !e.endsWith(attachment)) },
                      }));
                    }}
                  >
                    <FiTrash />
                  </Flex>
                  {mimetype.getType(attachment)?.startsWith('image') ? (
                    <Image key={`${i + 1}`} src={attachment} width="100%" height="100%" />
                  ) : mimetype.getType(attachment)?.startsWith('video') ? (
                    <video key={`${i + 1}`} width="100%" height="100%" controls>
                      <source src={attachment} />
                    </video>
                  ) : (
                    <Link target="_blank" href={attachment} w="100%" h="100%">
                      <Flex
                        key={`${i + 1}`}
                        w="100%"
                        h="100%"
                        bg="gray300"
                        overflow="hidden"
                        direction="column"
                        align="center"
                        justify="center"
                        gap="0.5rem"
                        fontWeight="500"
                      >
                        <TbFileText fontSize="2rem" />
                        <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                          {attachment.length > 20 ? `${attachment.slice(0, 14)}...${attachment.slice(-6)}` : attachment}
                        </Text>
                      </Flex>
                    </Link>
                  )}
                </Flex>
              ))}
            </Grid>
          </Flex>
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
            selectedRowKeys: (project.metadata.bncc || ([] as any)).map((e: any) => e.tag),
            onChange: (keys) => setProject((e) => ({ ...e, metadata: { ...e.metadata, bncc: bnccSkills.filter((e) => keys.includes(e.tag)) } })),
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
