/**
 * useHardwareManager - Gestor de Estado do Hardware.
 *
 * Sincroniza o estado da conexão serial global com os componentes da interface.
 * Lida com a proteção de desconexão durante o "busy state" (como no upload de código)
 * para evitar falhas visuais.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { ISerialPort, SerialStatus } from '../interfaces/code';
import StageBoard from '../lib/StageBoard';
import { getSerialService } from '../services/code';

export function useHardwareManager(isBusy: boolean) {
  const [serialPort, setSerialPort] = useState<ISerialPort | null>(null);
  const [isSerialConnected, setIsSerialConnected] = useState(false);

  // Usamos uma ref para rastrear a placa, mas a *instância* vem do SerialService
  // SerialService singleton mantém a instância real da placa.
  // No entanto, StageContext instanciou anteriormente `new StageBoard()` em uma ref.
  // SerialService também inicializa `new StageBoard()`.
  // Devemos alinhar para usar a placa do SerialService para evitar duplicatas.
  // Na Fase 2.3 padronizamos os singletons. StageContext.tsx importa getSerialService.

  const serialService = getSerialService();
  const board = serialService.getBoard(); // Expõe a placa singleton

  useEffect(() => {
    // Sincroniza o estado inicial
    const status = serialService.getStatus();
    setIsSerialConnected(status === SerialStatus.CONNECTED);
    setSerialPort(serialService.getPort());

    const handleStatusChange = (newStatus: SerialStatus) => {
      // Se estivermos "ocupados" (ex: fazendo upload), podemos querer ignorar eventos de DESCONEXÃO
      // para evitar piscadas na UI, conforme lógica anterior.
      // No entanto, SerialService *está* desconectado.

      if (isBusy && newStatus === SerialStatus.DISCONNECTED) {
        // Ignora desconexão se estiver ocupado (uploading)
        return;
      }

      setIsSerialConnected(newStatus === SerialStatus.CONNECTED);
      setSerialPort(serialService.getPort());
    };

    const handleDisconnect = () => {
      if (isBusy) return;
      setIsSerialConnected(false);
      setSerialPort(null);
    };

    serialService.on('statusChange', handleStatusChange);
    serialService.on('disconnect', handleDisconnect);

    return () => {
      serialService.off('statusChange', handleStatusChange);
      serialService.off('disconnect', handleDisconnect);
    };
  }, [isBusy]);

  const connectSerial = useCallback(async (forceNew = false, explicitPort?: ISerialPort) => {
    await serialService.connect(forceNew, explicitPort);
  }, []);

  const disconnectSerial = useCallback(async () => {
    await serialService.disconnect();
  }, []);

  return {
    serialPort,
    isSerialConnected,
    board,
    connectSerial,
    disconnectSerial,
  };
}
