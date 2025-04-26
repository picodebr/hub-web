import React from 'react';
import { motion } from 'framer-motion';

export interface OpenQuestionProps {
  id: string;
  title: string;
  question: string;
  answer: string;
  onAnswerChange: (id: string, answer: string) => void;
}

export const OpenQuestion: React.FC<OpenQuestionProps> = ({ id, title, question, answer, onAnswerChange }) => {
  return (
    <motion.div className="question-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-heading text-lg font-medium text-education-dark">{title}</h3>
        {/* <span className="bg-education-secondary/10 text-education-secondary text-xs px-2 py-1 rounded-full">Dissertativa</span> */}
      </div>

      <p className="text-gray-700 mb-6">{question}</p>

      <div className="relative">
        <textarea
          className="w-full min-h-[120px] p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-education-primary/50 focus:border-education-primary outline-none transition-all resize-none"
          placeholder="Digite sua resposta aqui..."
          value={answer}
          onChange={(e) => onAnswerChange(id, e.target.value)}
        />

        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>Dica: Desenvolva sua resposta com base no conteúdo estudado.</span>
          <span className={`${answer.length > 300 ? 'text-education-success' : 'text-gray-400'}`}>{answer.length} caracteres</span>
        </div>
      </div>
    </motion.div>
  );
};
