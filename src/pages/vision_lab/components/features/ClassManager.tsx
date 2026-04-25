import { PlusCircle, Tags } from 'lucide-react';
import { ClassCard } from './ClassCard';
import { useVisionLabStore } from '@/_base/hooks';

export function ClassManager() {
  const { classes, addClass } = useVisionLabStore();

  return (
    <div className="bg-white rounded-[24px] p-5 shadow-xl shadow-slate-200/50 border border-slate-100 flex-1 flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 tracking-tight">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-pi-blue)]" />
          Aprendizado
        </h2>
      </div>

      {/* Classes Container */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
        {classes.map((cls, index) => (
          <ClassCard key={cls.id} classData={cls} index={index} />
        ))}
      </div>

      {/* Add Class */}
      <div className="pt-4 border-t border-slate-100 mt-2">
        <button
          onClick={addClass}
          className="w-full bg-slate-50 hover:bg-white border-2 border-dashed border-slate-300 hover:border-[var(--color-pi-blue)] text-slate-500 hover:text-[var(--color-pi-blue)] py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
        >
          <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Adicionar Outra Classe
        </button>
      </div>
    </div>
  );
}
