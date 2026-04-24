'use client';

import { Bot } from 'lucide-react';
import { Flex } from '@chakra-ui/react';
import { VisionLabHeader } from './components/layout/Header';
import { useTensorFlow } from '@/_base/hooks';
import { VisionLabWebcamModal } from './components/modals/WebcamModal';
import { VisionLabConfirmModal } from './components/modals/ConfirmModal';
import { TrainingPanel } from './components/features/TrainingPanel';
import { ClassManager } from './components/features/ClassManager';
import { PreviewPanel } from './components/features/PreviewPanel';

export default function VisionLab() {
  const { isLoaded, error } = useTensorFlow();

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-50 text-red-500 p-6 rounded-2xl">
          <h2 className="font-bold text-xl">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <Flex direction="column" className="h-screen w-full bg-[var(--vlab-color-background)] overflow-hidden text-[var(--vlab-color-pi-text)]">
      <VisionLabHeader />

      {/* Loading Overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-slate-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
          isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <Bot className="w-16 h-16 text-[var(--vlab-color-pi-blue)] animate-bounce" />
          <h2 className="text-2xl font-black text-slate-700 tracking-tight">Acordando a máquina...</h2>
        </div>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row relative p-2 lg:p-4 gap-3 lg:gap-4 overflow-y-auto lg:overflow-hidden">
        {/* Coluna 1: Classes */}
        <div className="w-full lg:w-1/3 flex flex-col z-10 space-y-4 order-1 lg:overflow-y-auto custom-scrollbar pb-2">
          <ClassManager />
        </div>

        {/* Coluna 2: Treinamento */}
        <div className="w-full lg:w-1/3 flex flex-col z-10 items-center justify-center order-2 py-4 lg:py-0 lg:overflow-y-auto custom-scrollbar">
          <TrainingPanel />
        </div>

        {/* Coluna 3: Preview/Predição */}
        <div className="w-full lg:w-1/3 flex flex-col z-10 order-3 lg:overflow-y-auto custom-scrollbar pb-2">
          <PreviewPanel />
        </div>
      </main>

      <VisionLabWebcamModal />
      <VisionLabConfirmModal />
    </Flex>
  );
}
