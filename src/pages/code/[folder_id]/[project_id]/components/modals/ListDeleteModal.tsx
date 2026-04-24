/**
 * ListDeleteModal - Exclusão de listas do projeto.
 */

import React, { useState, useEffect } from 'react';
import * as Blockly from 'blockly/core';
import { useProject } from '@/_base/context/ProjectContext';

interface ListDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Blockly.WorkspaceSvg | null;
  isUploadMode: boolean;
}

export default function ListDeleteModal({ isOpen, onClose, workspace, isUploadMode }: ListDeleteModalProps) {
  const { stageLists, uploadLists, deleteList, forceSyncLists } = useProject();
  const [selected, setSelected] = useState<string>('');

  const lists = isUploadMode ? uploadLists : stageLists;

  useEffect(() => {
    if (isOpen && lists.length > 0) {
      setSelected(lists[0].name);
    }
  }, [isOpen, lists]);

  const handleDelete = () => {
    if (!selected || !workspace) return;

    const mode = isUploadMode ? 'upload' : 'stage';
    deleteList(mode, selected);

    // Remove a variável Blockly com type="list"
    const wsVar = workspace.getVariableMap().getVariable(selected, 'list');
    if (wsVar) {
      workspace.deleteVariableById(wsVar.getId());
    }

    forceSyncLists();

    const toolbox = workspace.getToolbox();
    if (toolbox) toolbox.refreshSelection();

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered mx-2 mx-sm-auto">
        <div
          className="modal-content border-0"
          style={{
            borderRadius: '25px',
            overflow: 'hidden',
            isolation: 'isolate',
            backgroundColor: '#f8f9fa',
            boxShadow: '0 0 0 5px #dc3545, 0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          <div
            className="modal-header border-0 text-white"
            style={{ backgroundColor: '#dc3545', padding: '20px', borderTopLeftRadius: '25px', borderTopRightRadius: '25px' }}
          >
            <h4 className="modal-title fw-bold">
              <i className="bi bi-trash me-2"></i>
              Apagar Lista
            </h4>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} style={{ opacity: 1 }}></button>
          </div>

          <div className="modal-body p-4 bg-light">
            {lists.length === 0 ? (
              <p className="text-muted text-center">Nenhuma lista para apagar.</p>
            ) : (
              <>
                <label className="form-label fw-bold text-secondary text-uppercase" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>
                  Selecione a lista:
                </label>
                <select
                  className="form-select form-select-lg border-2 shadow-sm"
                  style={{ borderRadius: '15px' }}
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  {lists.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div
            className="modal-footer border-0 bg-light p-3 justify-content-center gap-3"
            style={{ borderBottomLeftRadius: '25px', borderBottomRightRadius: '25px' }}
          >
            <button type="button" className="btn btn-secondary px-4 fw-bold" onClick={onClose} style={{ borderRadius: '25px', minWidth: '120px' }}>
              Cancelar
            </button>
            {lists.length > 0 && (
              <button
                type="button"
                className="btn btn-danger px-5 fw-bold shadow"
                onClick={handleDelete}
                style={{ borderRadius: '25px', minWidth: '150px' }}
              >
                <i className="bi bi-trash me-2"></i>
                APAGAR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
