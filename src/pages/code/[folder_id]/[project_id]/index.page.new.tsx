/**
 * Página Principal (Home) - Orquestrador da Interface.
 *
 * Este é o componente central onde o Blockly e o Palco coabitam. Ele gerencia:
 * 1. O layout responsivo entre o editor de blocos e o palco de simulação.
 * 2. A transição para o modo de "Upload" (C++ Preview).
 * 3. A integração com hooks globais de execução (`useCodeExecution`) e entrada (`useKeyboardInput`).
 * 4. O registro do workspace do Blockly no contexto global para persistência.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import BlocklyWorkspace, { BlocklyWorkspaceRef } from './components/BlocklyWorkspace';
import StageBridge from './components/StageBridge';
import StageArea from './components/StageArea';
import SpriteList from './components/SpriteList';
import CodePreview from './components/CodePreview';
import { useStage } from '@/_base/context/StageContext';
import { useCodeExecution } from '@/_base/hooks/useCodeExecution';
import { useKeyboardInput } from '@/_base/hooks/useKeyboardInput';
import { getCodeProject } from '@/_base/services/codeProject';
import { cookieManager } from '@/_base/utils';
import { ICodeProject, IProjectSourceCode } from '@/_base/interfaces/codeProject/IProject';
import { GetServerSideProps } from 'next';
import { isUuid } from 'uuidv4';
import CodeNavbar from './components/Navbar';

const getDefaultSourceCode = (project: ICodeProject | null) =>
  project?.source_code ||
  ({
    code: '',
    mode: 'block',
    simulation_elements_layout: [],
    variables: [],
  } as IProjectSourceCode);

interface IProps {
  project: ICodeProject | null;
  isDefaultProject: boolean;
  iframeUrl: string;
  projectId: string;
  folderId: string;
}

const NewCode: React.FC = () => {
  const stageContext = useStage();
  const { isUploadMode, isSerialConnected, restoreBoard } = stageContext;

  const blocklyRef = useRef<BlocklyWorkspaceRef>(null);

  // Register blocklyRef with StageContext so Navbar can access it for saving
  useEffect(() => {
    stageContext.setBlocklyWorkspaceRef(blocklyRef);
  }, [stageContext.setBlocklyWorkspaceRef]);

  // --- HOOKS ---
  const { executeSpriteCode, handleRun, handleStop, handleBlockClick, handleRunCode } = useCodeExecution(blocklyRef);

  useKeyboardInput(blocklyRef, executeSpriteCode);

  // --- UI STATE ---
  const [isCodePanelOpen, setIsCodePanelOpen] = useState(false);

  return (
    <div className="flex flex-column flex-1">
      <CodeNavbar />
      <StageBridge />

      <div className="container-fluid flex-grow-1 d-flex flex-column px-0" style={{ overflow: 'hidden' }}>
        <div className="row h-100 g-0">
          {/* BLOCKLY CONTAINER - Smooth Transition */}
          <div
            className="p-0"
            id="blockly-container"
            style={{
              transition: 'all 0.4s ease-in-out',
              flex: isUploadMode ? '0 0 100%' : '0 0 66.66667%',
              width: isUploadMode ? '100%' : '66.66667%',
              maxWidth: isUploadMode ? '100%' : '66.66667%',
            }}
          >
            <BlocklyWorkspace ref={blocklyRef} onBlockClick={handleBlockClick} onRunCode={handleRunCode} />
          </div>

          {/* Floating Code Preview Overlay - Always render for Smooth Transitions */}
          <CodePreview isOpen={isCodePanelOpen} isUploadMode={isUploadMode} onToggle={() => setIsCodePanelOpen(false)} />

          {/* Floating button to reopen code panel when hidden - Animated */}
          <button
            className="btn shadow-sm position-absolute d-flex align-items-center justify-content-center"
            style={{
              right: '30px',
              top: '80px',
              width: '45px',
              height: '45px',
              borderRadius: '12px',
              zIndex: 1000,
              backgroundColor: '#131432',
              border: 'none',
              color: '#fff',
              transition: 'all 0.4s ease-in-out',
              opacity: isUploadMode && !isCodePanelOpen ? 1 : 0,
              transform: isUploadMode && !isCodePanelOpen ? 'scale(1)' : 'scale(0.5)',
              pointerEvents: isUploadMode && !isCodePanelOpen ? 'all' : 'none',
            }}
            onClick={() => setIsCodePanelOpen(true)}
          >
            <i className="bi bi-code-slash" style={{ fontSize: '1.2rem' }}></i>
          </button>

          {/* RIGHT PANEL: STAGE & MANAGEMENT - Smooth Transition */}
          <div
            className={`p-0 bg-light ${!isUploadMode ? 'border-start' : ''}`}
            id="right-panel"
            style={{
              transition: 'all 0.4s ease-in-out',
              flex: isUploadMode ? '0 0 0' : undefined,
              width: isUploadMode ? '0' : undefined,
              maxWidth: isUploadMode ? '0' : undefined,
              opacity: isUploadMode ? 0 : 1,
              pointerEvents: isUploadMode ? 'none' : 'auto',
              overflowX: 'hidden',
              overflowY: 'auto' /* Allow scrolling the whole panel if needed */,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {!isUploadMode && (
              <>
                {/* 1. STAGE SECTION (FIXED SIZE) */}
                <div className="stage-section d-flex flex-column border-bottom bg-white" style={{ flex: '0 0 auto' }}>
                  <div className="stage-header d-flex justify-content-between align-items-center p-2 bg-light border-bottom">
                    <div className="d-flex align-items-center">
                      <h6 className="m-0 fw-bold text-secondary me-2">
                        <i className="bi bi-aspect-ratio me-1"></i>Palco
                      </h6>
                      <button
                        id="btnInteractBoard"
                        className="btn btn-sm btn-outline-secondary py-0 px-2"
                        style={{ fontSize: '0.75rem', borderRadius: '20px' }}
                        onClick={() => restoreBoard()} // Restore & Connect
                        title={isSerialConnected ? 'Clique para restaurar novamente' : 'Clique para interagir (Restaurar Firmware)'}
                      >
                        <i
                          className={`bi ${isSerialConnected ? 'bi-usb-plug-fill' : 'bi-usb-plug'}`}
                          style={{ color: isSerialConnected ? '#22c55e' : 'inherit' }}
                        ></i>
                        Interagir Placa
                      </button>
                    </div>
                    <div className="stage-controls">
                      <button id="btnGo" className="btn btn-link p-0 me-2 btn-go" title="Iniciar" onClick={handleRun}>
                        <i className="bi bi-flag-fill"></i>
                      </button>
                      <button id="btnStop" className="btn btn-link p-0 btn-stop" title="Parar" onClick={handleStop}>
                        <i className="bi bi-stop-fill"></i>
                      </button>
                    </div>
                  </div>

                  <StageArea />
                </div>

                {/* 2. MANAGEMENT SECTION (DYNAMIC SIZE & SCROLL) */}
                <div className="management-section flex-grow-1 d-flex flex-column">
                  <SpriteList />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default NewCode;

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  cookieManager.updateToken(req);

  const projectId = query.project_id || ``;
  const folderId = query.folder_id || ``;
  const pageTitle = query._p || `Novo Projeto`;
  let project = null;

  try {
    project = await getCodeProject(`${projectId}`);
  } catch {
    project = null;
  }

  return {
    props: {
      selectedPage: 'code',
      pageTitle,
      projectId: isUuid(`${projectId}`) ? projectId : null,
      folderId,
      project,
      isDefaultProject: projectId === `example` || !projectId,
      iframeUrl: process.env.NEXT_PUBLIC_PHYSICAL_SIMULATOR_URL || '',
      hideHeaderOnMobile: true,
      fullScreenOnMobile: true,
    },
  };
};
