import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface RatingQuestionProps {
  id: string;
  title: string;
  question: string;
  rating: number | null;
  onRatingChange: (id: string, rating: number) => void;
}

export const RatingQuestion: React.FC<RatingQuestionProps> = ({ id, title, question, rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(null);
  };

  return (
    <motion.div className="question-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-heading text-lg font-medium text-education-dark">{title}</h3>
        {/* <span className="bg-education-accent/10 text-education-accent text-xs px-2 py-1 rounded-full">Avaliação</span> */}
      </div>

      <p className="text-gray-700 mb-6">{question}</p>

      <div className="flex flex-col items-center">
        <div className="flex space-x-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = hoverRating !== null ? star <= hoverRating : rating !== null && star <= rating;

            return (
              <motion.button
                key={star}
                className="focus:outline-none"
                onClick={() => onRatingChange(id, star)}
                onMouseEnter={() => handleMouseEnter(star)}
                onMouseLeave={handleMouseLeave}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isActive ? '#ffd166' : 'none'}
                  stroke={isActive ? '#ffd166' : '#cbd5e1'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-10 h-10"
                  animate={{
                    scale: isActive ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </motion.svg>
              </motion.button>
            );
          })}
        </div>

        <motion.p className="text-sm text-gray-500 mt-2" animate={{ opacity: rating ? 1 : 0.5 }}>
          {rating
            ? rating === 5
              ? 'Excelente! Você atribuiu a nota máxima.'
              : rating === 1
                ? 'Muito baixo. Agradecemos seu feedback.'
                : `Você selecionou ${rating} ${rating === 1 ? 'estrela' : 'estrelas'}.`
            : 'Selecione uma classificação acima'}
        </motion.p>
      </div>
    </motion.div>
  );
};
