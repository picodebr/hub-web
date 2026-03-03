import { BlockBuilder, CategoryBuilder, shadowNum } from "../../lib/BlockBuilder";

export const catMotion = new CategoryBuilder("Movimento", "#4C97FF");

catMotion.addBlock(new BlockBuilder('mover').withShadowValue('VALUE', shadowNum(10)));
catMotion.addBlock(new BlockBuilder('virar').withField('DIRECAO', 'DIREITA').withShadowValue('GRAUS', shadowNum(90)));
catMotion.addBlock(new BlockBuilder('va_para').withField('OPCAO', 'posiAleatoria'));
catMotion.addBlock(new BlockBuilder('va_para_X_e_Y').withShadowValue('VALUE_X', shadowNum(0)).withShadowValue('VALUE_Y', shadowNum(0)));
catMotion.addBlock(new BlockBuilder('aponte_para_direcao').withShadowValue('GRAUS', shadowNum(90)));
catMotion.addBlock(new BlockBuilder('aponte_para').withField('OPCAO', 'posiMouse'));
catMotion.addBlock(new BlockBuilder('mude_x').withShadowValue('VALUE', shadowNum(10)));
catMotion.addBlock(new BlockBuilder('mude_y').withShadowValue('VALUE', shadowNum(10)));
catMotion.addBlock(new BlockBuilder('adicionar_x').withShadowValue('VALUE', shadowNum(10)));
catMotion.addBlock(new BlockBuilder('adicionar_y').withShadowValue('VALUE', shadowNum(10)));
catMotion.addBlock(new BlockBuilder('se_tocar_na_borda_volte'));
catMotion.addBlock(new BlockBuilder('posicao_x'));
catMotion.addBlock(new BlockBuilder('posicao_y'));
catMotion.addBlock(new BlockBuilder('direcao'));
