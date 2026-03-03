/**
 * Camada de Abstração de Hardware (HAL) usando Web Serial API.
 * Gerencia conexão, protocolo Firmata e cache de estado dos pinos.
 */

import { ISerialPort } from '../interfaces/code';

export default class StageBoard {
  port: ISerialPort | null;
  writer: WritableStreamDefaultWriter | null;
  reader: ReadableStreamDefaultReader | null;
  isConnected: boolean;

  // Callbacks
  callbacksBtn: { [pin: number]: () => void };
  callbacksLuz: { [pin: number]: (value: number) => void };

  // State Cache
  estadosPinos: { [pin: number]: number };
  analogStates: { [pin: number]: number };

  // Buffer
  buffer: number[];

  // Config Cache
  configuredPins: Set<number | string>;

  constructor() {
    // Referências da Web Serial API
    this.port = null; // Instância da porta física
    this.writer = null; // WritableStreamDefaultWriter: Canal de envio
    this.reader = null; // ReadableStreamDefaultReader: Canal de escuta
    this.isConnected = false;

    // --- Sistema de Eventos (Pub/Sub) ---
    // Mapeia ID do pino -> Função de Callback
    this.callbacksBtn = {};
    this.callbacksLuz = {};

    // --- State Cache (Espelhamento de Hardware) ---
    // Permite leitura síncrona instantânea pela UI sem aguardar round-trip USB.
    this.estadosPinos = {};
    this.analogStates = {};

    // --- Buffer de Entrada ---
    // Fila FIFO para acumular bytes parciais até formar um comando completo.
    this.buffer = [];

    // --- Otimização de Configuração (Memoization) ---
    // Set para rastrear quais pinos já foram inicializados no hardware,
    // evitando envio redundante de comandos de configuração (SET_PIN_MODE).
    this.configuredPins = new Set();

    // Inicialização dos valores padrão (Default Pullup para Digital)
    for (let i = 0; i < 16; i++) this.estadosPinos[i] = 1;
    for (let i = 0; i < 6; i++) this.analogStates[i] = 0;
  }

  // ===========================================
  // GESTÃO DE CONEXÃO E STREAMS
  // ===========================================

  // Callback para "spy" (Monitor Serial)
  private externalDataListener: ((data: Uint8Array) => void) | null = null;

  public setExternalDataListener(callback: ((data: Uint8Array) => void) | null) {
    this.externalDataListener = callback;
  }

  private currentBaudRate: number = 9600;

  public getBaudRate(): number {
    return this.currentBaudRate;
  }

  /**
   * Estabelece a conexão serial e configura os Streams de leitura/escrita.
   * @param {SerialPort} port - Instância retornada pelo navigator.serial.requestPort().
   * @param {number} baudRate - Taxa de transmissão (Padrão Firmata: 57600, mas PiCode usa 9600).
   */
  async connect(port: any, baudRate = 9600) {
    this.port = port;
    this.currentBaudRate = baudRate;
    try {
      if (!this.port) throw new Error('Porta não definida');

      // Garante que a porta esteja aberta antes de tentar obter os locks
      if (!this.port.readable) {
        // console.log(`[StageBoard] Abrindo porta a ${baudRate} bps...`);
        await this.port.open({ baudRate: baudRate });
      }

      // --- Stream Locking ---
      // A Web Serial API exige o bloqueio exclusivo (Lock) dos streams
      // para permitir leitura e escrita.
      if (!this.writer && this.port.writable && !this.port.writable.locked) {
        this.writer = this.port.writable.getWriter();
      }

      if (!this.reader && this.port.readable && !this.port.readable.locked) {
        this.reader = this.port.readable.getReader();
      }

      this.isConnected = true;
      this.configuredPins.clear(); // Reseta cache de configuração para nova sessão

      // console.log("[StageBoard] Conexão estabelecida.");
      this.buffer = [];

      // Inicia o loop de leitura em background (Non-blocking)
      this.readLoop();
    } catch (error) {
      console.error('[StageBoard] Erro Crítico na Conexão:', error);
      this.isConnected = false;
      // Rollback: Tenta liberar recursos em caso de falha parcial
      if (this.reader) {
        try {
          this.reader.releaseLock();
        } catch (e) {
          console.error(e);
        }
        this.reader = null;
      }
      if (this.writer) {
        try {
          this.writer.releaseLock();
        } catch (e) {
          console.error(e);
        }
        this.writer = null;
      }
      throw error;
    }
  }

  /**
   * Altera a taxa de transmissão (Baud Rate) da conexão atual.
   * @param {number} newRate - Nova taxa de transmissão.
   */
  async setBaudRate(newRate: number) {
    if (!this.port) return;
    if (this.currentBaudRate === newRate && this.isConnected) return;

    // console.log(`[StageBoard] Alterando Baud Rate para ${newRate}...`);
    const currentPort = this.port;
    this.currentBaudRate = newRate;

    try {
      // 1. Desconecta (fecha streams e porta)
      await this.disconnect();

      // 2. Reconecta com nova taxa
      // Pequeno delay para garantir liberação do SO
      await new Promise((r) => setTimeout(r, 100));
      await this.connect(currentPort, newRate);
    } catch (error) {
      console.error('[StageBoard] Erro ao alterar Baud Rate:', error);
      // Tenta recuperar com baud antigo ou estado limpo?
      throw error;
    }
  }

  /**
   * Encerra a conexão e libera o hardware.
   * Essencial para permitir que outras aplicações (ou reload da página) usem a porta.
   */
  async disconnect() {
    this.isConnected = false;

    // Cancelamento do Reader: Força a saída do loop de leitura
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (e) {
        console.error(e);
      }
      this.reader = null;
    }

    // Liberação do Writer
    if (this.writer) {
      try {
        this.writer.releaseLock();
      } catch (e) {
        console.error(e);
      }
      this.writer = null;
    }

    // Aguarda um curto período para os streams fecharem
    await new Promise((r) => setTimeout(r, 100));

    // Fechamento físico da porta
    if (this.port && this.port.readable) {
      try {
        await this.port.close();
      } catch (e) {
        console.warn('Erro ao fechar porta física:', e);
      }
    }
  }

  // ===========================================
  // LOOP DE LEITURA (ASYNC ITERATOR)
  // ===========================================

  /**
   * Loop principal de captura de dados.
   * Mantém a leitura contínua enquanto houver conexão.
   */
  async readLoop() {
    // console.log("[StageBoard] Iniciando loop de leitura...");
    while (this.isConnected && this.reader) {
      try {
        // Await aqui suspende a execução até chegarem novos bytes (Eficiência de CPU)
        if (!this.reader) break;
        const { value, done } = await this.reader.read();
        if (done) break; // Stream encerrado pelo sistema/usuário

        // REPASSE IMEDIATO PARA O MONITOR (Spy Mode)
        if (value) {
          // console.log("[StageBoard] Bytes recebidos:", value.length,  this.externalDataListener ? "(Spy Ativo)" : "(Sem Spy)");
          if (this.externalDataListener) {
            try {
              this.externalDataListener(value);
            } catch (errSpy) {
              console.error('Erro no Spy:', errSpy);
            }
          }
        }

        if (value) this.processarEntrada(value);
      } catch (e) {
        break;
      }
    }
  }

  // ===========================================
  // PARSER E TRATAMENTO DE DADOS
  // ===========================================

  /**
   * Processa bytes brutos e decodifica o protocolo.
   * Implementa mecanismo de segurança contra Buffer Overflow.
   * @param {Uint8Array} bytes - Chunk de dados recebido.
   */
  processarEntrada(bytes: Uint8Array) {
    // 1. Ingestão de Dados:
    // Loop for é utilizado por ser mais performático que Array.push(...spread) em high-throughput.
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }

    // 2. Failsafe / Garbage Collection:
    // Se o processamento JS for mais lento que a taxa de entrada (Arduino spamming data),
    // o buffer cresceria infinitamente travando a Main Thread.
    // Limite de 2KB imposto para forçar descarte e recuperar responsividade.
    if (this.buffer.length > 2048) {
      // console.warn("[StageBoard] Buffer Overflow detectado. Realizando flush...");
      this.buffer = [];
      return;
    }

    // 3. Decodificação (State Machine):
    while (this.buffer.length > 0) {
      const cmd = this.buffer[0];

      // --- PROTOCOLO DIGITAL (0x90 - 0x9F) ---
      // Estrutura: [Opcode(Porta), LSB, MSB]
      if ((cmd & 0xf0) === 0x90) {
        if (this.buffer.length < 3) break; // Aguarda pacote completo

        const porta = cmd & 0x0f;
        const dados = this.buffer[1] | (this.buffer[2] << 7); // Reconstrói 8 bits a partir de 2x7 bits

        // Itera pelos 8 pinos da porta recebida
        for (let i = 0; i < 8; i++) {
          const pino = porta * 8 + i;
          if (pino < 2) continue; // Ignora pinos RX/TX (Proteção Serial)

          const estado = dados & (1 << i) ? 1 : 0;

          // Atualiza Cache e Dispara Eventos apenas em mudança de estado (Edge Detection)
          if (this.estadosPinos[pino] !== estado) {
            this.estadosPinos[pino] = estado;

            // Callback Assíncrono: setTimeout(0) evita bloquear o parser
            if (estado === 0 && this.callbacksBtn[pino]) {
              setTimeout(() => this.callbacksBtn[pino](), 0);
            }
          }
        }
        this.buffer.splice(0, 3); // Remove pacote processado
      }
      // --- PROTOCOLO ANALÓGICO (0xE0 - 0xEF) ---
      // Estrutura: [Opcode(Pino), LSB, MSB]
      else if ((cmd & 0xf0) === 0xe0) {
        if (this.buffer.length < 3) break;
        const pinoA = cmd & 0x0f;
        const valor = this.buffer[1] | (this.buffer[2] << 7); // Reconstrói 10 bits (0-1023)

        if (this.callbacksLuz[pinoA]) this.callbacksLuz[pinoA](valor);
        this.analogStates[pinoA] = valor;

        this.buffer.splice(0, 3);
      }
      // --- COMANDOS SYSEX / FLUSH ---
      else if (cmd === 0xf0) {
        const fim = this.buffer.indexOf(0xf7); // Procura terminador SysEx
        if (fim !== -1) this.buffer.splice(0, fim + 1);
        else break;
      } else if (cmd === 0xf9) {
        // Report Version (Ignorado)
        if (this.buffer.length < 3) break;
        this.buffer.splice(0, 3);
      } else {
        // Byte desconhecido ou dessincronizado: descarta o primeiro byte e tenta realinhar
        this.buffer.shift();
      }
    }
  }

  // ===========================================
  // API PÚBLICA (INTERFACE DE HARDWARE)
  // ===========================================

  /**
   * Obtém o estado digital de um pino.
   * Implementa 'Lazy Configuration': configura o pino automaticamente na primeira leitura.
   * @param {number|string} pin - ID do pino.
   * @returns {boolean} True (HIGH) ou False (LOW).
   */
  getDigital(pin: number | string): boolean {
    const pino = parseInt(pin as string);

    // Auto-Configuração: Verifica se o pino já foi inicializado nesta sessão
    if (!this.configuredPins.has(pino)) {
      // console.log(`[StageBoard] Auto-Config (Input): Pino ${pino}`);

      // 1. Define modo INPUT (0xF4)
      this.enviarBytes([0xf4, pino, 0x00]);

      // 2. Habilita 'Reporting' para a porta correspondente (0xD0)
      const porta = Math.floor(pino / 8);
      this.enviarBytes([0xd0 | porta, 1]);

      this.configuredPins.add(pino);
    }

    return this.estadosPinos[pino] === 1;
  }

  /**
   * Define o estado digital de um pino (Escrita).
   * @param {number|string} pin - ID do pino.
   * @param {number|boolean} val - Estado (1/true=HIGH, 0/false=LOW).
   */
  setDigital(pin: number | string, val: number | boolean) {
    const pino = parseInt(pin as string);
    const valor = val === true || val === 1 ? 1 : 0;

    // Auto-Configuração para OUTPUT
    // Firmata não exige configurar como OUTPUT explicitamente se formos usar digitalWrite (o comando Digital Message atualiza o registro da porta).
    // POREM, é boa prática garantir o modo.
    // Se quisermos, podemos adicionar here. Mas o código legado não tinha explícito para setDigital, assumia que funcionava.
    // Vamos manter simples: Envia o comando de PORTA.

    // O comando Firmata de "Digital Message" (0x90) atualiza UMA PORTA INTEIRA (8 pinos).
    // Então precisamos saber o estado atual dos outros pinos dessa porta para não alterá-los.
    // Nosso cache 'estadosPinos' armazena leituras (Inputs). Para outputs, precisaríamos de um cache de output.
    // MAS espere: StageBoard.js legado NÃO TINHA setDigital no código que li!
    // O código legado tinha 'getDigital' e 'registerButton'.
    // O setDigital estava faltando no arquivo que li?
    // Vamos re-checar o arquivo main.js ou generators.
    // No main.js, vi imports mas não vi uso direto de setDigital.
    // No entanto, no 'board_blocks.ts' tem blocos 'set_digital_pin_pt'.
    // Se o usuário quer usar esses blocos, preciso implementar setDigital.

    // Implementação Padrão Firmata de setDigital:
    // Envia SET_PIN_MODE (0xF4) -> OUTPUT (1) (se ainda não configurado)
    // Envia DIGITAL_MESSAGE (0x90) com a máscara de bits atualizada.

    if (!this.configuredPins.has(`OUT_${pino}`)) {
      this.enviarBytes([0xf4, pino, 0x01]); // OUTPUT
      this.configuredPins.add(`OUT_${pino}`);
    }

    // Atualiza cache local (mesmo que misture input/output, precisamos saber o estado para reconstruir o byte)
    this.estadosPinos[pino] = valor;

    const porta = Math.floor(pino / 8);
    let mask = 0;
    for (let i = 0; i < 8; i++) {
      const p = porta * 8 + i;
      if (this.estadosPinos[p]) mask |= 1 << i;
    }

    // Envia 3 bytes: 0x90|porta, LSB(mask), MSB(mask)
    this.enviarBytes([0x90 | porta, mask & 0x7f, (mask >> 7) & 0x7f]);
  }

  /**
   * Define valor PWM (Analógico Write).
   */
  setPwm(pin: number | string, val: number) {
    const pino = parseInt(pin as string);
    const valor = Math.max(0, Math.min(255, val)); // Clamp 0-255

    if (!this.configuredPins.has(`PWM_${pino}`)) {
      this.enviarBytes([0xf4, pino, 0x03]); // PWM
      this.configuredPins.add(`PWM_${pino}`);
    }

    // Protocolo Analog Message (também usado para PWM em alguns pinos): 0xE0 | pino
    this.enviarBytes([0xe0 | pino, valor & 0x7f, (valor >> 7) & 0x7f]);
  }

  /**
   * Move Servo.
   */
  setServo(pin: number | string, degree: number) {
    const pino = parseInt(pin as string);
    const angulo = Math.max(0, Math.min(180, degree));

    if (!this.configuredPins.has(`SERVO_${pino}`)) {
      this.enviarBytes([0xf4, pino, 0x04]); // SERVO
      this.configuredPins.add(`SERVO_${pino}`);
    }

    // Analog Message para Servo
    this.enviarBytes([0xe0 | pino, angulo & 0x7f, (angulo >> 7) & 0x7f]);
  }

  /**
   * Obtém valor analógico.
   * Implementa 'Lazy Configuration' para ADC.
   */
  getAnalog(pin: number | string): number {
    const pino = parseInt(pin as string);
    // "A0" -> 0. "0" -> 0.
    // Se vier string "A0", parseInt dá NaN? Não, "A0" -> NaN.
    // Corrigir parsing se vier "A0"
    let pinoIndex = pino;
    if (typeof pin === 'string' && pin.startsWith('A')) {
      pinoIndex = parseInt(pin.substring(1));
    }

    const reportKey = 'A' + pinoIndex;
    if (!this.configuredPins.has(reportKey)) {
      // console.log(`[StageBoard] Auto-Config (ADC): A${pinoIndex}`);
      // Report Analog Pin: 0xC0 | pin, 1 (Enable)
      this.enviarBytes([0xc0 | pinoIndex, 1]);
      this.configuredPins.add(reportKey);
    }
    return this.analogStates[pinoIndex] || 0;
  }

  /**
   * Registra callback para interrupção digital (Botões).
   * Configura automaticamente como INPUT_PULLUP.
   */
  registerButton(pin: number | string, callback: () => void) {
    const pino = parseInt(pin as string);
    this.callbacksBtn[pino] = callback;

    // Configuração de Hardware: Input Pullup (0x0B)
    this.enviarBytes([0xf4, pino, 0x0b]);

    // Habilita Reporting
    const porta = Math.floor(pino / 8);
    this.enviarBytes([0xd0 | porta, 1]);

    this.configuredPins.add(pino);
  }

  registerSensor(pin: number | string, callback: (val: number) => void) {
    let pinoIndex = parseInt(pin as string);
    if (typeof pin === 'string' && pin.startsWith('A')) {
      pinoIndex = parseInt(pin.substring(1));
    }

    this.callbacksLuz[pinoIndex] = callback;
    this.enviarBytes([0xc0 | pinoIndex, 1]);
    this.configuredPins.add('A' + pinoIndex);
  }

  /**
   * Método interno para escrita no stream de saída.
   * Utiliza 'fire-and-forget' (sem await no chamador) para performance.
   */
  async enviarBytes(array: number[]) {
    if (!this.writer) return;
    try {
      await this.writer.write(new Uint8Array(array));
    } catch (e) {
      console.error(e);
    }
  }
}
