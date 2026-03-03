/**
 * Componente LuminosityModal - Monitor de Luminosidade em Tempo Real.
 *
 * Este modal exibe o nível de luz captado por um sensor (LDR), transformando o
 * valor analógico (0-1023) em uma interface dinâmica:
 * 1. O fundo da tela escurece ou clareia conforme a luz ambiente.
 * 2. O ícone do sol brilha e pulsa baseando-se na intensidade luminosa.
 */

'use client';

import { useSerialLine } from '@/_base/hooks/useSerialLine';
import { useEffect, useState } from 'react';

interface LuminosityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void; // Para retornar ao menu de ferramentas
}

export default function LuminosityModal({ isOpen, onClose, onBack }: LuminosityModalProps) {
  // Hook de conexão serial simplificada
  const { lastLine, isConnected, connect, disconnect } = useSerialLine(9600);
  const [value, setValue] = useState(0);

  // Processa os dados recebidos (0-1023)
  useEffect(() => {
    if (!lastLine) return;
    const parsed = parseInt(lastLine, 10);
    if (!isNaN(parsed)) {
      setValue(Math.max(0, Math.min(1023, parsed)));
    }
  }, [lastLine]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen && isConnected) {
      disconnect();
    }
  }, [isOpen, isConnected, disconnect]);

  // Visual calculations
  const brightnessPercent = (value / 1023) * 100;

  // Icon Opacity: 0.2 (Min) -> 1.0 (Max)
  const iconOpacity = 0.2 + (brightnessPercent / 100) * 0.8;

  // Background Color Interpolation (INNER CARD)
  // 0 -> rgb(20,20,20) (Not pure black to look good in card)
  // 1023 -> rgb(255,255,255)

  // To keep the text readable, we might invert colors or just add a text shadow.
  // Given the "Clean White Card" request, maybe we keep the CARD white,
  // and just change a visual indicators background?
  // User asked: "tela fique branca... preto"
  // Let's make the MODAL BODY background dynamic.

  const bgLevel = Math.round((value / 1023) * 235) + 20; // 20 to 255
  const bgColor = `rgb(${bgLevel}, ${bgLevel}, ${bgLevel})`;

  const textColor = bgLevel > 140 ? '#212529' : '#f8f9fa';
  const borderColor = '#ffc107'; // Warning/Yellow

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content border-0 shadow-lg rounded-4 overflow-hidden"
          style={{
            border: `3px solid ${borderColor}`,
          }}
        >
          {/* HEADER */}
          <div className="modal-header border-0 bg-white pb-0">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40, backgroundColor: '#fff3cd', color: '#ffc107' }}
              >
                <i className="bi bi-brightness-high-fill fs-5"></i>
              </div>
              <h5 className="modal-title fw-bold text-dark">Monitor de Luz</h5>
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

          {/* BODY (Dynamic BG) */}
          <div
            className="modal-body text-center py-5 d-flex flex-column align-items-center justify-content-center"
            style={{
              backgroundColor: bgColor,
              transition: 'background-color 0.1s ease',
              minHeight: '350px',
            }}
          >
            {/* SUN ICON */}
            <div className="mb-4 d-flex justify-content-center align-items-center position-relative" style={{ height: '120px', width: '120px' }}>
              {/* Halo / Glow */}
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,193,7,0.4) 0%, rgba(255,193,7,0) 70%)',
                  opacity: iconOpacity,
                  transform: `scale(${1 + value / 1023})`,
                  transition: 'all 0.1s ease',
                }}
              ></div>

              <i
                className="bi bi-sun-fill position-relative"
                style={{
                  fontSize: '80px',
                  color: bgLevel > 200 ? '#ffc107' : '#ffda6a', // Slightly lighter on dark
                  opacity: 1, // Icon always visible
                  filter: `drop-shadow(0 0 ${value / 30}px rgba(255, 193, 7, 0.8))`,
                  transition: 'all 0.1s ease',
                  transform: `scale(${0.9 + value / 2048})`,
                }}
              ></i>
            </div>

            {/* VALUES */}
            <h1 className="display-3 fw-bold mb-0" style={{ color: textColor, transition: 'color 0.2s' }}>
              {Math.round(brightnessPercent)}%
            </h1>
            <div style={{ color: textColor, opacity: 0.7, fontSize: '0.9rem' }}>Valor Serial: {value}</div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer border-0 bg-white justify-content-center py-3">
            {!isConnected ? (
              <button
                className="btn rounded-pill px-5 fw-bold shadow-sm"
                onClick={connect}
                style={{
                  backgroundColor: '#ffc107',
                  color: '#000',
                  border: 'none',
                  fontSize: '1.1rem',
                }}
              >
                <i className="bi bi-play-circle-fill me-2"></i>
                Iniciar
              </button>
            ) : (
              <button className="btn btn-outline-danger rounded-pill px-5 fw-bold" onClick={disconnect}>
                Parar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
