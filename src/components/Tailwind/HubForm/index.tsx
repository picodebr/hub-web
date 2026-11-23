import React from 'react';
import { motion } from 'framer-motion';
import { HubFormHeader } from '@/components/Tailwind/HubForm/components/Header';
import { AssessmentSection } from '@/components/Tailwind/HubForm/components/AssessmentSection';
import AnnouncementSection from '@/components/Tailwind/HubForm/components/AnnouncementSection';

interface IHubFormProps {
  target: `student` | `teacher`;
}

export const HubForm: React.FC<IHubFormProps> = () => {
  return (
    <motion.div className="min-h-screen bg-gray-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ overflow: `hidden auto` }}>
      {/* <Header /> */}

      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* <AnnouncementSection /> */}
        {/* <AssessmentSection /> */}

        <motion.footer
          className="mt-16 mb-8 text-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>© 2026 PiCode - Sistema de Avaliações Online</p>
          <p className="mt-1">Desenvolvido para proporcionar a melhor experiência educacional</p>
        </motion.footer>
      </div>
    </motion.div>
  );
};
