import { useVisionLabStore } from "@/store/useStore";
import { trainModel } from "@/lib/ml";
import { BrainCircuit, Play } from "lucide-react";

export function TrainingPanel() {
  const {
    classes,
    isTraining,
    isTrained,
    trainingProgress,
    setTrainingState,
    openConfirmModal,
  } = useVisionLabStore();

  const handleTrain = async () => {
    // Validação
    const invalidClasses = classes.filter((c) => c.samples.length === 0);
    if (invalidClasses.length > 0) {
      openConfirmModal(null, "error_no_samples");
      return;
    }
    if (classes.length < 2) {
      openConfirmModal(null, "error_min_classes_train");
      return;
    }

    setTrainingState({
      isTraining: true,
      trainingProgress: "Preparando Dados...",
    });

    try {
      // Delay pro React renderizar "Preparando..."
      await new Promise((r) => setTimeout(r, 100));

      await trainModel(classes, (epoch, loss) => {
        setTrainingState({
          trainingProgress: `Época ${epoch + 1}/50 - Perda: ${loss.toFixed(4)}`,
        });
      });

      setTrainingState({
        isTraining: false,
        isTrained: true,
        trainingProgress: "Modelo Treinado!",
      });
    } catch (err) {
      console.error(err);
      setTrainingState({
        isTraining: false,
        trainingProgress: "Erro no treinamento",
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-[32px] w-full max-w-[320px] flex flex-col items-center justify-center relative shadow-2xl shadow-blue-200/40 animate-float border-4 border-white ring-2 ring-slate-100">
      <div className="bg-blue-50 p-4 rounded-2xl mb-4">
        <BrainCircuit className="w-10 h-10 text-[var(--color-pi-blue)]" />
      </div>

      <h3 className="text-xl font-black text-slate-800 mb-1">Treinamento</h3>
      <p className="text-slate-400 text-[10px] font-bold mb-5 text-center px-2 leading-tight uppercase tracking-widest">
        Ensine o computador!
      </p>

      <button
        onClick={handleTrain}
        disabled={isTraining}
        className={`w-full text-white text-sm font-black py-3 rounded-xl shadow-lg transform transition-all flex items-center justify-center gap-2 ${
          isTraining
            ? "bg-slate-400 cursor-not-allowed"
            : isTrained
              ? "bg-green-500 hover:bg-green-600 hover:scale-105 active:scale-95 shadow-green-500/30"
              : "bg-[var(--color-pi-blue)] hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-blue-500/30"
        }`}
      >
        {!isTraining && <Play className="w-6 h-6" />}
        {isTraining
          ? trainingProgress
          : isTrained
            ? "TREINAR NOVAMENTE"
            : "TREINAR AGORA"}
      </button>

      {isTraining && (
        <div className="w-full mt-4 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div className="bg-[var(--color-pi-blue)] h-full animate-pulse w-full"></div>
        </div>
      )}

      {isTrained && !isTraining && (
        <div className="mt-4 text-sm font-bold text-green-500">
          {trainingProgress}
        </div>
      )}
    </div>
  );
}
