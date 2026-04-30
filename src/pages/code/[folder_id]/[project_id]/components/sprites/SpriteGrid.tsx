/**
 * Exibição visual dos atores em formato de grade para a biblioteca de seleção.
 */
'use client';
import React from 'react';
import Image from 'next/image';
import { SpriteData } from '@/_base/domain/entities';

interface SpriteGridProps {
  sprites: SpriteData[];
  activeSpriteId: string;
  selectSprite: (id: string) => void;
  deleteSprite: (id: string) => void;
  // addSprite: (file?: File) => void;
  addSurpriseSprite: () => void;
  openSpriteGallery: () => void;
  openPaintEditor: () => void;
  buttonScale: number;
  spriteInputRef: React.RefObject<HTMLInputElement | null>;
}

export function SpriteGrid({
  sprites,
  activeSpriteId,
  selectSprite,
  deleteSprite,
  addSurpriseSprite,
  openSpriteGallery,
  openPaintEditor,
  buttonScale,
  spriteInputRef,
}: SpriteGridProps) {
  return (
    <div className="flex-grow-1 position-relative bg-white" style={{ minHeight: 0, overflow: 'visible' }}>
      {/* SCROLL CONTAINER INTERNO */}
      <div className="p-3 w-100 h-100 position-absolute" style={{ overflowY: 'auto', inset: 0 }}>
        <div className="d-flex flex-wrap gap-2 content-start align-items-start">
          {sprites.map((sprite) => (
            <div
              key={sprite.id}
              className={`sprite-card d-flex flex-column align-items-center justify-content-between p-1 rounded bg-white position-relative group ${activeSpriteId === sprite.id ? 'border-primary ring-2 shadow-sm' : ''}`}
              style={{
                cursor: 'pointer',
                border: activeSpriteId === sprite.id ? '1px solid #4C97FF' : '1px solid #ccc',
              }}
              onClick={() => {
                selectSprite(sprite.id);
                window.dispatchEvent(new CustomEvent('flash-sprite', { detail: sprite.id }));
              }}
            >
              {/* Botão de Excluir Ator (aparece apenas no selecionado) */}
              {sprites.length > 1 && (
                <button
                  className={`position-absolute d-flex align-items-center justify-content-center shadow-sm transition-all border-0 ${activeSpriteId === sprite.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'}`}
                  style={{
                    width: '18px',
                    height: '18px',
                    top: '-5px',
                    right: '-5px',
                    zIndex: 20,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    color: '#575e75',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ff4d4d';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#575e75';
                  }}
                  onClick={(e) => {
                    if (activeSpriteId === sprite.id) {
                      e.stopPropagation();
                      deleteSprite(sprite.id);
                    }
                    // Se não for o ativo, deixa propagar para o card selecionar o ator
                  }}
                >
                  <i className="bi bi-x-lg" style={{ fontSize: '8px' }}></i>
                </button>
              )}

              <div className="sprite-card-img-area mt-1 px-1">
                <Image
                  src={sprite.costumes?.find((c) => c.id === sprite.currentCostumeId)?.url || sprite.costume || '/img/empty.png'}
                  alt={sprite.name}
                  width={48}
                  height={48}
                  style={{ maxWidth: '100%', objectFit: 'contain' }}
                  unoptimized
                />
              </div>
              <span
                className="sprite-name-label small text-truncate w-100 text-center mb-1 user-select-none"
                style={{ fontSize: '0.7rem', color: '#555' }}
              >
                {sprite.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scratch-style Hover Menu for Adding Sprites */}
      <div className="add-sprite-container" style={{ transform: `scale(${buttonScale})`, transformOrigin: 'bottom right' }}>
        <div className="add-sprite-label shadow-sm">Selecione um Ator</div>
        <div className="add-sprite-menu shadow">
          {/* 1. Upload Button */}
          <button className="add-sprite-item" onClick={() => spriteInputRef.current?.click()} title="Carregar Ator">
            <i className="bi bi-upload"></i>
          </button>

          {/* 2. Surprise Button */}
          <button className="add-sprite-item" onClick={() => addSurpriseSprite()} title="Surpresa">
            <i className="bi bi-stars"></i>
          </button>

          {/* 3. Paint Button */}
          <button className="add-sprite-item" onClick={() => openPaintEditor()} title="Pintar">
            <i className="bi bi-brush"></i>
          </button>

          {/* 4. Search Button */}
          <button className="add-sprite-item" onClick={() => openSpriteGallery()} title="Procurar">
            <i className="bi bi-search"></i>
          </button>
        </div>

        <button className="btn btn-primary btn-add-sprite-main shadow" title="Escolher um Ator" onClick={() => openSpriteGallery()}>
          <i className="bi bi-person-plus-fill"></i>
        </button>
      </div>
    </div>
  );
}
