/**
 * Componente SpriteList - Painel de Gestão de Atores e Cenários.
 *
 * Este componente permite:
 * 1. Visualizar e editar propriedades do ator selecionado (nome, posição x/y, tamanho, direção, visibilidade).
 * 2. Listar todos os atores (sprites) do projeto, permitindo seleção, adição e exclusão.
 * 3. Gerenciar o palco (cenários/backdrops), permitindo trocar o fundo do projeto.
 */

'use client';

import { useProject } from '@/_base/context/ProjectContext';
import { useStage } from '@/_base/context/StageContext';
import React from 'react';

export default function SpriteList() {
  // Acessa dados consolidados do Projeto (Atores e Cenários)
  const {
    sprites,
    activeSpriteId,
    addSprite,
    deleteSprite,
    selectSprite,
    backdrops,
    activeBackdrop,
    addBackdrop,
    selectBackdrop,
    deleteBackdrop,
    addCostumeToSprite,
    removeCostumeFromSprite,
    getSpriteById,
    updateSprite,
  } = useProject();

  // Funções de execução do palco (troca de fantasia em tempo real)
  const { switchCostume } = useStage();

  // Imagem de fundo atual do palco
  const backdropImage = activeBackdrop?.url ?? '/img/fundo.jpg';

  // Estados para controle de abertura de modais (Galeria)
  const [isBackdropModalOpen, setIsBackdropModalOpen] = React.useState(false);
  const [isCostumeModalOpen, setIsCostumeModalOpen] = React.useState(false);

  // Referências para inputs de arquivo ocultos (Upload de imagens)
  const backdropInputRef = React.useRef<HTMLInputElement>(null);
  const costumeInputRef = React.useRef<HTMLInputElement>(null);
  const spriteInputRef = React.useRef<HTMLInputElement>(null);

  const activeSprite = getSpriteById(activeSpriteId);

  /**
   * Auxiliar para lidar com mudanças em campos numéricos das propriedades.
   */
  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!activeSprite) return;
    const val = Number(e.target.value);
    if (!isNaN(val)) updateSprite(activeSprite.id, { [field]: val });
  };

  return (
    <React.Fragment>
      <div className="sprite-management-area h-100 d-flex flex-column bg-light" style={{ fontSize: '0.85rem' }}>
        {/* 1. PAINEL DE PROPRIEDADES (Exibido apenas se um ator estiver selecionado) */}
        {activeSprite && (
          <div className="properties-panel p-2 bg-white border-bottom shadow-sm">
            <div className="d-flex align-items-center gap-3 mb-2">
              {/* Nome do Ator */}
              <div className="d-flex align-items-center gap-1 flex-grow-1">
                <span className="fw-bold text-secondary">Ator</span>
                <input
                  type="text"
                  className="form-control form-control-sm "
                  value={activeSprite.name}
                  onChange={(e) => updateSprite(activeSprite.id, { name: e.target.value })}
                />
              </div>

              {/* Coordenadas X e Y */}
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-secondary">x</span>
                <input
                  type="number"
                  className="form-control form-control-sm text-center"
                  style={{ width: '60px' }}
                  value={Math.round(activeSprite.x)}
                  onChange={(e) => handleNumChange(e, 'x')}
                />
                <span className="fw-bold text-secondary">y</span>
                <input
                  type="number"
                  className="form-control form-control-sm text-center"
                  style={{ width: '60px' }}
                  value={Math.round(activeSprite.y)}
                  onChange={(e) => handleNumChange(e, 'y')}
                />
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between gap-3">
              {/* Visibilidade (Mostrar/Esconder) */}
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-secondary">Mostrar</span>
                <div className="btn-group btn-group-sm">
                  <button
                    className={`btn ${activeSprite.visible ? 'btn-primary-subtle border-primary' : 'btn-outline-secondary'}`}
                    onClick={() => updateSprite(activeSprite.id, { visible: true })}
                  >
                    <i className="bi bi-eye-fill"></i>
                  </button>
                  <button
                    className={`btn ${!activeSprite.visible ? 'btn-primary-subtle border-primary' : 'btn-outline-secondary'}`}
                    onClick={() => updateSprite(activeSprite.id, { visible: false })}
                  >
                    <i className="bi bi-eye-slash-fill"></i>
                  </button>
                </div>
              </div>

              {/* Tamanho (%) */}
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-secondary">Tamanho</span>
                <input
                  type="number"
                  className="form-control form-control-sm text-center"
                  style={{ width: '80px' }}
                  value={activeSprite.size}
                  onChange={(e) => handleNumChange(e, 'size')}
                />
              </div>

              {/* Direção (Ângulo em graus) */}
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-secondary">Direção</span>
                <input
                  type="number"
                  className="form-control form-control-sm text-center"
                  style={{ width: '60px' }}
                  value={Math.round(activeSprite.angle)}
                  onChange={(e) => handleNumChange(e, 'angle')}
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. ÁREA DIVIDIDA: Lista de Atores (Esquerda) | Seletor do Palco (Direita) */}
        <div className="d-flex flex-grow-1 overflow-hidden">
          {/* LISTA DE ATORES (SPRITES) */}
          <div className="flex-grow-1 p-2 overflow-auto position-relative bg-light" style={{ minHeight: '150px' }}>
            <div className="d-flex flex-wrap gap-2 content-start align-items-start">
              {sprites.map((sprite) => (
                <div
                  key={sprite.id}
                  className={`sprite-card d-flex flex-column align-items-center justify-content-between p-1 border rounded bg-white position-relative ${activeSpriteId === sprite.id ? 'border-primary ring-2 shadow-sm' : ''}`}
                  style={{
                    width: '70px',
                    height: '60px',
                    cursor: 'pointer',
                    borderColor: activeSpriteId === sprite.id ? '#4C97FF' : '#dee2e6',
                    borderWidth: activeSpriteId === sprite.id ? '2px' : '1px',
                  }}
                  onClick={() => selectSprite(sprite.id)}
                >
                  {/* Botão de Excluir Ator (aparece apenas no selecionado) */}
                  {activeSpriteId === sprite.id && sprites.length > 1 && (
                    <button
                      className="btn btn-sm btn-danger position-absolute rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: '20px', height: '20px', top: '-5px', right: '-5px', zIndex: 20 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSprite(sprite.id);
                      }}
                    >
                      <i className="bi bi-x" style={{ fontSize: '14px' }}></i>
                    </button>
                  )}

                  <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100 overflow-hidden mt-1 px-1">
                    <img src={sprite.costume ?? undefined} alt={sprite.name} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                  </div>
                  <span className="small text-truncate w-100 text-center mb-1 user-select-none" style={{ fontSize: '0.7rem', color: '#555' }}>
                    {sprite.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Botão Flutuante para Adicionar Novo Ator via Upload */}
            <input
              type="file"
              ref={spriteInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  addSprite(e.target.files[0]);
                }
              }}
            />
            {/* Scratch-style Hover Menu for Adding Sprites */}
            <div className="add-sprite-container">
              <div className="add-sprite-label shadow-sm">Selecione um Ator</div>
              <div className="add-sprite-menu shadow">
                {/* 1. Upload Button */}
                <button className="add-sprite-item" onClick={() => spriteInputRef.current?.click()} title="Carregar Ator">
                  <i className="bi bi-upload"></i>
                </button>

                {/* 2. Surprise Button */}
                <button className="add-sprite-item" onClick={() => addSprite()} title="Surpresa">
                  <i className="bi bi-stars"></i>
                </button>

                {/* 3. Paint Button */}
                <button className="add-sprite-item" onClick={() => addSprite()} title="Pintar">
                  <i className="bi bi-brush"></i>
                </button>

                {/* 4. Search Button */}
                <button className="add-sprite-item" onClick={() => setIsCostumeModalOpen(true)} title="Procurar">
                  <i className="bi bi-search"></i>
                </button>
              </div>

              <button className="btn btn-primary btn-add-sprite-main shadow" title="Escolher um Ator" onClick={() => setIsCostumeModalOpen(true)}>
                <i className="bi bi-person-plus-fill"></i>
              </button>
            </div>
          </div>

          {/* COLUNA DO PALCO (STAGE) */}
          <div className="stage-column p-2 bg-white border-start d-flex flex-column align-items-center" style={{ width: '100px', minWidth: '100px' }}>
            <span className="fw-bold text-secondary mb-2" style={{ fontSize: '0.75rem' }}>
              Palco
            </span>

            {/* Card do Palco Ativo - Abre a galeria de cenários */}
            <div
              className={`stage-card border rounded p-1 mb-2 d-flex flex-column align-items-center bg-white ${isBackdropModalOpen ? 'border-primary' : ''}`}
              style={{ width: '100%', cursor: 'pointer' }}
              onClick={() => setIsBackdropModalOpen(true)}
            >
              <div className="w-100 stage-card-image-container bg-secondary-subtle d-flex align-items-center justify-content-center border rounded overflow-hidden">
                <img src={backdropImage} alt="Stage" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span className="small text-center mt-1 text-secondary" style={{ fontSize: '0.65rem' }}>
                Cenários <br /> ({backdrops.length})
              </span>
            </div>

            {/* Scratch-style Hover Menu for Backdrops */}
            <div className="add-backdrop-container">
              <div className="add-backdrop-label shadow-sm">Selecionar Cenário</div>
              <div className="add-backdrop-menu shadow">
                {/* 1. Upload Button */}
                <button className="add-sprite-item" onClick={() => backdropInputRef.current?.click()} title="Carregar Cenário">
                  <i className="bi bi-upload"></i>
                </button>

                {/* 2. Surprise Button */}
                <button
                  className="add-sprite-item"
                  onClick={() => {
                    // TODO: Implement logic to pick a random backdrop
                    alert('Funcionalidade em breve!');
                  }}
                  title="Surpresa"
                >
                  <i className="bi bi-stars"></i>
                </button>

                {/* 3. Paint Button */}
                <button
                  className="add-sprite-item"
                  onClick={() => {
                    // TODO: Create a blank backdrop
                    alert('Funcionalidade em breve!');
                  }}
                  title="Pintar"
                >
                  <i className="bi bi-brush"></i>
                </button>

                {/* 4. Search Button */}
                <button className="add-sprite-item" onClick={() => setIsBackdropModalOpen(true)} title="Procurar">
                  <i className="bi bi-search"></i>
                </button>
              </div>

              <button
                className="btn btn-primary btn-add-backdrop-main shadow-sm"
                title="Escolher um Cenário"
                onClick={() => setIsBackdropModalOpen(true)}
              >
                <span className="d-flex align-items-center justify-content-center position-relative">
                  <i className="bi bi-image"></i>
                  <i className="bi bi-plus" style={{ position: 'absolute', top: '-6px', right: '-8px', fontWeight: 'bold' }}></i>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: GALERIA DE CENÁRIOS */}
      {isBackdropModalOpen && (
        <div
          className="modal-backdrop-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          onClick={() => setIsBackdropModalOpen(false)}
        >
          <div
            className="bg-white rounded shadow-lg d-flex flex-column"
            style={{ width: '600px', maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="m-0">Galeria de Cenários</h5>
              <button className="btn-close" onClick={() => setIsBackdropModalOpen(false)}></button>
            </div>
            <div className="p-3 overflow-auto flex-grow-1">
              <div className="d-flex flex-wrap gap-3">
                {backdrops.map((bd) => (
                  <div
                    key={bd.id}
                    className={`border rounded p-1 cursor-pointer position-relative ${backdropImage === bd.url ? 'border-primary ring-2' : ''}`}
                    style={{ width: '120px', height: '100px', cursor: 'pointer' }}
                    onClick={() => {
                      selectBackdrop(bd.id);
                    }}
                  >
                    {backdrops.length > 1 && (
                      <button
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle p-0 d-flex align-items-center justify-content-center"
                        style={{ width: '20px', height: '20px', transform: 'translate(30%, -30%)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBackdrop(bd.id);
                        }}
                      >
                        <i className="bi bi-x" style={{ fontSize: '12px' }}></i>
                      </button>
                    )}
                    <div className="w-100 h-100 overflow-hidden bg-light d-flex align-items-center justify-content-center">
                      <img src={bd.url} alt={bd.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="text-center small mt-1 text-truncate">{bd.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 border-top text-end">
              <button className="btn btn-primary" onClick={() => setIsBackdropModalOpen(false)}>
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GALERIA DE FANTASIAS (Para o ator selecionado) */}
      {isCostumeModalOpen && activeSprite && (
        <div
          className="modal-costume-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
          onClick={() => setIsCostumeModalOpen(false)}
        >
          <div
            className="bg-white rounded shadow-lg d-flex flex-column"
            style={{ width: '600px', maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="m-0">Fantasias: {activeSprite.name}</h5>
              <button className="btn-close" onClick={() => setIsCostumeModalOpen(false)}></button>
            </div>
            <div className="p-3 overflow-auto flex-grow-1">
              <div className="d-flex flex-wrap gap-3">
                {activeSprite.costumes &&
                  activeSprite.costumes.map((c) => (
                    <div
                      key={c.id}
                      className={`border rounded p-1 cursor-pointer position-relative ${activeSprite.currentCostumeId === c.id ? 'border-primary ring-2' : ''}`}
                      style={{ width: '100px', height: '100px', cursor: 'pointer' }}
                      onClick={() => {
                        switchCostume(c.id);
                      }}
                    >
                      {activeSprite.costumes.length > 1 && (
                        <button
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle p-0 d-flex align-items-center justify-content-center"
                          style={{ width: '20px', height: '20px', transform: 'translate(30%, -30%)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCostumeFromSprite(activeSprite.id, c.id);
                          }}
                        >
                          <i className="bi bi-x" style={{ fontSize: '12px' }}></i>
                        </button>
                      )}
                      <div className="w-100 h-100 overflow-hidden bg-white d-flex align-items-center justify-content-center">
                        <img src={c.url} alt={c.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                      <div className="text-center small mt-1 text-truncate">{c.name}</div>
                    </div>
                  ))}

                <input
                  type="file"
                  accept="image/*"
                  ref={costumeInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      addCostumeToSprite(activeSprite.id, e.target.files[0]);
                    }
                  }}
                />

                <div
                  className="border rounded p-1 d-flex flex-column align-items-center justify-content-center bg-light text-secondary"
                  style={{ width: '100px', height: '100px', cursor: 'pointer', borderStyle: 'dashed' }}
                  onClick={() => costumeInputRef.current?.click()}
                >
                  <i className="bi bi-plus-lg h4 mb-0"></i>
                  <span className="small">Nova</span>
                </div>
              </div>
            </div>
            <div className="p-3 border-top text-end">
              <button className="btn btn-primary" onClick={() => setIsCostumeModalOpen(false)}>
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
