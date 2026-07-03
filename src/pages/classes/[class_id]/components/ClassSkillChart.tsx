import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Estrutura de dados que cada ponto do gráfico espera receber
export interface IDailySkillAverage {
  date: string; // Ex: "10/05/2026"
  média: number; // Ex: 4.2
}

interface IClassSkillChartProps {
  skillName: string;
  data: IDailySkillAverage[];
}

/**
 * Componente educacional focado em renderizar a evolução de uma única habilidade.
 * Plotagem em barras verticais no eixo X (data exata) e notas de 0 a 5 no eixo Y.
 */
export const ClassSkillChart: React.FC<IClassSkillChartProps> = ({ skillName, data }) => {
  // Cores dinâmicas alinhadas com o Design System do ecossistema Hub (Modo Claro/Escuro)
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const barColor = useColorModeValue('#3182CE', '#63B3ED'); // blue.500 / blue.300

  return (
    <Box
      p={4}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      boxShadow="sm"
      display="flex"
      flexDirection="column"
      height="300px"
      width="100%"
    >
      {/* Título da Habilidade / Categoria no topo do card */}
      <Text
        fontWeight="bold"
        fontSize="md"
        mb={3}
        pb={3} /* Adiciona um pequeno espaço extra na base */
        lineHeight="normal" /* Força o html2canvas a respeitar a altura total da fonte */
        noOfLines={1}
        title={skillName}
      >
        {skillName}
      </Text>

      {/* Contêiner responsivo do Recharts */}
      <Box flex="1" width="100%" minHeight={0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />

            {/* Eixo X: Datas das avaliações */}
            <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={{ stroke: '#A0AEC0' }} />

            {/* Eixo Y: Fixo estritamente de 0 a 5 */}
            <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} axisLine={{ stroke: '#A0AEC0' }} />

            <Tooltip
              // formatter={(value: number) => [`${value.toFixed(2)}`, 'Média da Turma']}
              labelFormatter={(label) => `Data: ${label}`}
            />

            {/* Barra representando a média calculada do dia */}
            <Bar dataKey="média" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={45} isAnimationActive={true} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};
