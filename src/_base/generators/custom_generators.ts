/**
 * Geradores Customizados para Blocos Dinâmicos e Procedimentos.
 *
 * Este arquivo lida com a geração de código para blocos criados pelo usuário
 * (funções/procedimentos) e seus argumentos (reporters). Ele assegura que
 * as definições de funções sejam isoladas e as chamadas sejam assíncronas.
 */

import { javascriptGenerator, Order } from './stage/index';
import { arduinoGenerator, Order as ArduinoOrder } from './arduino';
import * as Blockly from 'blockly/core';

// Helper to safely get NameDB - Moved to top level for sharing
const getArduinoNameDB = () => {
  // @ts-ignore
  if (!arduinoGenerator.nameDB_) {
    // @ts-ignore
    arduinoGenerator.nameDB_ = new Blockly.Names(arduinoGenerator.RESERVED_WORDS_ || '');
  }
  // @ts-ignore
  return arduinoGenerator.nameDB_;
};

// Inicializar geradores estáticos (Reporters) e configurar overrides
export const initCustomGenerators = () => {
  // --- JAVASCRIPT GENERATORS ---
  // 1. Reporters (String/Number/Bool)
  javascriptGenerator.forBlock['argument_reporter_string'] = function (block: Blockly.Block) {
    const code = block.getFieldValue('VALUE');
    // @ts-ignore
    const name = (javascriptGenerator as any).nameDB_.getName(code, Blockly.Names.NameType.VARIABLE);
    return [name, Order.ATOMIC];
  };

  javascriptGenerator.forBlock['argument_reporter_number'] = function (block: Blockly.Block) {
    const code = block.getFieldValue('VALUE');
    // @ts-ignore
    const name = (javascriptGenerator as any).nameDB_.getName(code, Blockly.Names.NameType.VARIABLE);
    return [name, Order.ATOMIC];
  };

  javascriptGenerator.forBlock['argument_reporter_boolean'] = function (block: Blockly.Block) {
    const code = block.getFieldValue('VALUE');
    // @ts-ignore
    const name = (javascriptGenerator as any).nameDB_.getName(code, Blockly.Names.NameType.VARIABLE);
    return [name, Order.ATOMIC];
  };

  // 2. Sobrescrever scrub_
  const jsGenerator = javascriptGenerator as any;
  const jsOldScrub = jsGenerator.scrub_;
  jsGenerator.scrub_ = function (block: Blockly.Block, code: string, opt_thisOnly: boolean) {
    if (block.type && block.type.startsWith('custom_def_')) {
      return code;
    }
    return jsOldScrub.call(this, block, code, opt_thisOnly);
  };

  // --- ARDUINO GENERATORS ---
  // 1. Reporters
  arduinoGenerator.forBlock['argument_reporter_string'] = function (block: Blockly.Block) {
    const code = block.getFieldValue('VALUE');
    const name = getArduinoNameDB().getName(code, Blockly.Names.NameType.VARIABLE);
    return [name, ArduinoOrder.ATOMIC];
  };

  arduinoGenerator.forBlock['argument_reporter_number'] = function (block: Blockly.Block) {
    const code = block.getFieldValue('VALUE');
    const name = getArduinoNameDB().getName(code, Blockly.Names.NameType.VARIABLE);
    return [name, ArduinoOrder.ATOMIC];
  };

  arduinoGenerator.forBlock['argument_reporter_boolean'] = function (block: Blockly.Block) {
    const code = block.getFieldValue('VALUE');
    const name = getArduinoNameDB().getName(code, Blockly.Names.NameType.VARIABLE);
    return [name, ArduinoOrder.ATOMIC];
  };

  // 2. Sobrescrever scrub_ para Arduino
  const ardGenerator = arduinoGenerator as any;
  const ardOldScrub = ardGenerator.scrub_;
  ardGenerator.scrub_ = function (block: Blockly.Block, code: string, opt_thisOnly: boolean) {
    if (block.type && block.type.startsWith('custom_def_')) {
      return code;
    }
    return ardOldScrub.call(this, block, code, opt_thisOnly);
  };
};

// Registrar Gerador Dinâmico para uma Definição e Chamada de função específica
export const registerDynamicGenerator = (defBlockType: string, callBlockType: string, funcName: string, args: { type: string; value: string }[]) => {
  // --- JAVASCRIPT GENERATION ---
  javascriptGenerator.forBlock[defBlockType] = function (block: Blockly.Block) {
    // @ts-ignore
    const safeFuncName = javascriptGenerator.nameDB_.getName(funcName, Blockly.Names.NameType.PROCEDURE);

    const prototype = block.getInputTargetBlock('PROTOTYPE');
    const realArgs: string[] = [];

    if (prototype) {
      prototype.inputList.forEach((input) => {
        if (input.name.startsWith('ARG_')) {
          const target = input.connection?.targetBlock();
          if (target) {
            const val = target.getFieldValue('VALUE');
            // @ts-ignore
            realArgs.push(javascriptGenerator.nameDB_.getName(val, Blockly.Names.NameType.VARIABLE));
          }
        }
      });
    }

    const nextBlock = block.getNextBlock();
    let branch = '';
    if (nextBlock) {
      branch = javascriptGenerator.blockToCode(nextBlock) as string;
    }

    const argsList = realArgs.join(', ');
    return `async function ${safeFuncName} (${argsList}) { \n${branch} \n } \n`;
  };

  javascriptGenerator.forBlock[callBlockType] = function (block: Blockly.Block) {
    // @ts-ignore
    const safeFuncName = javascriptGenerator.nameDB_.getName(funcName, Blockly.Names.NameType.PROCEDURE);

    const generatedArgs: string[] = [];
    args.forEach((arg, i) => {
      if (arg.type !== 'label') {
        let defaultVal = "'null'";
        if (arg.type === 'input') defaultVal = "'0'";
        else if (arg.type === 'number') defaultVal = '0';
        else if (arg.type === 'bool') defaultVal = 'false';

        const code = javascriptGenerator.valueToCode(block, 'ARG_' + i, Order.COMMA) || defaultVal;
        generatedArgs.push(code);
      }
    });

    return `await ${safeFuncName}(${generatedArgs.join(', ')});\n`;
  };

  // --- ARDUINO GENERATION ---
  arduinoGenerator.forBlock[defBlockType] = function (block: Blockly.Block) {
    const safeFuncName = getArduinoNameDB().getName(funcName, Blockly.Names.NameType.PROCEDURE);

    // Arduino requires types for arguments.
    // We'll infer types based on the 'args' metadata passed during registration.
    // BUT we need to match them with the argument names from the PROTOTYPE block.

    const prototype = block.getInputTargetBlock('PROTOTYPE');
    const argParams: string[] = [];

    if (prototype) {
      const argIndex = 0;
      // Iterate inputs to match args spec with block structure
      // NOTE: The 'args' array contains labels and inputs mixed.
      // We need to properly correlate them.
      // Actually, we can just iterate the 'args' definition and if it's an input, we fetch name from block?
      // Safer: Iterate prototype inputs.

      // However, prototype inputs are dynamic.
      // Let's assume the order matches 'args' (filtering out labels).

      // Wait, we need the NAMES for the function signature: `void func(int arg1, String arg2)`

      const inputIdx = 0; // Index for retrieving name from connection

      args.forEach((argSpec, i) => {
        if (argSpec.type !== 'label') {
          // It's an input (number, input, bool)
          // Find the corresponding input in prototype block
          // In ProcedureModal, inputs are named "ARG_" + i.
          // So we can find the target block on that input.

          const input = prototype.getInput('ARG_' + i);
          if (input) {
            const target = input.connection?.targetBlock();
            if (target) {
              const val = target.getFieldValue('VALUE');
              const safeArgName = getArduinoNameDB().getName(val, Blockly.Names.NameType.VARIABLE);

              let type = 'float'; // Default for number
              if (argSpec.type === 'input') type = 'String';
              else if (argSpec.type === 'bool') type = 'bool';

              argParams.push(`${type} ${safeArgName}`);
            }
          }
        }
      });
    }

    const nextBlock = block.getNextBlock();
    let branch = '';
    if (nextBlock) {
      branch = arduinoGenerator.blockToCode(nextBlock) as string;
    }

    // Arduino functions are defined globally (outside loop/setup).
    // createUserCode adds code to the end of the file or specific section.
    // But here we return code? No, definitions usually don't return visible code in stream,
    // they add to 'definitions_' object.

    const funcSignature = `void ${safeFuncName}(${argParams.join(', ')})`;
    const funcCode = `${funcSignature} {\n${branch}\n}`;

    // Register function definition
    // @ts-ignore
    arduinoGenerator.definitions_[safeFuncName] = funcCode;

    return ''; // Return empty string so it doesn't appear in loop()
  };

  arduinoGenerator.forBlock[callBlockType] = function (block: Blockly.Block) {
    const safeFuncName = getArduinoNameDB().getName(funcName, Blockly.Names.NameType.PROCEDURE);

    const generatedArgs: string[] = [];
    args.forEach((arg, i) => {
      if (arg.type !== 'label') {
        let defaultVal = '0';
        if (arg.type === 'input') defaultVal = '""';
        else if (arg.type === 'bool') defaultVal = 'false';

        const code = arduinoGenerator.valueToCode(block, 'ARG_' + i, ArduinoOrder.COMMA) || defaultVal;
        generatedArgs.push(code);
      }
    });

    return `${safeFuncName}(${generatedArgs.join(', ')});\n`;
  };
};
