/**
 * Componente StageBridge - Ponte entre o Blockly e o Palco Visual.
 *
 * Este componente não renderiza nada visualmente. Sua função é expor o 'stageManager'
 * (do StageContext) para o objeto global 'window'.
 *
 * Isso é necessário porque o código gerado pelos blocos do Blockly (JavaScript)
 * é executado via eval() e precisa acessar funções como 'stage.sprite.move(10)'.
 */

'use client';

import { useEffect } from 'react';
import { useStage } from '@/_base/context/StageContext';

export default function StageBridge() {
  const stageManager = useStage();

  useEffect(() => {
    /**
     * Expõe a interface do palco para o objeto window.
     * O gerador de código do Blockly produz chamadas como: await stage.sprite.move(10);
     */
    const stageInterface = {
      wait: stageManager.wait, // Função para aguardar segundos
      registerKeyListener: stageManager.registerKeyListener, // Listener de teclas
      sprite: {
        // Comandos de Movimento e Aparência
        move: stageManager.move,
        turn: stageManager.turn,
        goTo: stageManager.goTo,
        setX: stageManager.setX,
        setY: stageManager.setY,
        addX: stageManager.addX,
        addY: stageManager.addY,
        setAngle: stageManager.setAngle,
        say: stageManager.say,
        sayFor: stageManager.sayFor,
        think: stageManager.think,
        thinkFor: stageManager.thinkFor,
        bounceOnEdge: stageManager.bounceOnEdge,

        /**
         * Getters para acessar propriedades do ator via código.
         * Ex: Math.round(stage.sprite.x)
         */
        get x() {
          return stageManager.getSprite().x;
        },
        get y() {
          return stageManager.getSprite().y;
        },
        get angle() {
          return stageManager.getSprite().angle;
        },
      },
    };

    // Faz o mapeamento global
    (window as any).stage = stageInterface;

    return () => {
      // Cleanup opcional: (window as any).stage = null;
    };
  }); // Atualiza a cada renderização para garantir que as closures tenham acesso ao estado mais recente

  return null; // Este componente é apenas um utilitário lógico
}
