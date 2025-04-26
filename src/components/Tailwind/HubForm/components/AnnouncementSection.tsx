import React from 'react';
import { motion } from 'framer-motion';

const AnnouncementSection: React.FC = () => {
  return (
    <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
      <div className="bg-education-warning/20 border-l-4 border-education-warning rounded-r-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-education-warning"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-education-dark">Avisos Importantes</h3>
            <div className="mt-2 text-sm text-gray-600">
              <ul className="list-disc pl-5 space-y-1">
                <li>Leia atentamente todas as questões antes de responder.</li>
                <li>Você tem 45 minutos para completar esta avaliação.</li>
                <li>Todas as respostas são salvas automaticamente.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="mt-4 bg-education-primary/10 rounded-lg p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="font-medium text-education-primary mb-2">Dica do Professor</h3>
        <p className="text-sm text-gray-600">Não se esqueça de revisar suas respostas antes de enviar. Boa sorte!</p>
      </motion.div>
    </motion.div>
  );
};

export default AnnouncementSection;
