/**
 * Tradução para C++ dos blocos de controle de Motores e Ponte H.
 */
import * as Blockly from 'blockly';
import { arduinoGenerator } from './generator';

// =================================================================
// 8. ATUADORES & MOTORES
// =================================================================

// CONTROLE DE MOTOR (H-Bridge L298N Simples)
arduinoGenerator.forBlock["motor_control"] = function (block: Blockly.Block) {
    const motor = block.getFieldValue("MOTOR");
    const direcao = block.getFieldValue("DIRECAO");
    let pin1 = "";
    let pin2 = "";

    if (motor === "MOTOR_A") {
        pin1 = "5"; pin2 = "10";
    } else if (motor === "MOTOR_B") {
        pin1 = "9"; pin2 = "6";
    }

    // Registra Pinos
    if (pin1) {
        arduinoGenerator.definitions_['setup_pin_' + pin1] = `pinMode(${pin1}, OUTPUT);`;
        arduinoGenerator.definitions_['setup_pin_' + pin2] = `pinMode(${pin2}, OUTPUT);`;
    }

    let code = "";
    if (direcao === "HORARIO") {
        code = `digitalWrite(${pin1}, HIGH);\ndigitalWrite(${pin2}, LOW);\n`;
    } else {
        code = `digitalWrite(${pin1}, LOW);\ndigitalWrite(${pin2}, HIGH);\n`;
    }
    return code;
};

// Acionar Motores
arduinoGenerator.forBlock["motor_control_pwm"] = function (block: Blockly.Block) {
    const motor = block.getFieldValue("MOTOR");
    // Agora a velocidade vem de um input_value, então usamos valueToCode
    const velocidade = arduinoGenerator.valueToCode(block, 'VELOCIDADE', arduinoGenerator.ORDER_ATOMIC) || "0";
    const direcao = block.getFieldValue("DIRECAO");

    let pin1 = "";
    let pin2 = "";
    let code = "";

    if (motor === "MOTOR_A") {
        pin1 = "5";
        pin2 = "10";
        // Define os Pinos A (5 e 10)
        arduinoGenerator.definitions_['setup_pin_' + pin1] = `pinMode(${pin1}, OUTPUT);`;
        arduinoGenerator.definitions_['setup_pin_' + pin2] = `pinMode(${pin2}, OUTPUT);`;

    } else if (motor === "MOTOR_B") {
        pin1 = "9";
        pin2 = "6";
        // Define os Pinos B (9 e 6)
        arduinoGenerator.definitions_['setup_pin_' + pin1] = `pinMode(${pin1}, OUTPUT);`;
        arduinoGenerator.definitions_['setup_pin_' + pin2] = `pinMode(${pin2}, OUTPUT);`;
    }

    // Lógica PWM:
    // Para controlar velocidade com L298N/Driver Ponte H tradicional em pinos PWM:
    // Sentido 1: Pino1 = VELOCIDADE (analogWrite), Pino2 = LOW (0)
    // Sentido 2: Pino1 = LOW (0), Pino2 = VELOCIDADE (analogWrite)
    // Obs: Se for sentido "ré" total, seria analogWrite(255) vs 0.

    if (direcao === "HORARIO") {
        // Exemplo: Pino1=HIGH (255 via analógico ou digital), Pino2=Controlado? 
        // SE a lógica for: Um pino HIGH fixo e outro PWM Invertido -> velocidade = 255 - speed
        // MAS geralmente é: Um em 0 e outro em PWM. Vamos assumir PWM simples.

        // Modo Simples: Gira para um lado
        code = `analogWrite(${pin1}, ${velocidade});\ndigitalWrite(${pin2}, LOW);\n`;
    } else {
        // Gira para o outro
        code = `digitalWrite(${pin1}, LOW);\nanalogWrite(${pin2}, ${velocidade});\n`;
    }

    return code;
};