import { parseVariableNames } from '../../utils/parseVariableNames';
import { IBlock, IBlockParser } from '../interfaces';

const procedureDefinitionParser: IBlockParser = (block, { scratchParser, procedures, lang }) => {
  const procedure = procedures.find((e) => e.proccode === block.fields.proccode);

  if (!procedure) return '';

  procedure.onScope = true;
  const nextParsed = scratchParser(block.statements.next);
  procedure.onScope = false;

  const args = parseVariableNames(block.statements.custom || {}, lang);

  return lang === 'cpp'
    ? `void ${procedure.name}(${args}) {\n${nextParsed}}\n`
    : `const ${procedure.name} = async (${args}) => {\nawait safeLoop();\n${nextParsed}}\n`;
};

const proceduresCallParser: IBlockParser = (block, { scratchParser, procedures, lang }) => {
  const nextParsed = scratchParser(block.statements.next);
  const { mutation } = block.fields;

  if (!mutation || typeof mutation === 'string') return nextParsed;

  const procedure = procedures.find((e) => e.proccode === mutation.fields.proccode);

  const args = Object.keys(block.fields)
    .filter((k) => k !== 'mutation')
    .map((k) => scratchParser(block.fields[k]))
    .filter((e) => e);

  if (!procedure || args.length < Object.keys(procedure.args).length) return nextParsed;

  const prefix = lang === 'cpp' ? '' : 'await ';

  return lang === 'cpp' ? `${procedure.name}(${args.join(', ')});\n${nextParsed}` : `${prefix}${procedure.name}(${args.join(', ')});\n${nextParsed}`;
};

const argumentReporterStringNumberParser: IBlockParser = (block, { procedures }) => {
  const procedure = procedures.find((e) => e.onScope);
  if (!procedure) return '';

  const index = Object.keys(procedure.args).findIndex((k) => procedure.args[k] === block.fields.VALUE);

  return index < 0 ? '' : `_arg${index}`;
};

const argumentReporterBooleanParser: IBlockParser = (block, { procedures }) => {
  const procedure = procedures.find((e) => e.onScope);
  if (!procedure) return '';

  const index = Object.keys(procedure.args).findIndex((k) => procedure.args[k] === block.fields.VALUE);

  return index < 0 ? '' : `_arg${index}`;
};

export const procedureBlocks: IBlock[] = [
  {
    name: 'procedures_definition',
    parserCpp: procedureDefinitionParser,
    parserJs: procedureDefinitionParser,
  },

  {
    name: 'procedures_call',
    parserCpp: proceduresCallParser,
    parserJs: proceduresCallParser,
  },

  {
    name: 'argument_reporter_string_number',
    parserCpp: argumentReporterStringNumberParser,
    parserJs: argumentReporterStringNumberParser,
  },

  {
    name: 'argument_reporter_boolean',
    parserCpp: argumentReporterBooleanParser,
    parserJs: argumentReporterBooleanParser,
  },
];
