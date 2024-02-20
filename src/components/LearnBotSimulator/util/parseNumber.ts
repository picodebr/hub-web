interface IOptions {
  allow?: Readonly<number[]>;
  deny?: Readonly<number[]>;
  default?: number;
  min?: number;
  max?: number;
}

export const parseNumber = (value: unknown, options?: IOptions) => {
  const _default = options?.default || 0;
  let n = Number(value);

  if (Number.isNaN(n)) n = _default;

  if (options?.deny !== undefined && options.deny.includes(n)) n = _default;

  if (options?.allow !== undefined && !options.allow.includes(n)) n = _default;

  if (options?.min !== undefined && n < options.min) n = _default;

  if (options?.max !== undefined && n > options.max) n = _default;

  return n;
};
