/**
 * Componente SerialMonitor - Terminal para comunicação serial.
 *
 * Permite que o usuário visualize em tempo real as mensagens enviadas pela placa USB
 * (via Serial.print do Arduino).
 */

'use client';

import { useStage } from '@/_base/context/StageContext';
import { useEffect, useRef, useState } from 'react';

interface SerialMonitorProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void; // Função para voltar ao menu anterior de ferramentas
}

export default function SerialMonitor({ isOpen, onClose, onBack }: SerialMonitorProps) {
  // Acessa o estado global de conexão serial do StageContext
  const { serialPort, isSerialConnected, connectSerial, disconnectSerial, setIsBusy, board } = useStage();

  // Estados locais para controlar a saída do texto e o comportamento da UI
  const [output, setOutput] = useState<string>('');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [baudRate, setBaudRate] = useState(9600);

  // Referências para o leitor serial e para o controle de rolagem
  const readerRef = useRef<any>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const keepReadingRef = useRef(false);

  // Sync Baud Rate with Board on Open
  useEffect(() => {
    if (isOpen && board) {
      // Tenta obter o baud rate atual da placa, se disponível
      if (typeof board.getBaudRate === 'function') {
        setBaudRate(board.getBaudRate());
      }
    }
  }, [isOpen, board]);

  /**
   * Altera o Baud Rate
   */
  const handleBaudRateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRate = Number(e.target.value);
    setBaudRate(newRate);

    if (board) {
      if (typeof board.setBaudRate === 'function') {
        try {
          await board.setBaudRate(newRate);
        } catch (err) {
          console.error('Falha ao mudar Baud Rate:', err);
        }
      }
    }
  };

  // Efeito para Rolagem Automática (Auto-scroll)
  useEffect(() => {
    if (isAutoScroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, isAutoScroll]);

  // Efeito para Gestão de Abertura/Fechamento do Monitor
  useEffect(() => {
    // Se o monitor for fechado, sinaliza para parar a leitura e limpa o leitor
    if (!isOpen) {
      keepReadingRef.current = false;
      if (readerRef.current) {
        readerRef.current.cancel().catch(() => {});
        readerRef.current = null;
      }
      return;
    }
  }, [isOpen]);

  // Efeito para o Loop de Leitura Serial (Lê os bytes da Web Serial API)
  useEffect(() => {
    // Só lê se o monitor estiver aberto, a porta conectada e o usuário clicou em "Conectar" no monitor
    if (!isOpen || !isSerialConnected || !isMonitoring) return;

    // Função de tratamento de dados vindo do StageBoard (Spy Mode)
    const handleData = (data: Uint8Array) => {
      if (keepReadingRef.current) {
        const text = new TextDecoder().decode(data);
        setOutput((prev) => (prev + text).slice(-5000));
      }
    };

    keepReadingRef.current = true;

    if (board) {
      try {
        board.setExternalDataListener(handleData);
      } catch (e) {
        console.error('Erro ao configurar listener do Monitor Serial:', e);
      }
    }

    return () => {
      keepReadingRef.current = false;
      if (board) {
        try {
          board.setExternalDataListener(null);
        } catch (e) {}
      }
    };
  }, [isOpen, isSerialConnected, isMonitoring, board]);

  // Efeito para limpar o monitor ao abrir
  useEffect(() => {
    if (isOpen) {
      setOutput(''); // Inicia sessão limpa
      setIsMonitoring(false); // Aguarda o clique em "Conectar"
    } else {
      setIsMonitoring(false);
      setIsBusy(false);
    }
  }, [isOpen]);

  /**
   * Lida com a desconexão manual
   */
  const handleDisconnect = async () => {
    keepReadingRef.current = false;

    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) {
        console.warn('Aviso ao cancelar leitor:', e);
      }
      readerRef.current = null;
    }

    await disconnectSerial();
  };

  if (!isOpen) return null;

  const borderColor = '#0d6efd';

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style={{ border: `3px solid ${borderColor}` }}>
          {/* CABEÇALHO DO MONITOR */}
          <div className="modal-header border-0 bg-white pb-2">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40, backgroundColor: '#cfe2ff', color: borderColor }}
              >
                <i className="bi bi-terminal-fill fs-5"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark lh-1">Monitor Serial</h5>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Comunicação direta com a placa
                </small>
              </div>
            </div>

            {/* Controles de Baud Rate e Fechar */}
            <div className="ms-auto d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm border-secondary text-secondary "
                style={{ width: '130px', borderRadius: '10px' }}
                value={baudRate}
                onChange={handleBaudRateChange}
              >
                <option value="9600">9600 baud</option>
                <option value="57600">57600 baud</option>
                <option value="115200">115200 baud</option>
              </select>

              <button type="button" className="btn p-0 border-0 ms-2" onClick={onBack || onClose}>
                <i className="bi bi-x-lg text-dark"></i>
              </button>
            </div>
          </div>

          {/* CORPO DO MONITOR (TERMINAL) */}
          <div className="modal-body bg-white p-3">
            <div className="bg-black rounded-3 p-2 shadow-inner" style={{ height: '350px', border: '1px solid #444', position: 'relative' }}>
              <textarea
                ref={outputRef}
                className="form-control bg-black text-success font-monospace border-0 h-100 w-100 p-2"
                style={{ resize: 'none', boxShadow: 'none', fontSize: '0.9rem' }}
                readOnly
                value={output}
                placeholder="// Aguardando dados..."
              ></textarea>
            </div>
          </div>

          {/* RODAPÉ E CONTROLES DE CONEXÃO */}
          <div className="modal-footer border-0 bg-white d-flex justify-content-between py-3">
            <div className="form-check form-check-inline small m-0 ms-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="checkAutoscroll"
                checked={isAutoScroll}
                onChange={(e) => setIsAutoScroll(e.target.checked)}
              />
              <label className="form-check-label fw-bold text-secondary" htmlFor="checkAutoscroll">
                Rolagem Automática
              </label>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary px-3 rounded-pill" onClick={() => setOutput('')}>
                <i className="bi bi-eraser me-1"></i> Limpar
              </button>

              {/* Lógica de Alternância Conectar/Desconectar */}
              {!isMonitoring || !isSerialConnected ? (
                <button
                  className="btn btn-sm btn-primary px-4 rounded-pill fw-bold shadow-sm"
                  onClick={async () => {
                    await connectSerial(false);
                    setIsMonitoring(true);
                  }}
                >
                  <i className="bi bi-plug-fill me-1"></i> Conectar
                </button>
              ) : (
                <button className="btn btn-sm btn-danger px-4 rounded-pill fw-bold" onClick={() => setIsMonitoring(false)}>
                  <i className="bi bi-x-circle me-1"></i> Desconectar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
