import { IProjectSourceCode } from '@/_base/interfaces/codeProject/IProject';
import React from 'react';

export type SimulatorCodeHandler = (code: string) => void;

export interface ISimulatorProps {
  showModal: boolean;
  codeHandlerRef: React.RefObject<SimulatorCodeHandler | undefined>;
  iframeUrl: string;
  sourceCodeRef: React.RefObject<IProjectSourceCode>;
  onCloseModal: (state: false) => void;
  onSourceCodeChange: (sourceCode: IProjectSourceCode) => void;
}
