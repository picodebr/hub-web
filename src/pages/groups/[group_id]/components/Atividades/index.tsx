import { Flex, Grid, Text, useUpdateEffect } from '@chakra-ui/react';
import { FiChevronLeft, FiFileText } from 'react-icons/fi';
import { ContentState, EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { EditorProps } from 'react-draft-wysiwyg';

import { IHubGroup } from '@/_base/interfaces/group';

const Editor = dynamic<EditorProps>(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), { ssr: false });

interface IProps {
  group: IHubGroup;
  setGroup: Dispatch<SetStateAction<IHubGroup>>;
}

export const Activities: React.FC<IProps> = ({ group, setGroup }) => {
  const [openEditor, setOpenEditor] = useState(false);
  const [editorValue, setEditorValue] = useState<EditorState>(EditorState.createEmpty());
  const [contentIsMounted, setContentIsMounted] = useState(false);

  useEffect(() => {
    const content = EditorState.createWithContent(
      group.metadata.annotation ? convertFromRaw(JSON.parse(group.metadata.annotation)) : ContentState.createFromText(``),
    );

    setEditorValue(content);
  }, []);

  useUpdateEffect(() => {
    if (contentIsMounted)
      setGroup((g) => ({ ...g, metadata: { ...g.metadata, annotation: JSON.stringify(convertToRaw(editorValue.getCurrentContent())) } }));
    else setContentIsMounted(true);
  }, [editorValue]);

  return (
    <Flex direction="column" gap="24px" overflow={openEditor ? `hidden` : 'auto'} flex="1">
      {openEditor && (
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
      )}
      {!openEditor && (
        <Grid
          gap="1rem"
          gridTemplateColumns="repeat(auto-fill, minmax(220px, 1fr))"
          gridTemplateRows="minmax(min-content, max-content)"
          padding="2rem"
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
        </Grid>
      )}
      {openEditor && (
        <Flex bg="white" flex="1" sx={{ '.hub-editor-wrapper': { w: `100%` }, '.hub-editor-content': { p: `0 1rem` } }}>
          <Editor
            wrapperClassName="hub-editor-wrapper"
            editorClassName="hub-editor-content"
            editorState={editorValue}
            onEditorStateChange={setEditorValue}
          />
        </Flex>
      )}
    </Flex>
  );
};
