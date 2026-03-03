/**
 * Componente ToolsModal - Menu de Ferramentas da Placa.
 *
 * Permite ao usuário escolher entre diferentes ferramentas de monitoramento:
 * - Monitor Serial (Terminal de texto)
 * - Monitor de Umidade
 * - Monitor de Luminosidade
 * - Monitor de Porcentagem Genérica
 */

import { useState } from 'react';
import LuminosityModal from './monitors/LuminosityModal';
import HumidityModal from './monitors/HumidityModal';
import PercentageModal from './monitors/PercentageModal';
import { useSerial } from '@/_base/context/SerialContext';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSerial: () => void; // Abre o componente SerialMonitor
}

// Modos de visualização dentro do modal
type ToolMode = 'MENU' | 'LUMINOSITY' | 'HUMIDITY' | 'PERCENTAGE' | 'WARNING';

export default function ToolsModal({ isOpen, onClose, onOpenSerial }: ToolsModalProps) {
  const [activeTool, setActiveTool] = useState<ToolMode>('MENU');
  const { isConnected } = useSerial();

  if (!isOpen) {
    // Reseta para o menu principal quando o modal é fechado para uma melhor experiência (UX)
    if (activeTool !== 'MENU') setTimeout(() => setActiveTool('MENU'), 200);
    return null;
  }

  /**
   * Verifica e executa ação apenas se a placa estiver conectada.
   */
  const runIfConnected = (action: () => void) => {
    if (!isConnected) {
      setActiveTool('WARNING');
      return;
    }
    action();
  };

  // RENDERIZAÇÃO DE SUB-MODAIS (MONITORES ESPECÍFICOS)
  if (activeTool === 'LUMINOSITY') {
    return <LuminosityModal isOpen={true} onClose={onClose} onBack={() => setActiveTool('MENU')} />;
  }
  if (activeTool === 'HUMIDITY') {
    return <HumidityModal isOpen={true} onClose={onClose} onBack={() => setActiveTool('MENU')} />;
  }
  if (activeTool === 'PERCENTAGE') {
    return <PercentageModal isOpen={true} onClose={onClose} onBack={() => setActiveTool('MENU')} />;
  }

  // MODAL DE AVISO (WARNING)
  if (activeTool === 'WARNING') {
    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-body text-center py-5">
              <div className="mb-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                  style={{ width: 80, height: 80, backgroundColor: '#fff3cd', color: '#ffc107' }}
                >
                  <i className="bi bi-exclamation-triangle-fill fs-1"></i>
                </div>
              </div>
              <h4 className="fw-bold text-dark mb-3">Conexão Necessária</h4>
              <p className="text-secondary px-4">Para utilizar as ferramentas de monitoramento, é necessário conectar a placa primeiro.</p>
              <button className="btn btn-primary rounded-pill px-5 fw-bold mt-3" onClick={() => setActiveTool('MENU')}>
                Entendi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MENU PRINCIPAL DE SELEÇÃO
  return (
    <div
      className="modal fade show vision-lab-modal"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex={-1}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header d-flex align-items-center">
            <h5 className="modal-title">Ferramentas de Placa</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="row g-4">
              {/* CARD SERIAL */}
              <div className="col-6">
                <div className="tool-card card-serial shadow-sm" onClick={() => runIfConnected(onOpenSerial)}>
                  <div className="tool-icon-wrapper tool-icon-serial">
                    <i className="bi bi-terminal"></i>
                  </div>
                  <div className="tool-card-title">Serial</div>
                </div>
              </div>

              {/* CARD UMIDADE */}
              <div className="col-6">
                <div className="tool-card card-humidity shadow-sm" onClick={() => runIfConnected(() => setActiveTool('HUMIDITY'))}>
                  <div className="tool-icon-wrapper tool-icon-humidity">
                    <i className="bi bi-droplet-half"></i>
                  </div>
                  <div className="tool-card-title">Umidade</div>
                </div>
              </div>

              {/* CARD LUZ (LUMINOSIDADE) */}
              <div className="col-6">
                <div className="tool-card card-light shadow-sm" onClick={() => runIfConnected(() => setActiveTool('LUMINOSITY'))}>
                  <div className="tool-icon-wrapper tool-icon-light">
                    <i className="bi bi-brightness-high"></i>
                  </div>
                  <div className="tool-card-title">Luz</div>
                </div>
              </div>

              {/* CARD PORCENTAGEM (%) */}
              <div className="col-6">
                <div className="tool-card card-percent shadow-sm" onClick={() => runIfConnected(() => setActiveTool('PERCENTAGE'))}>
                  <div className="tool-icon-wrapper tool-icon-percent">
                    <i className="bi bi-pie-chart-fill"></i>
                  </div>
                  <div className="tool-card-title">%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
