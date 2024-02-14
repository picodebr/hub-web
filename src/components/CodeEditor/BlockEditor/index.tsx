import React, { useCallback, useEffect, useState } from 'react';

import { buttons } from '../../scratch/buttons';
import { scratchCategories, scratchIOFactoryCategories } from '../../scratch/categories';
import { defaultBlocklyConfig } from '../../scratch/config';
import { scratchState } from '../../scratch/ScratchState';
import { makeBlocklyToolbox } from '../../scratch/toolbox';
import { getInitialBlocks } from '../../scratch/utils/getInitialBlocks';
import { ScratchNewBlockModal } from '../../ScratchNewBlockModal';
import { ScratchNewVariableModal } from '../../ScratchNewVariableModal';
import { ICodeEditor } from '../interfaces';
import { BlocklyDiv, BlocklyGlobals, Container } from './styles';
import { useBlockly } from '@/_base/hooks';
import { headerEvents } from '@/components/Page/components/Header/HeaderEvents';

export const BlockEditor: React.FC<ICodeEditor> = ({ sourceCodeRef, board, onSourceCodeChange }) => {
  const Blockly = useBlockly();

  const [showVariableModal, setShowVariableModal] = useState(false);

  useEffect(() => {
    if (!Blockly) return;

    scratchState.workspace = Blockly.inject('blocklyDiv', defaultBlocklyConfig);
    scratchState.variables = [...(sourceCodeRef.current.variables || [])];

    // Register blocks
    scratchCategories.forEach((category) => {
      let { blocks } = category;

      if (category.blocksFactories && scratchIOFactoryCategories.includes(category.id))
        blocks = category.blocksFactories.map((factory) => factory(board.pins));

      if (category.blocksFactories && category.id === 'variable') {
        blocks = category.blocksFactories.map((factory) => factory(scratchState.variables));
      }

      blocks.forEach(({ name, init }) => {
        if (init) Blockly.Blocks[name] = { init };
      });
    });

    buttons.forEach((e) => scratchState.workspace.registerButtonCallback(e.key, e.callback));

    scratchState.workspace.registerButtonCallback('new_variable', () => setShowVariableModal(true));

    scratchState.workspace.updateToolbox(makeBlocklyToolbox(board));

    const xmlElement = getInitialBlocks();

    if (sourceCodeRef.current.code) xmlElement.innerHTML = sourceCodeRef.current.code;

    Blockly.Xml.domToWorkspace(xmlElement, scratchState.workspace);

    const updateCode = () => {
      const xml = Blockly.Xml.workspaceToDom(scratchState.workspace);

      onSourceCodeChange({
        ...sourceCodeRef.current,
        code: xml.innerHTML,
        variables: scratchState.variables,
      });
    };

    // keep track of every workspace change and update the XML representation
    scratchState.workspace.addChangeListener(updateCode);

    updateCode();
  }, [Blockly, board, onSourceCodeChange, sourceCodeRef]);

  const handleUndo = useCallback(() => Blockly?.mainWorkspace.undo(false), [Blockly]);

  const handleRedo = useCallback(() => Blockly?.mainWorkspace.undo(true), [Blockly]);

  useEffect(() => {
    headerEvents.addListener('undo', handleUndo);
    headerEvents.addListener('redo', handleRedo);

    return () => {
      headerEvents.removeListener('undo', handleUndo);
      headerEvents.removeListener('redo', handleRedo);
    };
  }, [handleRedo, handleUndo]);

  const handleNewVariable = useCallback(
    (variable?: string) => {
      setShowVariableModal(false);

      if (!variable) return;

      scratchState.variables.push(variable);
      scratchState.workspace.updateToolbox(makeBlocklyToolbox(board));
    },
    [board],
  );

  const handleNewBlockUpdate = useCallback(() => {
    scratchState.workspace.updateToolbox(makeBlocklyToolbox(board));
  }, [board]);

  const procedureCodes =
    scratchState.workspace
      .getAllBlocks?.()
      .filter((e: any) => e.type === 'procedures_definition')
      .map((e: any) => e.childBlocks_?.[0]?.procCode_ || '')
      .filter((e: any) => e) || [];

  return (
    <Container>
      <BlocklyDiv id="blocklyDiv" />
      <BlocklyGlobals />
      <ScratchNewBlockModal onUpdate={handleNewBlockUpdate} procedureCodes={procedureCodes} />
      <ScratchNewVariableModal show={showVariableModal} onClose={handleNewVariable} variables={scratchState.variables} />
    </Container>
  );
};
