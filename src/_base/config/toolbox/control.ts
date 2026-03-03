import { BlockBuilder, CategoryBuilder, shadowNum } from "../../lib/BlockBuilder";

// Controle Stage
export const catControl = new CategoryBuilder("Controle", "#FFAB19");

catControl.addBlock(new BlockBuilder('control_wait').withShadowValue('DURATION', shadowNum(1)));
catControl.addBlock(new BlockBuilder('repete_vezes').withShadowValue('TIMES', shadowNum(10)));
catControl.addBlock(new BlockBuilder('repete_sempre'));
catControl.addBlock(new BlockBuilder('se_entao'));
catControl.addBlock(new BlockBuilder('se_entao_senao'));

// Controle Board
export const catControlBoard = new CategoryBuilder("Controle", "#FFBF00");
catControlBoard.addBlock(new BlockBuilder('wait_block').withShadowValue('TIME', shadowNum(500)));
catControlBoard.addBlock(new BlockBuilder('if_block'));
catControlBoard.addBlock(new BlockBuilder('if_else_block'));
catControlBoard.addBlock(new BlockBuilder('repeat_block').withShadowValue('TIMES', shadowNum(10)));
catControlBoard.addBlock(new BlockBuilder('while_block'));
