/**
 * WebSerialAdapter - Implementação concreta da comunicação Serial via Web API.
 *
 * Responsabilidade: Lidar com a abertura de portas, configuração de baudrate
 * e o fluxo de leitura/escrita de streams de dados. Converte os comandos de
 * alto nível da aplicação em pacotes de bytes trafegados via USB/Serial para
 * a placa controladora.
 *
 * Operações Principais:
 * - requestPort: Interação com o navegador para seleção de hardware pelo usuário.
 * - getReader/getWriter: Gestão de fluxos assíncronos para comunicação não-bloqueante.
 * - setBaudRate: Reconfiguração dinâmica da velocidade de transmissão.
 *
 * Interações: Implementa a interface `ISerialPortAdapter`, isolando o domínio
 * das APIs específicas do navegador.
 */
import { ISerialPortAdapter } from '../domain/ports/ISerialPortAdapter';
import { SerialStatus, SerialConfig, ISerialPort, SerialOptions, NavigatorWithSerial, SerialConnectionEvent } from '../domain/entities/ISerial';

export class WebSerialAdapter implements ISerialPortAdapter {
  private _port: ISerialPort | null = null;
  public get port(): ISerialPort | null {
    return this._port;
  }
  private status: SerialStatus = SerialStatus.DISCONNECTED;
  private dataCallbacks: ((data: Uint8Array) => void)[] = [];
  private errorCallbacks: ((error: Error) => void)[] = [];
  private statusCallbacks: ((status: SerialStatus) => void)[] = [];
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;

  constructor() {
    this.setupGlobalListeners();
  }

  private setupGlobalListeners() {
    if (typeof navigator !== 'undefined' && 'serial' in navigator) {
      const nav = navigator as unknown as NavigatorWithSerial;
      nav.serial.addEventListener('disconnect', (e: Event) => {
        const serialEvent = e as SerialConnectionEvent;
        if (serialEvent.port === this._port) {
          this.handleDisconnect();
        }
      });
    }
  }

  private handleDisconnect() {
    if (this.status === SerialStatus.DISCONNECTED) return;
    this.status = SerialStatus.DISCONNECTED;
    this.notifyStatusChange();
    this.cleanup();
  }

  private notifyStatusChange() {
    this.statusCallbacks.forEach((cb) => cb(this.status));
  }

  public getStatus(): SerialStatus {
    return this.status;
  }

  public async connect(config: SerialConfig, explicitPort?: ISerialPort): Promise<void> {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial não suportado neste navegador.');
    }

    // Se já estiver conectado à mesma porta, não faz nada
    if (this.status === SerialStatus.CONNECTED && this._port) {
      if (!explicitPort || explicitPort === this._port) {
        console.log('[WebSerialAdapter] Porta já conectada. Ignorando.');
        return;
      }
    }

    try {
      this.status = SerialStatus.CONNECTING;
      this.notifyStatusChange();

      const nav = navigator as unknown as NavigatorWithSerial;

      // Se recebemos uma porta explícita (ex: reconexão pós-upload), usamos ela.
      // Caso contrário, solicitamos ao usuário.
      this._port = explicitPort || (await nav.serial.requestPort());

      const options: SerialOptions = {
        baudRate: config.baudRate,
        dataBits: config.dataBits,
        stopBits: config.stopBits,
        parity: config.parity,
        flowControl: config.flowControl,
      };

      // No Web Serial, não há uma propriedade "isOpen", mas se writable está definido e não bloqueado,
      // ou se tentarmos abrir e disparar erro "already open", podemos ignorar.
      // No Web Serial, não há uma propriedade "isOpen" nativa e confiável.
      // Para evitar erros de "Port already open" durante reconexões rápidas
      // (comuns após um upload de firmware), capturamos a exceção específica
      // ou verificamos se os streams (readable/writable) já estão vivos.
      try {
        if (this._port?.readable || this._port?.writable) {
          console.log('[WebSerialAdapter] Porta detectada como já aberta.');
        } else {
          await this._port!.open(options);
        }
      } catch (openErr: unknown) {
        const msg = (openErr as Error).message || '';
        // Se o erro for apenas que a porta já está aberta, podemos prosseguir
        // silenciosamente para iniciar a leitura.
        if (msg.includes('already open')) {
          console.warn('[WebSerialAdapter] Porta já estava aberta (capturado no catch).');
        } else {
          throw openErr;
        }
      }

      this.status = SerialStatus.CONNECTED;

      // Só pedimos o writer se ele não existir e a porta permitir
      if (!this.writer && this._port.writable) {
        this.writer = this._port.writable.getWriter();
      }

      this.notifyStatusChange();

      this.startReading();
    } catch (err) {
      this.status = SerialStatus.ERROR;
      this.notifyStatusChange();
      this.errorCallbacks.forEach((cb) => cb(err as Error));
      throw err;
    }
  }

  private async startReading() {
    if (!this._port || !this._port.readable) return;

    // Adquire o bloqueio (lock) do stream para leitura.
    // No Web Serial, apenas um leitor pode estar ativo por vez.
    this.reader = this._port.readable.getReader();
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break; // Porta fechada externamente ou cancelada
        if (value) {
          // Notifica todos os listeners registrados (ex: SerialMonitor, context)
          this.dataCallbacks.forEach((cb) => cb(value));
        }
      }
    } catch (err) {
      console.error('[WebSerialAdapter] Erro na leitura do stream:', err);

      // Propaga o erro para os callbacks (necessário para disparar o modal de aviso)
      this.errorCallbacks.forEach((cb) => cb(err as Error));

      const error = err as any;
      const msg = error.message || '';
      const name = error.name || '';

      if (msg.includes('The device has been lost') || msg.includes('dispositivo foi perdido') || name === 'NetworkError') {
        console.warn('[WebSerialAdapter] Conexão perdida detectada pelo stream. Forçando desconexão.');
        this.handleDisconnect();
      }
    } finally {
      // Importante liberar o lock para que outros leitores (ou o próximo ciclo)
      // possam usar o stream readable da porta.
      if (this.reader) {
        this.reader.releaseLock();
        this.reader = null;
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }
    if (this.writer) {
      this.writer.releaseLock();
      this.writer = null;
    }
    if (this._port) {
      await this._port.close();
      this._port = null;
    }
    this.handleDisconnect();
  }

  public async write(data: Uint8Array): Promise<void> {
    if (!this.writer) throw new Error('Porta não disponível para escrita ou writer não bloqueado.');
    // Escreve os dados. A fila de promessas é mantida pelo próprio stream interno do Web Serial
    await this.writer.write(data);
  }

  public async writeString(data: string): Promise<void> {
    const encoder = new TextEncoder();
    await this.write(encoder.encode(data));
  }

  public onData(callback: (data: Uint8Array) => void): () => void {
    this.dataCallbacks.push(callback);
    return () => {
      this.dataCallbacks = this.dataCallbacks.filter((cb) => cb !== callback);
    };
  }

  public onError(callback: (error: Error) => void): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
    };
  }

  public onStatusChange(callback: (status: SerialStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter((cb) => cb !== callback);
    };
  }

  public async setBaudRate(baudRate: number): Promise<void> {
    if (!this._port) return;

    console.log(`[WebSerialAdapter] Alterando baud rate para ${baudRate}...`);

    // 1. Para leitura
    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }

    // Libera writer antes de fechar a porta
    if (this.writer) {
      this.writer.releaseLock();
      this.writer = null;
    }

    // 2. Fecha porta
    try {
      await this._port.close();
    } catch (e) {
      console.warn('[WebSerialAdapter] Erro ao fechar porta para mudar baud rate:', e);
    }

    // 3. Reabre com novo baud
    const options: SerialOptions = {
      baudRate: baudRate,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
    };

    await this._port.open(options);

    if (this._port.writable) {
      this.writer = this._port.writable.getWriter();
    }

    // 4. Reinicia leitura
    this.startReading();
  }

  private cleanup() {
    this.reader = null;
  }
}
