import { Flex, Grid, Text, useUpdateEffect } from '@chakra-ui/react';
import { FiChevronLeft, FiFileText } from 'react-icons/fi';
import { ContentState, EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { EditorProps } from 'react-draft-wysiwyg';

import { IHubGroup } from '@/_base/interfaces/group';
import { ITempFile } from '@/_base/interfaces/shared';
import { SmallModal } from '@/components/Modal/Small';
import { FaRegTrashCan } from 'react-icons/fa6';
import { TextInput } from '@/components/Inputs/Text';
import { useInputHandler } from '@/_base/hooks';
import { ColorPicker } from '@/components/ColorPicker';

const Editor = dynamic<EditorProps>(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), { ssr: false });

interface ICustomActivity extends ITempFile {
  id?: string;
  error?: string;
  title: string;
  color?: string;
}

interface IProps {
  group: IHubGroup;
  setGroup: Dispatch<SetStateAction<IHubGroup>>;
  canEdit: boolean;
  setActivityFiles: Dispatch<SetStateAction<ITempFile[]>>;
}

export const Activities: React.FC<IProps> = ({ group, setGroup, canEdit, setActivityFiles }) => {
  const [openEditor, setOpenEditor] = useState(false);
  const [editorValue, setEditorValue] = useState<EditorState>(EditorState.createEmpty());
  const [contentIsMounted, setContentIsMounted] = useState(false);
  const [customActivities, setCustomActivities] = useState<ICustomActivity[]>([]);
  const [targetCustomActivity, setTargetCustomActivity] = useState<ICustomActivity | null>(null);

  useEffect(() => {
    const content = EditorState.createWithContent(
      group.metadata.annotation ? convertFromRaw(JSON.parse(group.metadata.annotation)) : ContentState.createFromText(``),
    );

    setEditorValue(content);
  }, []);

  useUpdateEffect(() => {
    if (!canEdit) return;

    if (contentIsMounted)
      setGroup((g) => ({ ...g, metadata: { ...g.metadata, annotation: JSON.stringify(convertToRaw(editorValue.getCurrentContent())) } }));
    else setContentIsMounted(true);
  }, [editorValue]);

  const uploadCallback = (file: File) => {
    return new Promise((resolve) => {
      const reader = new window.FileReader();
      reader.onloadend = async () => {
        const form_data = new FormData();
        form_data.append('file', file);
        const path = URL.createObjectURL(file);
        setActivityFiles((f) => [...f, { path, file }]);
        resolve({ data: { link: path } });
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <Flex direction="column" gap="24px" overflow={openEditor ? `hidden` : 'auto'} flex="1">
      {openEditor ? (
        <>
          <Flex
            color="primary700"
            align="center"
            fontWeight="500"
            border="1px"
            borderColor="primary700"
            borderRadius="md"
            w="fit-content"
            p=".25rem .75rem .25rem .25rem"
            m="5px"
            cursor="pointer"
            transition="all 0.175s"
            _hover={{ transform: `scale(1.05)` }}
            onClick={() => setOpenEditor(false)}
            bg="white"
          >
            <FiChevronLeft fontSize="20px" />
            <Text>Atividades</Text>
          </Flex>
          <Flex bg="white" flex="1" sx={{ '.hub-editor-wrapper': { w: `100%` }, '.hub-editor-content': { p: `0 1rem` } }} overflow="hidden">
            <Editor
              toolbar={{
                image: {
                  uploadEnabled: true,
                  previewImage: true,
                  uploadCallback,
                },
              }}
              wrapperClassName="hub-editor-wrapper"
              editorClassName="hub-editor-content"
              editorState={editorValue}
              onEditorStateChange={setEditorValue}
            />
          </Flex>
        </>
      ) : (
        <Grid
          gap="1rem"
          gridTemplateColumns="repeat(auto-fill, minmax(220px, 1fr))"
          gridTemplateRows="minmax(min-content, max-content)"
          borderRadius="md"
          flex="1"
        >
          <Flex
            w="220px"
            h="183px"
            p="12px"
            gap="4px"
            display="flex"
            direction="column"
            bg="white"
            borderRadius="10px"
            border="1px"
            borderColor="gray300"
            cursor="pointer"
            _hover={{ bg: 'gray50' }}
            onClick={() => setOpenEditor(true)}
          >
            <Flex align="center" color="primary500" gap="4px" fontWeight="500">
              <FiFileText />
              Anotações
            </Flex>
          </Flex>
          {customActivities.map((activity) => (
            <Flex
              w="220px"
              h="183px"
              p="12px"
              gap="4px"
              display="flex"
              direction="column"
              bg="white"
              borderRadius="10px"
              border="1px"
              borderColor="gray300"
              cursor="pointer"
              _hover={{ bg: 'gray50' }}
              // onClick={() => setOpenEditor(true)}
            >
              <Flex align="center" color="primary500" gap="4px" fontWeight="500">
                <FiFileText />
                {activity.title}
              </Flex>
            </Flex>
          ))}
          <Flex
            w="220px"
            h="183px"
            p="12px"
            gap="4px"
            display="flex"
            direction="column"
            bg="white"
            borderRadius="10px"
            border="1px"
            borderColor="gray300"
            cursor="pointer"
            _hover={{ bg: 'gray50' }}
            onClick={() => setOpenEditor(true)}
          >
            <Flex align="center" color="primary500" gap="4px" fontWeight="500">
              <FiFileText />
              Anotações
            </Flex>
          </Flex>
        </Grid>
      )}
      <SmallModal
        show={!!targetCustomActivity}
        onConfirm={() => setCustomActivities((c) => [...c, targetCustomActivity as ICustomActivity])}
        onCancel={() => setTargetCustomActivity(null)}
        onClose={() => setTargetCustomActivity(null)}
        disableOkButton={!canEdit}
        size="2xl"
      >
        {!!targetCustomActivity?.id && (
          <Flex justify="flex-end" m="-0.5rem 1.5rem 0">
            <Flex
              align="center"
              justify="center"
              color="primary500"
              border="1px"
              borderColor="gray300"
              p=".35rem .35rem .38rem .38rem"
              cursor="pointer"
              borderRadius="50%"
              transition="0.1s"
              _hover={{
                borderColor: `primary500`,
              }}
              onClick={() => canEdit && setCustomActivities((c) => c.filter((e) => e.id !== targetCustomActivity.id))}
            >
              <FaRegTrashCan fontSize="1rem" />
            </Flex>
          </Flex>
        )}
        <Flex direction="column" gap="1rem" flex="1">
          <Flex gap="1rem" align="flex-end">
            <TextInput
              isDisabled={!canEdit}
              flex="1"
              label="Título"
              placeholder="Informe o título da tarefa"
              _placeholder={{ fontSize: '14px' }}
              error={targetCustomActivity?.error}
              value={targetCustomActivity?.title || ``}
              onInputChange={(value) => setTargetCustomActivity((e) => (e ? { ...e, title: value } : null))}
            />
            <Flex gap="1rem" align="center" mb="0.45rem">
              <ColorPicker
                onChange={(value) => setTargetCustomActivity((e) => (e ? { ...e, color: value } : null))}
                enableInput={false}
                color={targetCustomActivity?.color}
              />
              <Text fontWeight="500" whiteSpace="nowrap">
                Cor de fundo
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </SmallModal>
    </Flex>
  );
};
