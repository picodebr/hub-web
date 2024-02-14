/* eslint-disable @typescript-eslint/no-unused-vars */

import { ILearnBotBuiltinComponents, ILearnBotComponents, ILearnBotExternalComponents } from '../interfaces';

export const formatComponents = (value: any, model: ILearnBotComponents): any => {
  if (!Array.isArray(value)) return value;

  const builtin = formatBuiltinComponents(
    value.filter((e) => e?.type === 'builtin'),
    model.builtin,
  );

  const external = formatExternalComponents(
    value.filter((e) => e?.type === 'external'),
    model.external,
  );

  return { builtin, external };
};

const formatBuiltinComponents = (values: any[], model: ILearnBotBuiltinComponents): any => {
  const inputKeys = Object.keys(model.inputs);
  const outputKeys = Object.keys(model.outputs);

  const inputs = values
    .filter((e) => inputKeys.includes(e?.name))
    .reduce((acc, e) => {
      const { name, value } = e;
      return { ...acc, [name]: value };
    }, {});

  const outputs = values
    .filter((e) => outputKeys.includes(e?.name))
    .reduce((acc, e) => {
      const { name, value } = e;
      return { ...acc, [name]: value };
    }, {});

  return { inputs, outputs };
};

const formatExternalComponents = (values: any[], model: ILearnBotExternalComponents): any => {
  const inputKeys = Object.keys(model.inputs);
  const outputKeys = Object.keys(model.outputs);

  const inputs = values
    .filter((e) => inputKeys.includes(e?.name))
    .reduce((acc, e) => {
      const { name, type, ...rest } = e;
      return { ...acc, [name]: rest };
    }, {});

  const outputs = values
    .filter((e) => outputKeys.includes(e?.name))
    .reduce((acc, e) => {
      const { name, type, ...rest } = e;
      return { ...acc, [name]: rest };
    }, {});

  return { inputs, outputs };
};
