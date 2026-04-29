'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import * as tf from '@tensorflow/tfjs';
import { FileJson, Package, FileText, Upload, Image as ImageIcon, X, ArrowLeft, FlaskConical, BarChart2, Cpu } from 'lucide-react';
import { getModel } from '@/_base/lib/ml';
import { getGlobalWebcam, getGlobalWebcamStream } from '@/_base/lib/webcam';

interface Metadata {
  labels: string[];
}

export default function VisionLabTester() {
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [binFile, setBinFile] = useState<File | null>(null);
  const [metadataFile, setMetadataFile] = useState<File | null>(null);

  const jsonInputRef = useRef<HTMLInputElement>(null!);
  const binInputRef = useRef<HTMLInputElement>(null!);
  const metaInputRef = useRef<HTMLInputElement>(null!);

  const [classifier, setClassifier] = useState<tf.LayersModel | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadSuccess, setLoadSuccess] = useState(false);

  const [mode, setMode] = useState<'webcam' | 'file'>('webcam');
  const [predictions, setPredictions] = useState<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPredictingRef = useRef(false);
  const classifierRef = useRef<tf.LayersModel | null>(null);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const isModelLoaded = classifier !== null;

  const handleLoadModel = async () => {
    if (!jsonFile || !binFile) return;

    setIsLoading(true);
    setLoadError(null);
    setLoadSuccess(false);

    try {
      await tf.ready();

      if (classifierRef.current) {
        classifierRef.current.dispose();
        classifierRef.current = null;
        setClassifier(null);
      }

      const loaded = await tf.loadLayersModel(tf.io.browserFiles([jsonFile, binFile]));

      let classLabels: string[] = [];
      if (metadataFile) {
        const text = await metadataFile.text();
        const meta: Metadata = JSON.parse(text);
        classLabels = meta.labels ?? [];
      }

      if (classLabels.length === 0) {
        const outputShape = loaded.outputs[0].shape;
        const numClasses = (outputShape[outputShape.length - 1] as number) || 2;
        classLabels = Array.from({ length: numClasses }, (_, i) => `Classe ${i + 1}`);
      }

      classifierRef.current = loaded;
      setClassifier(loaded);
      setLabels(classLabels);
      setPredictions(new Array(classLabels.length).fill(0));
      setLoadSuccess(true);
    } catch (err) {
      console.error(err);
      setLoadError('Erro ao carregar. Verifique se selecionou os arquivos corretos.');
    } finally {
      setIsLoading(false);
    }
  };

  const predictFrame = useCallback(async (element: HTMLVideoElement | HTMLImageElement, isMirrored: boolean) => {
    const model = classifierRef.current;
    if (!model) return [];

    const mobileNet = await getModel();

    return tf.tidy(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      if (!ctx) return [];

      if (isMirrored) {
        ctx.translate(224, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(element, 0, 0, 224, 224);

      const imgTensor = tf.browser.fromPixels(canvas);
      const features = mobileNet.infer(imgTensor, true).reshape([1, 1024]);
      const output = model.predict(features) as tf.Tensor;
      return Array.from(output.dataSync());
    });
  }, []);

  useEffect(() => {
    if (!isModelLoaded || mode !== 'webcam') return;

    isPredictingRef.current = true;

    const runLoop = async () => {
      if (!isPredictingRef.current) return;
      if (videoRef.current) {
        try {
          const scores = await predictFrame(videoRef.current, true);
          if (scores.length > 0) setPredictions(scores);
        } catch {}
      }
      if (isPredictingRef.current) requestAnimationFrame(runLoop);
    };

    getGlobalWebcam().then((videoEl) => {
      if (videoRef.current && videoEl) {
        videoRef.current.srcObject = getGlobalWebcamStream();
        runLoop();
      }
    });

    return () => {
      isPredictingRef.current = false;
    };
  }, [mode, isModelLoaded, predictFrame]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      setFileUrl(URL.createObjectURL(file));
    }
  };

  const onImageLoad = async () => {
    if (imageRef.current && isModelLoaded) {
      try {
        const scores = await predictFrame(imageRef.current, false);
        if (scores.length > 0) setPredictions(scores);
      } catch {}
    }
  };

  const clearFile = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(null);
    setPredictions(new Array(labels.length).fill(0));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    return () => {
      isPredictingRef.current = false;
      if (classifierRef.current) {
        classifierRef.current.dispose();
        classifierRef.current = null;
      }
    };
  }, []);

  const topIndex = predictions.length > 0 ? predictions.indexOf(Math.max(...predictions)) : -1;

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sub-header */}
      <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-vlab-pi-blue)] p-1.5 rounded-xl text-white shadow-md shadow-blue-200">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-[var(--color-vlab-pi-blue)] leading-none">Model Tester</h1>
            <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">Testar modelo exportado</p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-[var(--color-vlab-pi-blue)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
        {/* LEFT: Load Model */}
        <div className="w-full lg:w-[320px] flex-shrink-0 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-50 p-2.5 rounded-2xl">
                <Cpu className="w-5 h-5 text-[var(--color-vlab-pi-blue)]" />
              </div>
              <h2 className="text-sm font-black text-slate-800">1. Carregar Modelo</h2>
            </div>

            <div className="space-y-3">
              <FileSelector
                label="Selecionar .json"
                icon={<FileJson className="w-6 h-6" />}
                file={jsonFile}
                onSelect={setJsonFile}
                accept=".json"
                inputRef={jsonInputRef}
              />
              <FileSelector
                label="Selecionar .bin"
                icon={<Package className="w-6 h-6" />}
                file={binFile}
                onSelect={setBinFile}
                accept=".bin"
                inputRef={binInputRef}
              />
              <FileSelector
                label="Selecionar metadata.json (Opcional)"
                icon={<FileText className="w-6 h-6" />}
                file={metadataFile}
                onSelect={setMetadataFile}
                accept=".json"
                inputRef={metaInputRef}
              />
            </div>

            {loadError && <p className="mt-3 text-xs font-bold text-red-500 bg-red-50 rounded-xl p-3 text-center">{loadError}</p>}

            {loadSuccess && !loadError && (
              <p className="mt-3 text-xs font-bold text-green-600 bg-green-50 rounded-xl p-3 text-center">Modelo carregado com sucesso!</p>
            )}

            <button
              onClick={handleLoadModel}
              disabled={!jsonFile || !binFile || isLoading}
              className={`mt-4 w-full py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all ${
                !jsonFile || !binFile
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : isLoading
                    ? 'bg-slate-300 text-white cursor-not-allowed'
                    : 'bg-[var(--color-vlab-pi-blue)] text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              {isLoading ? 'Carregando...' : 'Carregar Modelo'}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100">
            <p className="text-xs font-black text-[var(--color-vlab-pi-blue)] mb-3">ℹ Como usar?</p>
            <ul className="space-y-2 text-xs text-slate-600 font-semibold">
              <li>• Exporte seu modelo na página principal.</li>
              <li>
                • Isso baixa 2 arquivos: <strong>.json</strong> e <strong>.bin</strong>.
              </li>
              <li>
                • Selecione <strong>ambos</strong> aqui.
              </li>
              <li>• Clique em Carregar e teste!</li>
            </ul>
          </div>
        </div>

        {/* RIGHT: Test */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isModelLoaded ? 'bg-[var(--color-vlab-pi-green)] shadow-[0_0_8px_var(--color-vlab-pi-green)] animate-pulse' : 'bg-slate-300'
                }`}
              />
              <h2 className="text-sm font-black text-slate-800">2. Testar</h2>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['webcam', 'file'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                    mode === m ? 'bg-white text-[var(--color-vlab-pi-blue)] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {m === 'webcam' ? 'Webcam' : 'Arquivo'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 flex-1">
            {/* Preview */}
            <div className="lg:w-[300px] xl:w-[340px] flex-shrink-0">
              <div className="relative w-full aspect-[4/3] bg-[#0d1117] rounded-[28px] overflow-hidden border-4 border-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]">
                {mode === 'webcam' ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                    {!isModelLoaded && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest">Aguardando Modelo...</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col">
                    {!fileUrl ? (
                      <div
                        className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors m-4 border-2 border-dashed border-slate-700 rounded-[22px]"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="w-8 h-8 text-slate-600 mb-2" />
                        <span className="text-slate-500 text-[11px] font-black uppercase tracking-wider">Enviar Foto</span>
                      </div>
                    ) : (
                      <div className="w-full h-full relative p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          ref={imageRef}
                          src={fileUrl}
                          onLoad={onImageLoad}
                          alt="Predição"
                          className="w-full h-full object-contain rounded-[22px]"
                        />
                        <button
                          onClick={clearFile}
                          className="absolute top-4 right-4 bg-white/90 text-red-500 p-2 rounded-xl shadow-lg hover:bg-red-50 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
            </div>

            {/* Results */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-black text-slate-700">Resultados em Tempo Real</h3>
              </div>

              {!isModelLoaded ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <BarChart2 className="w-10 h-10 text-slate-200 mb-3" />
                  <p className="text-slate-400 text-xs font-semibold">Carregue um modelo para ver as previsões.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {labels.map((label, index) => {
                    const score = predictions[index] ?? 0;
                    const percent = Math.round(score * 100);
                    const isTop = index === topIndex && percent > 0;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <span className="w-20 text-[11px] font-black text-slate-500 uppercase tracking-wider truncate text-right flex-shrink-0">
                          {label}
                        </span>
                        <div className="flex-1 h-8 bg-slate-100 rounded-full relative overflow-hidden ring-1 ring-slate-200/50">
                          <div
                            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out ${
                              isTop
                                ? 'bg-[var(--color-vlab-pi-green)] shadow-[2px_0_10px_rgba(16,185,129,0.3)]'
                                : 'bg-[var(--color-vlab-pi-blue)] shadow-[2px_0_10px_rgba(0,82,204,0.2)]'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-black text-slate-500">{percent}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function FileSelector({
  label,
  icon,
  file,
  onSelect,
  accept,
  inputRef,
}: {
  label: string;
  icon: React.ReactNode;
  file: File | null;
  onSelect: (f: File) => void;
  accept: string;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])} />
      <button
        onClick={() => inputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${
          file ? 'border-[var(--color-vlab-pi-blue)] bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
        }`}
      >
        <div className={file ? 'text-[var(--color-vlab-pi-blue)]' : 'text-slate-400'}>{icon}</div>
        <span className={`text-xs font-bold truncate max-w-full px-2 ${file ? 'text-[var(--color-vlab-pi-blue)]' : 'text-slate-500'}`}>
          {file ? file.name : label}
        </span>
      </button>
    </div>
  );
}
