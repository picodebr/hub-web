import React from 'react';
import { motion } from 'framer-motion';
import { IProject } from '@/_base/interfaces/project';
import { formatClassGrade } from '@/_base/utils';
import { IHubUser } from '@/_base/interfaces/user';
import { Logo } from '@/components/Logo';

interface IProps {
  project: IProject | null;
  student: IHubUser | null;
}

export const Header: React.FC<IProps> = ({ project, student }) => {
  return (
    <motion.header
      className="bg-white border-b border-gray-200 py-4 px-6 mb-6 sticky top-0 z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <motion.div className="flex items-center mb-4 md:mb-0 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Logo size="md" variant="only-icon" forceTheme="dark" />

          <div>
            <h1 className="text-2xl font-heading font-bold text-education-dark">{project?.title || 'PiCode'}</h1>
            <p className="text-sm text-gray-500">{student ? `${student.name}` : 'Sistema de Avaliações Online'}</p>
          </div>
        </motion.div>

        <motion.div className="flex items-center space-x-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <span className="text-sm text-gray-500">{formatClassGrade(student?.hub_class.grade || ``)}</span>
          <div className="h-6 w-px bg-gray-300"></div>
          {/* <span className="text-sm font-medium text-education-primary">Tempo: 45 min</span> */}
          <div className="bg-education-primary/10 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-education-primary">Avaliação Quinzenal</span>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};
