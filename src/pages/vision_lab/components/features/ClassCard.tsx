import { useRef } from 'react';
import { Trash2, Video, Upload } from 'lucide-react';
import { useVisionLabStore, VisionLabClassData } from '@/_base/hooks';
import { extractFeatures } from '@/_base/lib/ml';

interface ClassCardProps {
  classData: VisionLabClassData;
  index: number;
}

export function ClassCard({ classData, index }: ClassCardProps) {
  const { classes, updateClassName, removeClass, removeSample, addSample, openWebcamModal, openConfirmModal } = useVisionLabStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const focusColors = [
    'focus-within:border-[var(--color-pi-blue)]',
    'focus-within:border-[var(--color-pi-green)]',
    'focus-within:border-[var(--color-pi-yellow)]',
  ];
  const focusClass = focusColors[index % focusColors.length];

  const borderColors = [
    'border-[var(--color-pi-yellow)]',
    'border-[var(--color-pi-green)]',
    'border-[var(--color-pi-blue)]',
    'border-[var(--color-pi-blue-dark)]',
  ];
  const activeBorder = borderColors[index % borderColors.length];

  const btnColor =
    index % 2 === 0
      ? 'text-[var(--color-pi-blue)] bg-blue-50 hover:bg-[var(--color-pi-blue)] hover:text-white'
      : 'text-[var(--color-pi-green)] bg-green-50 hover:bg-[var(--color-pi-green)] hover:text-white';

  const hasSamples = classData.samples.length > 0;

  const handleDeleteClassClick = () => {
    if (classes.length <= 2) {
      openConfirmModal(classData.id, 'info_min_classes');
    } else {
      openConfirmModal(classData.id, 'remove');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await new Promise<void>((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = async () => {
          try {
            const { activation, thumbnail } = await extractFeatures(img, false);
            addSample(classData.id, thumbnail, activation);
          } catch (err) {
            console.error('Erro ao processar imagem:', err);
          }
          URL.revokeObjectURL(url);
          resolve();
        };
        img.src = url;
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      className={`bg-white border-2 ${activeBorder} rounded-xl p-2 sm:p-3 relative group hover:border-4 transition-all shadow-sm hover:shadow-md min-h-[140px] sm:min-h-[160px] h-auto flex flex-col justify-between`}
    >
      {/* Header do Card */}
      <div className="flex justify-between items-center mb-2">
        <div
          className={`flex-1 mr-2 px-2 py-1 bg-slate-50 rounded-lg border border-transparent ${focusClass} focus-within:bg-white transition-colors`}
        >
          <input
            type="text"
            value={classData.name}
            onChange={(e) => updateClassName(classData.id, e.target.value)}
            className="bg-transparent font-black text-xs text-slate-700 w-full focus:outline-none placeholder-slate-400 uppercase tracking-tighter"
            placeholder="Nome"
          />
        </div>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          onClick={handleDeleteClassClick}
          title={classes.length <= 2 ? 'Limpar' : 'Remover'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Conteúdo do Card */}
      <div className="flex-1 flex flex-col">
        {!hasSamples ? (
          <div className="flex flex-col gap-2">
            <div className="flex gap-1.5">
              <button
                className={`flex-1 ${btnColor} py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5`}
                onClick={() => openWebcamModal(classData.id)}
              >
                <Video className="w-4 h-4" /> Webcam
              </button>
              <button
                className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" /> Arquivo
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide px-1">{classData.samples.length} Exemplos</div>
            <div className="flex gap-3 items-start">
              {/* Botões laterais */}
              <div className="flex flex-col gap-1.5">
                <button
                  className="w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 transition-colors border border-slate-100"
                  onClick={() => openWebcamModal(classData.id)}
                  title="Webcam"
                >
                  <Video className="w-3.5 h-3.5" />
                </button>
                <button
                  className="w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 transition-colors border border-slate-100"
                  onClick={() => fileInputRef.current?.click()}
                  title="Arquivo"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Lista de Thumbnails */}
              <div className="flex-1 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {classData.samples.map((sample) => (
                  <div
                    key={sample.id}
                    className="relative w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] flex-shrink-0 rounded-lg overflow-hidden border border-slate-100 shadow-sm group/thumb cursor-pointer animate-pop-in"
                    onClick={() => removeSample(classData.id, sample.id)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sample.thumbnail} alt="Amostra" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                      <Trash2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
    </div>
  );
}
