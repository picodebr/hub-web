/**
 * Componente HumidityModal - Monitor de Umidade em Tempo Real.
 *
 * Este modal conecta-se à porta serial para ler valores de um sensor de umidade
 * (entrada analógica 0-1023) e exibe uma animação de "tanque de água" que enche
 * ou esvazia conforme o nível detectado.
 */

'use client';

import { useSerialLine } from '@/_base/hooks/useSerialLine';
import { useEffect, useState } from 'react';

interface HumidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

export default function HumidityModal({ isOpen, onClose, onBack }: HumidityModalProps) {
  // Hook customizado para ler uma linha da porta serial (baudRate 9600)
  const { lastLine, isConnected, connect, disconnect } = useSerialLine(9600);
  const [value, setValue] = useState(0);

  // Processa o processamento dos dados recebidos via Serial
  useEffect(() => {
    if (!lastLine) return;
    const parsed = parseInt(lastLine, 10);
    if (!isNaN(parsed)) {
      // Garante que o valor esteja no intervalo analógico padrão (0-1023)
      setValue(Math.max(0, Math.min(1023, parsed)));
    }
  }, [lastLine]);

  // Cleanup
  useEffect(() => {
    if (!isOpen && isConnected) disconnect();
  }, [isOpen, isConnected, disconnect]);

  const percent = Math.round((value / 1023) * 100);
  const waveTop = 100 - percent * 1.1;
  const borderColor = '#0dcaf0'; // Cyan/Info

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style={{ border: `3px solid ${borderColor}` }}>
          {/* HEADER */}
          <div className="modal-header border-0 bg-white pb-0">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40, backgroundColor: '#cff4fc', color: '#0dcaf0' }}
              >
                <i className="bi bi-droplet-fill fs-5"></i>
              </div>
              <h5 className="modal-title fw-bold text-dark">Monitor de Umidade</h5>
            </div>
            <button
              type="button"
              className="btn p-0 border-0"
              onClick={() => {
                disconnect();
                onBack();
              }}
            >
              <i className="bi bi-x-lg text-dark"></i>
            </button>
          </div>

          <div className="modal-body text-center py-5">
            {/* WATER TANK */}
            <div
              className="water-tank-container mx-auto mb-4 position-relative"
              style={{
                width: '220px',
                height: '220px',
                background: '#f8f9fa',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '6px solid #fff',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05), 0 10px 20px rgba(13, 202, 240, 0.2)',
              }}
            >
              {/* The Wave */}
              <div
                style={{
                  position: 'absolute',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'linear-gradient(to top, #0d6efd, #0dcaf0)',
                  borderRadius: '38%',
                  opacity: 0.9,
                  top: `${waveTop}%`,
                  transition: 'top 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'spin-wave 5s infinite linear',
                }}
              />

              {/* Value Text Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  fontSize: '3.5rem',
                  fontWeight: 'bold',
                  color: percent > 50 ? 'white' : '#495057',
                  textShadow: percent > 50 ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                  transition: 'color 0.3s',
                }}
              >
                {percent}
                <small style={{ fontSize: '0.6em' }}>%</small>
              </div>
            </div>

            {/* RAW VALUE */}
            <div className="text-muted small fw-bold">Entrada Analógica: {value}</div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer border-0 bg-white justify-content-center py-3">
            <div>
              {!isConnected ? (
                <button
                  className="btn rounded-pill px-5 fw-bold shadow-sm text-white"
                  onClick={connect}
                  style={{
                    background: 'linear-gradient(45deg, #0d6efd, #0dcaf0)',
                    border: 'none',
                    fontSize: '1.1rem',
                  }}
                >
                  <i className="bi bi-play-circle-fill me-2"></i>
                  Iniciar
                </button>
              ) : (
                <button className="btn btn-outline-danger px-5 rounded-pill fw-bold" onClick={disconnect}>
                  Parar
                </button>
              )}
            </div>
          </div>

          <style jsx>{`
            @keyframes spin-wave {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
