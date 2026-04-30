import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import { IHubCertificate } from '@/_base/interfaces/certificate';
import { listUserCertificates } from '@/_base/services/certificates';

interface MyCertificatesProps {
  isDark: boolean;
}

export const MyCertificates: React.FC<MyCertificatesProps> = ({ isDark }) => {
  const [certificates, setCertificates] = useState<IHubCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const certificatesResponse = await listUserCertificates();
        setCertificates(certificatesResponse);
      } catch (error) {
        console.error('Erro ao carregar certificados:', error);
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border p-6 shadow-sm transition-colors duration-300`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Award className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Meus Certificados
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin">
            <div className={`w-8 h-8 border-4 ${isDark ? 'border-gray-600 border-t-blue-500' : 'border-gray-200 border-t-blue-500'} rounded-full`} />
          </div>
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
          {certificates.map((cert, idx) => (
            <motion.div
              key={cert.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } transition-all hover:translate-y-[-2px] cursor-pointer`}
            >
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                  {cert.course_title}
                </h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {new Date(cert.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <a
                href={cert.certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`ml-3 p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-600 hover:bg-gray-500 text-yellow-400'
                    : 'bg-gray-200 hover:bg-gray-300 text-yellow-600'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Você ainda não tem certificados</p>
        </div>
      )}
    </motion.div>
  );
};

export default MyCertificates;
