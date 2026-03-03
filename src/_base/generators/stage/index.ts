import { javascriptGenerator, Order } from 'blockly/javascript';
import { initMotionGenerators } from './motion';
import { initLooksGenerators } from './looks';
import { initControlGenerators } from './control';
import { initBoardGenerators } from './board';
import { initMathGenerators } from './math';

export const initStageGenerators = () => {
    initMotionGenerators();
    initLooksGenerators();
    initControlGenerators();
    initBoardGenerators();
    initMathGenerators();
};

export { javascriptGenerator, Order };
