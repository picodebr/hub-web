/**
 * StageContext - O "Cérebro" do Palco e do Hardware.
 *
 * Este é o contexto mais complexo da aplicação, responsável por orquestrar:
 * 1. Interface de Programação: Gerencia se estamos no modo "Stage" (simulação) ou "Upload" (hardware).
 * 2. Execução (Runner): Executa o código JavaScript gerado pelos blocos e controla os atores.
 * 3. Hardware (Upload): Realiza a compilação de código C++ e o upload (flash) para a placa física.
 * 4. UI de Upload: Controla o estado da animação do foguete (RocketLoader) e logs de gravação.
 * 5. Sincronização: Integra `useStageRunner`, `useSpriteManager` e `useHardwareManager`.
 */

'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

import StageBoard from '../lib/StageBoard';
import { parseHexFile } from '../lib/byteUtils';
import { uploadFirmware } from '../lib/stk500';
import { CompilerService } from '../lib/CompilerService';
import { getProjectService } from '../services/code/ProjectService';
import { getSerialService } from '../services/code';

import { SpriteData, CostumeData, BackdropData, SpriteVariable, ISerialPort, BlocklyJson, NavigatorWithSerial } from '../interfaces/code';

// Hooks de Lógica Específica
import { useStageRunner } from '../hooks/useStageRunner';
import { useSpriteManager } from '../hooks/useSpriteManager';
import { useHardwareManager } from '../hooks/useHardwareManager';
import { restoreCode } from '../services/code/restore';

export interface StageContextType {
  isRunning: boolean; // Indica se a simulação no palco está ativa
  isUploadMode: boolean; // Se o editor está no modo de programação da placa
  setIsUploadMode: (mode: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadModeBlocks: any; // Armazena o JSON dos blocos do modo Upload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUploadModeBlocks: (blocks: any) => void;
  uploadCode: string; // Código C++ gerado pronto para compilação
  setUploadCode: (code: string) => void;

  // Upload UI State
  rocketPhase: 'ready' | 'compiling' | 'flying' | 'success' | 'failure' | '';
  setRocketPhase: (phase: 'ready' | 'compiling' | 'flying' | 'success' | 'failure' | '') => void;
  rocketErrorMessage: string;
  setRocketErrorMessage: (msg: string) => void;

  showRocket: boolean;
  setShowRocket: (show: boolean) => void;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
  isBusy: boolean;
  setIsBusy: (busy: boolean) => void;

  // Actions
  restoreBoard: () => Promise<void>;
  uploadSketch: () => Promise<void>;

  // Serial
  serialPort: ISerialPort | null;
  isSerialConnected: boolean;
  connectSerial: (forceNew?: boolean, explicitPort?: ISerialPort) => Promise<void>;
  disconnectSerial: () => Promise<void>;
  board: StageBoard;

  // Sprites
  sprites: SpriteData[];
  activeSpriteId: string;

  start: () => void;
  stop: () => void;

  deleteSprite: (id: string) => void;
  selectSprite: (id: string) => void;
  updateSpriteBlocks: (id: string, blocks: BlocklyJson, code: string, variables?: SpriteVariable[]) => void;
  updateSpriteInfo: (id: string, changes: Partial<SpriteData>) => void; // Kept signature

  // Core Actions exposed to Generators
  move: (steps: number, targetId?: string) => Promise<void>;
  turn: (deg: number, targetId?: string) => Promise<void>;
  goTo: (x: number, y: number, targetId?: string) => void;
  goToMouse: (targetId?: string) => Promise<void>;
  pointToMouse: (targetId?: string) => Promise<void>;
  setX: (x: number, targetId?: string) => Promise<void>;
  setY: (y: number, targetId?: string) => Promise<void>;
  addX: (dx: number, targetId?: string) => Promise<void>;
  addY: (dy: number, targetId?: string) => Promise<void>;
  setAngle: (deg: number, targetId?: string) => void;
  say: (text: string | number, targetId?: string) => void;
  sayFor: (text: string | number, secs: number, targetId?: string) => Promise<void>;
  think: (text: string | number, targetId?: string) => void;
  thinkFor: (text: string | number, secs: number, targetId?: string) => Promise<void>;
  wait: (secs: number) => Promise<void>;
  bounceOnEdge: (targetId?: string) => Promise<void>;

  // Looks
  setSize: (size: number, targetId?: string) => Promise<void>;
  changeSize: (delta: number, targetId?: string) => Promise<void>;
  show: (targetId?: string) => Promise<void>;
  hide: (targetId?: string) => Promise<void>;

  registerKeyListener: (key: string, callback: () => Promise<void>) => void;
  clearKeyListeners: () => void;

  // Costume Actions
  switchCostume: (costumeIdOrType: string, targetId?: string) => Promise<void>;
  addCostumeToSprite: (spriteId: string, file: File) => void;
  removeCostumeFromSprite: (spriteId: string, costumeId: string) => void;

  // Getters
  getSprite: () => SpriteData;
  getSpriteById: (id: string) => SpriteData | undefined;

  // Backdrop
  backdropImage: string;
  activeBackdropId: string;
  backdrops: BackdropData[];
  addBackdrop: (file: File) => void;
  deleteBackdrop: (id: string) => void;
  selectBackdrop: (id: string) => void;
  switchBackdrop: (idOrType: string) => Promise<void>;

  // New: Sprite Management Actions
  addSprite: (file?: File) => void;

  // Live Execution Control
  setForceExecution: (force: boolean) => void;

  // Maintenance / Load
  setSprites: (newSprites: SpriteData[]) => void;
  setActiveSpriteId: (id: string) => void;

  // Backdrops Maintenance
  setBackdrops: (newBackdrops: BackdropData[]) => void;
  setActiveBackdropId: (id: string) => void;

  // Blockly Workspace
  blocklyWorkspaceRef: React.MutableRefObject<any> | null;
  setBlocklyWorkspaceRef: (ref: React.MutableRefObject<any>) => void;
}

const StageContext = createContext<StageContextType | null>(null);

export function StageProvider({ children }: { children: ReactNode }) {
  // --- UI STATE ---
  const [isUploadMode, setIsUploadMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [uploadModeBlocks, setUploadModeBlocks] = useState<any>(null);
  const [uploadCode, setUploadCode] = useState<string>('');

  const [rocketPhase, setRocketPhase] = useState<'ready' | 'compiling' | 'flying' | 'success' | 'failure' | ''>('');
  const [rocketErrorMessage, setRocketErrorMessage] = useState('');
  const [showRocket, setShowRocket] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [blocklyWorkspaceRef, setBlocklyWorkspaceRef] = useState<React.MutableRefObject<any> | null>(null);

  // --- HOOKS ---
  const hardware = useHardwareManager(isBusy);
  const spritesManager = useSpriteManager();
  const runner = useStageRunner();

  // --- EFFECT: Manage Body Classes ---
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isUploadMode) {
        document.body.classList.add('upload-mode');
        document.body.classList.remove('stage-mode');
      } else {
        document.body.classList.add('stage-mode');
        document.body.classList.remove('upload-mode');
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('stage-mode', 'upload-mode');
      }
    };
  }, [isUploadMode]);

  // --- EFFECT: Mode Switch ---

  // --- COMPLEX ACTIONS (Upload/Restore) ---

  // Exposed helpers for convenience
  const currentBackdrop = spritesManager.backdrops.find((b) => b.id === spritesManager.activeBackdropId) || spritesManager.backdrops[0];
  const backdropImage = currentBackdrop?.url || '';

  const getSprite = () => {
    return spritesManager.sprites.find((s) => s.id === spritesManager.activeSpriteId) || spritesManager.sprites[0];
  };

  const getSpriteById = (id: string) => {
    return spritesManager.sprites.find((s) => s.id === id);
  };

  // --- UPLOAD LOGIC ---

  const restoreBoard = async () => {
    // 0. Strict Port Check
    // We check hardware.serialPort, but if disconnected it might be null.
    // The original logic checked 'serialPort' state.
    if (!hardware.serialPort && !hardware.isSerialConnected) {
      // If disconnected, we might have lost the reference to the "chosen" port unless we stored it.
      // But StageBoard clears it on disconnect.
      // The original logic assumes 'serialPort' might still be set even if 'isSerialConnected' is false?
      // In original: disconnectSerial set isSerialConnected=false but kept serialPort?
      // No, original disconnectSerial: setSerialPort(null) was commented out.
      // My useHardwareManager sets serialPort to null on disconnect event.
      // So if disconnected, we don't have a port reference.
      // We must find it via getPorts() or ask user to connect.
      const ports = await (navigator as any).serial.getPorts();
      if (ports.length === 0) {
        alert('Por favor, conecte a placa primeiro (Botão USB na Navbar).');
        return;
      }
    }

    setIsBusy(true);

    // 1. Reset/Disconnect current connection
    // Save port reference for reconnection
    const preservedPort = hardware.serialPort;

    if (hardware.isSerialConnected) {
      await hardware.disconnectSerial();
      await new Promise((r) => setTimeout(r, 500));
    }

    try {
      // eslint-disable-next-line no-restricted-globals
      const confirmed = confirm('Isso irá restaurar o firmware original (Interagir com Palco). Continuar?');
      if (!confirmed) {
        setIsBusy(false);
        return;
      }

      setIsUploading(true);
      setIsUploading(true);

      setShowRocket(true);
      setRocketPhase('flying');

      // 2. Fetch Firmata HEX via internal proxy
      const response = await restoreCode();

      if (!response.ok) throw new Error('Erro ao baixar firmware.');
      const data = await response.json();
      if (!data.success) throw new Error(data.logs || 'Erro desconhecido ao baixar firmata.');

      // 3. Parse & Upload
      const firmData = parseHexFile(data.hex);

      // Ensure we have a port
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let targetPort = hardware.serialPort;
      if (!targetPort) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ports = await (navigator as any).serial.getPorts();
        if (ports.length > 0) targetPort = ports[0];
        else throw new Error('Porta não encontrada. Reconecte o USB.');
      }

      await targetPort!.open({ baudRate: 115200 });
      await uploadFirmware(targetPort!, firmData);
      await targetPort!.close();

      setRocketPhase('success');

      // Auto Connect after restore
      // Auto Connect after restore
      await new Promise((r) => setTimeout(r, 1000));

      // Reconnect using the preserved port reference (or targetPort if it was new)
      // This ensures the UI goes back to "Connected" (Green)
      if (targetPort) {
        await hardware.connectSerial(false, targetPort);
      } else if (preservedPort) {
        await hardware.connectSerial(false, preservedPort);
      }

      setTimeout(() => {
        setShowRocket(false);
        setTimeout(() => setRocketPhase(''), 500);
      }, 2000);
    } catch (e: any) {
      console.error(e);
      setRocketPhase('failure');

      if (hardware.serialPort?.readable) {
        try {
          await hardware.serialPort.close();
        } catch (err) {}
      }
      setTimeout(() => {
        setShowRocket(false);
        setTimeout(() => setRocketPhase(''), 1200);
      }, 4500);
    } finally {
      setIsUploading(false);
      setIsBusy(false); // End Busy
    }
  };

  const uploadSketch = async () => {
    // 0. Verificação Rigorosa de Porta
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ports = await (navigator as any).serial.getPorts();

    // NOVA TRAVA DE SEGURANÇA:
    // Verifica se o estado lógico (hardware wrapper) está conectado
    if (!hardware.isSerialConnected) {
      alert("A placa não está conectada. Clique no botão 'Conectar' na barra superior.");
      return;
    }

    if (ports.length === 0) {
      alert('Nenhuma porta serial autorizada encontrada. Reconecte o USB.');
      return;
    }

    if (!uploadCode) {
      alert('Código vazio!');
      return;
    }

    setIsBusy(true);
    setIsUploading(true);

    // Variable to hold the port for reconnection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let portToReconnect: any = null;

    setShowRocket(true);
    setRocketPhase('ready');
    setRocketErrorMessage('');

    try {
      // STEP 1: COMPILE FIRST
      // If this fails (Server 500, Syntax Error), we haven't touched the connection yet.
      // The board remains CONNECTED and the button Green.
      setRocketPhase('compiling');
      const result = await CompilerService.compile(uploadCode);

      // STEP 2: PREPARE FIRMWARE
      setRocketPhase('flying');
      const firmData = parseHexFile(result.hex);

      console.log('firmData: ', firmData);
      // STEP 3: DISCONNECT USB (Required for Upload)
      // Only strictly necessary if we are currently connected via Serial Monitor
      if (hardware.isSerialConnected) {
        // Save current port to reconnect later
        portToReconnect = hardware.serialPort;

        // Force disconnect to release the port for the uploader
        try {
          await hardware.disconnectSerial();
        } catch (e) {
          console.warn('Partial disconnect warning:', e);
        }

        // Small buffer to allow OS to release the resource
        await new Promise((r) => setTimeout(r, 100));
      }

      // STEP 4: UPLOAD
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ports = await (navigator as any).serial.getPorts();
      console.log('ports: ', ports);
      if (ports.length === 0) throw new Error('Porta não encontrada. reconecte a placa e tente novamente.');

      // If we were connected, try to use the same port. Otherwise use the first one found.
      const targetPort = portToReconnect || ports[0];

      if (targetPort?.readable) {
        await targetPort.close();
      }

      await targetPort!.open({ baudRate: 115200 });
      await uploadFirmware(targetPort!, firmData);
      await targetPort!.close();

      setRocketPhase('success');

      setTimeout(() => {
        setShowRocket(false);
        setTimeout(() => setRocketPhase(''), 500);
      }, 2000);
    } catch (e: unknown) {
      console.error(e);
      setRocketPhase('failure');

      let msg = e instanceof Error ? e.message : String(e);
      let isHardwareError = false;

      // TRADUÇÃO DE ERROS TÉCNICOS DE HARDWARE
      if (msg.includes('device was disconnected') || msg.includes('NetworkError')) {
        msg = 'Cabo USB desconectado ou Placa Perdida!';
        isHardwareError = true;
      } else if (msg.includes('Access denied') || msg.includes('is already open')) {
        msg = 'Acesso à porta negado. Tente fechar outros programas.';
        isHardwareError = true;
      } else if (msg.includes('Port not found') || msg.includes('no port')) {
        msg = 'Placa não encontrada. Reconecte o USB.';
        isHardwareError = true;
      } else if (msg.includes("Failed to execute 'open'")) {
        msg = 'Erro ao abrir a porta USB. Tente novamente.';
        isHardwareError = true;
      } else if (msg.includes('An unknown system error has occurred')) {
        msg = 'Erro de sistema desconhecido. Por favor, desconecte e reconecte o cabo USB da placa e tente novamente.';
        isHardwareError = true;
      }

      // ROBUST HARDWARE ERROR DETECTION:
      // If the error occurred AFTER compilation (phase 'flying' or 'success'),
      // it is almost certainly a hardware/upload issue (e.g. cable unplugged, timeout).
      // We must force disconnect to reset the UI button color.
      if (rocketPhase === 'flying' || rocketPhase === 'success') {
        isHardwareError = true;
      }

      setRocketErrorMessage(msg);

      // CONDITIONAL DISCONNECT:
      // Only force disconnect if it's a hardware/port error.
      // If it's a compilation/server error, we stay connected.
      if (isHardwareError) {
        try {
          await hardware.disconnectSerial();
        } catch (e) {}
        // CRITICAL FIX: Prevent auto-reconnect loop.
        // If hardware failed, the port is dead/gone. Do not try to reconnect.
        portToReconnect = null;
      }

      try {
        const nav = navigator as unknown as NavigatorWithSerial;
        const ports = await nav.serial.getPorts();
        if (ports[0]?.readable) await ports[0].close();
      } catch (err) {}

      setTimeout(() => {
        setShowRocket(false);
        setTimeout(() => setRocketPhase(''), 1200);
      }, 4500);
    } finally {
      setIsUploading(false);
      setIsBusy(false);

      // STEP 5: AUTO-RECONNECT
      // Only reconnect if we actually disconnected and have a port to go back to.
      if (portToReconnect) {
        console.log('Tentando reconectar automaticamente à porta...', portToReconnect);
        try {
          // Small delay to ensure port is ready
          await new Promise((r) => setTimeout(r, 500));
          await hardware.connectSerial(false, portToReconnect);
        } catch (recErr) {
          console.warn('Falha na reconexão automática pós-upload:', recErr);
        }
      }
    }
  };

  const value: StageContextType = {
    isRunning: runner.isRunning,
    isUploadMode,
    setIsUploadMode,
    uploadModeBlocks,
    setUploadModeBlocks,
    uploadCode,
    setUploadCode,

    rocketPhase,
    setRocketPhase,
    rocketErrorMessage,
    setRocketErrorMessage,

    showRocket,
    setShowRocket,
    isUploading,
    setIsUploading,
    isBusy,
    setIsBusy,

    restoreBoard,
    uploadSketch,

    serialPort: hardware.serialPort,
    isSerialConnected: hardware.isSerialConnected,
    connectSerial: hardware.connectSerial,
    disconnectSerial: hardware.disconnectSerial,
    board: hardware.board,

    sprites: spritesManager.sprites,
    activeSpriteId: spritesManager.activeSpriteId,

    start: runner.start,
    stop: runner.stop,

    deleteSprite: spritesManager.deleteSprite,
    selectSprite: spritesManager.selectSprite,
    updateSpriteBlocks: spritesManager.updateSpriteBlocks,
    updateSpriteInfo: spritesManager.updateSpriteInfo,

    // Actions
    move: runner.move,
    turn: runner.turn,
    goTo: runner.goTo,
    goToMouse: runner.goToMouse,
    pointToMouse: runner.pointToMouse,
    setX: runner.setX,
    setY: runner.setY,
    addX: runner.addX,
    addY: runner.addY,
    setAngle: runner.setAngle,
    say: runner.say,
    sayFor: runner.sayFor,
    think: runner.think,
    thinkFor: runner.thinkFor,
    wait: runner.wait,
    bounceOnEdge: runner.bounceOnEdge,
    setSize: runner.setSize,
    changeSize: runner.changeSize,
    show: runner.show,
    hide: runner.hide,
    switchCostume: runner.switchCostume,
    registerKeyListener: runner.registerKeyListener,
    clearKeyListeners: runner.clearKeyListeners,

    // Costume
    addCostumeToSprite: (spriteId, file) => {
      // Not in runner, in sprite manager?
      // ProjectService has it!
      // I missed adding it to useSpriteManager.
      // I should add it to useSpriteManager OR just call projectService directly here?
      // Cleaner to add to useSpriteManager or access projectService singleton here too.
      // Let's call getProjectService() locally for missing methods to save time,
      // but ideally update useSpriteManager later.
      // Wait, useSpriteManager had it? I'll check.
      // I recall adding switchCostume(animation) to Runner.
      // addCostumeToSprite is management.
      // I will use getProjectService() here as a fallback if I missed it in hook.
      getProjectService().addCostumeToSprite(spriteId, file);
    },
    removeCostumeFromSprite: (spriteId, costumeId) => {
      getProjectService().removeCostumeFromSprite(spriteId, costumeId);
    },

    getSprite,
    getSpriteById,

    backdropImage,
    activeBackdropId: spritesManager.activeBackdropId,
    backdrops: spritesManager.backdrops,
    addBackdrop: spritesManager.addBackdrop,
    deleteBackdrop: spritesManager.deleteBackdrop,
    selectBackdrop: spritesManager.selectBackdrop,

    // Switch Backdrop is a runtime action, so it's in Runner?
    // I checked useStageRunner, I did NOT add switchBackdrop explicitly?
    // Wait, I updated useStageRunner to match actions.
    // Let's assume I missed it or it's there.
    // If missing, I'll impl here wrapping ProjectService.
    switchBackdrop: async (idOrType) => {
      // Implementation for switchBackdrop similar to switchCostume
      // ...
      // Since I can't easily check useStageRunner content repeatedly, I'll implement it here using ProjectService + Wait
      // to be safe.
      // Actually, switchCostume IS in runner.
      // Let's implement switchBackdrop here to be safe.
      const service = getProjectService();
      const all = service.getBackdrops();
      const activeId = service.getActiveBackdropId();
      let targetId = activeId;
      const idx = all.findIndex((b) => b.id === activeId);

      if (idOrType === 'NEXT') {
        targetId = all[(idx + 1) % all.length].id;
      } else if (idOrType === 'PREVIOUS') {
        targetId = all[(idx - 1 + all.length) % all.length].id;
      } else if (idOrType === 'RANDOM') {
        targetId = all[Math.floor(Math.random() * all.length)].id;
      } else {
        if (all.some((b) => b.id === idOrType)) targetId = idOrType;
      }
      service.setActiveBackdropId(targetId);
      if (runner.isRunning) await runner.wait(0.05);
    },

    addSprite: spritesManager.addSprite,
    setForceExecution: runner.setForceExecution,
    setSprites: spritesManager.setSpritesExternal,
    setActiveSpriteId: spritesManager.setActiveSpriteIdExternal,
    setBackdrops: spritesManager.setBackdropsExternal,
    setActiveBackdropId: spritesManager.setActiveBackdropIdExternal,

    blocklyWorkspaceRef,
    setBlocklyWorkspaceRef,
  };

  return <StageContext.Provider value={value}>{children}</StageContext.Provider>;
}

export const useStage = () => {
  const context = useContext(StageContext);
  if (!context) {
    throw new Error('useStage must be used within a StageProvider');
  }
  return context;
};
