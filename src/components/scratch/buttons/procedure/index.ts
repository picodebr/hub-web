import { getBlockly } from '@/_base/utils';
import { scratchState } from '../../ScratchState';
import { IButton } from '../interfaces';

export const procedureButton: IButton = {
  key: 'new_procedure',
  label: 'Novo bloco',
  callback: () => {
    const Blockly = getBlockly();
    if (!Blockly) return;

    Blockly.Procedures.createProcedureDefCallback_(scratchState.workspace);
  },
};
