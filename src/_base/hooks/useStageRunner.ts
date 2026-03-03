/**
 * useStageRunner - O Motor de Execução do Palco.
 *
 * Este hook contém a implementação real de todos os comandos do palco (mover, girar,
 * falar, esperar, etc.). Ele controla o "game loop" visual, gerencia temporizadores
 * e responde aos comandos vindos do sandbox.
 * É aqui que a lógica de "onde o ator está" e "o que ele está fazendo" é processada 16ms por 16ms.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { getProjectService } from '../services/code/ProjectService';
import { getSerialService } from '../services/code';

export function useStageRunner() {
  const [isRunning, setIsRunning] = useState(false);

  // Refs para performance/sincronia em loops assíncronos
  const isRunningRef = useRef(false);
  const forceExecutionRef = useRef(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Listeners de Teclas gerenciados aqui ou em um hook separado?
  // O plano diz que "useKeyboardInput" foi extraído para interações de PÁGINA.
  // Mas o StageContext possui `registerKeyListener` para blocos WHEN_KEY_PRESSED.
  // Vamos manter aqui por simplicidade, pois ele dispara execuções.
  const keyListenersRef = useRef<{ [key: string]: (() => Promise<void>)[] }>({});

  const projectService = getProjectService();
  const serialService = getSerialService(); // Acessa a placa via singleton

  const start = useCallback(() => {
    setIsRunning(true);
    isRunningRef.current = true;
    timeoutsRef.current = [];
    keyListenersRef.current = {};
    // console.log("Stage Started");
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    isRunningRef.current = false;

    // Limpa temporizadores
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];

    // Reseta Força de Execução
    forceExecutionRef.current = 0;

    // Reseta Bolha de Fala/Efeitos se necessário
    const sprites = projectService.getSprites();
    sprites.forEach((s) => {
      s.bubbleText = '';
      s.bubbleType = null;
    });
    projectService.syncSprites(); // Força atualização
  }, []);

  const setForceExecution = useCallback((force: boolean) => {
    if (force) {
      forceExecutionRef.current += 1;
    } else {
      forceExecutionRef.current = Math.max(0, forceExecutionRef.current - 1);
    }
  }, []);

  // --- Primitivas de Execução ---

  const checkExecution = () => {
    return isRunningRef.current || forceExecutionRef.current > 0;
  };

  const wait = useCallback((secs: number) => {
    return new Promise<void>((resolve) => {
      if (!checkExecution()) {
        resolve();
        return;
      }
      const ms = secs * 1000;
      const timeout = setTimeout(() => {
        resolve();
      }, ms);
      timeoutsRef.current.push(timeout);
    });
  }, []);

  // --- Ações de Movimento ---

  const move = useCallback(async (steps: number, targetId?: string) => {
    if (!checkExecution()) return;

    const id = targetId || projectService.getActiveSpriteId();
    const sprite = projectService.getSpriteById(id);

    if (sprite) {
      const rad = (90 - sprite.angle) * (Math.PI / 180);
      const dx = steps * Math.cos(rad);
      const dy = steps * Math.sin(rad);

      projectService.updateSprite(id, {
        x: sprite.x + dx,
        y: sprite.y + dy,
      });

      // Atraso artificial para suavidade da animação
      await new Promise((r) => setTimeout(r, 16));
    }
  }, []);

  const turn = useCallback(async (deg: number, targetId?: string) => {
    if (!checkExecution()) return;

    const id = targetId || projectService.getActiveSpriteId();
    const sprite = projectService.getSpriteById(id);

    if (sprite) {
      projectService.updateSprite(id, {
        angle: sprite.angle + deg,
      });
      await new Promise((r) => setTimeout(r, 16));
    }
  }, []);

  const goTo = useCallback((x: number, y: number, targetId?: string) => {
    if (!checkExecution()) return;

    const id = targetId || projectService.getActiveSpriteId();
    projectService.updateSprite(id, { x, y });
  }, []);

  const setX = useCallback(async (x: number, targetId?: string) => {
    if (!checkExecution()) return;
    const id = targetId || projectService.getActiveSpriteId();
    projectService.updateSprite(id, { x });
    await new Promise((r) => setTimeout(r, 16));
  }, []);

  const setY = useCallback(async (y: number, targetId?: string) => {
    if (!checkExecution()) return;
    const id = targetId || projectService.getActiveSpriteId();
    projectService.updateSprite(id, { y });
    await new Promise((r) => setTimeout(r, 16));
  }, []);

  const addX = useCallback(async (dx: number, targetId?: string) => {
    if (!checkExecution()) return;
    const id = targetId || projectService.getActiveSpriteId();
    const sprite = projectService.getSpriteById(id);
    if (sprite) {
      projectService.updateSprite(id, { x: sprite.x + dx });
      await new Promise((r) => setTimeout(r, 16));
    }
  }, []);

  const addY = useCallback(async (dy: number, targetId?: string) => {
    if (!checkExecution()) return;
    const id = targetId || projectService.getActiveSpriteId();
    const sprite = projectService.getSpriteById(id);
    if (sprite) {
      projectService.updateSprite(id, { y: sprite.y + dy });
      await new Promise((r) => setTimeout(r, 16));
    }
  }, []);

  const setAngle = useCallback((deg: number, targetId?: string) => {
    if (!checkExecution()) return;
    const id = targetId || projectService.getActiveSpriteId();
    projectService.updateSprite(id, { angle: deg });
  }, []);

  const bounceOnEdge = useCallback(async (targetId?: string) => {
    if (!checkExecution()) return;
    const id = targetId || projectService.getActiveSpriteId();
    const sprite = projectService.getSpriteById(id);

    if (sprite) {
      // Verificação simples de limites (O palco é geralmente 800x600 ou 480x360? Scratch usa 480x360)
      // Assumindo coordenadas do Scratch: Centro 0,0. Largura 480 (-240 a 240), Altura 360 (-180 a 180).
      const LIMIT_X = 240;
      const LIMIT_Y = 180;
      let newAngle = sprite.angle;
      let newX = sprite.x;
      let newY = sprite.y;
      let hit = false;

      if (newX < -LIMIT_X) {
        newX = -LIMIT_X;
        newAngle = -newAngle;
        hit = true;
      }
      if (newX > LIMIT_X) {
        newX = LIMIT_X;
        newAngle = -newAngle;
        hit = true;
      }
      if (newY < -LIMIT_Y) {
        newY = -LIMIT_Y;
        newAngle = 180 - newAngle;
        hit = true;
      }
      if (newY > LIMIT_Y) {
        newY = LIMIT_Y;
        newAngle = 180 - newAngle;
        hit = true;
      }

      if (hit) {
        projectService.updateSprite(id, { x: newX, y: newY, angle: newAngle });
        await new Promise((r) => setTimeout(r, 16));
      }
    }
  }, []);

  // --- Ações de Aparência ---

  const say = useCallback((text: string | number, targetId?: string) => {
    if (!checkExecution()) return;
    const id = targetId || projectService.getActiveSpriteId();
    projectService.updateSprite(id, { bubbleText: String(text), bubbleType: 'say' });
  }, []);

  const sayFor = useCallback(
    async (text: string | number, secs: number, targetId?: string) => {
      if (!checkExecution()) return;
      const id = targetId || projectService.getActiveSpriteId();
      projectService.updateSprite(id, { bubbleText: String(text), bubbleType: 'say' });
      await wait(secs);
      projectService.updateSprite(id, { bubbleText: '', bubbleType: null });
    },
    [wait],
  );

  const think = useCallback((text: string | number, targetId?: string) => {
    if (!checkExecution()) return;
    const id = targetId || projectService.getActiveSpriteId();
    projectService.updateSprite(id, { bubbleText: String(text), bubbleType: 'think' });
  }, []);

  const thinkFor = useCallback(
    async (text: string | number, secs: number, targetId?: string) => {
      if (!checkExecution()) return;
      const id = targetId || projectService.getActiveSpriteId();
      projectService.updateSprite(id, { bubbleText: String(text), bubbleType: 'think' });
      await wait(secs);
      projectService.updateSprite(id, { bubbleText: '', bubbleType: null });
    },
    [wait],
  );

  const setSize = useCallback(async (size: number, targetId?: string) => {
    if (!checkExecution()) return;
    const id = targetId || projectService.getActiveSpriteId();
    projectService.updateSprite(id, { size });
    await new Promise((r) => setTimeout(r, 16));
  }, []);

  const changeSize = useCallback(async (delta: number, targetId?: string) => {
    if (!checkExecution()) return;
    const id = targetId || projectService.getActiveSpriteId();
    const sprite = projectService.getSpriteById(id);
    if (sprite) {
      projectService.updateSprite(id, { size: sprite.size + delta });
      await new Promise((r) => setTimeout(r, 16));
    }
  }, []);

  const show = useCallback(async (targetId?: string) => {
    if (!checkExecution()) return;
    const id = targetId || projectService.getActiveSpriteId();
    projectService.updateSprite(id, { visible: true });
    await new Promise((r) => setTimeout(r, 16));
  }, []);

  const hide = useCallback(async (targetId?: string) => {
    if (!checkExecution()) return;
    const id = targetId || projectService.getActiveSpriteId();
    projectService.updateSprite(id, { visible: false });
    await new Promise((r) => setTimeout(r, 16));
  }, []);

  const switchCostume = useCallback(async (costumeIdOrType: string, targetId?: string) => {
    if (!checkExecution()) return;
    const id = targetId || projectService.getActiveSpriteId();
    const sprite = projectService.getSpriteById(id);
    if (!sprite) return;

    let nextCostumeId = costumeIdOrType;

    if (costumeIdOrType === 'next') {
      const currentIndex = sprite.costumes.findIndex((c) => c.id === sprite.currentCostumeId);
      const nextIndex = (currentIndex + 1) % sprite.costumes.length;
      nextCostumeId = sprite.costumes[nextIndex].id;
    } else if (costumeIdOrType === 'prev') {
      const currentIndex = sprite.costumes.findIndex((c) => c.id === sprite.currentCostumeId);
      const nextIndex = (currentIndex - 1 + sprite.costumes.length) % sprite.costumes.length;
      nextCostumeId = sprite.costumes[nextIndex].id;
    }

    const costume = sprite.costumes.find((c) => c.id === nextCostumeId) || sprite.costumes.find((c) => c.name === nextCostumeId);

    if (costume) {
      projectService.updateSprite(id, {
        currentCostumeId: costume.id,
        costume: costume.url,
      });
      await new Promise((r) => setTimeout(r, 16));
    }
  }, []);

  // --- Ações de Mouse & Teclado ---

  // --- RASTREAMENTO DO MOUSE ---
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getMouseStageCoords = () => {
    const container = document.getElementById('stage-main-container');
    if (!container) return { x: 0, y: 0 };

    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawX = mouseRef.current.x - centerX;
    const rawY = centerY - mouseRef.current.y;

    const LIMIT_X = 260;
    const LIMIT_Y = 190;

    const x = Math.max(-LIMIT_X, Math.min(rawX, LIMIT_X));
    const y = Math.max(-LIMIT_Y, Math.min(rawY, LIMIT_Y));

    return { x, y };
  };

  const goToMouse = useCallback(async (targetId?: string) => {
    if (!checkExecution()) return;
    const { x, y } = getMouseStageCoords();
    const id = targetId || projectService.getActiveSpriteId();
    projectService.updateSprite(id, { x, y });
    await new Promise((r) => setTimeout(r, 16));
  }, []);

  const pointToMouse = useCallback(async (targetId?: string) => {
    if (!checkExecution()) return;
    const { x: mouseX, y: mouseY } = getMouseStageCoords();
    const id = targetId || projectService.getActiveSpriteId();
    const sprite = projectService.getSpriteById(id);

    if (sprite) {
      const dx = mouseX - sprite.x;
      const dy = mouseY - sprite.y;
      const radians = Math.atan2(dy, dx);
      const degrees = 90 - radians * (180 / Math.PI);

      projectService.updateSprite(id, { angle: degrees });
      await new Promise((r) => setTimeout(r, 16));
    }
  }, []);

  const registerKeyListener = useCallback((key: string, callback: () => Promise<void>) => {
    if (!keyListenersRef.current[key]) {
      keyListenersRef.current[key] = [];
    }
    keyListenersRef.current[key].push(callback);
  }, []);

  const clearKeyListeners = useCallback(() => {
    keyListenersRef.current = {};
  }, []);

  // Listener de Tecla Global com Normalização
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRunningRef.current) return;
      const key = e.key;

      // Normalização
      let matchedKey = key;
      if (key === ' ') matchedKey = 'space';
      else if (key === 'ArrowUp') matchedKey = 'up arrow';
      else if (key === 'ArrowDown') matchedKey = 'down arrow';
      else if (key === 'ArrowRight') matchedKey = 'right arrow';
      else if (key === 'ArrowLeft') matchedKey = 'left arrow';
      else if (key === 'Enter') matchedKey = 'enter';
      else if (key.length === 1) matchedKey = key.toLowerCase();

      const listeners = keyListenersRef.current[matchedKey];
      if (listeners) {
        listeners.forEach((cb) => cb().catch(console.error));
      }

      const anyListeners = keyListenersRef.current['any'];
      if (anyListeners) {
        anyListeners.forEach((cb) => cb().catch(console.error));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mantemos triggerKey para acesso programático se necessário
  const triggerKey = useCallback(async (key: string) => {
    const listeners = keyListenersRef.current[key];
    if (listeners) {
      await Promise.all(listeners.map((cb) => cb()));
    }
  }, []);

  return {
    isRunning,
    start,
    stop,
    setForceExecution,
    // Actions
    move,
    turn,
    goTo,
    setX,
    setY,
    addX,
    addY,
    setAngle,
    bounceOnEdge,
    say,
    sayFor,
    think,
    thinkFor,
    wait,
    setSize,
    changeSize,
    show,
    hide,
    switchCostume,
    goToMouse,
    pointToMouse,
    registerKeyListener,
    clearKeyListeners,
    triggerKey,
  };
}
