/**
 * Componente StageArea - Palco de Simulação Visual.
 *
 * Este componente renderiza o cenário de fundo e todos os atores (sprites).
 * Implementa a lógica de arrasto (drag and drop) para posicionar os atores manualmente no palco.
 */

'use client';

import React from 'react';
import { useStage } from '@/_base/context/StageContext';
import { useProject } from '@/_base/context/ProjectContext';

// Interface para as propriedades de renderização de um Ator
interface SpriteProps {
  id: string;
  x: number;
  y: number;
  costume: string | null;
  name: string;
  visible: boolean;
  angle: number;
  size: number;
  bubbleText: string;
  bubbleType: 'say' | 'think' | null;
}

/**
 * Sub-componente SpriteRenderer - Responsável por desenhar um ator individual e seu balão de fala.
 */
const SpriteRenderer = ({ sprite, onMouseDown }: { sprite: SpriteProps; onMouseDown: (e: React.MouseEvent, id: string) => void }) => {
  // Estilos base para o posicionamento e transformação do ator
  const spriteStyle: React.CSSProperties = {
    position: 'absolute',
    left: `calc(50% + ${sprite.x}px)`, // Centralizado horizontalmente + offset X
    top: `calc(50% - ${sprite.y}px)`, // Centralizado verticalmente - offset Y (Y cresce para cima)
    width: '100px',
    height: '100px',
    zIndex: 100,
    display: sprite.visible ? 'block' : 'none',
    transform: `translate(-50%, -50%) rotate(${sprite.angle - 90}deg) scale(${sprite.size / 100})`,
    cursor: 'grab',
    transition: 'none', // Remove transição de movimento para evitar lag no arrasto
    userSelect: 'none',
    WebkitUserDrag: 'none',
  } as React.CSSProperties;

  const interactStyle = {
    ...spriteStyle,
    transition: 'transform 0.1s linear', // Mantém transição suave apenas para rotação e redimensionamento
  };

  // Estilo para o balão de fala/pensamento
  const bubbleStyle: React.CSSProperties = {
    position: 'absolute',
    left: `calc(50% + ${sprite.x}px)`,
    top: `calc(50% - ${sprite.y}px - ${60 * (sprite.size / 100)}px)`,
    transform: `translate(-15%, -100%)`,
    display: sprite.bubbleText ? 'block' : 'none',
    zIndex: 101,
    transition: 'transform 0.1s linear',
    backgroundColor: 'white',
    border: '2px solid black',
    borderRadius: '10px',
    padding: '5px 10px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  };

  return (
    <React.Fragment>
      {/* RENDERIZAÇÃO DA IMAGEM DO ATOR */}
      <img
        id={sprite.id}
        src={sprite.costume || undefined}
        alt={sprite.name}
        className="sprite-actor"
        style={interactStyle}
        onMouseDown={(e) => onMouseDown(e, sprite.id)}
        draggable={false}
      />

      {/* RENDERIZAÇÃO DO BALÃO DE TEXTO */}
      {sprite.bubbleText && (
        <div className={`speech-bubble ${sprite.bubbleType === 'think' ? 'think' : ''}`} style={bubbleStyle}>
          {sprite.bubbleText}
        </div>
      )}
    </React.Fragment>
  );
};

export default function StageArea() {
  // Acessa dados dos atores e cenários do contexto de projeto
  const { sprites, activeBackdrop, updateSprite, selectSprite } = useProject();
  // Acessa a imagem de fundo atual (que pode ser alterada via blocos em tempo real)
  const { backdropImage } = useStage();

  // ESTADO DE ARRASTO (Drag and Drop)
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const dragStartRef = React.useRef<{
    mouseX: number;
    mouseY: number;
    spriteX: number;
    spriteY: number;
  } | null>(null);

  /**
   * Inicia o processo de arrasto ao clicar em um ator.
   */
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    const sprite = sprites.find((s) => s.id === id);
    if (!sprite) return;

    selectSprite(id); // Marca o ator como ativo/selecionado no projeto

    setDraggingId(id);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      spriteX: sprite.x,
      spriteY: sprite.y,
    };
  };

  /**
   * Efeito Global para ouvir movimentos do mouse durante o arrasto.
   */
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingId || !dragStartRef.current) return;

      // Calcula o deslocamento do mouse
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      // X mapeia 1:1, mas Y é invertido (CSS top diminui quando Y aumenta)
      let newX = dragStartRef.current.spriteX + deltaX;
      let newY = dragStartRef.current.spriteY - deltaY;

      // Limites visuais do palco para evitar que o ator suma completamente
      const LIMIT_X = 280;
      const LIMIT_Y = 180;

      newX = Math.max(-LIMIT_X, Math.min(newX, LIMIT_X));
      newY = Math.max(-LIMIT_Y, Math.min(newY, LIMIT_Y));

      // Atualiza a posição no estado global do projeto
      updateSprite(draggingId, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (draggingId) {
        setDraggingId(null);
        dragStartRef.current = null;
      }
    };

    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, updateSprite]);

  return (
    <div id="stage-main-container" className="stage-area-container position-relative overflow-hidden border bg-white" style={{ width: '100%' }}>
      {/* CAMADA DE FUNDO (CENÁRIO) */}
      <div
        className="stage-backdrop position-absolute w-100 h-100"
        style={{
          backgroundImage: `url(${backdropImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* CAMADA DE ATORES (SPRITES) */}
      {sprites.map((spr) => (
        <SpriteRenderer key={spr.id} sprite={spr} onMouseDown={handleMouseDown} />
      ))}
    </div>
  );
}
