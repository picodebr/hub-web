import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { ImagePlus, Plus, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IProject } from '@/_base/interfaces/project';

interface IProps {
  project: IProject;
  onChangeFiles: (data: File[]) => void;
  canEdit: boolean;
}

export const ProjectPhotos: React.FC<IProps> = ({ project, onChangeFiles, canEdit }) => {
  const attachments = project.metadata?.attachments || [];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onChangeFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="glass-card p-5 space-y-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 text-base font-semibold text-foreground">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <ImagePlus className="w-4 h-4 text-pink-500" />
            </div>
            Fotos do Projeto
          </div>
          
          {canEdit && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar fotos
              </button>
              <input type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={handleAddPhotos} ref={fileInputRef} className="hidden" />
            </>
          )}
        </div>

        {attachments.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {attachments.map((url, idx) => (
              <div
                key={idx}
                className="relative group aspect-square rounded-2xl overflow-hidden border border-border/40 bg-accent/30 cursor-zoom-in"
                onClick={() => setLightboxIdx(idx)}
              >
                <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            ))}
            {canEdit && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-border/60 flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all bg-accent/10"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
          </div>
        ) : (
          <button
            disabled={!canEdit}
            onClick={() => canEdit && fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed border-border/60 rounded-2xl py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground transition-all bg-accent/10
              ${canEdit ? 'hover:border-primary/50 hover:text-primary hover:bg-primary/5 cursor-pointer' : 'cursor-default opacity-70'}`}
          >
            <ImagePlus className="w-8 h-8 mb-1" />
            <span className="text-sm font-semibold">Clique para adicionar fotos</span>
            <span className="text-xs font-medium opacity-70">PNG, JPG ou WEBP</span>
          </button>
        )}
      </div>

      {/* Lightbox Integrado com Framer Motion */}
      <AnimatePresence>
        {lightboxIdx !== null && attachments[lightboxIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setLightboxIdx(null)}
          >
            <button
              onClick={() => setLightboxIdx(null)}
              className="absolute top-6 right-6 p-2.5 rounded-xl bg-background/80 border border-border/50 hover:bg-accent transition-colors z-10"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
            
            {attachments.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + attachments.length) % attachments.length); }}
                  className="absolute left-6 p-3 rounded-xl bg-background/80 border border-border/50 hover:bg-accent transition-colors z-10"
                >
                  <ChevronDown className="w-5 h-5 text-foreground rotate-90" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % attachments.length); }}
                  className="absolute right-6 p-3 rounded-xl bg-background/80 border border-border/50 hover:bg-accent transition-colors z-10"
                >
                  <ChevronDown className="w-5 h-5 text-foreground -rotate-90" />
                </button>
              </>
            )}

            <motion.img
              key={attachments[lightboxIdx]}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
              src={attachments[lightboxIdx]}
              alt={`Foto ampla ${lightboxIdx + 1}`}
              onClick={(e) => e.stopPropagation()}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-background/80 border border-border/50 text-sm font-semibold text-foreground">
              {lightboxIdx + 1} / {attachments.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};