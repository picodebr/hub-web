import { BlockBuilder, CategoryBuilder } from "../../lib/BlockBuilder";

export const catSensing = new CategoryBuilder("Sensores", "#5CB1D6");
catSensing.addBlock(new BlockBuilder('ler_botao'));
