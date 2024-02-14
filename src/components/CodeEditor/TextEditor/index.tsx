import React, { useCallback, useEffect, useRef } from 'react';
import MonacoEditor, { OnChange, OnMount } from '@monaco-editor/react';

import { ICodeEditor } from '../interfaces';
import { Container } from './styles';
import { headerEvents } from '@/components/Page/components/Header/HeaderEvents';

export const TextEditor: React.FC<ICodeEditor> = ({ sourceCodeRef, onSourceCodeChange, editorErrors = [] }) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }, []);

  const handleSourceCodeChange: OnChange = useCallback(
    (code) => {
      onSourceCodeChange({
        ...sourceCodeRef.current,
        code: code || '',
      });
    },
    [onSourceCodeChange, sourceCodeRef],
  );

  const handleUndo = useCallback(() => {
    editorRef.current.trigger('myapp', 'undo');
  }, []);

  const handleRedo = useCallback(() => {
    editorRef.current.trigger('myapp', 'redo');
  }, []);

  useEffect(() => {
    headerEvents.addListener('undo', handleUndo);
    headerEvents.addListener('redo', handleRedo);

    return () => {
      headerEvents.removeListener('undo', handleUndo);
      headerEvents.removeListener('redo', handleRedo);
    };
  }, [handleRedo, handleUndo]);

  useEffect(() => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor || !editorErrors.length) return;

    monaco.editor.setModelMarkers(
      editor.getModel(),
      'myapp',
      editorErrors.map((err) => ({
        startLineNumber: err.line,
        startColumn: err.column,
        message: err.message,
        severity: 8,
      })),
    );
  }, [editorErrors, monacoRef]);

  return (
    <Container>
      <MonacoEditor defaultLanguage="cpp" defaultValue={sourceCodeRef.current.code} onChange={handleSourceCodeChange} onMount={handleEditorMount} />
    </Container>
  );
};
