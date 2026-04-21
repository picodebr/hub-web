/**
 * Tradução para JavaScript dos blocos de interação com a Placa (via Firmata) no modo Stage.
 */
import * as Blockly from 'blockly/core';
import { javascriptGenerator, Order } from 'blockly/javascript';

export const initBoardGenerators = () => {
    // BLOCOS DA PLACA (FIRMATA / MODO PALCO)
    // ==================================================

    // Leitura Digital
    javascriptGenerator.forBlock['board_read_digital_pin'] = function (block: Blockly.Block) {
        const pin = block.getFieldValue('PIN');
        // Gera chamada síncrona (via Cache do StageBoard)
        // O proxy no sandbox transformou em Promise => precisa de await.
        const code = `(await stage.board.getDigital('${pin}'))`;
        return [code, Order.ATOMIC];
    };

    // Leitura Digital (Versão Stage - legacy nome)
    javascriptGenerator.forBlock['board_read_digital_pin_stage'] = function (block: Blockly.Block) {
        const pin = block.getFieldValue('PIN');
        const code = `(await stage.board.getDigital('${pin}'))`;
        return [code, Order.ATOMIC];
    };

    // Botão da Placa (Pino 2 - Active Low)
    javascriptGenerator.forBlock['board_button_read_stage'] = function (_block: Blockly.Block) {
        // Se 0 (LOW) -> Pressionado (True)
        // Se 1 (HIGH) -> Solto (False)
        const code = `(await stage.board.setPullup('2'), !(await stage.board.getDigital('2')))`;
        return [code, Order.LOGICAL_NOT];
    };

    // Leitura Analógica
    javascriptGenerator.forBlock['board_read_analog_pin'] = function (block: Blockly.Block) {
        const pin = block.getFieldValue('PIN');
        const code = `(await stage.board.getAnalog('${pin}'))`;
        return [code, Order.ATOMIC];
    };

    javascriptGenerator.forBlock['board_read_analog_pin_stage'] = function (block: Blockly.Block) {
        const pin = block.getFieldValue('PIN');
        const code = `(await stage.board.getAnalog('${pin}'))`;
        return [code, Order.ATOMIC];
    };

    // Escrita Digital
    javascriptGenerator.forBlock['set_digital_pin_pt'] = function (block: Blockly.Block) {
        const pin = block.getFieldValue('PIN');
        const state = block.getFieldValue('STATE'); // "HIGH" or "LOW"
        const val = (state === 'HIGH') ? 'true' : 'false';
        return `await stage.board.setDigital('${pin}', ${val});\n`;
    };

    // Escrita PWM
    javascriptGenerator.forBlock['set_pwm_pin_pt'] = function (block: Blockly.Block) {
        const pin = block.getFieldValue('PIN');
        const value = javascriptGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || '0';
        return `await stage.board.setPwm('${pin}', ${value});\n`;
    };

    // Servo
    javascriptGenerator.forBlock['board_servo_move'] = function (block: Blockly.Block) {
        const pin = block.getFieldValue('PIN');
        const degree = javascriptGenerator.valueToCode(block, 'DEGREE', Order.ATOMIC) || '90';
        return `await stage.board.setServo('${pin}', ${degree});\n`;
    };

    // Servo (versão palco)
    javascriptGenerator.forBlock['board_servo_move_stage'] = function (block: Blockly.Block) {
        const pin = block.getFieldValue('PIN');
        const degree = javascriptGenerator.valueToCode(block, 'DEGREE', Order.ATOMIC) || '90';
        return `await stage.board.setServo('${pin}', ${degree});\n`;
    };

    // Pullup
    javascriptGenerator.forBlock['board_set_pullup'] = function (block: Blockly.Block) {
        const pin = block.getFieldValue('PIN');
        return `await stage.board.setPullup('${pin}');\n`;
    };

    // Ultrassônico (Simulado ou Mockado, pois exige protocolo especial ou PING)
    javascriptGenerator.forBlock['board_ultrasonic_read'] = function (_block: Blockly.Block) {
        // HC-SR04 via Firmata requer Sysex Config geralmente (PingFirmata).
        // O StageBoard.ts atual não tem implementação de Ultrassônico via Sysex.
        // Retornamos 0 para evitar crash.
        return ['0', Order.ATOMIC];
    };

    // LDR (Simples Analog Read no A5 fixo, conforme tooltip legado)
    javascriptGenerator.forBlock['board_ldr_read'] = function (_block: Blockly.Block) {
        const code = `(await stage.board.getAnalog('A5'))`;
        return [code, Order.ATOMIC];
    };

    // Botão Placa (Pino 2 fixo, conforme tooltip legado)
    javascriptGenerator.forBlock['board_button_read'] = function (_block: Blockly.Block) {
        const code = `(await stage.board.setPullup('2'), await stage.board.getDigital('2'))`;
        return [code, Order.ATOMIC];
    };

    // Serial Print (Monitor Serial Virtual)
    javascriptGenerator.forBlock['board_serial_print'] = function (block: Blockly.Block) {
        const content = javascriptGenerator.valueToCode(block, 'CONTENT', Order.ATOMIC) || '""';
        return `console.log("SERIAL OUTPUT:", ${content});\n`;
    };

    // Play Note / Tone (Buzzer) - Implementação básica ou Mock
    // Requereria enviar comando de Tone (não padrão no Firmata Standard, às vezes via Sysex ou I2C backpack).
    // Ou usamos PWM se for piezo simples?
    javascriptGenerator.forBlock['board_play_note'] = function (_block: Blockly.Block) {
        return `console.log("Play Note not implemented in StageBoard yet.");\n`;
    };

    javascriptGenerator.forBlock['play_tone_block'] = function (_block: Blockly.Block) {
        return `console.log("Play Tone not implemented in StageBoard yet.");\n`;
    };
};
