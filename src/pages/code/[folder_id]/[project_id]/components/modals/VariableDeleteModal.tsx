import React, { useState, useEffect } from 'react';
import * as Blockly from 'blockly/core';
import { useProject } from '@/_base/context/ProjectContext';

interface VariableDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Blockly.WorkspaceSvg;
  isUploadMode: boolean;
  initialSelection?: string | null;
}

const VariableDeleteModal: React.FC<VariableDeleteModalProps> = ({ isOpen, onClose, workspace, isUploadMode, initialSelection }) => {
  const { stageVariables, uploadVariables, deleteVariable, forceSyncVariables } = useProject();
  const [selectedVars, setSelectedVars] = useState<string[]>([]);
  const [availableVars, setAvailableVars] = useState<{ name: string; type: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      const vars = isUploadMode ? uploadVariables : stageVariables;
      setAvailableVars(vars as any[]);
      if (initialSelection) {
        setSelectedVars([initialSelection]);
      } else {
        setSelectedVars([]);
      }
    }
  }, [isOpen, initialSelection, isUploadMode, stageVariables, uploadVariables]);

  const handleCheckboxChange = (varName: string) => {
    if (selectedVars.includes(varName)) {
      setSelectedVars(selectedVars.filter((v) => v !== varName));
    } else {
      setSelectedVars([...selectedVars, varName]);
    }
  };

  const handleDelete = async () => {
    if (selectedVars.length === 0) return;

    const mode = isUploadMode ? 'upload' : 'stage';

    // 1. Delete from Project Service
    for (const varName of selectedVars) {
      deleteVariable(mode, varName);
    }

    // 2. Delete from Blockly Workspace
    const blocklyVars = workspace.getVariableMap().getAllVariables();
    selectedVars.forEach((name) => {
      const v = blocklyVars.find((bv) => (bv as any).name === name);
      if (v) {
        workspace.getVariableMap().deleteVariable(v);
      }
    });

    // 3. Force UI Update
    forceSyncVariables();
    onClose();

    setTimeout(() => {
      workspace.refreshToolboxSelection();
      if ((workspace as any).getToolbox()) {
        (workspace as any).getToolbox().refreshSelection();
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden', border: '5px solid #dc3545' }}>
          {/* Header - Red for Danger */}
          <div className="modal-header border-0 text-white" style={{ backgroundColor: '#dc3545', padding: '20px' }}>
            <h4 className="modal-title fw-bold" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
              <i className="bi bi-trash me-2"></i>
              Apagar Variáveis ({isUploadMode ? 'Upload' : 'Palco'})
            </h4>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-light">
            {availableVars.length === 0 ? (
              <p className="text-muted text-center fw-bold">Nenhuma variável disponível para apagar.</p>
            ) : (
              <>
                <p className="fw-bold text-secondary mb-3">Selecione as variáveis para excluir:</p>
                <div className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {availableVars.map((v) => (
                    <label key={v.name} className="list-group-item d-flex gap-3 align-items-center cursor-pointer" style={{ cursor: 'pointer' }}>
                      <input
                        className="form-check-input flex-shrink-0"
                        type="checkbox"
                        checked={selectedVars.includes(v.name)}
                        onChange={() => handleCheckboxChange(v.name)}
                        style={{ width: '1.5em', height: '1.5em' }}
                      />
                      <span className="fw-bold">{v.name}</span>
                      <span className="badge bg-secondary ms-auto">{v.type}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {selectedVars.length > 0 && (
              <div className="mt-3 alert alert-danger d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div>
                  <strong>Atenção:</strong> Blocos usando estas variáveis serão apagados do workspace!
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
              className="btn btn-danger px-5 fw-bold shadow"
              onClick={handleDelete}
              disabled={selectedVars.length === 0}
              style={{ borderRadius: '25px', minWidth: '150px' }}
            >
              <i className="bi bi-trash-fill me-2"></i>
              Apagar ({selectedVars.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariableDeleteModal;
