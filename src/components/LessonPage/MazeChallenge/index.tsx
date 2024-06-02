/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import * as Interpreter from 'js-interpreter';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import Blockly from 'blockly';
import { FiPlay as PlayIcon } from 'react-icons/fi';
import { VscDebugRestart as RestartIcon } from 'react-icons/vsc';

import BlocklyWidget from './components/BlocklyWidget';
import Game, { GameRef } from './components/Game';

import checkCollision from './utils/checkCollision';
import checkFinish from './utils/checkFinish';
import getInitialPlayerCoordinates from './utils/getInitialPlayerCoordinates';
import useWindowResize from './utils/windowResize';

import { App, AppGlobal, GameButtonContainer, Button } from './styles';
import { GameStatus, IMazeFields, MazePlayer } from './interfaces';

const instructionStepDelay = 500; // milliseconds

export interface Props {
  fields: IMazeFields;
  workspaceCode?: string;
  onGameStatusChange?(status: GameStatus): void;
  onWorkspaceCodeChange?(workspaceCode: string): void;
  maxCollisions?: number;
  clearFields?: boolean;
  onClearFields?(bool: boolean): void;
  challengeId: string;
  player: MazePlayer;
}

export const MazePage: React.FC<Props> = ({
  fields,
  workspaceCode,
  onGameStatusChange,
  onWorkspaceCodeChange,
  maxCollisions = 4,
  clearFields,
  onClearFields,
  challengeId,
  ...rest
}) => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('stop');
  const [remainingBlocks, setRemainingBlocks] = useState<number>(Infinity);
  const blocklyWorkspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const gameRef = useRef<GameRef | null>(null);
  const player = useMemo(getInitialPlayerCoordinates, []);
  const windowSize = useWindowResize();
  const simulationStatus = useMemo(() => ({ status: 'stop' }), []);

  useEffect(() => {
    if (clearFields) {
      setGameStatus('stop');
      if (onClearFields) onClearFields(false);
    }
  }, [clearFields]);

  useEffect(() => {
    simulationStatus.status = gameStatus;

    if (onGameStatusChange) onGameStatusChange(gameStatus);

    if (blocklyWorkspaceRef.current && gameStatus !== 'running') {
      blocklyWorkspaceRef.current.highlightBlock('');
    }
  }, [gameStatus]);

  const blocklyToolboxConfig = useMemo(() => {
    return { blocks: { custom: fields.blocks } };
  }, [fields.blocks]);

  const horizontalLayout = useMemo(() => !windowSize.isLandscape || windowSize.width < 1100, [windowSize]);

  const blocklyConfig = useMemo(
    () => ({
      maxBlocks: fields.max_blocks,
      horizontalLayout,
    }),
    [fields.max_blocks, horizontalLayout],
  );

  function needExecutionDelay() {
    if (!blocklyWorkspaceRef.current) return false;

    const delayedFunctions = ['forward', 'turnLeft', 'turnRight'];
    const found = delayedFunctions.find((f) => f === (blocklyWorkspaceRef.current as any).lastExecutedFunction);

    if (blocklyWorkspaceRef.current) {
      (blocklyWorkspaceRef.current as any).lastExecutedFunction = '';
    }
    return found;
  }

  function handleRunClick() {
    if (!blocklyWorkspaceRef.current || !gameRef.current) return;

    const code: string = (Blockly as any).JavaScript.workspaceToCode(blocklyWorkspaceRef.current);

    const interpreter = new Interpreter(code, (gameRef.current as any).interpreterInitHandler);

    function endOfSimulation() {
      if (checkCollision({ player, map: fields })) setGameStatus('collision');
      else if (checkFinish({ player, map: fields })) setGameStatus('finish');
      else setGameStatus('fail');
    }

    simulationStatus.status = 'running';
    setGameStatus('running');

    function nextStep() {
      if (simulationStatus.status !== 'running') return;

      if (interpreter.step()) {
        setTimeout(nextStep, needExecutionDelay() ? instructionStepDelay : 0);
      } else endOfSimulation();
    }

    nextStep();
  }

  function handleStopResetClick() {
    Object.assign(player, getInitialPlayerCoordinates(fields.start));
    setGameStatus('stop');
  }

  const buttonClickHandlers: Record<GameStatus, () => void> = {
    running: handleStopResetClick,
    stop: handleRunClick,
    collision: handleStopResetClick,
    fail: handleStopResetClick,
    finish: handleStopResetClick,
    over: handleStopResetClick,
  };

  const handleButtonClick = () => {
    buttonClickHandlers[gameStatus]();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <App className="app">
      <AppGlobal />
      <GameButtonContainer className="game-button-container">
        <Game
          remainingBlocks={remainingBlocks}
          gameRef={gameRef}
          gameStatus={gameStatus}
          onGameStatusChange={setGameStatus}
          fields={fields}
          player={player}
          blocklyWorkspaceRef={blocklyWorkspaceRef}
          maxCollisions={maxCollisions}
        />
        <Button onClick={handleButtonClick} className={`run-button ${gameStatus}`} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
          <PlayIcon className="play" size="1.35rem" />
          <RestartIcon className="restart" size="1.35rem" />
        </Button>
      </GameButtonContainer>
      <BlocklyWidget
        setRemainingBlocks={setRemainingBlocks}
        blocklyToolboxConfig={blocklyToolboxConfig}
        blocklyConfig={blocklyConfig}
        blocklyWorkspaceRef={blocklyWorkspaceRef}
        workspaceCode={workspaceCode}
        onWorkspaceCodeChange={onWorkspaceCodeChange}
        challengeId={challengeId}
        player={rest.player}
      />
    </App>
  );
};
