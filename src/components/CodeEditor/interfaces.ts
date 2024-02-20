import { IBoard } from '@/_base/interfaces/boards/IBoard';
import { IProjectSourceCode } from '@/_base/interfaces/codeProject/IProject';

export interface ICodeEditorError {
  line: number;
  column: number;
  message: string;
}

export interface ICodeEditor {
  sourceCodeRef: React.MutableRefObject<IProjectSourceCode>;
  onSourceCodeChange: (sourceCode: IProjectSourceCode) => void;
  board: IBoard;
  editorErrors: ICodeEditorError[];
}
