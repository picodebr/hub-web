import { useEffect, useRef, useState } from 'react';
import { X, Video as VideoIcon, Disc } from 'lucide-react';
import { useVisionLabStore } from '@/_base/hooks';
import { getGlobalWebcam, getGlobalWebcamStream } from '@/_base/lib/webcam';
import { extractFeatures } from '@/_base/lib/ml';

export function VisionLabWebcamModal() {
  const { activeModalClassId, classes, closeWebcamModal, addSample } = useVisionLabStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeClass = classes.find((c) => c.id === activeModalClassId);

  useEffect(() => {
    if (activeModalClassId !== null) {
      getGlobalWebcam()
        .then(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = getGlobalWebcamStream();
          }
        })
        .catch(console.error);
    } else {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [activeModalClassId]);

  if (activeModalClassId === null || !activeClass) return null;

  const captureFrame = async () => {
    if (!videoRef.current) return;
    try {
      const { activation, thumbnail } = await extractFeatures(videoRef.current, true);
      addSample(activeClass.id, thumbnail, activation);
    } catch (err) {
      console.error(err);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    captureFrame(); // Capture first immediately
    recordIntervalRef.current = setInterval(captureFrame, 100); // 10 FPS
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={closeWebcamModal} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-4 ring-white/50 animate-float w-full max-w-xl max-h-[95vh] h-auto">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <VideoIcon className="text-[var(--color-pi-blue)] w-5 h-5" />
            <h3 className="font-bold text-slate-700 text-lg">
              Capturar Imagens - <span className="text-[var(--color-pi-blue)]">{activeClass.name}</span>
            </h3>
          </div>
          <button
            onClick={closeWebcamModal}
            className="w-10 h-10 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-center gap-4 bg-slate-50/50 overflow-y-auto">
          <div className="relative w-full max-w-lg aspect-square max-h-[40vh] md:max-h-[50vh] mx-auto bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white flex-shrink-0">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
            {isRecording && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
                REC
              </div>
            )}
          </div>

          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className="w-full max-w-lg bg-red-500 hover:bg-red-600 active:scale-95 text-white font-black text-xl py-4 rounded-2xl shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-2 select-none"
          >
            <Disc className="w-6 h-6" />
            SEGURE PARA GRAVAR
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2 px-1">Capturadas Agora ({activeClass.samples.length})</p>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar min-h-[80px]">
            {activeClass.samples.slice(-15).map((sample) => (
              <div key={sample.id} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-200 relative flex-shrink-0 animate-pop-in">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sample.thumbnail} className="w-full h-full object-cover" alt="sample" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
