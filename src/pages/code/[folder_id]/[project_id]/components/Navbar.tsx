/**
 * Componente Navbar - A barra de navegação principal da aplicação.
 *
 * Este componente gerencia:
 * 1. Interface de conexão USB/Serial.
 * 2. Operações de arquivo (Salvar e Abrir projeto).
 * 3. Alternância entre os modos "Palco" (Simulação) e "Upload" (Hardware).
 * 4. Acionamento do processo de compilação e envio de código.
 */

/**
 * Barra de navegação principal com controles de projeto (Salvar, Abrir, Conectar).
 */
'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import RocketLoader from './shared/RocketLoader';
import SerialMonitor from './serial/SerialMonitor';
import ToolsModal from './shared/ToolsModal';
import { useExecutionRunner } from '@/_base/context/ExecutionRunnerContext';
import { useUI } from '@/_base/context/UIContext';
import { useProject } from '@/_base/context/ProjectContext';
import { useFirmware } from '@/_base/context/FirmwareContext';
import { IProjectContextUI, SerializationService } from '@/_base/services/code';

export default function Navbar() {
  // Contextos globais para gerenciar o estado do palco e da conexão serial
  const runnerContext = useExecutionRunner();
  const uiContext = useUI();
  const projectContext = useProject();

  // UI states from UIContext
  const { isUploadMode, setIsUploadMode, rocketPhase, showRocket, isUploading, isBusy, rocketErrorMessage } = uiContext;

  // Firmware Context
  const { isSerialConnected, connectSerial, disconnectSerial, uploadSketch } = useFirmware();

  // Estados locais para modais específicos
  const [showTools, setShowTools] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);

  // Estado auxiliar para controle visual do botão de upload
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);

  // Helpers de Estado Visual
  const isConnecting = false; // Simplified, or can be tracked inside FirmwareContext if needed
  // Define se o botão deve estar "ativo" (Verde)
  const isActive = isSerialConnected || isConnecting || isBusy || isUploading || isUploadingLocal;

  // Referência para o input de arquivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Adapter to decouple SerializationService from React Contexts
  const contextAdapter: IProjectContextUI = {
    projectId: undefined, // Could be added to a State if needed
    projectName: 'meu_projeto',
    isUploadMode: isUploadMode,
    uploadModeBlocks: uiContext.uploadModeBlocks,
    uploadCode: uiContext.uploadCode,
    setIsUploadMode: setIsUploadMode,
    setUploadModeBlocks: uiContext.setUploadModeBlocks,
    setUploadCode: uiContext.setUploadCode,
    backdrops: projectContext.backdrops,
    activeBackdropId: projectContext.activeBackdropId,
    activeSpriteId: projectContext.activeSpriteId,
    activeExtensions: uiContext.activeExtensions,
    setActiveExtensions: uiContext.setActiveExtensions,
    activeStageMLModel: projectContext.activeStageMLModel,
    setActiveStageMLModel: projectContext.setActiveStageMLModel,
    activeUploadMLModel: projectContext.activeUploadMLModel,
    setActiveUploadMLModel: projectContext.setActiveUploadMLModel,
  };

  /**
   * Lida com a exportação do projeto atual para um arquivo JSON.
   */
  const handleSaveProject = () => {
    const workspace = runnerContext.blocklyWorkspaceRef?.current?.getWorkspace?.();
    SerializationService.saveProject(contextAdapter, 'meu_projeto.json', workspace || undefined);
  };

  /**
   * Abre o seletor de arquivos do sistema.
   */
  const handleOpenProjectClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Processa o arquivo selecionado pelo usuário e carrega os blocos no workspace.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    SerializationService.handleFileSelect(e, contextAdapter);
    // Reseta o valor para permitir selecionar o mesmo arquivo novamente
    if (e.target) e.target.value = '';
  };

  /**
   * Inicia o processo de compilação e upload do código para a placa.
   */
  const handleUpload = async () => {
    if (!isUploadMode) {
      alert('Vá para o modo Upload.');
      return;
    }

    // Delega a lógica complexa de upload para o FirmwareContext
    await uploadSketch();
  };

  return (
    <>
      <nav className="navbar navbar-expand px-3 py-2" style={{ backgroundColor: '#fff', borderBottom: '1px solid #e8e8e8' }}>
        <div className="container-fluid p-0 d-flex align-items-center justify-content-between">
          {/* Logotipo */}
          <a className="navbar-brand d-flex align-items-center" href="#" suppressHydrationWarning={true}>
            <Image src="/img/picode-logo-light.png" alt="PiCode" width={120} height={27} style={{ width: 'auto' }} priority />
          </a>

          {/* Conteúdo Central e Botões de Ação */}
          <div className="d-flex align-items-center flex-grow-1 justify-content-between ms-3">
            <div className="d-flex align-items-center gap-2">
              {/* Botão de Conectar/Desconectar USB */}
              <button
                className="btn btn-sm  d-flex align-items-center gap-2"
                onClick={isSerialConnected ? disconnectSerial : () => connectSerial()}
                disabled={false}
                title={isSerialConnected ? 'Clique para desconectar' : 'Clique para conectar'}
                style={{
                  backgroundColor: isActive ? '#22c55e' : '#f1f5f9',
                  color: isActive ? '#fff' : '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  opacity: 1,
                  cursor: 'pointer',
                }}
              >
                <i className={`bi ${isActive ? 'bi-usb-plug-fill' : 'bi-usb-plug'}`} style={{ fontSize: '14px' }}></i>
                {isSerialConnected || isUploading || isUploadingLocal || isBusy ? 'Conectado' : 'Conectar'}
              </button>

              {/* Botão Salvar */}
              <button
                className="btn btn-sm "
                onClick={handleSaveProject}
                style={{
                  backgroundColor: '#4483ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                }}
              >
                <i className="bi bi-download me-1" style={{ fontSize: '14px' }}></i> Salvar
              </button>

              {/* Botão Abrir */}
              <button
                className="btn btn-sm"
                onClick={handleOpenProjectClick}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '6px 12px',
                }}
              >
                <i className="bi bi-folder2-open me-1" style={{ fontSize: '14px' }}></i> Abrir
              </button>

              {/* Input de Arquivos Escondido */}
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".piboard,.json" onChange={handleFileChange} />
            </div>

            {/* Lado Direito: Alternador de Modo e Ações Específicas */}
            <div className="d-flex align-items-center gap-3">
              {/* Botão de Monitores (Apenas no modo Upload) */}
              {isUploadMode && (
                <button
                  className="btn btn-sm d-flex align-items-center gap-2"
                  onClick={() => setShowTools(true)}
                  title="Ferramentas e Monitores"
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '6px 12px',
                  }}
                >
                  <i className="bi bi-speedometer2" style={{ fontSize: '14px' }}></i> Monitores
                </button>
              )}

              {/* Botão de CARREGAR (Apenas no modo Upload) */}
              {isUploadMode && (
                <button
                  className="btn btn-sm fw-semibold"
                  onClick={() => {
                    setIsUploadingLocal(true);
                    handleUpload().finally(() => setIsUploadingLocal(false));
                  }}
                  disabled={isUploadingLocal || isUploading || !isSerialConnected}
                  title={!isSerialConnected ? 'Conecte a placa primeiro' : ''}
                  style={{
                    backgroundColor: !isSerialConnected ? '#94a3b8' : '#0047b3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    cursor: !isSerialConnected ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isUploadingLocal ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2"></span>Enviando...
                    </span>
                  ) : (
                    <span>
                      <i className="bi bi-lightning-fill me-1" style={{ fontSize: '14px' }}></i> Carregar
                    </span>
                  )}
                </button>
              )}

              {/* Alternador de Modo (Palco vs Upload) */}
              <div
                className="d-flex align-items-center p-1"
                style={{
                  backgroundColor: '#f1f5f9',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <button
                  className="btn btn-sm px-3 fw-semibold d-flex align-items-center gap-2"
                  onClick={() => setIsUploadMode(false)}
                  style={{
                    backgroundColor: !isUploadMode ? '#131432' : 'transparent',
                    color: !isUploadMode ? '#fff' : '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                  }}
                >
                  <i className="bi bi-play-circle-fill" style={{ fontSize: '14px' }}></i> Palco
                </button>
                <button
                  className="btn btn-sm px-3 fw-semibold d-flex align-items-center gap-2"
                  onClick={() => setIsUploadMode(true)}
                  style={{
                    backgroundColor: isUploadMode ? '#131432' : 'transparent',
                    color: isUploadMode ? '#fff' : '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                  }}
                >
                  <i className="bi bi-cpu-fill" style={{ fontSize: '14px' }}></i> Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Modais e Overlays de Carregamento */}

      {/* Animação do Foguete (Carregamento de código) */}
      <RocketLoader isVisible={showRocket} phase={rocketPhase} errorMessage={rocketErrorMessage} />

      {/* Modal de Ferramentas de Sensores */}
      <ToolsModal
        isOpen={showTools}
        onClose={() => setShowTools(false)}
        onOpenSerial={() => {
          setShowTools(false);
          setShowMonitor(true);
        }}
      />

      {/* Monitor Serial (Terminal) */}
      <SerialMonitor
        isOpen={showMonitor}
        onClose={() => setShowMonitor(false)}
        onBack={() => {
          setShowMonitor(false);
          setShowTools(true);
        }}
      />
    </>
  );
}
