/**
 * Página Principal (Home) - Orquestrador da Interface.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import CodePreview from './components/CodePreview';
import { useCodeExecution } from '@/_base/hooks/Code/useCodeExecution';
import { getCodeProject } from '@/_base/services/codeProject';
import { cookieManager } from '@/_base/utils';
import { ICodeProject } from '@/_base/interfaces/codeProject/IProject';
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
import { Flex, Button } from '@chakra-ui/react'; // Importei o Button do Chakra

interface IProps {
  project: ICodeProject | null;
  isDefaultProject: boolean;
  iframeUrl: string;
  projectId: string;
  folderId: string;
}

const NewCode: React.FC<IProps> = ({ project }) => {
  const { isUploadMode, activeExtensions, isStageFullScreen, setIsStageFullScreen, setShowRestoreConfirmModal } = useUI();

  const { isSerialConnected, restoreBoard } = useFirmware();
  const { isRecognitionWindowOpen, setIsRecognitionWindowOpen } = useProject();
  const runnerContext = useExecutionRunner();

  const blocklyRef = useRef<BlocklyWorkspaceRef | null>(null);

  const { setBlocklyWorkspaceRef } = runnerContext;
  useEffect(() => {
    setBlocklyWorkspaceRef(blocklyRef);
  }, [setBlocklyWorkspaceRef]);

  const { handleRun, handleStop, handleBlockClick, handleRunCode } = useCodeExecution(blocklyRef);

  useEffect(() => {
    if (isUploadMode) {
      handleStop();
    }
  }, [isUploadMode, handleStop]);

  useEffect(() => {
    const handleConfirmRestore = () => {
      handleStop();
      restoreBoard();
    };

    window.addEventListener('confirm-restore-board', handleConfirmRestore);
    return () => window.removeEventListener('confirm-restore-board', handleConfirmRestore);
  }, [handleStop, restoreBoard]);

  const [isCodePanelOpen, setIsCodePanelOpen] = useState(false);

  // --- Forçar Modo Paisagem e Tela Cheia ---
  const forceLandscapeMode = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      }
      
      // Tenta travar a orientação usando a Screen Orientation API
      // Nota: Nem todos os navegadores mobile (ex: Safari) suportam isso 100%
      if (window.screen && window.screen.orientation && 'lock' in window.screen.orientation) {
        // @ts-ignore
        await window.screen.orientation.lock('landscape');
      }
    } catch (error) {
      console.warn('Bloqueio de orientação não suportado ou negado pelo navegador:', error);
    }
  };

  return (
    <>
      {/* 
        ESTILOS GLOBAIS PARA O OVERLAY DE PORTRAIT 
        Só aparecerá em telas menores que 1024px quando o celular estiver em pé.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        .portrait-lock-overlay {
          display: none;
        }
        @media screen and (max-width: 1024px) and (orientation: portrait) {
          .portrait-lock-overlay {
            display: flex !important;
          }
          .main-ide-content {
            display: none !important;
          }
        }
      `}} />

      {/* OVERLAY DE BLOQUEIO (MODO PORTRAIT) */}
      <div 
        className="portrait-lock-overlay"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#131432',
          color: 'white',
          zIndex: 99999,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem'
        }}
      >
        <i className="bi bi-phone-landscape" style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}></i>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Gire o seu dispositivo</h2>
        <p style={{ marginBottom: '2rem' }}>
          Para programar e visualizar o palco corretamente, precisamos que a tela esteja na horizontal.
        </p>
        <Button colorScheme="blue" onClick={forceLandscapeMode}>
          Entrar em Tela Cheia e Girar
        </Button>
      </div>

      {/* CONTEÚDO PRINCIPAL (Recebe a classe main-ide-content para ser escondido no portrait) */}
      <Flex className="main-ide-content" direction="column" flex="1" position="fixed" top="0" left="0" right="0" bottom="0" overflow="hidden" zIndex="100">
        <CodeNavbar project={project} />
        <div className="d-flex flex-column flex-grow-1 overflow-hidden" style={{ position: 'relative' }}>
          <StageBridge />

          <div className="container-fluid flex-grow-1 d-flex flex-column px-0" style={{ overflow: 'hidden' }}>
          <div className="d-flex h-100 flex-nowrap w-100">
            {/* BLOCKLY CONTAINER */}
            <div
              className="p-0"
              id="blockly-container"
              style={{
                minWidth: 0,
                border: `none`,
              }}
            >
              <BlocklyWorkspace ref={blocklyRef} onBlockClick={handleBlockClick} onRunCode={handleRunCode} />
            </div>

            {!isUploadMode && <MLRecognitionWindow isOpen={isRecognitionWindowOpen} onClose={() => setIsRecognitionWindowOpen(false)} />}

            <BoardConnectionWarningModal />
            <DeviceLostModal />
            <RestoreConfirmModal />
            <UploadTimeoutModal />

            <CodePreview isOpen={isCodePanelOpen} isUploadMode={isUploadMode} onToggle={() => setIsCodePanelOpen(false)} />

            <button
              className="btn shadow-sm position-absolute d-flex align-items-center justify-content-center"
              style={{
                right: '15px',
                top: '10px',
                width: '45px',
                height: '45px',
                borderRadius: '12px',
                zIndex: 1000,
                backgroundColor: '#131432',
                border: 'none',
                color: '#fff',
                opacity: isUploadMode && !isCodePanelOpen ? 1 : 0,
                transform: isUploadMode && !isCodePanelOpen ? 'scale(1)' : 'scale(0.5)',
                pointerEvents: isUploadMode && !isCodePanelOpen ? 'all' : 'none',
              }}
              onClick={() => setIsCodePanelOpen(true)}
            >
              <i className="bi bi-code-slash" style={{ fontSize: '1.2rem' }}></i>
            </button>

              {/* Floating button */}
              <button
                className="btn shadow-sm position-absolute d-flex align-items-center justify-content-center"
                style={{
                  right: '15px', top: '10px', width: '45px', height: '45px', borderRadius: '12px',
                  zIndex: 1000, backgroundColor: '#131432', border: 'none', color: '#fff',
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
              className="p-0"
              id="right-panel"
              style={{
                opacity: isUploadMode ? 0 : 1,
                pointerEvents: isUploadMode ? 'none' : 'auto',
                overflow: isUploadMode ? 'hidden' : undefined,
                flex: isUploadMode ? '0 0 0' : undefined,
                backgroundColor: '#e9eef2',
                minWidth: 0,
                display: isUploadMode ? 'none' : 'flex',
                flexDirection: 'column',
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '0px'
              }}
            >
              {!isUploadMode && (
                <>
                  <div
                    className={`stage-section d-flex flex-column ${isStageFullScreen ? 'align-items-center fullscreen' : 'align-items-center'} w-100`}
                    style={{ 
                      flex: isStageFullScreen ? '1' : '0 1 auto', 
                      minHeight: 0,
                      maxHeight: isStageFullScreen ? 'none' : 'calc(100vh - 120px)',
                      backgroundColor: '#e9eef2',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      className="stage-header w-100 d-flex align-items-center px-3"
                      style={{ backgroundColor: '#e9eef2', minHeight: '52px', position: isStageFullScreen ? 'absolute' : 'relative' }}
                    >
                      <div className="d-flex align-items-center justify-content-start" style={{ flex: 1 }}>
                        <div className="stage-controls d-flex align-items-center mb-0 gap-3">
                          <button
                            id="btnGo"
                            className={`btn btn-link p-0 btn-go d-flex align-items-center ${runnerContext.isAnyCodeRunning ? 'inactive' : 'active'}`}
                            title="Play"
                            onClick={(e) => {
                              handleRun();
                              e.currentTarget.blur();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === ' ') e.preventDefault();
                            }}
                          >
                            <i className="bi bi-play-fill" style={{ fontSize: '1.8rem' }}></i>
                          </button>
                          <button
                            id="btnStop"
                            className={`btn btn-link p-0 btn-stop d-flex align-items-center ${runnerContext.isAnyCodeRunning ? 'active' : 'inactive'}`}
                            title="Parar"
                            onClick={(e) => {
                              handleStop();
                              e.currentTarget.blur();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === ' ') e.preventDefault();
                            }}
                          >
                            <i className="bi bi-octagon-fill" style={{ fontSize: '1.4rem' }}></i>
                          </button>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-end gap-3" style={{ flex: 1 }}>
                        <button
                          id="btnMaximize"
                          className="btn btn-link p-0 d-flex align-items-center text-secondary"
                          title={isStageFullScreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
                          style={{ transition: 'color 0.2s' }}
                          onClick={(e) => {
                            setIsStageFullScreen(!isStageFullScreen);
                            e.currentTarget.blur();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === ' ') e.preventDefault();
                          }}
                        >
                          <i className={`bi ${isStageFullScreen ? 'bi-fullscreen-exit' : 'bi-arrows-fullscreen'}`} style={{ fontSize: '1.1rem' }}></i>
                        </button>
                        {activeExtensions.includes('piboard') && (
                          <button
                            id="btnInteractBoard"
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center py-0 px-2 flex-shrink-0"
                            style={{ fontSize: '0.75rem', borderRadius: '20px', backgroundColor: '#fff' }}
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
                              style={{ color: isSerialConnected ? '#22c55e' : 'inherit', fontSize: '1rem' }}
                            ></i>
                            <span>Interagir Placa</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <StageArea />
                  </div>

                  <div className="management-section flex-grow-1 d-flex flex-column align-items-center w-100">
                    <SpriteList />
                  </div>
                </>
              )}
            </div>
              
            </div>
          </div>
        </div>
      </Flex>
    </>
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
      fullScreen: true
    },
  };
};
