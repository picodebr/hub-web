const convertNamedNodeMapToSimpleObject = (n: NamedNodeMap) =>
  Object.keys(n).reduce((acc, k: any) => {
    acc[n[k].name] = n[k].value;
    return acc;
  }, {} as Record<string, string>);

const convertHTMLCollectionToArray = (c: HTMLCollection) =>
  Object.keys(c).map(k => c[k as any]) as HTMLUnknownElement[];

const isEmptyOrFalsy = (value: any) => {
  if (typeof value !== 'object') return !value;

  if (Array.isArray(value)) return !value.length;

  return !Object.keys(value).length;
};

const removeEmptyProperties = (obj: Record<string, any>) => {
  const parsed = {} as Record<string, any>;

  Object.keys(obj).forEach(k => {
    if (!isEmptyOrFalsy(obj[k])) parsed[k] = obj[k];
  });

  return parsed;
};

export interface IParsedHTMLUnknownElement {
  name?: string;
  attributes?: Record<string, any>;
  children?: IParsedHTMLUnknownElement[];
  value?: string;
}

const parseHTMLUnknownElement = (element: HTMLUnknownElement | string) => {
  if (typeof element === 'string') {
    return {};
  }

  const parsed: IParsedHTMLUnknownElement = {
    name: element.localName,
    attributes: convertNamedNodeMapToSimpleObject(element.attributes),
    children: element.children.length
      ? convertHTMLCollectionToArray(element.children).map(
          parseHTMLUnknownElement,
        )
      : [parseHTMLUnknownElement(element.innerText)].filter(
          e => Object.keys(e).length,
        ),
    value: element.children.length ? undefined : element.innerText,
  };

  return removeEmptyProperties(parsed);
};

type Fields = Record<string, IParsedBlock | string>;

type ArgType = 'text' | 'boolean';

export interface IParsedBlock {
  name: string;
  fields: Fields;
  statements: IParsedStatements;
}

export type ICustomArgs = Record<string, ArgType>;

interface IParsedStatements {
  truthy?: IParsedBlock;
  falsy?: IParsedBlock;
  next?: IParsedBlock;
  custom?: ICustomArgs;
  global?: IParsedBlock[];
}

type ElementHandler = (e: IParsedHTMLUnknownElement) => IParsedBlock | string;

const convertElementToBlock = (e?: IParsedHTMLUnknownElement) => {
  const handler = e && elementConverters[e.name || ''];
  return handler ? handler(e) : '';
};

const elementConverters: Record<string, ElementHandler> = {
  xml: e => ({
    name: 'xml',
    fields: {},
    statements: {
      global: e.children?.map(convertElementToBlock) as IParsedBlock[],
    },
  }),

  variables: () => ({ name: 'variables', fields: {}, statements: {} }),

  field: e => e.value || '',

  shadow: e => convertElementToBlock(e.children?.[0]),

  value: e => convertElementToBlock(e.children?.at(-1)),

  next: e => convertElementToBlock(e.children?.[0]),

  statement: e => convertElementToBlock(e.children?.[0]),

  mutation: e => ({
    name: 'mutation',
    fields: e.attributes || {},
    statements: {},
  }),

  block: e => ({
    name: e.attributes?.type || 'unknown',

    fields:
      (e.attributes?.type === 'procedures_definition'
        ? e.children?.[0]?.children?.[0]?.children?.[0]?.attributes
        : e.children
            ?.filter(
              el =>
                el.name === 'value' ||
                el.name === 'field' ||
                el.name === 'mutation',
            )
            .reduce(
              (acc, el) => ({
                ...acc,
                [el.attributes?.name || el.name || '']:
                  convertElementToBlock(el),
              }),
              {} as Fields,
            )) || {},

    statements: removeEmptyProperties({
      truthy: convertElementToBlock(
        e.children?.find(
          el => el.name === 'statement' && el.attributes?.name === 'SUBSTACK',
        ),
      ),

      falsy: convertElementToBlock(
        e.children?.find(
          el => el.name === 'statement' && el.attributes?.name === 'SUBSTACK2',
        ),
      ),

      custom: e.children
        ?.find(
          el =>
            el.name === 'statement' && el.attributes?.name === 'custom_block',
        )
        ?.children?.[0]?.children?.filter(el => el.name === 'value')
        .map(el => ({
          type: el.children?.[0]?.attributes?.type?.endsWith('boolean')
            ? 'boolean'
            : 'text',
          value: el.children?.[0]?.children?.[0].value || '',
        }))
        .reduce((acc, el) => ({ ...acc, [el.value]: el.type }), {}),

      next: convertElementToBlock(e.children?.find(el => el.name === 'next')),
    }),
  }),
};

export const parseHTMLUnknownElementIntoParsedBlock = (
  htmlElement: HTMLUnknownElement,
): IParsedBlock | string =>
  convertElementToBlock(parseHTMLUnknownElement(htmlElement));
