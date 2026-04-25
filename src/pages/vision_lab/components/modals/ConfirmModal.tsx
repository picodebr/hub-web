import { useVisionLabStore } from '@/_base/hooks';
import { Trash2, AlertCircle } from 'lucide-react';

export function VisionLabConfirmModal() {
  const { classes, activeConfirmModal, closeConfirmModal, removeClass, removeSample } = useVisionLabStore();

  if (!activeConfirmModal) return null;
  const { classId, action } = activeConfirmModal;
  const classData = classId !== null ? classes.find((c) => c.id === classId) : null;

  const isError = action.startsWith('error_') || action === 'info_min_classes';

  const handleConfirm = () => {
    if (classId === null) return;

    if (action === 'clear' && classData) {
      classData.samples.forEach((s) => removeSample(classId, s.id));
    } else if (action === 'remove') {
      removeClass(classId);
    }
    closeConfirmModal();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closeConfirmModal} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl p-6 sm:p-8 w-full max-w-sm animate-pop-in border-4 border-slate-50 ring-4 ring-slate-100/50">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${isError ? 'bg-blue-50' : 'bg-red-50'}`}>
          {isError ? <AlertCircle className="w-8 h-8 text-[var(--color-pi-blue)]" /> : <Trash2 className="w-8 h-8 text-red-500" />}
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">
          {action === 'error_no_samples'
            ? 'Faltam exemplos!'
            : action === 'error_min_classes_train'
              ? 'Treinamento impossível'
              : action === 'info_min_classes'
                ? 'Ação não permitida'
                : action === 'clear'
                  ? 'Limpar as Fotos?'
                  : 'Remover Classe?'}
        </h3>
        <p className="text-slate-500 mb-8 font-medium text-sm sm:text-base leading-snug">
          {action === 'error_no_samples'
            ? 'Todas as classes precisam ter pelo menos um exemplo ou foto para que eu possa aprender!'
            : action === 'error_min_classes_train'
              ? 'Para criar uma inteligência, precisamos comparar pelo menos duas coisas diferentes com exemplos!'
              : action === 'info_min_classes'
                ? 'Não é possível deixar menos de 2 classes. Para criar a inteligência, precisamos comparar pelo menos duas coisas diferentes!'
                : action === 'clear'
                  ? 'Como você só tem 2 classes, podemos apenas apagar todas as fotos dela. Tem certeza?'
                  : `Tem certeza que deseja jogar a classe "${classData?.name}" fora? Todas as fotos dela serão perdidas.`}
        </p>
        <div className="flex gap-3">
          {isError ? (
            <button
              onClick={closeConfirmModal}
              className="flex-1 px-4 py-3 bg-[var(--color-pi-blue)] hover:bg-blue-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30 active:scale-95"
            >
              Entendi
            </button>
          ) : (
            <>
              <button
                onClick={closeConfirmModal}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30 active:scale-95"
              >
                Sim, {action === 'clear' ? 'Limpar' : 'Remover'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
