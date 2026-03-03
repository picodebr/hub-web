import { BlockBuilder, CategoryBuilder, shadowNum } from "../../lib/BlockBuilder";

// Operadores Stage
export const catOperators = new CategoryBuilder("Operadores", "#59C059");

catOperators.addBlock(new BlockBuilder('math_arithmetic').withShadowValue('A', shadowNum(1)).withShadowValue('B', shadowNum(1)));
catOperators.addBlock(new BlockBuilder('logic_compare').withShadowValue('A', shadowNum(50)).withShadowValue('B', shadowNum(50)));
catOperators.addBlock(new BlockBuilder('logic_operation'));
catOperators.addBlock(new BlockBuilder('logic_negate'));

// Operadores Board
export const catOperatorsBoard = new CategoryBuilder("Operadores", "#59C059");
catOperatorsBoard.addBlock(new BlockBuilder('math_arithmetic').withShadowValue('A', shadowNum(1)).withShadowValue('B', shadowNum(1)));
catOperatorsBoard.addBlock(new BlockBuilder('logic_compare').withShadowValue('A', shadowNum(50)).withShadowValue('B', shadowNum(50)));
catOperatorsBoard.addBlock(new BlockBuilder('logic_operation'));
catOperatorsBoard.addBlock(new BlockBuilder('logic_negate'));
catOperatorsBoard.addBlock(new BlockBuilder('math_map')
    .withShadowValue('FROM_LOW', shadowNum(0))
    .withShadowValue('FROM_HIGH', shadowNum(1024))
    .withShadowValue('TO_LOW', shadowNum(0))
    .withShadowValue('TO_HIGH', shadowNum(255))
);
