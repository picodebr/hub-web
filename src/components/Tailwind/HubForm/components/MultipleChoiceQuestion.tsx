import React from 'react';
import { motion } from 'framer-motion';

export interface MultipleChoiceQuestionProps {
  id: string;
  title: string;
  question: string;
  options: string[];
  selectedOption: string | null;
  onOptionSelect: (id: string, option: string) => void;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ id, title, question, options, selectedOption, onOptionSelect }) => {
  return (
    <motion.div className="question-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-heading text-lg font-medium text-education-dark">{title}</h3>
        <span className="bg-education-primary/10 text-education-primary text-xs px-2 py-1 rounded-full">Múltipla Escolha</span>
      </div>

      <p className="text-gray-700 mb-6">{question}</p>

      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedOption === option;

          return (
            <motion.div
              key={index}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                isSelected ? 'border-education-primary bg-education-primary/5' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onOptionSelect(id, option)}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                    isSelected ? 'border-education-primary bg-education-primary' : 'border-gray-400'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      className="w-2 h-2 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>
                <span className={`${isSelected ? 'text-education-dark font-medium' : 'text-gray-700'}`}>{option}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
