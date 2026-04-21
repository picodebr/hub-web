/**
 * MLExtensionModal - Vision Lab (Seletor de Modelos de IA).
 *
 * Responsabilidade: Interface de escolha para modelos de Teachable Machine.
 * Busca modelos disponíveis em um JSON estático (simulando API),
 * gerencia a escala responsiva do modal e sincroniza as classes (labels)
 * do modelo selecionado com o objeto global 'window' para consumo pelo Blockly.
 */
'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useProject } from '@/_base/context/ProjectContext';
import { IGlobalWindow, IMLModel } from '@/_base/domain/entities';

interface MLModelPreview {
  id: string;
  name: string;
  thumbnail: string;
  modelJsonUrl: string;
  modelBinUrl: string;
  metadataUrl: string;
}

interface MLExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'stage' | 'upload';
}

export const MLExtensionModal: React.FC<MLExtensionModalProps> = ({ isOpen, onClose, mode }) => {
  const { setActiveStageMLModel, activeStageMLModel, setActiveUploadMLModel, activeUploadMLModel } = useProject();

  const [models, setModels] = useState<MLModelPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // ESCALA DINÂMICA (HYBRID SCALE):
    // Como o modal de seleção é alto, aplicamos um fator de escala
    // baseado na altura da viewport para garantir que ele caiba
    // inteiramente em telas menores (ex: laptops 720p).
    const handleScale = () => {
      const threshold = 820; // Altura base do modal
      const vh = window.innerHeight;
      if (vh < threshold) {
        setScale(vh / threshold);
      } else {
        setScale(1);
      }
    };
    handleScale();
    window.addEventListener('resize', handleScale);
    return () => window.removeEventListener('resize', handleScale);
  }, []);

  const activeModelId = mode === 'stage' ? activeStageMLModel?.id : activeUploadMLModel?.id;

  useEffect(() => {
    if (!isOpen) return;

    // Use a slight delay to avoid cascading render warning in some strict linters,
    // or ensure it's handled as part of the loading lifecycle.
    const timer = setTimeout(() => {
      setLoading(true);
      fetch('/mock_api/ml_models.json')
        .then((res) => res.json())
        .then((data) => {
          setModels(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Erro ao carregar modelos:', err);
          setLoading(false);
        });
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Sincroniza labels globais para o Blockly consumir via window (acesso tipado)
  useEffect(() => {
    if (activeStageMLModel) {
      const win = window as unknown as IGlobalWindow;
      win.ml_labels = {
        ...(win.ml_labels || {}),
        stage: activeStageMLModel.labels,
      };
      win.activeMLModelLabels = activeStageMLModel.labels;
    }
  }, [activeStageMLModel]);

  useEffect(() => {
    if (activeUploadMLModel) {
      const win = window as unknown as IGlobalWindow;
      win.ml_labels = {
        ...(win.ml_labels || {}),
        upload: activeUploadMLModel.labels,
      };
      win.activeUploadMLModelLabels = activeUploadMLModel.labels;
    }
  }, [activeUploadMLModel]);

  const handleSelectModel = async (model: MLModelPreview) => {
    try {
      const metaRes = await fetch(model.metadataUrl);
      const metaData = await metaRes.json();

      const activeModel: IMLModel = {
        id: model.id,
        name: model.name,
        modelJsonUrl: model.modelJsonUrl,
        modelBinUrl: model.modelBinUrl,
        metadataUrl: model.metadataUrl,
        labels: metaData.labels || ['Desconhecido'],
      };

      if (mode === 'stage') {
        setActiveStageMLModel(activeModel);
      } else {
        setActiveUploadMLModel(activeModel);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao carregar metadata do modelo:', err);
      alert('Falha ao carregar metadados do modelo.');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6" style={{ zIndex: 1000000 }}>
      {/* Modal Container */}
      <div
        className="bg-white shadow-2xl flex flex-col max-h-[95vh] overflow-hidden transform transition-all duration-300"
        style={{
          width: 'min(900px, 95vw)',
          borderRadius: '16px',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          border: 'none',
        }}
      >
        {/* Header: Hybrid Scratch/CodePreview Style */}
        <div className="flex items-center p-4 bg-white relative border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-2.5 rounded-2xl shadow-sm">
              <i className="bi bi-robot text-[#0d6efd] text-2xl"></i>
            </div>
            <div className="flex flex-col">
              <h2 className="m-0 text-xl font-bold text-[#1e293b] leading-tight">Vision Lab</h2>
              <p className="m-0 text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1 text-left">Escolha seu Modelo</p>
            </div>
          </div>

          <div className="absolute right-4">
            <button
              onClick={onClose}
              className="p-2 transition-all duration-200"
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                borderRadius: '8px',
              }}
              title="Fechar"
            >
              <i className="bi bi-x-lg text-lg"></i>
            </button>
          </div>
        </div>

        {/* Corpo (Lista de Modelos) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-[#F8FAFC]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-20 h-20 animate-bounce">
                <i className="bi bi-cpu text-6xl text-blue-400"></i>
              </div>
              <p className="mt-4 font-black text-blue-500 text-lg animate-pulse tracking-wide">Despertando os robôs...</p>
            </div>
          ) : (
            /* Grid Responsivo para Cartões */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {models.map((m, index) => {
                const isSelected = m.id === activeModelId;
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectModel(m)}
                    className={`group relative bg-white border-2 rounded-2xl aspect-square p-5 cursor-pointer transition-all duration-300 flex flex-col items-center justify-between text-center shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95 ${
                      isSelected ? 'border-[#0d6efd] bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'
                    }`}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {/* Badge de Selecionado */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-[#0d6efd] text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md animate-in fade-in zoom-in z-10 border-2 border-white">
                        <i className="bi bi-check-lg text-sm"></i>
                      </div>
                    )}

                    {/* Ícone / Imagem */}
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center p-2 transition-colors duration-300 shadow-inner shrink-0 ${
                        isSelected ? 'bg-white' : 'bg-gray-50 group-hover:bg-blue-50'
                      }`}
                    >
                      <Image
                        src={m.thumbnail}
                        alt={m.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                      />
                    </div>

                    {/* Color exactly #64748b via inline style to avoid CSS overrides */}
                    <div className="flex-1 flex items-center justify-center w-full my-3">
                      <h3 className="text-sm font-bold leading-tight break-words line-clamp-2 w-full" style={{ color: '#64748b' }}>
                        {m.name}
                      </h3>
                    </div>

                    {/* Botão de Status */}
                    <div
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-full transition-all w-full shrink-0 ${
                        isSelected ? 'bg-[#0d6efd] text-white shadow-sm' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}
                    >
                      {isSelected ? 'Em Uso' : 'Selecionar'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
