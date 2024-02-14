import React, { useEffect, useState } from 'react';

import { BlockEditor } from './BlockEditor';
import { ICodeEditor } from './interfaces';
import { TextEditor } from './TextEditor';
import { SourceCodeMode } from '@/_base/interfaces/codeProject/IProject';

const codeEditors: Record<SourceCodeMode, React.FC<ICodeEditor>> = {
  text: TextEditor,
  block: BlockEditor,
};

export const CodeEditor: React.FC<ICodeEditor> = (props) => {
  const [editor, setEditor] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    props.sourceCodeRef ||= { current: { code: '', mode: 'block', simulation_elements_layout: [], variables: [] } };

    const EditorElement = codeEditors[props.sourceCodeRef.current.mode as SourceCodeMode];

    setEditor(<EditorElement {...props} />);
  }, [props]);

  if (!editor) return <></>;

  return editor;
};
