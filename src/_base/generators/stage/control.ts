import { javascriptGenerator, Order } from 'blockly/javascript';

export const initControlGenerators = () => {
    // BLOCOS DE CONTROLE & EVENTOS
    // ==================================================
    javascriptGenerator.forBlock['when_flag_clicked'] = function (block) {
        return '';
    };

    javascriptGenerator.forBlock['repete_vezes'] = function (block) {
        const times = javascriptGenerator.valueToCode(block, 'TIMES', Order.ATOMIC) || '0';
        const branch = javascriptGenerator.statementToCode(block, 'DO');
        let code = '';
        code += `for (let i = 0; i < ${times}; i++) {\n`;
        code += branch;
        code += `  await stage.wait(0.01);\n`;
        code += `}\n`;
        return code;
    };

    javascriptGenerator.forBlock['repete_sempre'] = function (block) {
        const statements = javascriptGenerator.statementToCode(block, 'DO');
        let code = '';
        code += `while(true) {\n`;
        code += statements;
        code += `  await stage.wait(0.01);\n`;
        code += `}\n`;
        return code;
    };

    javascriptGenerator.forBlock['control_wait'] = function (block) {
        const seconds = javascriptGenerator.valueToCode(block, 'DURATION', Order.ATOMIC) || '0';
        console.log(seconds)
        return `await stage.wait(${seconds});\n`;
    };

    javascriptGenerator.forBlock['wait_block'] = function (block) {
        const ms = javascriptGenerator.valueToCode(block, 'TIME', Order.ATOMIC) || '0';
        return `await stage.wait(${ms} / 1000);\n`;
    };

    javascriptGenerator.forBlock['se_entao'] = function (block) {
        const cond = javascriptGenerator.valueToCode(block, 'IF0', Order.NONE) || "false";
        const statements = javascriptGenerator.statementToCode(block, 'DO0');
        return `
        if (${cond}) {
            ${statements}
        }
        `;
    };

    javascriptGenerator.forBlock['se_entao_senao'] = function (block) {
        const cond = javascriptGenerator.valueToCode(block, 'IF0', Order.NONE) || "false";
        const doCode = javascriptGenerator.statementToCode(block, 'DO0');
        const elseCode = javascriptGenerator.statementToCode(block, 'ELSE');
        return `
        if (${cond}) {
            ${doCode}
        } else {
            ${elseCode}
        }
        `;
    };

    javascriptGenerator.forBlock['event_when_key_pressed'] = function (block) {
        const keyOption = block.getFieldValue('KEY_OPTION');
        const nextBlock = block.getNextBlock();
        const branch = javascriptGenerator.blockToCode(nextBlock);
        return `
        stage.registerKeyListener("${keyOption}", async function() {
            ${branch}
        });
        `;
    };
};
