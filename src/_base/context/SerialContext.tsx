/**
 * SerialContext - Contexto React para o Estado da Comunicação Serial.
 *
 * Este contexto gerencia a conexão física com a placa (Arduino/ESP32).
 * Ele expõe para a aplicação:
 * 1. O status atual da conexão (conectado/desconectado).
 * 2. Referência direta à porta serial (Web Serial API).
 * 3. A instância do `StageBoard` para envio/recebimento de comandos.
 * 4. Funções globais de `connect` e `disconnect`.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import StageBoard from '../lib/StageBoard';
import { ISerialPort, SerialStatus } from '../interfaces/code';
import { getSerialService, SerialService } from '../services/code';

interface SerialContextType {
  isConnected: boolean;
  status: SerialStatus;
  serialPort: ISerialPort | null;
  board: StageBoard;
  connect: (forceNew?: boolean) => Promise<void>;
  disconnect: () => Promise<void>;
}

const SerialContext = createContext<SerialContextType | null>(null);

export function SerialProvider({ children }: { children: ReactNode }) {
  const [serialService, setSerialService] = useState<SerialService>();
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<SerialStatus>(SerialStatus.DISCONNECTED);
  const [serialPort, setSerialPort] = useState<ISerialPort | null>(null);

  useEffect(() => {
    setSerialService(() => getSerialService());
  }, []);

  useEffect(() => {
    if (!serialService) return;
    // Subscribe to serial service status changes
    const handleStatusChange = (newStatus: SerialStatus) => {
      setStatus(newStatus);
      setIsConnected(newStatus === SerialStatus.CONNECTED);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setStatus(SerialStatus.DISCONNECTED);
    };

    serialService.on('statusChange', handleStatusChange);
    serialService.on('disconnect', handleDisconnect);

    // Initialize state from service
    setStatus(serialService.getStatus());
    setIsConnected(serialService.isConnected());
    setSerialPort(serialService.getPort());

    return () => {
      serialService.off('statusChange', handleStatusChange);
      serialService.off('disconnect', handleDisconnect);
    };
  }, [serialService]);

  const connect = async (forceNew?: boolean) => {
    try {
      if (!serialService) return;
      await serialService.connect(forceNew);
      setSerialPort(serialService.getPort());
    } catch (error) {
      console.error('[SerialContext] Connection error:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      await serialService?.disconnect();
      setSerialPort(null);
    } catch (error) {
      console.error('[SerialContext] Disconnection error:', error);
      throw error;
    }
  };

  const value: SerialContextType = useMemo(
    () => ({
      isConnected,
      status,
      serialPort,
      board: serialService?.getBoard() as any,
      connect,
      disconnect,
    }),
    [isConnected, status, serialPort, serialService],
  );

  return <SerialContext.Provider value={value}>{children}</SerialContext.Provider>;
}

export function useSerial(): SerialContextType {
  const context = useContext(SerialContext);
  if (!context) {
    throw new Error('useSerial must be used within a SerialProvider');
  }
  return context;
}
