/**
 * BlockStageDefinitions - Definições de Blocos para o Modo Palco (Simulação).
 * 
 * Este arquivo define os blocos usados para programar atores (sprites) no palco.
 * Refatorado para usar definições modulares em ./stage/
 */

import { blockMotion } from "./stage/motion";
import { blockLooks } from "./stage/looks";
import { blockSound } from "./stage/sound";
import { blockEvents } from "./stage/events";
import { blockControl } from "./stage/control";
import { blockPrimitives } from "./stage/primitives";
import { blockSensing } from "./stage/sensing";
import { blockBoard } from "./stage/board";

export const BlockStageDefinitions = [
    ...blockMotion,
    ...blockLooks,
    ...blockSound,
    ...blockEvents,
    ...blockControl, // Primitives were often mixed or standalone, putting them before or after doesn't matter much for definition list
    ...blockPrimitives,
    ...blockSensing,
    ...blockBoard
] as any;
