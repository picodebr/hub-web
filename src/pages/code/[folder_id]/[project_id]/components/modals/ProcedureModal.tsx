/**
 * Componente ProcedureModal - Criador de Blocos Personalizados (Procedimentos).
 *
 * Este modal permite que o usuário crie seus próprios blocos, definindo:
 * 1. O nome do bloco (o texto de comando).
 * 2. Entradas de dados (parâmetros) do tipo Número, Texto ou Booleano.
 * 3. Rótulos de texto para melhor legibilidade.
 *
 * O funcionamento baseia-se em um "Workspace de Pré-visualização" (mini-Blockly)
 * onde o bloco é montado e editado visualmente antes de ser registrado no projeto.
 */

import React, { useState, useEffect, useRef } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { CustomBlockDefinitions, registerCustomBlockFromSpec, registerCustomExtensions } from '@/_base/config/custom_definitions';

// CORREÇÃO: Forçar desativação da lógica de toque globalmente para este módulo para prevenir prompts nativos.
// Isso garante que mesmo em dispositivos de toque (ou simulados), o editor inline (WidgetDiv) seja usado.
try {
  if ((Blockly as any).FieldTextInput) {
    (Blockly as any).FieldTextInput.prototype.useTouchInteraction_ = () => false;
  }
} catch (e) {
  console.warn('Failed to override Blockly touch interaction', e);
}

interface ProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Blockly.WorkspaceSvg | null;
}

export default function ProcedureModal({ isOpen, onClose, workspace }: ProcedureModalProps) {
  const previewDiv = useRef<HTMLDivElement>(null);
  const previewWorkspace = useRef<Blockly.WorkspaceSvg | null>(null);

  // Estado interno do bloco em construção: Nome principal e lista de argumentos/rótulos.
  const blockStateRef = useRef<{ mainName: string; args: { type: string; value: string }[] }>({
    mainName: 'nome do bloco',
    args: [],
  });

  // Ainda precisamos de algum estado react para acionar re-renderizações se elementos da UI precisarem,
  // mas a lógica do blockly deve depender de estado mutável ou sincronização.
  // Na verdade, para este modal, estado React estrito é bom SE sincronizarmos do Blockly antes das mutações.

  const [screenRefresh, setScreenRefresh] = useState(false);
  const [selectedArgIndex, setSelectedArgIndex] = useState(-1);
  const [deleteBubbleVisible, setDeleteBubbleVisible] = useState(false);
  const [deleteBubblePos, setDeleteBubblePos] = useState({ top: 0, left: 0 });
  const hideTrashTimer = useRef<NodeJS.Timeout | null>(null);

  // Configuração Inicial
  useEffect(() => {
    registerCustomExtensions();
    Blockly.defineBlocksWithJsonArray(CustomBlockDefinitions);
  }, []);

  // Gerenciar Workspace de Pré-visualização
  useEffect(() => {
    if (isOpen && previewDiv.current) {
      // CORREÇÃO: Forçar descarte da referência antiga do workspace para prevenir Workspaces Zumbis (desconectados)
      if (previewWorkspace.current) {
        previewWorkspace.current.dispose();
      }

      previewWorkspace.current = Blockly.inject(previewDiv.current, {
        renderer: 'zelos',
        readOnly: false,
        scrollbars: false,
        trashcan: false,
        zoom: { controls: false, startScale: 1.0 },
        move: { scrollbars: false, drag: false, wheel: false },
        sounds: false,
      });

      // Resetar estado ao abrir
      blockStateRef.current = { mainName: 'nome do bloco', args: [] };
      setScreenRefresh(false);

      // CORREÇÃO: Forçar desativação da lógica de toque para prevenir prompts nativos (garantir que Editor Inline use WidgetDiv)
      if ((Blockly as any).FieldTextInput) {
        (Blockly as any).FieldTextInput.prototype.useTouchInteraction_ = () => false;
      }

      // Reconstruir
      rebuildBlock();

      // Adicionar ouvinte
      previewWorkspace.current.addChangeListener(onSelectionChange);
    }
  }, [isOpen]);

  const onSelectionChange = (event: Blockly.Events.Abstract) => {
    if (event.type === Blockly.Events.SELECTED) {
      const e = event as Blockly.Events.Selected;
      if (e.newElementId && previewWorkspace.current) {
        let block = previewWorkspace.current.getBlockById(e.newElementId);
        if (block) {
          let type = block.type;
          if (type.startsWith('arg_helper')) {
            let index = findArgIndex(block);
            if (index !== -1) {
              if (hideTrashTimer.current) clearTimeout(hideTrashTimer.current);
              setSelectedArgIndex(index);
              showDeleteBubble(block);
              return;
            }
          }
        }
      }
      scheduleHideTrash();
    }
  };

  const findArgIndex = (block: Blockly.Block): number => {
    let parent = block.getParent();
    if (!parent) return -1;
    for (let i = 0; i < parent.inputList.length; i++) {
      let input = parent.inputList[i];
      if (input.connection && input.connection.targetBlock() === block) {
        if (input.name.startsWith('ARG_')) return parseInt(input.name.split('_')[1]);
      }
    }
    return -1;
  };

  const showDeleteBubble = (block: Blockly.Block | null, targetField: Blockly.Field | null = null) => {
    if (!block && !targetField) return;

    let svgRoot;
    if (targetField) {
      svgRoot = targetField.getSvgRoot();
    } else if (block) {
      svgRoot = (block as Blockly.BlockSvg).getSvgRoot();
    }

    if (!svgRoot || !previewDiv.current) return;

    const relativeBlock = svgRoot.getBoundingClientRect();
    const previewRect = previewDiv.current.getBoundingClientRect();

    // Calcular posição relativa ao container
    const topPos = relativeBlock.top - previewRect.top - 40; // 35-40px acima
    const leftPos = relativeBlock.left - previewRect.left + relativeBlock.width / 2 - 16; // Centralizado

    setDeleteBubblePos({ top: topPos, left: leftPos });
    setDeleteBubbleVisible(true);
  };

  const hideDeleteBubble = () => {
    setDeleteBubbleVisible(false);
    setSelectedArgIndex(-1);
  };

  const scheduleHideTrash = () => {
    if (hideTrashTimer.current) clearTimeout(hideTrashTimer.current);
    hideTrashTimer.current = setTimeout(() => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      hideDeleteBubble();
    }, 200);
  };

  // Lógica de Salvar: Sincroniza de Bloco Blockly -> Estado do Bloco
  const saveCurrentValues = () => {
    if (!previewWorkspace.current) return;
    const blocks = previewWorkspace.current.getAllBlocks(false);
    if (blocks.length === 0) return;

    const main = previewWorkspace.current.getTopBlocks()[0];
    if (!main) return;

    // Salvar Nome Principal
    const nameField = main.getFieldValue('NAME');
    if (nameField !== null) {
      blockStateRef.current.mainName = nameField;
    }

    // Salvar Valores dos Argumentos
    blockStateRef.current.args.forEach((arg, index) => {
      if (arg.type === 'label') {
        const labelText = main.getFieldValue('LABEL_' + index);
        if (labelText !== null && labelText !== undefined) arg.value = labelText;
      } else {
        const input = main.getInput('ARG_' + index);
        if (input && input.connection && input.connection.targetBlock()) {
          // Helpers são inputs, então olhamos o campo do bloco alvo
          arg.value = input.connection.targetBlock()!.getFieldValue('TEXT');
        }
      }
    });
  };

  // Lógica de Reconstrução: Estado do Bloco -> Bloco Blockly
  const rebuildBlock = () => {
    if (!previewWorkspace.current) return;
    const ws = previewWorkspace.current;
    ws.clear();

    const state = blockStateRef.current;
    const uniqueBlockType = 'dyn_block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    let msg = 'Defina %1';
    const args0: any[] = [{ type: 'field_input', name: 'NAME', text: state.mainName }];

    state.args.forEach((arg, i) => {
      if (arg.type === 'label') {
        msg += ' %' + (args0.length + 1);
        args0.push({ type: 'field_input', name: 'LABEL_' + i, text: arg.value });
      } else {
        msg += ' %' + (args0.length + 1);
        const check = arg.type === 'bool' ? 'Boolean' : arg.type === 'number' ? 'Number' : 'String';
        args0.push({ type: 'input_value', name: 'ARG_' + i, check: check });
      }
    });

    // 1. Definir o Bloco de Pré-visualização
    Blockly.defineBlocksWithJsonArray([
      {
        type: uniqueBlockType,
        message0: msg,
        args0: args0,
        nextStatement: true,
        previousStatement: true,
        inputsInline: true,
        colour: '#FF6680',
      },
    ]);

    // 2. Criar Bloco Principal
    const main = ws.newBlock(uniqueBlockType);
    main.setMovable(false);
    main.setDeletable(false);
    main.initSvg();
    main.render();

    // 3. Anexar Helpers
    state.args.forEach((arg, i) => {
      if (arg.type !== 'label') {
        const helperType =
          arg.type === 'input' ? 'arg_helper_string' : arg.type === 'number' ? 'arg_helper_number' : arg.type === 'bool' ? 'arg_helper_boolean' : '';

        if (helperType) {
          const child = ws.newBlock(helperType);
          child.setFieldValue(arg.value, 'TEXT');
          child.setShadow(true);
          child.initSvg();
          child.render();

          const input = main.getInput('ARG_' + i);
          if (input) input.connection?.connect(child.outputConnection);
        }
      }
    });

    // 4. Centralizar
    const m = ws.getMetrics();
    const hw = main.getHeightWidth();
    const x = m.viewWidth / 2 - hw.width / 2;
    const y = m.viewHeight / 2 - hw.height / 2;
    main.moveBy(x, y);

    // 5. Anexar Ouvintes para Deleção (Campos de Rótulo) - Imitando custom_procedures.js
    main.inputList.forEach((input) => {
      input.fieldRow.forEach((field) => {
        if (field.name && field.name.startsWith('LABEL_')) {
          const svgRoot = field.getSvgRoot();
          if (svgRoot) {
            Blockly.browserEvents.bind(svgRoot, 'mousedown', null, (e: Event) => {
              const mouseEvent = e as MouseEvent;
              if (mouseEvent.button !== 0) return;

              const idx = parseInt(field.name!.split('_')[1]);
              setSelectedArgIndex(idx);
              showDeleteBubble(main, field);
              // Não parar propagação para permitir edição
            });
          }
        }
      });
    });
  };

  const handleDeleteArg = (indexOrEvent: number | React.MouseEvent) => {
    // Se acionado por evento de clique (bolha), usar índice do estado
    let index = typeof indexOrEvent === 'number' ? indexOrEvent : selectedArgIndex;

    if (index !== -1) {
      saveCurrentValues();
      blockStateRef.current.args.splice(index, 1);
      hideDeleteBubble();
      rebuildBlock();
    }
  };

  // Ações
  const addArg = (type: string, defaultValue: string) => {
    saveCurrentValues(); // Salvar texto antes de adicionar
    blockStateRef.current.args.push({ type, value: defaultValue });
    rebuildBlock();
  };

  const handleConfirm = () => {
    if (!workspace) return;
    saveCurrentValues(); // Salvamento final

    const state = blockStateRef.current;
    const validName = state.mainName.trim() || 'função sem nome';

    // Verificar duplicatas
    const allBlocks = workspace.getAllBlocks(false);
    const nameExists = allBlocks.some((block) => {
      if (block.type.startsWith('custom_def_')) {
        const prototype = block.getInputTargetBlock('PROTOTYPE');
        if (prototype) {
          const existingName = prototype.getFieldValue('NAME');
          return existingName && existingName.trim() === validName;
        }
      }
      return false;
    });

    if (nameExists) {
      alert('Já existe uma função com esse nome.');
      return;
    }

    const uniqueID = Date.now();
    // Construir Mensagens
    // let protoMsg = "%1"; ... (moved to helper)

    // 1. & 2. Registrar Gerador e Blocos via Helper

    // 1. & 2. Registrar Gerador e Blocos via Helper
    const spec = {
      id: uniqueID.toString(),
      name: validName,
      args: state.args.map((a) => ({ type: a.type, value: a.value, label: a.type === 'label' ? a.value : undefined })),
    };

    // Import helper inside component file? No, imported at top.
    // Wait, I need to make sure I import it.
    // I will trust that I will add the import or it is already there? No, I need to add import.
    // But this replace_file_content is for lines 341-369.
    // I will use a separate edit for import if needed.
    // Actually, let's just replace the logic block.

    // Note: The helper expects specific arg format.
    // procedureModal args: { type: string, value: string }
    // helper args: { type: string, value?: string, label?: string }

    // Let's call the helper:
    const { defBlockType, callBlockType, protoBlockType } = registerCustomBlockFromSpec(spec);

    // 3. Criar Blocos usando Serialização (Combina com Lógica Legada)
    // Isso garante que a estrutura seja criada atomicamente e corretamente conectada.

    let definitionInputs: any = {};

    state.args.forEach((arg, i) => {
      if (arg.type !== 'label') {
        let reporterType = 'argument_reporter_string';
        if (arg.type === 'bool') reporterType = 'argument_reporter_boolean';
        if (arg.type === 'number') reporterType = 'argument_reporter_number';

        definitionInputs['ARG_' + i] = {
          block: {
            type: reporterType,
            fields: { VALUE: arg.value },
            movable: false,
            deletable: false,
            shadow: true, // Reporters são sombras
          },
        };
      }
    });

    const prototypeStructure = {
      block: {
        type: protoBlockType,
        inputs: definitionInputs,
        movable: false,
        deletable: false,
        editable: false,
        shadow: true, // O protótipo em si é uma sombra no bloco de definição
      },
    };

    const blockDefJson = {
      type: defBlockType,
      inputs: { PROTOTYPE: prototypeStructure },
      editable: false,
      'top-level': true,
      x: 0,
      y: 0, // Posição será atualizada
    };

    // Anexar ao Workspace
    const createdBlock = Blockly.serialization.blocks.append(blockDefJson, workspace);

    if (createdBlock) {
      // Centralizar na Visualização
      const metrics = workspace.getMetrics();
      createdBlock.moveBy(metrics.viewWidth / 2 - 100, metrics.viewHeight / 2 - 50);

      const blockSvg = createdBlock as Blockly.BlockSvg;
      blockSvg.initSvg();
      blockSvg.render();
    }

    workspace.refreshToolboxSelection();
    onClose();
  };

  if (!isOpen) return null;

  // Estilos
  const cardStyle: React.CSSProperties = {
    width: '140px',
    height: '120px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'white',
  };

  const iconBoxStyle: React.CSSProperties = {
    width: '60px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: '800px' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px', overflow: 'hidden' }}>
          {/* Header */}
          <div className="modal-header border-0 text-white" style={{ backgroundColor: '#FF6680' }}>
            <h5 className="modal-title fw-bold">Criar um Bloco</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-white">
            {/* Preview Area */}
            <div
              className="border rounded mb-4 position-relative"
              id="previewContainer"
              style={{ height: '150px', backgroundColor: 'white', overflow: 'hidden' }}
            >
              <div ref={previewDiv} style={{ width: '100%', height: '100%' }}></div>
              <div
                style={{
                  position: 'absolute',
                  right: '5px',
                  top: '20px',
                  bottom: '20px',
                  width: '6px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '3px',
                }}
              ></div>

              {/* Delete Bubble */}
              <div
                id="deleteBubble"
                style={{
                  display: deleteBubbleVisible ? 'block' : 'none',
                  position: 'absolute',
                  top: deleteBubblePos.top,
                  left: deleteBubblePos.left,
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  zIndex: 1000,
                  textAlign: 'center',
                  lineHeight: '32px',
                }}
                onClick={handleDeleteArg}
              >
                <span style={{ color: '#FF6680', fontSize: '16px', fontWeight: 'bold' }}>🗑️</span>
              </div>
            </div>

            {/* Options Cards */}
            <div className="d-flex justify-content-between gap-3 mb-4">
              {/* Number */}
              <div className="card-option" style={cardStyle} onClick={() => addArg('number', 'Numero')}>
                <div style={iconBoxStyle}>
                  <div
                    style={{
                      width: '50px',
                      height: '30px',
                      backgroundColor: '#FFB3C6',
                      borderRadius: '15px',
                      color: '#D60036',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    número
                  </div>
                </div>
                <div className="fw-bold small text-dark">Adicionar entrada</div>
                <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                  número
                </div>
              </div>
              {/* Text */}
              <div className="card-option" style={cardStyle} onClick={() => addArg('input', 'Texto')}>
                <div style={iconBoxStyle}>
                  <div
                    style={{
                      width: '50px',
                      height: '30px',
                      backgroundColor: '#FFB3C6',
                      borderRadius: '4px',
                      color: '#D60036',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    texto
                  </div>
                </div>
                <div className="fw-bold small text-dark">Adicionar entrada</div>
                <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                  texto
                </div>
              </div>
              {/* Boolean */}
              <div className="card-option" style={cardStyle} onClick={() => addArg('bool', 'Booleano')}>
                <div style={iconBoxStyle}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: '#FFB3C6',
                      transform: 'rotate(45deg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  ></div>
                </div>
                <div className="fw-bold small text-dark">Adicionar entrada</div>
                <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                  booleana
                </div>
              </div>
              {/* Label */}
              <div className="card-option" style={cardStyle} onClick={() => addArg('label', 'Rótulo')}>
                <div style={iconBoxStyle}>
                  <div
                    style={{
                      width: '50px',
                      height: '30px',
                      backgroundColor: '#FFB3C6',
                      borderRadius: '4px',
                      color: '#D60036',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    rótulo
                  </div>
                </div>
                <div className="fw-bold small text-dark">Adicionar rótulo</div>
              </div>
            </div>

            {/* Checkbox */}
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="screenRefreshCheck"
                checked={screenRefresh}
                onChange={(e) => setScreenRefresh(e.target.checked)}
              />
              <label className="form-check-label text-secondary" htmlFor="screenRefreshCheck">
                Executar sem atualização de tela
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-top-0 p-3 bg-white d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary px-4 rounded-pill"
              style={{ backgroundColor: '#E0E0E0', border: 'none', color: '#555' }}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary px-4 rounded-pill fw-bold"
              style={{ backgroundColor: '#FF6680', borderColor: '#FF6680' }}
              onClick={handleConfirm}
            >
              OK
            </button>
          </div>
        </div>
      </div>
      <style>{`
                .card-option:hover {
                    border-color: #FF6680 !important;
                    background-color: #FFF0F5 !important;
                }
            `}</style>
    </div>
  );
}
