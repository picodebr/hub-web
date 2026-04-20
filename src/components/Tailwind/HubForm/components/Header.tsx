import React from 'react';
import { motion } from 'framer-motion';
import { IProject } from '@/_base/interfaces/project';
import { formatClassGrade } from '@/_base/utils';
import { IHubUser } from '@/_base/interfaces/user';
import { Logo } from '@/components/Logo';
import { IHubFactoryProject } from '@/_base/interfaces/project/IHubFactoryProject';

interface IProps {
  project: IProject | IHubFactoryProject;
  student: IHubUser | null;
}

export const HubFormHeader: React.FC<IProps> = ({ project, student }) => {
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
        </motion.div>
      </div>
    </motion.header>
  );
};
