import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MultipleChoiceQuestion, MultipleChoiceQuestionProps } from './MultipleChoiceQuestion';
import { OpenQuestion, OpenQuestionProps } from './OpenQuestion';
import { RatingQuestion, RatingQuestionProps } from './RatingQuestion';
import { LoadingOverlay } from './LoadingOverlay';
import { SubmissionComplete } from './SubmissionComplete';
import { IProject } from '@/_base/interfaces/project';
import { IHubUser } from '@/_base/interfaces/user';
import { IHubFactoryProject } from '@/_base/interfaces/project/IHubFactoryProject';

export type AssessmentQuestionType =
  | (Omit<MultipleChoiceQuestionProps, 'onOptionSelect'> & { type: 'multiple-choice' })
  | (Omit<OpenQuestionProps, 'onAnswerChange'> & { type: 'open' })
  | (Omit<RatingQuestionProps, 'onRatingChange'> & { type: 'rating' });

interface IProps {
  student: IHubUser | null;
  questions: AssessmentQuestionType[];
}

export const AssessmentSection: React.FC<IProps> = ({ questions: initialQuestions, student }) => {
  const [questions, setQuestions] = useState<AssessmentQuestionType[]>(initialQuestions);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleMultipleChoiceAnswer = (id: string, option: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id && q.type === 'multiple-choice' ? { ...q, selectedOption: option } : q)));
  };

  const handleOpenAnswer = (id: string, answer: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id && q.type === 'open' ? { ...q, answer } : q)));
  };

  const handleRatingChange = (id: string, rating: number) => {
    setQuestions((prev) => prev.map((q) => (q.id === id && q.type === 'rating' ? { ...q, rating } : q)));
  };

  const handleSubmit = () => {
    setIsLoading(true);
    updateLocalStorage();
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 3000);
  };

  const updateLocalStorage = () => {
    const items = JSON.parse(localStorage.getItem(`finished_forms`) || `[]`);

    // localStorage.setItem(`finished_forms`, JSON.stringify([...items, { student_id: student?.id, project_id: project?.id, questions }]));
  };

  const closeSubmissionComplete = () => {
    setIsSubmitted(false);
  };

  const getAnsweredQuestionsCount = () => {
    return questions.filter((q) => {
      if (q.type === 'multiple-choice') return q.selectedOption !== null;
      if (q.type === 'open') return q.answer.trim() !== '';
      if (q.type === 'rating') return q.rating !== null;
      return false;
    }).length;
  };

  const answeredCount = getAnsweredQuestionsCount();
  const totalCount = questions.length;
  const allAnswered = answeredCount === totalCount;

  return (
    <div className="mb-10">
      <motion.div className="flex justify-between items-center mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="font-heading text-2xl font-semibold text-education-dark">Avaliação de Matemática</h2>
        <div className="bg-education-primary/10 px-3 py-1 rounded-lg text-sm">
          <span className="font-medium text-education-primary">
            {answeredCount}/{totalCount}
          </span>
          <span className="text-gray-500 ml-1">Questões respondidas</span>
        </div>
      </motion.div>

      <div className="space-y-6">
        {questions.map((question) => {
          if (question.type === 'multiple-choice') {
            return (
              <MultipleChoiceQuestion
                key={question.id}
                id={question.id}
                title={question.title}
                question={question.question}
                options={question.options}
                selectedOption={question.selectedOption}
                onOptionSelect={handleMultipleChoiceAnswer}
              />
            );
          } else if (question.type === 'open') {
            return (
              <OpenQuestion
                key={question.id}
                id={question.id}
                title={question.title}
                question={question.question}
                answer={question.answer}
                onAnswerChange={handleOpenAnswer}
              />
            );
          } else if (question.type === 'rating') {
            return (
              <RatingQuestion
                key={question.id}
                id={question.id}
                title={question.title}
                question={question.question}
                rating={question.rating}
                onRatingChange={handleRatingChange}
              />
            );
          }
          return null;
        })}
      </div>

      <motion.div className="mt-10 flex justify-end items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* <button className="text-education-primary hover:text-education-primary/80 font-medium transition-colors">Salvar para depois</button> */}

        <motion.button
          className={`btn-primary flex items-center ${!allAnswered ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={!allAnswered}
          onClick={handleSubmit}
          whileHover={allAnswered ? { scale: 1.03 } : {}}
          whileTap={allAnswered ? { scale: 0.98 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <span>Enviar Respostas</span>
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </motion.button>
      </motion.div>

      <LoadingOverlay isLoading={isLoading} />

      <AnimatePresence>{isSubmitted && <SubmissionComplete onClose={closeSubmissionComplete} />}</AnimatePresence>
    </div>
  );
};
