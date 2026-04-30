/**
 * StageColumn - Coluna lateral do Palco (Cenários).
 *
 * Responsabilidade: Exibir a miniatura do cenário ativo e fornecer
 * um menu flutuante estilo Scratch para adicionar, pintar ou buscar
 * novos cenários (backdrops). Também permite selecionar o palco
 * como alvo ativo para edição de blocos de cenário.
 */
import React from 'react';
import Image from 'next/image';
import { BackdropData } from '@/_base/domain/entities';

interface StageColumnProps {
  activeSpriteId: string;
  backdropImage: string;
  backdrops: BackdropData[];
  selectSprite: (id: string) => void;
  addSurpriseBackdrop: () => void;
  openBackdropGallery: () => void;
  openPaintEditor: () => void;
  buttonScale: number;
  backdropInputRef: React.RefObject<HTMLInputElement | null>;
}

export function StageColumn({
  activeSpriteId,
  backdropImage,
  backdrops,
  selectSprite,
  addSurpriseBackdrop,
  openBackdropGallery,
  openPaintEditor,
  buttonScale,
  backdropInputRef,
}: StageColumnProps) {
  const isSelected = activeSpriteId === 'stage';

  return (
    <div className={`stage-selector-panel${isSelected ? ' stage-selector-panel--selected' : ''}`} onClick={() => selectSprite('stage')}>
      {/* Header — fica roxo quando selecionado, igual ao Scratch */}
      <div className="stage-selector-panel__header">
        <span className="stage-selector-panel__header-title">Palco</span>
      </div>

      {/* Miniatura do cenário ativo */}
      <div className="stage-selector-panel__thumbnail">
        {backdropImage ? (
          <Image
            src={backdropImage}
            alt="Stage"
            width={64}
            height={48}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            unoptimized
          />
        ) : null}
      </div>

      {/* Label e contagem de cenários */}
      <div className="stage-selector-panel__label">Cenários</div>
      <div className="stage-selector-panel__count">{backdrops.length}</div>

      {/* Botão flutuante estilo Scratch para adicionar cenários */}
      <div
        className="add-backdrop-container"
        style={{ transform: `scale(${buttonScale})`, transformOrigin: 'bottom right' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="add-backdrop-label shadow-sm">Selecionar Cenário</div>
        <div className="add-backdrop-menu shadow">
          <button className="add-sprite-item" onClick={() => backdropInputRef.current?.click()} title="Carregar Cenário">
            <i className="bi bi-upload"></i>
          </button>
          <button className="add-sprite-item" onClick={() => addSurpriseBackdrop()} title="Surpresa">
            <i className="bi bi-stars"></i>
          </button>
          <button className="add-sprite-item" onClick={() => openPaintEditor()} title="Pintar">
            <i className="bi bi-brush"></i>
          </button>
          <button className="add-sprite-item" onClick={() => openBackdropGallery()} title="Procurar">
            <i className="bi bi-search"></i>
          </button>
        </div>

        <button className="btn btn-primary btn-add-backdrop-main shadow-sm" title="Escolher um Cenário" onClick={() => openBackdropGallery()}>
          <div className="position-relative d-flex align-items-center justify-content-center">
            <i className="bi bi-image-fill"></i>
          </div>
        </button>
      </div>
    </div>
  );
}
