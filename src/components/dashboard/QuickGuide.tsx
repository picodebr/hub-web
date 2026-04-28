import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface Guide {
  label: string;
  instructions: string;
}

interface QuickGuideProps {
  isDark: boolean;
}

export const QuickGuide: React.FC<QuickGuideProps> = ({ isDark }) => {
  const [expandedId, setExpandedId] = useState<number | null>(0);

  const guides: Guide[] = [
    {
      label: 'Como navegar pela plataforma?',
      instructions:
        'Você pode navegar pelo Hub utilizando o menu à esquerda e selecionando a sessão que deseja ver. Cada seção oferece funcionalidades específicas para gerenciar seus cursos, turmas e projetos.',
    },
    {
      label: 'Como abrir o livro na plataforma?',
      instructions:
        'Para abrir um livro, basta entrar na sessão "Biblioteca" e selecionar, no menu superior, o tipo do livro desejado. Caso deseje consultar um planejamento, este se encontrará em "Materiais Complementares".',
    },
    {
      label: 'Como criar um novo projeto?',
      instructions:
        'Para criar um novo projeto, entre em "Turmas", selecione a turma, navegue até a aba "Projetos" e clique em "Novo Projeto". Você pode usar nossa IA para mapear tudo rapidamente.',
    },
    {
      label: 'Como acessar minhas turmas?',
      instructions:
        'Selecione "Turmas" no menu à esquerda. Se não aparecerem, clique em "Adicionar turmas" e selecione as que você é responsável.',
    },
    {
      label: 'O que fazer se meu aluno esquecer a senha?',
      instructions:
        'Acesse "Turmas" > Selecione a Turma > Aba "Alunos" > Clique no aluno > Clique no botão "Resetar Senha".',
    },
    {
      label: 'Como pedir um novo produto na loja?',
      instructions:
        'Os alunos compram no ambiente do projeto. Você deve aprovar o pedido deles pelo Hub, na sessão "Estoque Maker", aba "Pedidos".',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
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
        <HelpCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Guia Rápido
        </h2>
      </div>

      {/* Accordion Items */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {guides.map((guide, idx) => (
          <div
            key={idx}
            className={`border rounded-lg overflow-hidden transition-colors ${
              isDark
                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {/* Accordion Button */}
            <button
              onClick={() => setExpandedId(expandedId === idx ? null : idx)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                expandedId === idx
                  ? isDark
                    ? 'bg-gray-600'
                    : 'bg-gray-100'
                  : ''
              }`}
            >
              <span className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                {guide.label}
              </span>
              <motion.div
                animate={{ rotate: expandedId === idx ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </motion.div>
            </button>

            {/* Accordion Content */}
            <AnimatePresence>
              {expandedId === idx && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className={`border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                >
                  <p className={`px-4 py-3 text-xs leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {guide.instructions}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickGuide;
