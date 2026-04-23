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
import CodePreview from './components/CodePreview';
import { useCodeExecution } from '@/_base/hooks/Code/useCodeExecution';
import { getCodeProject } from '@/_base/services/codeProject';
import { cookieManager } from '@/_base/utils';
import { ICodeProject, IProjectSourceCode } from '@/_base/interfaces/codeProject/IProject';
import { GetServerSideProps } from 'next';
import { isUuid } from 'uuidv4';
import { useUI } from '@/_base/context/UIContext';
import { useFirmware } from '@/_base/context/FirmwareContext';
import { useProject } from '@/_base/context/ProjectContext';
import { useExecutionRunner } from '@/_base/context/ExecutionRunnerContext';
import { MLRecognitionWindow } from './components/ml/MLRecognitionWindow';
import { BlocklyWorkspaceRef } from '@/_base/domain/entities';
import StageBridge from './components/stage/StageBridge';
import BlocklyWorkspace from './components/blockly/BlocklyWorkspace';
import StageArea from './components/stage/StageArea';
import SpriteList from './components/sprites/SpriteList';
import { BoardConnectionWarningModal } from './components/modals/BoardConnectionWarningModal';
import { DeviceLostModal } from './components/modals/DeviceLostModal';
import { RestoreConfirmModal } from './components/modals/RestoreConfirmModal';
import { UploadTimeoutModal } from './components/modals/UploadTimeoutModal';
import CodeNavbar from './components/Navbar';
import { Flex } from '@chakra-ui/react';

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

const NewCode: React.FC<IProps> = ({ project, isDefaultProject, iframeUrl, projectId, folderId }) => {
  console.log('project: ', project);
  const { isUploadMode, activeExtensions, isStageFullScreen, setIsStageFullScreen, setShowRestoreConfirmModal } = useUI();

  const { isSerialConnected, restoreBoard } = useFirmware();
  const { isRecognitionWindowOpen, setIsRecognitionWindowOpen } = useProject();
  const runnerContext = useExecutionRunner();

  const blocklyRef = useRef<BlocklyWorkspaceRef | null>(null);

  // Registra blocklyRef no ExecutionRunnerContext para que Navbar/Runner possam acessá-lo
  const { setBlocklyWorkspaceRef } = runnerContext;
  useEffect(() => {
    setBlocklyWorkspaceRef(blocklyRef);
  }, [setBlocklyWorkspaceRef]);

  // --- HOOKS ---
  const { handleRun, handleStop, handleBlockClick, handleRunCode } = useCodeExecution(blocklyRef);

  useEffect(() => {
    if (isUploadMode) {
      handleStop();
    }
  }, [isUploadMode, handleStop]);

  // --- MODAL EVENT LISTENERS ---
  useEffect(() => {
    const handleConfirmRestore = () => {
      handleStop();
      restoreBoard();
    };

    window.addEventListener('confirm-restore-board', handleConfirmRestore);
    return () => window.removeEventListener('confirm-restore-board', handleConfirmRestore);
  }, [handleStop, restoreBoard]);

  // --- UI STATE ---
  const [isCodePanelOpen, setIsCodePanelOpen] = useState(false);

  return (
    <Flex direction="column" flex="1" position="fixed" top="0" left="0" right="0" bottom="0" overflow="hidden" zIndex="100">
      <CodeNavbar project={project} />
      <StageBridge />

      <div className="container-fluid flex-grow-1 d-flex flex-column px-0" style={{ overflow: 'hidden' }}>
        <div className="row h-100 g-0 p-0 m-0">
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

          {/* ML Recognition floating window (STAGE MODE ONLY) */}
          {!isUploadMode && <MLRecognitionWindow isOpen={isRecognitionWindowOpen} onClose={() => setIsRecognitionWindowOpen(false)} />}

          {/* Warning Modal for Disconnected Board Runs */}
          <BoardConnectionWarningModal />
          <DeviceLostModal />
          <RestoreConfirmModal />
          <UploadTimeoutModal />

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

          {/* RIGHT PANEL: STAGE & MANAGEMENT */}
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
                          style={{
                            color: isSerialConnected ? '#22c55e' : 'inherit',
                          }}
                        ></i>
                        Interagir Placa
                      </button>
                    </div>

                    {/* RIGHTSIDE: Botões Interagir/Fechar */}
                    <div className="d-flex align-items-center justify-content-end gap-3" style={{ flex: 1 }}>
                      <button
                        id="btnMaximize"
                        className="btn btn-link p-0 d-flex align-items-center text-secondary"
                        title={isStageFullScreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
                        style={{ transition: 'color 0.2s' }}
                        onClick={() => setIsStageFullScreen(!isStageFullScreen)}
                      >
                        <i className={`bi ${isStageFullScreen ? 'bi-fullscreen-exit' : 'bi-arrows-fullscreen'}`} style={{ fontSize: '1.1rem' }}></i>
                      </button>
                      {activeExtensions.includes('piboard') && (
                        <button
                          id="btnInteractBoard"
                          className="btn btn-sm btn-outline-secondary d-flex align-items-center py-0 px-2 flex-shrink-0"
                          style={{
                            fontSize: '0.75rem',
                            borderRadius: '20px',
                            backgroundColor: '#fff',
                          }}
                          onClick={() => {
                            if (!isSerialConnected) {
                              alert('Conecte a placa primeiro clicando no ícone de USB na barra superior.');
                              return;
                            }
                            setShowRestoreConfirmModal(true);
                          }}
                          title={isSerialConnected ? 'Clique para restaurar novamente' : 'Clique para interagir (Restaurar Firmware)'}
                        >
                          <i
                            className={`bi ${isSerialConnected ? 'bi-usb-plug-fill' : 'bi-usb-plug'} me-1`}
                            style={{
                              color: isSerialConnected ? '#22c55e' : 'inherit',
                              fontSize: '1rem',
                            }}
                          ></i>
                          <span>Interagir Placa</span>
                        </button>
                      )}
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
    </Flex>
  );
};
export default NewCode;

export const getServerSideProps: GetServerSideProps = async ({ req, query, params }) => {
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
