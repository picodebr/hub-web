import { javascriptGenerator, Order } from 'blockly/javascript';

export const initMathGenerators = () => {
    // Utils: Map (Não é exclusivo de Board, mas estava na lista)
    javascriptGenerator.forBlock['math_map'] = function (block) {
        const value = javascriptGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || '0';
        const fromLow = javascriptGenerator.valueToCode(block, 'FROM_LOW', Order.ATOMIC) || '0';
        const fromHigh = javascriptGenerator.valueToCode(block, 'FROM_HIGH', Order.ATOMIC) || '1024';
        const toLow = javascriptGenerator.valueToCode(block, 'TO_LOW', Order.ATOMIC) || '0';
        const toHigh = javascriptGenerator.valueToCode(block, 'TO_HIGH', Order.ATOMIC) || '255';

        // Função map estilo Arduino
        const code = `((${value} - ${fromLow}) * (${toHigh} - ${toLow}) / (${fromHigh} - ${fromLow}) + ${toLow})`;
        return [code, Order.ATOMIC];
    };
};
