import {
  IParsedBlock,
  parseHTMLUnknownElementIntoParsedBlock,
} from '../utils/parseHTMLUnknownElement';
import {
  IBlockParser,
  IProcedure,
  IScratchParser,
  ScratchTranspilerLanguage,
} from '../blocks/interfaces';
import { scratchCategories } from '../categories';
import { VARIABLE_PREFIX } from '../blocks/variable';

const xmlParser = (
  block: IParsedBlock,
  vars: string[],
  lang: ScratchTranspilerLanguage,
) => {
  const procedureBlocks =
    block.statements.global?.filter(e => e.name === 'procedures_definition') ||
    [];

  const procedures = procedureBlocks
    .map((b, index) => {
      const argIds: string[] = JSON.parse(
        (b.fields.argumentids as string) || '[]',
      );
      const argNames = Object.keys(b.statements.custom || {});

      return {
        name: `_fun${index}`,
        proccode: b.fields.proccode,
        args: argIds.reduce((acc, e, i) => ({ ...acc, [e]: argNames[i] }), {}),
        onScope: false,
      };
    })
    .filter(e => e) as IProcedure[];

  const isNumberRegex = new RegExp('[\\-\\.0-9]');

  const parseNumber = (n: string) => {
    const parsed = Number(n);
    return Number.isNaN(parsed) ? '' : `${parsed}`;
  };

  const scratchParser: IScratchParser = (e, isNumber) => {
    if (typeof e === 'string')
      return !isNumber ? e : isNumberRegex.test(e) ? parseNumber(e) : '';

    const blockParsers = lang === 'cpp' ? blockParsersCpp : blockParsersJs;
    const parser = e && blockParsers[e.name];

    const doubleToIntParse =
      lang === 'cpp' ? doubleToIntParseCpp : doubleToIntParseJs;

    return parser
      ? parser(e, {
          scratchParser,
          doubleToIntParse,
          wrapParens,
          procedures,
          lang,
        })
      : '';
  };

  const parsedProcedures = procedureBlocks
    .map(e => scratchParser(e))
    .map(e => adjustIndentation(e))
    .join('\n\n');

  const parsedSetup = block.statements.global
    ?.filter(e => e.name === 'event_setup')
    .map(e => scratchParser(e))
    .map(e => adjustIndentation(e))
    .join('\n\n');

  const parsedLoop = block.statements.global
    ?.filter(e => e.name === 'event_loop')
    .map(e => scratchParser(e))
    .map(e => adjustIndentation(e))
    .join('\n\n');

  const langVarPrefix = lang === 'cpp' ? 'double' : 'let';
  const variables = vars
    .map(e => `${langVarPrefix} ${VARIABLE_PREFIX}${e} = 0;`)
    .join('\n');

  const includes = lang === 'cpp' ? '#include <CodeHeaders.hpp>' : '';

  const parsedCode = [
    includes,
    variables,
    parsedProcedures,
    parsedSetup,
    parsedLoop,
  ];

  return parsedCode.filter(e => e?.trim()).join('\n\n');
};

const blockParsersCpp: Record<string, IBlockParser> = scratchCategories
  .map(category =>
    (category.blocksFactories
      ? category.blocksFactories.map(factory => factory({}))
      : category.blocks
    )
      .filter(block => !!block.parserCpp)
      .reduce((acc, block) => ({ ...acc, [block.name]: block.parserCpp }), {}),
  )
  .reduce((acc, e) => ({ ...acc, ...e }), {});

const blockParsersJs: Record<string, IBlockParser> = scratchCategories
  .map(category =>
    (category.blocksFactories
      ? category.blocksFactories.map(factory => factory({}))
      : category.blocks
    )
      .filter(block => !!block.parserJs)
      .reduce((acc, block) => ({ ...acc, [block.name]: block.parserJs }), {}),
  )
  .reduce((acc, e) => ({ ...acc, ...e }), {});

const doubleToIntParseCpp = (n: string) => `(int) lround(${n})`;
const doubleToIntParseJs = (n: string) => `parseInt(${n}, 10)`;

const wrapParens = (value?: string) => {
  const val = value?.trim() || '';

  return val.split(' ').length > 1 && !val.startsWith('(') ? `(${val})` : val;
};

const adjustIndentation = (value: string, spaces = 0, step = 2) => {
  if (!value) return '';

  return value
    .split('\n')
    .map(e => e.trim())
    .filter(e => e)
    .map(line => {
      if (line.startsWith('}') || line.endsWith('}'))
        spaces = Math.max(spaces - step, 0);

      const newLine = prefixSpaces(line, spaces);

      if (line.endsWith('{')) spaces += step;

      return newLine;
    })
    .join('\n');
};

const prefixSpaces = (value: string, spaces: number) =>
  `${''.padStart(spaces, ' ')}${value || ''}`;

export const scratchTranspiler = (
  xml: HTMLUnknownElement,
  vars: string[],
  lang: ScratchTranspilerLanguage = 'cpp',
) => {
  const parsed = parseHTMLUnknownElementIntoParsedBlock(xml);
  return typeof parsed === 'string' ? parsed : xmlParser(parsed, vars, lang);
};
