import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ListFilter } from 'lucide-react';
import { getStudentExtract, IStudentExtract } from '@/_base/services/user';
import { formatCoin } from '@/_base/utils';
import moment from 'moment';

interface StudentExtractProps {
  isDark: boolean;
}

export const StudentExtract: React.FC<StudentExtractProps> = ({ isDark }) => {
  const [userExtract, setUserExtract] = useState<IStudentExtract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const extract = await getStudentExtract();
        setUserExtract(extract);
      } catch (error) {
        console.error('Erro ao carregar extrato:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  const totalPositive = userExtract
    .filter((e) => e.type === 'plus')
    .reduce((sum, e) => sum + e.value, 0);

  const totalNegative = userExtract
    .filter((e) => e.type === 'minus')
    .reduce((sum, e) => sum + e.value, 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border p-6 shadow-sm transition-colors duration-300`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <ListFilter className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Meu Extrato
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Positive */}
        <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className={`text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
              Recebido
            </span>
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-green-300' : 'text-green-600'}`}>
            +{formatCoin(totalPositive)}
          </p>
        </div>

        {/* Negative */}
        <div className={`p-3 rounded-lg ${isDark ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50 border-red-200'} border`}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className={`text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>
              Gasto
            </span>
          </div>
          <p className={`text-lg font-bold ${isDark ? 'text-red-300' : 'text-red-600'}`}>
            -{formatCoin(totalNegative)}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className={`h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'} mb-6`} />

      {/* Extract List */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin">
            <div className={`w-8 h-8 border-4 ${isDark ? 'border-gray-600 border-t-blue-500' : 'border-gray-200 border-t-blue-500'} rounded-full`} />
          </div>
        </div>
      ) : userExtract.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {userExtract.map((extract, idx) => (
            <motion.div
              key={`${extract.label}-${idx}`}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } transition-colors`}
            >
              {/* Icon + Label */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-full flex-shrink-0 ${
                  extract.type === 'plus'
                    ? isDark ? 'bg-green-900/30' : 'bg-green-100'
                    : isDark ? 'bg-red-900/30' : 'bg-red-100'
                }`}>
                  {extract.type === 'plus' ? (
                    <TrendingUp className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  ) : (
                    <TrendingDown className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} truncate`}>
                    {extract.label}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {moment(extract.date).format('DD/MM/YYYY')}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div className={`flex-shrink-0 text-right`}>
                <p className={`text-sm font-bold ${
                  extract.type === 'plus'
                    ? isDark ? 'text-green-400' : 'text-green-600'
                    : isDark ? 'text-red-400' : 'text-red-600'
                }`}>
                  {extract.type === 'plus' ? '+' : '-'}{formatCoin(extract.value)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <ListFilter className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nenhuma transação registrada</p>
        </div>
      )}
    </motion.div>
  );
};

export default StudentExtract;
