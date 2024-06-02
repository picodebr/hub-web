import React, { useState, useEffect, useCallback } from 'react'
import Blockly from 'blockly'

import { Game, RemainingBlocksContainer } from './styles'
import Map from '../Map'
import apiFunctions, { ApiFunctions, This } from '../../utils/apiFunctions'
import checkCollision from '../../utils/checkCollision'
import { PlayerCoordinates } from '../../utils/getInitialPlayerCoordinates'
import { GameStatus, IMazeFields } from '../../interfaces'

export interface Props {
  gameRef: React.MutableRefObject<GameRef | null>
  gameStatus: GameStatus
  onGameStatusChange(status: GameStatus): void
  fields: IMazeFields
  player: PlayerCoordinates
  blocklyWorkspaceRef: React.MutableRefObject<Blockly.WorkspaceSvg | null>
  remainingBlocks: number
  maxCollisions: number
}

type ObjectType = Record<string, unknown>

export interface GameRef {
  interpreterInitHandler(
    interpreter: ObjectType,
    globalObject: ObjectType
  ): void
}

const Games: React.FC<Props> = ({
  gameRef,
  gameStatus,
  onGameStatusChange,
  fields,
  player,
  blocklyWorkspaceRef,
  remainingBlocks,
  maxCollisions
}) => {
  const [, setRefresh] = useState<ObjectType>({})
  const [collisions, setCollisions] = useState(0)

  useEffect(() => {
    if (!fields.start) return

    player.position.x = fields.start.x
    player.position.y = fields.start.y
    player.angle = 0
    setRefresh({})
  }, [fields, player])

  const refresh = useCallback(() => {
    if (checkCollision({ player, map: fields })) {
      const status = collisions + 1 < maxCollisions ? 'collision' : 'over'
      onGameStatusChange(status)

      setCollisions(status === 'collision' ? collisions + 1 : 0)
    }
    setRefresh({})
  }, [
    setRefresh,
    onGameStatusChange,
    player,
    fields,
    collisions,
    maxCollisions
  ])

  function interpreterInitHandler(
    interpreter: ObjectType,
    globalObject: ObjectType
  ) {
    const that: This = {
      player,
      map: fields,
      workspace: blocklyWorkspaceRef.current,
      refresh
    }

    Object.keys(apiFunctions).forEach(key => {
      (interpreter as any).setProperty(
        globalObject,
        key,
        (interpreter as any).createNativeFunction(
          apiFunctions[key as keyof ApiFunctions].bind(that)
        )
      )
    })
  }

  gameRef.current = { interpreterInitHandler }

  return (
    <Game className="game">
      <Map
        gameStatus={gameStatus}
        player={player}
        fields={fields}
        collisions={collisions}
        maxCollisions={maxCollisions}
      />
      {remainingBlocks !== Infinity && (
        <RemainingBlocksContainer>{`Blocos restantes: ${remainingBlocks}`}</RemainingBlocksContainer>
      )}
    </Game>
  )
}

export default Games
