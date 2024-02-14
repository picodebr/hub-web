/* eslint-disable @typescript-eslint/no-unused-vars */
import { IBoard } from '@/_base/interfaces/boards/IBoard';
import { variableBlocksFactories } from '../blocks/variable';
import { IButton } from '../buttons/interfaces';
import { scratchCategories, scratchIOFactoryCategories } from '../categories';
import { ICategory } from '../categories/interfaces';
import { scratchState } from '../ScratchState';
import { isProduction } from '@/_base/utils';

export const defaultToolbox = `
  <xml>
    <category
        name="Default"
    >
    </category>
  </xml>
`;

type ICategoryAttributes = Omit<ICategory, 'blocks'>;

const makeCategoryAttributes = (attributes: ICategoryAttributes) =>
  `${Object.keys(attributes)
    .filter((key) => {
      const value = attributes[key as keyof ICategoryAttributes];
      return Array.isArray(value) ? value.length : value;
    })
    .map((key) => `${key}="${attributes[key as keyof ICategoryAttributes]}"`)
    .join(' ')}`;

const makeSimpleCategory = ({ blocks, ...attributes }: ICategory) => `
  <category ${makeCategoryAttributes(attributes)}>
    ${
      blocks
        ?.map(
          ({ name, toolboxXml }) =>
            toolboxXml ||
            `
          <block type="${name}" />
          `,
        )
        .join('') || ''
    }
  </category>
`;

const makeButton = (button: IButton) => `<button text="${button?.label}" callbackKey="${button?.key}" />`;

const makeVariableCategory = (category: ICategory) => `
  <category
    id="${category.id}"
    name="${category.name}"
    colour="${category.colour}"
    secondaryColour="${category.secondaryColour}"
  >
    ${category.button ? makeButton(category.button) : ''}
    ${scratchState.variables.length ? variableBlocksFactories.map((factory) => factory(scratchState.variables).toolboxXml).join('\n') : ''}
    }
  </category>
`;

const makeIOBlocksCategory = ({ blocksFactories, ...attributes }: ICategory, board: IBoard) => `
  <category ${makeCategoryAttributes(attributes)}>
    ${
      blocksFactories
        ?.map((factory) => factory(board.pins))
        .map(
          ({ name, toolboxXml }) =>
            toolboxXml ||
            `
          <block type="${name}" />
          `,
        )
        .join('') || ''
    }
  </category>
`;

export const makeBlocklyToolbox = (board: IBoard) => {
  (window as any).scratch = scratchState;

  const isProd = isProduction();

  return `<xml>
      ${scratchCategories
        .filter((e) => !e.hidden)
        .filter((e) => !isProd || !e.developmentOnly)
        .map((e) =>
          e.id === 'variable'
            ? makeVariableCategory(e)
            : scratchIOFactoryCategories.includes(e.id)
            ? makeIOBlocksCategory(e, board)
            : makeSimpleCategory(e),
        )
        .join('')}
    </xml>
  `;
};
