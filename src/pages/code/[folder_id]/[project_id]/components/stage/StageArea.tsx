/**
 * StageArea - O ambiente de renderização visual e interação (Palco).
 */
'use client';

import React from 'react';
import { StageMonitor } from './StageMonitor';
import { StageListMonitor } from './StageListMonitor';
import { AskModal } from './AskModal';
import { useUI } from '@/_base/context/UIContext';
import { useProject } from '@/_base/context/ProjectContext';
import { getCollisionEngine, getWebGLRenderer, initWebGL } from '@/_base/engine/webgl';
import { getProjectService } from '@/_base/services/code';
import { dragState } from '@/_base/lib/dragState';

const SpeechBubble = ({ text, type, targetX, isFlippedY }: { text: string; type: 'say' | 'think' | null; targetX: number; isFlippedY: boolean }) => {
  const charWidth = 9;
  const minWidth = 80;
  const maxWidth = 220;
  const paddingHorizontal = 30;
  const w = Math.min(maxWidth, Math.max(minWidth, text.length * charWidth + paddingHorizontal));
  const h = text.length > 30 ? 70 : 50;
  const R = 20;

  const isFlippedX = targetX > 80;

  if (type === 'think') {
    const bodyY = isFlippedY ? 35 : 2;
    const circ1Y = isFlippedY ? 22 : h + 10;
    const circ2Y = isFlippedY ? 10 : h + 22;
    const translateY = isFlippedY ? '5px' : '-95%';
    const translateX = isFlippedX ? `-${w - 20}px` : '-20px';

    return (
      <div
        className="balao-wrapper"
        style={{
          width: `${w}px`,
          height: `${h + 35}px`,
          transform: `translate(${translateX}, ${translateY})`,
        }}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h + 35}`} fill="none" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.06))' }}>
          <rect x="2" y={bodyY} width={w - 4} height={h - 4} rx="22" fill="white" stroke="#CED4D9" strokeWidth="3" />
          <circle cx={isFlippedX ? w - 35 : 35} cy={circ1Y} r="7" fill="white" stroke="#CED4D9" strokeWidth="2.5" />
          <circle cx={isFlippedX ? w - 20 : 20} cy={circ2Y} r="5" fill="white" stroke="#CED4D9" strokeWidth="2" />
        </svg>
        <div
          className="balao-texto"
          style={{
            width: `${w - 30}px`,
            left: '15px',
            top: `${bodyY + 8}px`,
            height: `${h - 20}px`,
            fontSize: '13px',
          }}
        >
          {text}
        </div>
      </div>
    );
  }

  let path = '';
  if (isFlippedX) {
    path = isFlippedY
      ? `M ${w - 30} 70 L 20 70 A ${R} ${R} 0 0 1 0 50 A ${R} ${R} 0 0 1 20 30 L ${w - 45} 30 Q ${w - 40} 20, ${w - 25} 13 Q ${w - 30} 25, ${w - 32} 30 L ${w - 30} 30 A ${R} ${R} 0 0 1 ${w - 10} 50 A ${R} ${R} 0 0 1 ${w - 30} 70 Z`
      : `M ${w - 30} 5 L 20 5 A ${R} ${R} 0 0 0 0 25 A ${R} ${R} 0 0 0 20 45 L ${w - 45} 45 Q ${w - 40} 55, ${w - 25} 62 Q ${w - 30} 50, ${w - 32} 45 L ${w - 30} 45 A ${R} ${R} 0 0 0 ${w - 10} 25 A ${R} ${R} 0 0 0 ${w - 30} 5 Z`;
  } else {
    path = isFlippedY
      ? `M 30 70 L ${w - R} 70 A ${R} ${R} 0 0 0 ${w} 50 A ${R} ${R} 0 0 0 ${w - R} 30 L 45 30 Q 40 20, 25 13 Q 30 25, 32 30 L 30 30 A ${R} ${R} 0 0 0 10 50 A ${R} ${R} 0 0 0 30 70 Z`
      : `M 30 5 L ${w - R} 5 A ${R} ${R} 0 0 1 ${w} 25 A ${R} ${R} 0 0 1 ${w - R} 45 L 45 45 Q 40 55, 25 62 Q 30 50, 32 45 L 30 45 A ${R} ${R} 0 0 1 10 25 A ${R} ${R} 0 0 1 30 5 Z`;
  }

  const wrapperWidth = w + 10;
  const translateX = isFlippedX ? -(wrapperWidth - 25) : -25;
  const translateY = isFlippedY ? '5px' : '-85%';

  return (
    <div
      className="balao-wrapper"
      style={{
        width: `${wrapperWidth}px`,
        height: '75px',
        transform: `translate(${translateX}px, ${translateY})`,
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${wrapperWidth} 75`} fill="none" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.06))' }}>
        <path d={path} fill="white" stroke="#CED4D9" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <div
        className="balao-texto"
        style={{
          width: `${w - 25}px`,
          left: isFlippedX ? '12px' : '18px',
          top: isFlippedY ? '33px' : '8px',
          height: '35px',
          fontSize: '15px',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default function StageArea() {
  const { sprites, updateSprite, selectSprite, activeSpriteId, monitors } = useProject();
  const { isStageFullScreen } = useUI();

  const spritesWithBubble = React.useMemo(() => sprites.filter((s) => !!s.bubbleText), [sprites]);

  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [scale, setScale] = React.useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const dragStartRef = React.useRef<{
    mouseX: number;
    mouseY: number;
    spriteX: number;
    spriteY: number;
  } | null>(null);

  const [isPointerDown, setIsPointerDown] = React.useState(false);
  const hasDraggedRef = React.useRef(false);
  const potentialClickIdRef = React.useRef<string | null>(null);

  const [flashSpriteId, setFlashSpriteId] = React.useState<string | null>(null);
  const flashTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const handleFlash = (e: Event) => {
      const ce = e as CustomEvent;
      setFlashSpriteId(ce.detail);

      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = setTimeout(() => {
        setFlashSpriteId(null);
      }, 2000); 
    };

    window.addEventListener('flash-sprite', handleFlash);
    return () => window.removeEventListener('flash-sprite', handleFlash);
  }, []);

  React.useEffect(() => {
    if (canvasRef.current) {
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = 480 * dpr;
      canvasRef.current.height = 360 * dpr;
      initWebGL(canvasRef.current);
    }
  }, []);

  React.useEffect(() => {
    let frameId: number;

    const renderLoop = () => {
      const renderer = getWebGLRenderer();
      if (renderer && canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        const targetW = Math.floor(480 * scale * dpr);
        const targetH = Math.floor(360 * scale * dpr);

        if (targetW > 0 && targetH > 0) {
          if (canvasRef.current.width !== targetW || canvasRef.current.height !== targetH) {
            canvasRef.current.width = targetW;
            canvasRef.current.height = targetH;
          }

          const ps = getProjectService();
          const currentSprites = ps.getSprites();
          const currentActiveId = ps.getActiveSpriteId();
          const currentActiveBackdropInfo = ps.backdrops.find((b: any) => b.id === ps.activeBackdropId);
          const currentBackdropUrl = currentActiveBackdropInfo?.url || '';

          renderer.preloadNonBlocking(currentBackdropUrl, currentSprites as any);
          getCollisionEngine()?.tickFrame();
          renderer.drawSceneSync(currentBackdropUrl, currentSprites as any, [1.0, 1.0, 1.0, 1.0], currentActiveId);
        }
      }
      frameId = requestAnimationFrame(renderLoop);
    };

    frameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(frameId);
  }, [scale]);

  const handleStageMouseDown = (e: React.MouseEvent) => {
    if (!stageRef.current) return;
    const renderer = getWebGLRenderer();
    if (!renderer) return;

    const stageRect = stageRef.current.getBoundingClientRect();
    const clickXInStage = (e.clientX - stageRect.left) / scale;
    const clickYInStage = (e.clientY - stageRect.top) / scale;

    const targetX = clickXInStage - 240;
    const targetY = 180 - clickYInStage;

    setIsPointerDown(true);
    hasDraggedRef.current = false;
    potentialClickIdRef.current = null;

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      spriteX: 0,
      spriteY: 0,
    };

    for (let i = sprites.length - 1; i >= 0; i--) {
      const spr = sprites[i];
      if (!spr.visible) continue;

      const realW = (spr as any)._realWidth || 50;
      const realH = (spr as any)._realHeight || 50;
      const sizeW = realW * (spr.size / 100);
      const sizeH = realH * (spr.size / 100);

      if (
        targetX >= spr.x - sizeW / 2 &&
        targetX <= spr.x + sizeW / 2 &&
        targetY >= spr.y - sizeH / 2 &&
        targetY <= spr.y + sizeH / 2 &&
        (getCollisionEngine()?.isOpaqueAt(spr, targetX, targetY) ?? true)
      ) {
        e.preventDefault();
        e.stopPropagation();

        if (!spr.isClone && spr.id !== activeSpriteId) {
          selectSprite(spr.id);
        }

        potentialClickIdRef.current = spr.id;
        
        const isDraggable = !isStageFullScreen || !!spr.draggable;
        
        if (isDraggable) {
          setDraggingId(spr.id);
          dragState.draggingId = spr.id;

          dragStartRef.current.spriteX = spr.x;
          dragStartRef.current.spriteY = spr.y;
        }

        return;
      }
    }
  };

  React.useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const availableWidth = Math.max(10, rect.width - 32);
      // Fora do modo tela cheia, a altura não deve restringir a escala para evitar loops de redimensionamento,
      // já que o contêiner do palco tem altura automática.
      const availableHeight = isStageFullScreen ? Math.max(10, rect.height - 32) : 9999;

      const scaleW = (availableWidth - 2) / 480;
      const scaleH = (availableHeight - 2) / 360;

      let newScale = Math.min(scaleW, scaleH, 2.0);
      setScale(newScale);
      window.dispatchEvent(new CustomEvent('stage-width-changed', { detail: 480 * newScale + 2 }));
    };

    const observer = new ResizeObserver(() => updateScale());
    observer.observe(containerRef.current);
    updateScale();

    return () => observer.disconnect();
  }, [isStageFullScreen]);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerDown || !dragStartRef.current) return;

      const deltaX = (e.clientX - dragStartRef.current.mouseX) / scale;
      const deltaY = (e.clientY - dragStartRef.current.mouseY) / scale;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        hasDraggedRef.current = true;
      }

      if (draggingId) {
        const newX = dragStartRef.current.spriteX + deltaX;
        const newY = dragStartRef.current.spriteY - deltaY;
        updateSprite(draggingId, { x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      if (!isPointerDown) return;
      if (!hasDraggedRef.current) {
        if (potentialClickIdRef.current) {
          window.dispatchEvent(
            new CustomEvent('sprite-clicked', {
              detail: { spriteId: potentialClickIdRef.current },
            }),
          );
        } else {
          window.dispatchEvent(new CustomEvent('stage-clicked'));
        }
      }
      setIsPointerDown(false);
      setDraggingId(null);
      dragState.draggingId = null;
      dragStartRef.current = null;
      potentialClickIdRef.current = null;
    };

    if (isPointerDown) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPointerDown, draggingId, updateSprite, scale]);

  return (
    <div
      ref={containerRef}
      className={`w-100 d-flex align-items-center ${isStageFullScreen ? 'justify-content-center fullscreen' : 'justify-content-center'} stage-area-container`}
      style={{
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${480 * scale + 2}px`,
          height: `${360 * scale + 2}px`,
          position: 'relative',
          border: '1px solid #ccc',
          borderRadius: '16px',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <div
          ref={stageRef}
          id="stage-main-container"
          className="stage-content position-absolute overflow-hidden shadow-sm"
          style={{
            backgroundColor: '#ffffff',
            width: '480px',
            height: '360px',
            transform: `scale(${scale})`,
            transformOrigin: `top left`,
            position: `absolute`,
            top: 0,
            left: 0,
            margin: 0,
            border: 'none',
          }}
          onMouseDown={handleStageMouseDown}
        >
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 0,
              width: '480px',
              height: '360px',
              borderRadius: '16px',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          >
            {spritesWithBubble.map((spr) => {
              if (!spr.bubbleText) return null;
              const realH = (spr as any)._realHeight || 50;
              const sizeH = realH * (spr.size / 100);
              const targetX = spr.x;
              const targetY = spr.y + sizeH / 2;
              const isFlippedY = spr.y > 60;

              return (
                <div
                  key={'bubble_' + spr.id}
                  className="speech-bubble"
                  style={{
                    position: 'absolute',
                    left: `calc(50% + ${targetX}px)`,
                    top: `calc(50% - ${targetY}px)`,
                  }}
                >
                  <SpeechBubble text={spr.bubbleText} type={spr.bubbleType} targetX={targetX} isFlippedY={isFlippedY} />
                </div>
              );
            })}

            {(() => {
              const flashSprite = sprites.find((s) => s.id === flashSpriteId);
              if (!flashSprite || flashSprite.id === 'stage' || !flashSprite.visible) return null;
              return (
                <div
                  className="flash-bounding-box"
                  style={{
                    position: 'absolute',
                    left: `calc(50% + ${flashSprite.x}px)`,
                    top: `calc(50% - ${flashSprite.y}px)`,
                    width: `${((flashSprite as any)._realWidth || 50) * (flashSprite.size / 100)}px`,
                    height: `${((flashSprite as any)._realHeight || 50) * (flashSprite.size / 100)}px`,
                    transform: `translate(-50%, -50%) rotate(${flashSprite.rotationStyle === 'left-right' ? 0 : 90 - flashSprite.angle}deg) scaleX(${flashSprite.rotationStyle === 'left-right' && flashSprite.angle < 0 ? -1 : 1})`,
                    border: '2px dashed #3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    borderRadius: '4px',
                    pointerEvents: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              );
            })()}
          </div>

          <div
            className="stage-monitors-layer"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 200,
            }}
          >
            {monitors.map((monitor) =>
              monitor.type === 'list' ? (
                <StageListMonitor key={monitor.id} monitor={monitor} scale={scale} />
              ) : (
                <StageMonitor key={monitor.id} monitor={monitor} scale={scale} />
              ),
            )}
          </div>
          <AskModal />
        </div>
      </div>
    </div>
  );
}
