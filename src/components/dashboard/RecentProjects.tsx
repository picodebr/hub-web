import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Folder, ChevronRight } from 'lucide-react';
import { IProject } from '@/_base/interfaces/project';
import { getMyProjects } from '@/_base/services/project';
import { useCustomRouter } from '@/_base/hooks/CustomRouter';

interface RecentProjectsProps {
  isDark: boolean;
  schoolId?: string;
}

export const RecentProjects: React.FC<RecentProjectsProps> = ({ isDark, schoolId }) => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useCustomRouter();

  useEffect(() => {
    (async () => {
      try {
        if (schoolId) {
          const myProjects = await getMyProjects(schoolId);
          setProjects(
            myProjects
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .slice(0, 8)
          );
        }
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [schoolId]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border p-6 shadow-sm transition-colors duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Folder className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Meus Projetos Recentes
          </h2>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
        }`}>
          {projects.length}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin">
            <div className={`w-8 h-8 border-4 ${isDark ? 'border-gray-600 border-t-blue-500' : 'border-gray-200 border-t-blue-500'} rounded-full`} />
          </div>
        </div>
      ) : projects.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: idx * 0.1 }}
              onClick={() => router.push(`/code/${project.folder_id}/${project.id}`)}
              className={`flex-shrink-0 w-64 p-4 rounded-lg border cursor-pointer transition-all hover:translate-y-[-2px] group ${
                isDark
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {/* Thumbnail */}
              <div className={`w-full h-32 mb-3 rounded-lg overflow-hidden ${
                isDark ? 'bg-gray-600' : 'bg-gray-200'
              }`}>
                {project.snapshot ? (
                  <img
                    src={project.snapshot}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Folder className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                )}
              </div>

              {/* Content */}
              <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'} truncate mb-1`}>
                {project.name}
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                Atualizado em {new Date(project.updated_at).toLocaleDateString('pt-BR')}
              </p>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  isDark
                    ? 'bg-blue-900/30 text-blue-300'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {project.status || 'Em desenvolvimento'}
                </span>
                <ChevronRight className={`w-4 h-4 transform group-hover:translate-x-1 transition-transform ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Você ainda não tem projetos</p>
        </div>
      )}
    </motion.div>
  );
};

export default RecentProjects;
