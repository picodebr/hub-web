/**
 * UploadService - Orquestrador de Upload de Firmware.
 *
 * Este serviço coordena o fluxo completo de transformar blocos em hardware:
 * 1. Recebe o código C++ gerado.
 * 2. Chama o CompilerService para compilação remota.
 * 3. Libera a porta serial (desconecta o Firmata se necessário).
 * 4. Utiliza o stk500 para gravar o binário na placa.
 * 5. Gerencia o feedback visual do progresso (animação do foguete e logs).
 */

import { UploadStatus, UploadPhase, INITIAL_UPLOAD_STATUS } from '../../interfaces/code';
import { CompilerService } from '../../lib/CompilerService';
import { uploadFirmware } from '../../lib/stk500';
import { parseHexFile } from '../../lib/byteUtils';
import { EventEmitter } from '../../lib/EventEmitter';
import { getSerialService } from './SerialService';

interface UploadEvents {
  statusChange: UploadStatus;
  phaseChange: string; // Could be stricter union type
  logUpdate: string;
  error: unknown;
}

export class UploadService extends EventEmitter<UploadEvents> {
  private status: UploadStatus = { ...INITIAL_UPLOAD_STATUS };
  private compiler: typeof CompilerService = CompilerService;

  constructor() {
    super();
  }

  /**
   * Get current upload status
   */
  public getStatus(): UploadStatus {
    return { ...this.status };
  }

  /**
   * Upload a sketch to the connected board
   * @param code - C++ code to compile and upload
   */
  public async uploadSketch(code: string): Promise<void> {
    this.updateStatus({
      phase: 'flying',
      isUploading: true,
      showRocket: true,
    });

    try {
      // 1. Compile the code

      const hexData = await this.compiler.compile(code);

      if (!hexData) {
        throw new Error('Compilação falhou: HEX vazio retornado.');
      }

      // 2. Get serial port from SerialService
      const serialService = getSerialService();

      // Disconnect Firmata to free the port
      if (serialService.isConnected()) {
        await serialService.disconnect();
        await new Promise((r) => setTimeout(r, 500)); // Wait for port release
      }

      const port = serialService.getPort();
      if (!port) {
        throw new Error('Nenhuma porta serial disponível. Conecte a placa primeiro.');
      }

      // 3. Parse HEX file

      const firmware = parseHexFile(hexData.hex);

      // 4. Upload firmware
      await uploadFirmware(port, firmware, (log: string) => {
        // Log ignored
      });

      // 5. Mark as success
      this.updateStatus({
        phase: 'success',
        isUploading: false,
      });

      // Auto-hide rocket after 2 seconds
      setTimeout(() => {
        this.updateStatus({ showRocket: false });
      }, 2000);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      this.updateStatus({
        phase: 'failure',
        isUploading: false,
      });

      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Restore default Firmata firmware to the board
   */
  public async restoreBoard(): Promise<void> {
    this.updateStatus({
      phase: 'flying',
      isUploading: true,
      showRocket: true,
    });

    try {
      // 1. Fetch default Firmata HEX

      const response = await fetch('/firmata_standard.hex');

      if (!response.ok) {
        throw new Error('Falha ao baixar firmware padrão.');
      }

      const hexData = await response.text();

      // 2. Get serial port
      const serialService = getSerialService();

      if (serialService.isConnected()) {
        await serialService.disconnect();
        await new Promise((r) => setTimeout(r, 500));
      }

      const port = serialService.getPort();
      if (!port) {
        throw new Error('Nenhuma porta serial disponível.');
      }

      // 3. Parse and upload

      const firmware = parseHexFile(hexData);

      await uploadFirmware(port, firmware, (log: string) => {
        // Log ignored
      });

      this.updateStatus({
        phase: 'success',
        isUploading: false,
      });

      // Auto-hide rocket after 2 seconds
      setTimeout(() => {
        this.updateStatus({ showRocket: false });
      }, 2000);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      this.updateStatus({
        phase: 'failure',
        isUploading: false,
      });

      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Reset upload status to ready state
   */
  public reset(): void {
    this.status = { ...INITIAL_UPLOAD_STATUS };
    this.emit('statusChange', this.status);
  }

  /**
   * Update upload status and notify listeners
   */
  private updateStatus(changes: Partial<UploadStatus>): void {
    const oldPhase = this.status.phase;

    this.status = {
      ...this.status,
      ...changes,
    };

    if (changes.phase && changes.phase !== oldPhase) {
      this.emit('phaseChange', this.status.phase);
    }

    this.emit('statusChange', this.status);
  }

  /**
   * Append text to upload logs
   */
}

// Export singleton instance
let uploadServiceInstance: UploadService | null = null;

export const getUploadService = (): UploadService => {
  if (!uploadServiceInstance) {
    uploadServiceInstance = new UploadService();
  }
  return uploadServiceInstance;
};
