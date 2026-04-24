/**
 * Tradução para C++ dos blocos de Machine Learning (via comunicação Serial).
 */
import * as Blockly from 'blockly';
import { arduinoGenerator } from './generator';

// =================================================================
// ML UPLOAD — Quando receber classe via Serial
// =================================================================
arduinoGenerator.forBlock["ml_upload_on_class"] = function (block: Blockly.Block) {
    const className = block.getFieldValue('CLASS') || '';
    const doCode = arduinoGenerator.statementToCode(block, 'DO');

    // Garante Serial.begin no setup
    arduinoGenerator.definitions_['setup_serial'] = 'Serial.begin(9600);';

    // Gera código de leitura serial + comparação
    const code =
        `if (Serial.available()) {
  String mlClass = Serial.readStringUntil('\\n');
  mlClass.trim();
  if (mlClass == "${className}") {
${doCode}  }
}
`;
    return code;
};

// =================================================================
// ML UPLOAD — Bloco Booleano "classe X detectada"
// =================================================================
arduinoGenerator.forBlock["ml_upload_current_class"] = function (block: Blockly.Block) {
    const className = block.getFieldValue('CLASS') || '';

    // Garante Serial.begin no setup
    arduinoGenerator.definitions_['setup_serial'] = 'Serial.begin(9600);';

    // Variável global para armazenar a última classe lida na iteração atual do loop
    arduinoGenerator.definitions_['var_ml_last_class'] = 'String mlLastClass = "";';

    // Isso usa o addLoopHook do ArduinoGenerator (se ele tiver suporte)
    // Se o core original não suportar um loop hook, podemos colocar a lógica na declaração da função que esse bloco devolve.
    // Uma forma mais segura no Blockly nativo é gerar uma função auxiliar.
    arduinoGenerator.definitions_['func_check_ml_class'] = `bool checkMLClass(String targetClass) {
  if (Serial.available()) {
    mlLastClass = Serial.readStringUntil('\\n');
    mlLastClass.trim();
  }
  return mlLastClass == targetClass;
}`;

    const code = `checkMLClass("${className}")`;
    return [code, arduinoGenerator.ORDER_EQUALITY];
};
