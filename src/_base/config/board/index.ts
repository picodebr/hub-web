/**
 * BlockBoardDefinitions - Definições de Blocos para o Modo Placa (Arduino).
 * 
 * Este arquivo contém a configuração JSON dos blocos usados quando o usuário
 * programa diretamente para o hardware (Arduino/ESP32). Os blocos aqui definidos
 * são traduzidos para código C++ (Arduino) pelo gerador.
 * 
 * Agregado de definições modulares.
 */

import { blockStructure } from "./structure";
import { blockIO } from "./io";
import { blockMotors } from "./motors";
import { blockControl } from "./control";
import { blockSensors } from "./sensors";
import { blockSerial } from "./serial";
import { blockActuators } from "./actuators";
import { blockMath } from "./math";

export const BlockBoardDefinitions = [
    ...blockStructure,
    ...blockIO,
    ...blockMotors,
    ...blockControl,
    ...blockSensors,
    ...blockSerial,
    ...blockActuators,
    ...blockMath
] as any;
