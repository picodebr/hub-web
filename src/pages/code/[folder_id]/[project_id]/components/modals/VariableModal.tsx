/**
 * Componente VariableModal - Gerenciador de Criação de Variáveis.
 *
 * Permite ao usuário criar novas variáveis no projeto, definindo:
 * 1. Nome da variável.
 * 2. Tipo de dado (Número ou Texto).
 * 3. Escopo (Global para todos os atores ou Local apenas para o selecionado).
 *
 * Nota: No "Upload Mode" (modo hardware), o escopo local é desativado por simplicidade técnica.
 */

import React, { useState, useEffect, useRef } from 'react';
import * as Blockly from 'blockly/core';
import { useProject } from '@/_base/context/ProjectContext';

interface VariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Blockly.WorkspaceSvg | null;
  isUploadMode: boolean;
}

export default function VariableModal({ isOpen, onClose, workspace, isUploadMode }: VariableModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Number'); // Pode ser 'Number' ou 'String'
  const [scope, setScope] = useState('global'); // 'global' ou 'local'
  const { stageVariables, uploadVariables, addVariable, forceSyncVariables, getUserVariables, activeSpriteId } = useProject();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincroniza o estado inicial ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      setName('');
      setType('Number');
      setScope('global');
      // Foca automaticamente no campo de nome
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const varName = name.trim();
    if (!varName) {
      alert('Por favor, digite um nome para a variável.');
      return;
    }
    if (!workspace) return;

    const mode = isUploadMode ? 'upload' : 'stage';

    // Use getUserVariables to check scope-aware duplicates
    const allVars = getUserVariables(mode);
    const exists = allVars.find((v) => v.name.toLowerCase() === varName.toLowerCase());

    if (exists) {
      alert(
        `Já existe uma variável com o nome "${varName}" (como ${exists.scope === 'global' ? 'global' : 'local deste ator'}). Escolha um nome diferente.`,
      );
      return;
    }

    const ownerId = scope === 'local' ? activeSpriteId : undefined;
    addVariable(mode, varName, type, scope as 'global' | 'local', ownerId);
    forceSyncVariables(); // Force UI update

    // Also create in workspace primarily so it shows up immediately
    // (though forceSync might handle it via listener in Workspace component)

    // Note: For local variables, we rely on the ProjectService emitting a change
    // which triggers the BlocklyWorkspace to re-inject variables.
    // Direct creation here might be redundant or miss the scope metadata if Blockly doesn't support it directly.
    // But standard delete/rename events in Blockly are name-based.

    // We'll create it here as a visual feedback, ProjectService is the "Truth".
    if (!workspace.getVariableMap().getVariable(varName)) {
      workspace.createVariable(varName, type);
    }

    // Force toolbox refresh
    workspace.refreshToolboxSelection();

    onClose();
  };

  if (!isOpen) return null;

  // Custom Purple/Orange Style (Playful)
  const activePurpleStyle = { backgroundColor: '#FF8C1A', borderColor: '#FF8C1A', color: 'white', fontWeight: 'bold' }; // Orange for Variables
  const inactiveStyle = { borderColor: '#ccc', color: '#666', fontWeight: 'bold' };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden', border: '5px solid #FF8C1A' }}>
          {/* Header Playful */}
          <div className="modal-header border-0 text-white" style={{ backgroundColor: '#FF8C1A', padding: '20px' }}>
            <h4 className="modal-title fw-bold" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
              <i className="bi bi-box-seam me-2"></i>
              Nova Variável
            </h4>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} style={{ opacity: 1 }}></button>
          </div>

          <div className="modal-body p-4 bg-light">
            <div className="mb-4">
              <label className="form-label fw-bold text-secondary text-uppercase" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>
                Nome da Variável:
              </label>
              <input
                ref={inputRef}
                type="text"
                className="form-control form-control-lg border-2 shadow-sm"
                style={{ borderRadius: '15px', color: '#333', fontWeight: 'bold' }}
                placeholder="Minha Variável..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold text-secondary text-uppercase" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>
                Quem é ela?
              </label>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn flex-grow-1 py-3 ${type === 'Number' ? '' : 'bg-white'}`}
                  style={{
                    borderRadius: '15px',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    ...(type === 'Number' ? activePurpleStyle : inactiveStyle),
                  }}
                  onClick={() => setType('Number')}
                >
                  <i className="bi bi-123 fs-4 d-block mb-1"></i>
                  Número
                </button>
                <button
                  type="button"
                  className={`btn flex-grow-1 py-3 ${type === 'String' ? '' : 'bg-white'}`}
                  style={{
                    borderRadius: '15px',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    ...(type === 'String' ? activePurpleStyle : inactiveStyle),
                  }}
                  onClick={() => setType('String')}
                >
                  <i className="bi bi-fonts fs-4 d-block mb-1"></i>
                  Texto
                </button>
              </div>
            </div>

            {/* Scope Toggle: Hidden in Upload Mode */}
            {!isUploadMode && (
              <div className="mb-2">
                <label className="form-label fw-bold text-secondary text-uppercase" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>
                  Para quem?
                </label>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className={`btn flex-grow-1 py-2 ${scope === 'global' ? 'btn-success' : 'btn-outline-secondary bg-white'}`}
                    style={{
                      borderRadius: '15px',
                      fontWeight: 'bold',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      ...(scope === 'global' ? { borderColor: '#198754' } : { borderColor: '#ccc' }),
                    }}
                    onClick={() => setScope('global')}
                  >
                    <i className="bi bi-globe2 me-2"></i>
                    Para todos os atores
                  </button>
                  <button
                    type="button"
                    className={`btn flex-grow-1 py-2 ${scope === 'local' ? 'btn-success' : 'btn-outline-secondary bg-white'}`}
                    style={{
                      borderRadius: '15px',
                      fontWeight: 'bold',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      ...(scope === 'local' ? { borderColor: '#198754' } : { borderColor: '#ccc' }),
                    }}
                    onClick={() => setScope('local')}
                  >
                    <i className="bi bi-person me-2"></i>
                    Apenas para este ator
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer border-0 bg-light p-3 justify-content-center gap-3">
            <button type="button" className="btn btn-secondary px-4 fw-bold" onClick={onClose} style={{ borderRadius: '25px', minWidth: '120px' }}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-warning text-white px-5 fw-bold shadow"
              onClick={handleConfirm}
              style={{ borderRadius: '25px', minWidth: '150px', backgroundColor: '#FF8C1A', borderColor: '#FF8C1A' }}
            >
              <i className="bi bi-check-lg me-2"></i>
              CRIAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
