import { javascriptGenerator, Order } from 'blockly/javascript';

export const initMotionGenerators = () => {
    // BLOCOS DE MOVIMENTO
    // ==================================================
    javascriptGenerator.forBlock['mover'] = function (block) {
        const value = javascriptGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || '0';
        return `await sprite.move(${value});\n`;
    };

    javascriptGenerator.forBlock['virar'] = function (block) {
        const direcao = block.getFieldValue('DIRECAO');
        const grau = javascriptGenerator.valueToCode(block, 'GRAUS', Order.ATOMIC) || '0';
        let valorFinal;
        if (direcao === "DIREITA") {
            valorFinal = grau;
        } else {
            valorFinal = `(-1 * (${grau}))`;
        }
        return `await sprite.turn(${valorFinal});\n`;
    };

    javascriptGenerator.forBlock['va_para_X_e_Y'] = function (block) {
        const value_x = javascriptGenerator.valueToCode(block, 'VALUE_X', Order.ATOMIC) || '0';
        const value_y = javascriptGenerator.valueToCode(block, 'VALUE_Y', Order.ATOMIC) || '0';
        return `sprite.goTo(${value_x}, ${value_y});\n`;
    };

    javascriptGenerator.forBlock['aponte_para_direcao'] = function (block) {
        const graus = javascriptGenerator.valueToCode(block, 'GRAUS', Order.ATOMIC) || '0';
        return `sprite.setAngle(${graus});\n`;
    }

    javascriptGenerator.forBlock['mude_x'] = function (block) {
        const value = javascriptGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || '0';
        return `await sprite.setX(${value});\n`;
    };

    javascriptGenerator.forBlock['mude_y'] = function (block) {
        const value = javascriptGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || '0';
        return `await sprite.setY(${value});\n`;
    };

    javascriptGenerator.forBlock['adicionar_y'] = function (block) {
        const value = javascriptGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || '0';
        return `await sprite.addY(${value});\n`;
    };

    javascriptGenerator.forBlock['adicionar_x'] = function (block) {
        const value = javascriptGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || '0';
        return `await sprite.addX(${value});\n`;
    };

    javascriptGenerator.forBlock['va_para'] = function (block) {
        const dropdown_direcao = block.getFieldValue('OPCAO');
        let code = '';
        if (dropdown_direcao === 'posiAleatoria') {
            code = `
            (function() {
            const limitX = 275;
            const limitY = 160;
            const randX = Math.floor(Math.random() * (limitX * 2 + 1)) - limitX;
            const randY = Math.floor(Math.random() * (limitY * 2 + 1)) - limitY;
            sprite.goTo(randX, randY);
            })();\n`;
        } else if (dropdown_direcao === 'posiMouse') {
            code = `sprite.goToMouse();\n`;
        }
        return code;
    };

    javascriptGenerator.forBlock['aponte_para'] = function (block) {
        const dropdown_opcao = block.getFieldValue('OPCAO');
        if (dropdown_opcao === 'posiMouse') {
            return 'sprite.pointToMouse();\n';
        }
        return '';
    };

    javascriptGenerator.forBlock['se_tocar_na_borda_volte'] = function (block) {
        return `await sprite.bounceOnEdge();\n`;
    };

    javascriptGenerator.forBlock['posicao_x'] = function (block) {
        const code = 'Math.round(sprite.x)';
        return [code, Order.ATOMIC];
    };

    javascriptGenerator.forBlock['posicao_y'] = function (block) {
        const code = 'Math.round(sprite.y)';
        return [code, Order.ATOMIC];
    };

    javascriptGenerator.forBlock['direcao'] = function (block) {
        const code = 'Math.round(sprite.angle)';
        return [code, Order.ATOMIC];
    };
};
