import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useVisionLabStore } from "@/store/useStore";
import { getGlobalWebcam, getGlobalWebcamStream } from "@/lib/webcam";
import { predictImage, getTrainedModel } from "@/lib/ml";
import {
  Eye,
  Image as ImageIcon,
  X,
  Download,
  FlaskConical,
} from "lucide-react";

export function PreviewPanel() {
  const { classes, isTrained } = useVisionLabStore();
  const [mode, setMode] = useState<"webcam" | "file">("webcam");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [predictions, setPredictions] = useState<number[]>([]);
  const isPredictingRef = useRef(false);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!isTrained) return;

    const runPredictLoop = async () => {
      if (mode === "webcam" && videoRef.current) {
        try {
          const scores = await predictImage(videoRef.current, true);
          setPredictions(scores);
        } catch (e) {}
      }

      if (isPredictingRef.current) {
        requestAnimationFrame(runPredictLoop);
      }
    };

    if (mode === "webcam") {
      isPredictingRef.current = true;
      getGlobalWebcam().then((videoEl) => {
        if (videoRef.current && videoEl) {
          videoRef.current.srcObject = getGlobalWebcamStream();
          runPredictLoop();
        }
      });
    } else {
      isPredictingRef.current = false;
    }

    return () => {
      isPredictingRef.current = false;
    };
  }, [mode, isTrained]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    }
  };

  const onImageLoad = async () => {
    if (imageRef.current && isTrained) {
      try {
        const scores = await predictImage(imageRef.current, false);
        setPredictions(scores);
      } catch (e) {}
    }
  };

  const clearFile = () => {
    setFileUrl(null);
    setPredictions([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExport = async () => {
    const model = getTrainedModel();
    if (model) {
      await model.save("downloads://picode-modelo");

      const metadata = {
        labels: classes.map((c) => c.name),
        createdAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(metadata, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "picode-metadata.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-2xl shadow-slate-200/50 border border-slate-100 flex-1 flex flex-col relative overflow-hidden min-h-[450px] lg:min-h-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-pi-green)] shadow-[0_0_8px_var(--color-pi-green)] animate-pulse" />
          <h2 className="text-lg font-black text-slate-800 tracking-tight">
            Câmera IA
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-[#F1F5F9] p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setMode("webcam")}
              className={`px-5 py-1.5 rounded-lg text-xs font-black transition-all ${
                mode === "webcam"
                  ? "bg-white text-[var(--color-pi-blue)] shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Webcam
            </button>
            <button
              onClick={() => setMode("file")}
              className={`px-5 py-1.5 rounded-lg text-xs font-black transition-all ${
                mode === "file"
                  ? "bg-white text-[var(--color-pi-blue)] shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Arquivo
            </button>
          </div>
          <div className="flex gap-1.5">
            <button className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center overflow-y-auto pr-1 custom-scrollbar min-h-0">
        {/* Preview Area */}
        <div className="relative w-full max-w-[360px] aspect-[4/3] mx-auto mb-6 flex-shrink-0 group">
          <div className="w-full h-full bg-black rounded-[32px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] overflow-hidden relative border-4 border-white">
            {mode === "webcam" ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="w-full h-full relative bg-slate-50 flex flex-col">
                {!fileUrl ? (
                  <div
                    className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors border-4 border-dashed border-slate-200 m-5 rounded-[28px] group/file"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="bg-white p-5 rounded-full shadow-sm mb-3 group-hover/file:scale-110 transition-transform">
                      <ImageIcon className="w-8 h-8 text-[var(--color-pi-blue)]" />
                    </div>
                    <span className="font-black text-slate-400 text-xs uppercase tracking-wider">
                      Enviar Foto
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-full relative p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imageRef}
                      src={fileUrl}
                      onLoad={onImageLoad}
                      alt="Predição"
                      className="w-full h-full object-contain rounded-[24px]"
                    />
                    <button
                      onClick={clearFile}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-red-500 p-2.5 rounded-2xl shadow-xl hover:bg-red-50 transition-all z-20"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bars */}
        <div className="w-full space-y-3 px-1 flex-1 overflow-y-auto custom-scrollbar">
          {!isTrained ? (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                Aguardando Treinamento...
              </p>
            </div>
          ) : (
            classes.map((cls, index) => {
              const score = predictions[index] || 0;
              const percent = Math.round(score * 100);
              return (
                <div key={cls.id} className="flex items-center gap-2 group/row">
                  <span className="w-14 sm:w-16 font-black text-[10px] text-slate-400 uppercase tracking-widest truncate text-right">
                    {cls.name}
                  </span>
                  <div className="flex-1 h-8 bg-[#F1F5F9] rounded-full relative overflow-hidden shadow-inner ring-1 ring-slate-200/50">
                    <div
                      className="absolute left-0 top-0 h-full bg-[var(--color-pi-blue)] transition-all duration-700 ease-out rounded-full shadow-[4px_0_12px_rgba(0,82,204,0.2)]"
                      style={{ width: `${percent}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-black text-slate-400 tracking-tighter">
                        {percent}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Botão de Salvar/Exportar Modelo */}
        {isTrained && (
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handleExport}
              className="w-full bg-blue-50 hover:bg-blue-100 text-[var(--color-pi-blue)] border-2 border-dashed border-blue-200 hover:border-[var(--color-pi-blue)] font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Salvar Modelo Treinado
            </button>
            <Link
              href="/tester"
              className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-2 border-dashed border-green-200 hover:border-green-500 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FlaskConical className="w-5 h-5" />
              Testar Modelo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
