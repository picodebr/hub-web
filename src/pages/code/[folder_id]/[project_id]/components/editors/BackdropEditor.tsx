/**
 * Editor de cenários (backdrops) do palco.
 * Visual inspirado no scratch-gui: sidebar 150px, itens estilo SpriteSelectorItem.
 */
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useProject } from '@/_base/context/ProjectContext';
import dynamic from 'next/dynamic';

const PaintEditor = dynamic(() => import('./PaintEditor/index'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#4483ff] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-500 font-medium">Carregando Editor...</span>
      </div>
    </div>
  ),
});

export default function BackdropEditor() {
  const { activeSprite, addCostumeToSprite, removeCostumeFromSprite, renameCostume, switchCostume } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingCostumeId, setEditingCostumeId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; costumeId: string } | null>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  if (!activeSprite || activeSprite.id !== 'stage') {
    return <div className="p-4 flex-1 h-full bg-white flex items-center justify-center text-gray-500">Nenhum cenário selecionado</div>;
  }

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await addCostumeToSprite('stage', file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRenameStart = (e: React.MouseEvent, costumeId: string, currentName: string) => {
    e.stopPropagation();
    setEditingCostumeId(costumeId);
    setTempName(currentName);
  };

  const handleRenameSubmit = () => {
    if (editingCostumeId && tempName.trim()) {
      renameCostume('stage', editingCostumeId, tempName.trim());
    }
    setEditingCostumeId(null);
  };

  const handleRenameCancel = () => setEditingCostumeId(null);

  const handleContextMenu = (e: React.MouseEvent, costumeId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, costumeId });
  };

  const handleExport = (costumeId: string) => {
    const costume = activeSprite.costumes?.find((c) => c.id === costumeId);
    if (costume) {
      const url = costume.url;
      let extension = 'png';
      if (url.startsWith('data:image/')) {
        const mime = url.split(';')[0].split(':')[1];
        if (mime === 'image/svg+xml') extension = 'svg';
        else if (mime === 'image/jpeg') extension = 'jpg';
      } else {
        const lastPart = url.split('.').pop()?.toLowerCase();
        if (lastPart && ['svg', 'png', 'jpg', 'jpeg', 'gif'].includes(lastPart)) {
          extension = lastPart === 'jpeg' ? 'jpg' : lastPart;
        }
      }
      const link = document.createElement('a');
      link.href = url;
      link.download = `${costume.name || 'cenario'}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setContextMenu(null);
  };

  const activeCostumeId = activeSprite.currentCostumeId;
  const currentCostume = activeSprite.costumes?.find((c) => c.id === activeCostumeId);

  return (
    <div className="flex-1 flex h-full w-full bg-[#f0f0f0] overflow-hidden min-h-0 min-w-0">
      {/* Container principal */}
      <div className="flex-1 flex overflow-hidden border-t border-r border-[#ccc] rounded-tr-[16px] bg-white shadow-[inset_-3px_0_0_0_black]">
        {/* Sidebar esquerda: 150px */}
        <div className="flex flex-col bg-[#f9f9f9] border-r border-[#ddd] flex-shrink-0 relative overflow-visible" style={{ width: '150px' }}>
          {/* Lista de cenários */}
          <div className="flex-1 overflow-y-auto flex flex-col items-center pt-[10px] px-[10px] custom-scrollbar" style={{ paddingBottom: '80px' }}>
            {activeSprite.costumes?.map((costume, index) => {
              const isActive = activeCostumeId === costume.id;
              const isEditing = editingCostumeId === costume.id;

              return (
                <div
                  key={costume.id || index}
                  onClick={() => switchCostume('stage', costume.id)}
                  onDoubleClick={(e) => handleRenameStart(e, costume.id, costume.name)}
                  onContextMenu={(e) => handleContextMenu(e, costume.id)}
                  className={`
                                        group w-[130px] flex flex-col relative cursor-pointer select-none
                                        rounded-[6px] border-2 mb-[8px] transition-all
                                        ${
                                          isActive
                                            ? 'border-[#4483ff] shadow-[0_0_0_3px_rgba(68,131,255,0.25)] bg-white'
                                            : 'border-[rgba(0,0,0,0.12)] hover:border-[#4483ff] bg-white'
                                        }
                                    `}
                >
                  {/* Número */}
                  <span className="absolute top-[3px] left-[5px] text-[10px] font-bold text-[#575e75] z-[2] leading-none select-none">
                    {index + 1}
                  </span>

                  {/* Área da imagem — proporção 16:9 para cenários */}
                  <div
                    className="flex items-center justify-center overflow-hidden mx-[6px] mt-[14px] mb-[2px] rounded-[4px]"
                    style={{
                      height: '56px',
                      backgroundImage:
                        'linear-gradient(45deg,#e8e8e8 25%,transparent 25%),linear-gradient(-45deg,#e8e8e8 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e8e8e8 75%),linear-gradient(-45deg,transparent 75%,#e8e8e8 75%)',
                      backgroundSize: '8px 8px',
                      backgroundPosition: '0 0,0 4px,4px -4px,-4px 0px',
                    }}
                  >
                    <Image
                      src={costume.url}
                      alt={costume.name}
                      width={108}
                      height={54}
                      className="object-contain"
                      style={{ maxWidth: '108px', maxHeight: '54px' }}
                      unoptimized
                    />
                  </div>

                  {/* Nome + dimensões */}
                  <div className={`px-[6px] pb-[5px] rounded-b-[4px] ${isActive ? 'bg-[#4483ff]' : ''}`}>
                    {isEditing ? (
                      <input
                        autoFocus
                        className="w-full text-center bg-white text-black border border-blue-400 outline-none rounded-sm"
                        style={{ fontSize: '11px', padding: '1px 2px', lineHeight: '1.4' }}
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit();
                          if (e.key === 'Escape') handleRenameCancel();
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className={`text-[11px] font-bold truncate text-center leading-tight ${isActive ? 'text-white' : 'text-[#575e75]'}`}>
                        {costume.name}
                      </div>
                    )}
                    <div className={`text-[9px] text-center leading-tight mt-[1px] ${isActive ? 'text-white/80' : 'text-[#aaa]'}`}>480 × 360</div>
                  </div>

                  {/* Botão excluir */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCostumeFromSprite('stage', costume.id);
                    }}
                    className={`
                                            absolute top-[-7px] right-[-7px] w-[18px] h-[18px] rounded-full
                                            flex items-center justify-center z-[10] transition-all border-0
                                            ${
                                              isActive
                                                ? 'opacity-100 scale-100 pointer-events-auto'
                                                : 'opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
                                            }
                                        `}
                    style={{
                      backgroundColor: 'white',
                      color: '#575e75',
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.15),0 1px 3px rgba(0,0,0,0.15)',
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
                    title="Excluir cenário"
                  >
                    <i className="bi bi-x-lg" style={{ fontSize: '8px' }}></i>
                  </button>
                </div>
              );
            })}

            {(!activeSprite.costumes || activeSprite.costumes.length === 0) && (
              <div className="text-gray-400 text-center py-4 text-xs w-full">Nenhum cenário.</div>
            )}
          </div>

          {/* Menu de adição */}
          <div className="add-sprite-container container-center">
            <div className="add-sprite-label label-right shadow-sm">Escolha um Cenário</div>
            <div className="add-sprite-menu shadow">
              <button className="add-sprite-item" onClick={handleUploadClick} title="Carregar Cenário">
                <i className="bi bi-upload"></i>
              </button>
              <button className="add-sprite-item" onClick={() => {}} title="Surpresa">
                <i className="bi bi-stars"></i>
              </button>
              <button
                className="add-sprite-item"
                onClick={async () => {
                  await addCostumeToSprite('stage');
                }}
                title="Pintar"
              >
                <i className="bi bi-brush"></i>
              </button>
              <button className="add-sprite-item" onClick={() => {}} title="Procurar">
                <i className="bi bi-search"></i>
              </button>
            </div>
            <button className="btn btn-primary btn-add-sprite-main shadow" title="Escolher um Cenário" onClick={() => {}}>
              <i className="bi bi-image-fill"></i>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
          </div>
        </div>

        {/* PaintEditor — key="stage" estável, recarrega via costumeId prop */}
        {activeCostumeId ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
            <PaintEditor
              key="stage"
              spriteId="stage"
              costumeId={activeCostumeId}
              costumeName={currentCostume?.name || 'Cenário'}
              initialUrl={currentCostume?.stageUrl || currentCostume?.url || activeSprite.costume || ''}
              isBackdrop={true}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#e9eef2] text-gray-500">Nenhum cenário selecionado.</div>
        )}
      </div>

      {/* Menu de contexto */}
      {contextMenu && (
        <div
          className="fixed bg-white shadow-xl border border-gray-200 py-1 rounded-lg z-[9999]"
          style={{ top: contextMenu.y, left: contextMenu.x, minWidth: '150px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-4 py-2 hover:bg-blue-50 text-slate-700 flex items-center gap-2 border-0 bg-transparent transition-colors"
            onClick={() => handleExport(contextMenu.costumeId)}
            style={{ fontSize: '14px', fontWeight: '500' }}
          >
            <i className="bi bi-download"></i>
            Exportar
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-blue-50 text-slate-700 flex items-center gap-2 border-0 bg-transparent transition-colors"
            onClick={() => {
              const costume = activeSprite.costumes?.find((c) => c.id === contextMenu.costumeId);
              if (costume) handleRenameStart(new MouseEvent('click') as unknown as React.MouseEvent, contextMenu.costumeId, costume.name);
              setContextMenu(null);
            }}
            style={{ fontSize: '14px', fontWeight: '500' }}
          >
            <i className="bi bi-pencil"></i>
            Renomear
          </button>
          <div className="h-[1px] bg-gray-100 my-1"></div>
          <button
            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 border-0 bg-transparent transition-colors"
            onClick={() => {
              removeCostumeFromSprite('stage', contextMenu.costumeId);
              setContextMenu(null);
            }}
            style={{ fontSize: '14px', fontWeight: '500' }}
          >
            <i className="bi bi-trash"></i>
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}
