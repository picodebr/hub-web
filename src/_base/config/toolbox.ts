/**
 * Definindo o Toolbox (Caixa de Ferramentas) do Blockly.
 * 
 * Este arquivo organiza os blocos em categorias coloridas e lógicas.
 * Existem duas definições principais:
 * 1. ToolboxDefinition: Usada no modo "Stage" (simulação visual).
 * 2. ToolboxUploadDefinition: Usada no modo "Upload" (programação da placa).
 * 
 * Refatorado para usar definições modulares em ./toolbox/
 */

import { catMotion } from "./toolbox/motion";
import { catLooks } from "./toolbox/looks";
import { catSound } from "./toolbox/sound";
import { catEvents } from "./toolbox/events";
import { catControl, catControlBoard } from "./toolbox/control";
import { catSensing } from "./toolbox/sensing";
import { catOperators, catOperatorsBoard } from "./toolbox/operators";
import { catPlaca, catOutput, catInput, catSensorsBoard, catSerial, catActuators } from "./toolbox/board";
import { catVariables, catMyBlocks } from "./toolbox/custom";

export const ToolboxDefinition = {
    kind: 'categoryToolbox',
    contents: [
        catMotion.toJSON(),
        catLooks.toJSON(),
        catSound.toJSON(),
        catEvents.toJSON(),
        catControl.toJSON(),
        catSensing.toJSON(),
        catOperators.toJSON(),
        catPlaca.toJSON(),
        catVariables.toJSON(),
        catMyBlocks.toJSON()
    ]
};

export const ToolboxUploadDefinition = {
    kind: 'categoryToolbox',
    contents: [
        catOutput.toJSON(),
        catInput.toJSON(),
        catSensorsBoard.toJSON(),
        catSerial.toJSON(),
        catActuators.toJSON(),
        catControlBoard.toJSON(),
        catOperatorsBoard.toJSON(),
        catVariables.toJSON(),
        catMyBlocks.toJSON()
    ]
};
