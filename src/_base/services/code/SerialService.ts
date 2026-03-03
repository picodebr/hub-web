/**
 * SerialService - Gerenciador da Conexão Serial (Web Serial API).
 *
 * Este serviço controla o ciclo de vida da conexão física com a placa Arduino.
 * Ele encapsula a complexidade da Web Serial API, gerencia o estado da conexão
 * (Conectado, Desconectado, Erro) e fornece acesso à instância do StageBoard
 * para interação em tempo real via Firmata.
 */

import { SerialStatus, SerialConfig, DEFAULT_SERIAL_CONFIG, ISerialPort, SerialEvents } from '../../interfaces/code';
import StageBoard from '../../lib/StageBoard';
import { EventEmitter } from '../../lib/EventEmitter';

export class SerialService extends EventEmitter<SerialEvents> {
  private static instance: SerialService | null = null;
  private port: ISerialPort | null = null;
  private status: SerialStatus = SerialStatus.DISCONNECTED;
  private board: StageBoard;

  private constructor() {
    super();
    this.board = new StageBoard();
    this.initializeEventListeners();
  }

  /**
   * Get the singleton instance of SerialService
   */
  public static getInstance(): SerialService {
    if (!SerialService.instance) {
      SerialService.instance = new SerialService();
    }
    return SerialService.instance;
  }

  /**
   * Initialize event listeners for global serial events
   */
  private initializeEventListeners(): void {
    // In server environments `navigator` is not defined at all, so we must
    // guard against that before attempting any property access. The previous
    // check (`'serial' in navigator`) would throw a ReferenceError during
    // SSR, which is exactly what caused error ID 281 when the context
    // provider instantiated the service on the server. Using `typeof`
    // prevents the exception and simply makes this a no-op outside of a
    // browser.
    if (typeof navigator === 'undefined' || !('serial' in navigator)) {
      return;
    }

    // Monitor hardware disconnects
    (navigator as any).serial.addEventListener('disconnect', (e: Event) => {
      if (e.target === this.port) {
        // console.log('[SerialService] Hardware disconnected');
        this.status = SerialStatus.DISCONNECTED;
        this.emit('disconnect', undefined);
        this.emit('statusChange', this.status);
      }
    });
  }

  /**
   * Connect to a serial port
   * @param forceNew - Force selection of a new port
   * @param explicitPort - Optional: Use a specific port instance (skips requestPort UI)
   */
  public async connect(forceNew: boolean = false, explicitPort?: ISerialPort): Promise<void> {
    // Guard the same way as above; attempting to access `navigator` on the
    // server would blow up. Callers should never invoke `connect` during SSR
    // anyway, but the defensive programming keeps the error contained.
    if (typeof navigator === 'undefined' || !('serial' in navigator)) {
      throw new Error('Web Serial API not supported in this browser. Use Chrome or Edge.');
    }

    // 0. Use Explicit Port if provided (Reconnection scenario)
    if (explicitPort) {
      // Ensure we are not duplicating if it's the same port and already connected
      if (this.port === explicitPort && this.status === SerialStatus.CONNECTED) {
        return;
      }

      this.status = SerialStatus.CONNECTING;
      this.emit('statusChange', this.status);

      try {
        // Initialize with specific port
        await this.board.connect(explicitPort);
        this.port = explicitPort;
        this.status = SerialStatus.CONNECTED;
        this.emit('statusChange', this.status);
      } catch (e) {
        console.warn('[SerialService] Explicit connection failed:', e);
        this.status = SerialStatus.DISCONNECTED; // Or ERROR
        this.emit('statusChange', this.status);
        // Propagate error if needed, or just return
      }
      return;
    }

    this.status = SerialStatus.CONNECTING;
    this.emit('statusChange', this.status);

    try {
      // 1. Try to reuse existing port (if not forcing new)
      if (!forceNew && this.port) {
        try {
          await this.port.open({ baudRate: DEFAULT_SERIAL_CONFIG.baudRate });
          await this.initializeBoard();
          this.status = SerialStatus.CONNECTED;
          this.emit('statusChange', this.status);
          return;
        } catch (e: unknown) {
          const err = e as Error;
          if (err.name === 'InvalidStateError' || (err.message && err.message.includes('open'))) {
            // Port already open
            this.status = SerialStatus.CONNECTED;
            this.emit('statusChange', this.status);
            return;
          }
          // If reuse failed, clear the port
          this.port = null;
        }
      }

      // 2. Request new port
      // Force disconnect ensuring clean state before UI selection
      // FIX: Check this.port because isConnected() returns false during CONNECTING state
      if (this.port) {
        try {
          await this.disconnect();
        } catch (e) {
          console.error(e);
        }
      }

      const port = (await (navigator as any).serial.requestPort()) as ISerialPort;

      // 3. Initialize StageBoard with the port
      await this.board.connect(port);

      this.port = port;
      this.status = SerialStatus.CONNECTED;
      this.emit('statusChange', this.status);

      // console.log('[SerialService] Serial port connected successfully:', port);
    } catch (e: unknown) {
      this.status = SerialStatus.ERROR;
      this.emit('error', e);
      this.emit('statusChange', this.status);
      throw e;
    }
  }

  /**
   * Initialize the board after connection
   */
  private async initializeBoard(): Promise<void> {
    if (this.port && this.board) {
      await this.board.connect(this.port);
    }
  }

  /**
   * Disconnect from the serial port
   */
  public async disconnect(): Promise<void> {
    try {
      // Race condition protection: If board.disconnect hangs (driver issue),
      // force proceed after 500ms so UI doesn't freeze.
      const disconnectPromise = this.board.disconnect();
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 500));

      await Promise.race([disconnectPromise, timeoutPromise]);

      this.status = SerialStatus.DISCONNECTED;
      this.emit('statusChange', this.status);
      // console.log('[SerialService] Serial port disconnected');
    } catch (e) {
      console.error('[SerialService] Error during disconnect:', e);
      this.status = SerialStatus.DISCONNECTED;
      this.emit('statusChange', this.status);
    }
  }

  /**
   * Get the current serial port
   */
  public getPort(): ISerialPort | null {
    return this.port;
  }

  /**
   * Get the StageBoard instance
   */
  public getBoard(): StageBoard {
    return this.board;
  }

  /**
   * Check if currently connected
   */
  public isConnected(): boolean {
    return this.status === SerialStatus.CONNECTED;
  }

  /**
   * Get current connection status
   */
  public getStatus(): SerialStatus {
    return this.status;
  }

  /**
   * Reset the singleton instance (for testing purposes)
   */
  public static resetInstance(): void {
    SerialService.instance = null;
  }
}

// Export singleton instance getter
export const getSerialService = () => SerialService.getInstance();
