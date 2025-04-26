import React from 'react';
import { motion } from 'framer-motion';
import { useCustomRouter } from '@/_base/hooks';

interface SubmissionCompleteProps {
  onClose: () => void;
}

export const SubmissionComplete: React.FC<SubmissionCompleteProps> = ({ onClose }) => {
  const router = useCustomRouter();
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 flex flex-col items-center"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <div className="w-16 h-16 bg-education-success/20 rounded-full flex items-center justify-center mb-4">
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-education-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </motion.svg>
        </div>

        <h3 className="text-xl font-heading font-medium text-education-dark mb-2">Respostas enviadas!</h3>
        <p className="text-gray-600 text-center mb-6">Suas respostas foram enviadas com sucesso. Obrigado por completar esta avaliação.</p>

        <div className="w-full bg-gray-100 rounded-lg p-4 mb-6">
          {/* <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-500">Tempo de conclusão</span>
            <span className="text-sm font-medium">12 minutos</span>
          </div> */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Questões respondidas</span>
            <span className="text-sm font-medium">10/10</span>
          </div>
        </div>

        <motion.button className="btn-primary w-full" onClick={() => router.push(`/exam`)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          Retornar ao Painel
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
