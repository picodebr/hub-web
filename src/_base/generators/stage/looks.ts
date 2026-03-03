import { javascriptGenerator, Order } from 'blockly/javascript';

export const initLooksGenerators = () => {
    // BLOCOS DE APARÊNCIA
    // ==================================================
    javascriptGenerator.forBlock['looks_say_for_secs'] = function (block) {
        const message = javascriptGenerator.valueToCode(block, 'MESSAGE', Order.ATOMIC) || '""';
        const secs = javascriptGenerator.valueToCode(block, 'SECS', Order.ATOMIC) || '0';
        return `await sprite.sayFor(${message}, ${secs});\n`;
    };

    javascriptGenerator.forBlock['looks_say'] = function (block) {
        const message = javascriptGenerator.valueToCode(block, 'MESSAGE', Order.ATOMIC) || '""';
        return `sprite.say(${message});\n`;
    };

    javascriptGenerator.forBlock['looks_think_for_secs'] = function (block) {
        const message = javascriptGenerator.valueToCode(block, 'MESSAGE', Order.ATOMIC) || '""';
        const secs = javascriptGenerator.valueToCode(block, 'SECS', Order.ATOMIC) || '0';
        return `await sprite.thinkFor(${message}, ${secs});\n`;
    };

    javascriptGenerator.forBlock['looks_think'] = function (block) {
        const message = javascriptGenerator.valueToCode(block, 'MESSAGE', Order.ATOMIC) || '""';
        return `sprite.think(${message});\n`;
    };

    javascriptGenerator.forBlock['looks_switch_backdrop'] = function (block) {
        const backdrop = block.getFieldValue('BACKDROP');
        return `await stage.switchBackdrop('${backdrop}');\n`;
    };

    javascriptGenerator.forBlock['looks_next_backdrop'] = function (block) {
        return `await stage.switchBackdrop('NEXT');\n`;
    };

    javascriptGenerator.forBlock['looks_switch_costume'] = function (block) {
        const costume = block.getFieldValue('COSTUME');
        return `await sprite.switchCostume('${costume}');\n`;
    };

    javascriptGenerator.forBlock['looks_next_costume'] = function (block) {
        return `await sprite.switchCostume('NEXT');\n`;
    };

    javascriptGenerator.forBlock['looks_set_size'] = function (block) {
        const size = javascriptGenerator.valueToCode(block, 'SIZE', Order.ATOMIC) || '100';
        return `await sprite.setSize(${size});\n`;
    };

    javascriptGenerator.forBlock['looks_change_size'] = function (block) {
        const change = javascriptGenerator.valueToCode(block, 'CHANGE', Order.ATOMIC) || '10';
        return `await sprite.changeSize(${change});\n`;
    };

    javascriptGenerator.forBlock['looks_show'] = function (block) {
        return `await sprite.show();\n`;
    };

    javascriptGenerator.forBlock['looks_hide'] = function (block) {
        return `await sprite.hide();\n`;
    };
};
