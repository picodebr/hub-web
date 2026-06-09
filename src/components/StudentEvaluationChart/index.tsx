import React, { useMemo, useState, useEffect } from 'react';
import { Box, Flex, Text, Checkbox, Button, Grid } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IHubFormClassUser } from '@/_base/interfaces/form/IHubFormClassUser';
import { useDarkMode } from '@/_base/hooks/useDarkMode';

interface StudentEvaluationChartProps {
  forms: IHubFormClassUser[];
  bgCard: string;
  borderColor: string;
  enableDevMode?: boolean;
  showLegend?: boolean;
}

// Array de cores para as linhas
const COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#14B8A6', // teal
  '#F97316', // orange
  '#6366F1', // indigo
];

// Componente customizado para o Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0]; // Mostra apenas a barra específica
    return (
      <Box
        bg="#FFFFFF"
        border="1px solid #E5E7EB"
        borderRadius="8px"
        p="0.5rem 0.75rem"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
      >
        <Text fontSize="12px" fontWeight="600" color="#1F2937">
          {data.name}
        </Text>
        <Text fontSize="13px" fontWeight="500" color="#1F2937" mt="0.25rem">
          {data.value?.toFixed(1) ?? data.value}
        </Text>
      </Box>
    );
  }
  return null;
};

// Função para gerar dados mockados
const generateMockForms = (): IHubFormClassUser[] => {
  const mockForms: IHubFormClassUser[] = [];
  const questionsIds = ['q1', 'q2', 'q3', 'q4', 'q5'];
  const questionsTitles = ['Matemática', 'Português', 'Ciências', 'História', 'Geografia'];

  // Gerar 12 datas com intervalos de 15 dias
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (11 - i) * 15); // Começa 165 dias atrás e vai até hoje

    // Gerar scores aleatórios para cada questão
    const questions = questionsIds.map((_, idx) => ({
      question_id: questionsIds[idx],
      score: Math.floor(Math.random() * 5) + 1, // Score entre 1 e 5
    }));

    mockForms.push({
      id: `mock-form-${i}`,
      hub_form_class_id: 'mock-class',
      hub_user_id: 'mock-user',
      questions,
      metadata: {},
      created_at: date.toISOString(),
      updated_at: date.toISOString(),
      hub_form_class: {
        id: 'mock-class',
        hub_form_id: 'mock-form',
        hub_class_id: 'mock-class-inst',
        form: {
          id: 'mock-form',
          title: 'Avaliação Mock',
          description: 'Avaliação para teste em modo desenvolvimento',
          grades: ['1', '2', '3'],
          questions: questionsTitles.map((title, idx) => ({
            id: questionsIds[idx],
            title,
          })),
          metadata: {},
          created_at: date,
          updated_at: date,
          class_links: [],
        },
        created_at: date.toISOString(),
        updated_at: date.toISOString(),
      } as any,
      user: {} as any,
    });
  }

  return mockForms;
};

// @ts-nocheck
const StudentEvaluationChart: React.FC<StudentEvaluationChartProps> = ({ forms, bgCard, borderColor, enableDevMode, showLegend = true }) => {
  const { colorMode } = useDarkMode();
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  const chartData = useMemo(() => {
    // Usar dados mockados se devMode estiver ativado
    const formsToUse = enableDevMode ? generateMockForms() : forms;

    if (!formsToUse || formsToUse.length === 0) {
      return { data: [], questionsMap: new Map() };
    }

    // Mapear questões com suas cores
    const questionsMap = new Map<string, { color: string; title: string }>();
    let colorIndex = 0;

    // Coletar todas as questões únicas
    formsToUse.forEach((form) => {
      form.hub_form_class.form.questions.forEach((question) => {
        if (!questionsMap.has(question.id)) {
          questionsMap.set(question.id, {
            color: COLORS[colorIndex % COLORS.length],
            title: question.title,
          });
          colorIndex++;
        }
      });
    });

    // Construir dados do gráfico
    const data = formsToUse.map((form) => {
      const dataPoint: any = {
        date: new Date(form.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }),
        timestamp: new Date(form.created_at).getTime(),
      };

      // Adicionar scores para cada questão
      form.questions.forEach((answer) => {
        dataPoint[answer.question_id] = answer.score;
      });

      return dataPoint;
    });

    // Ordenar por data
    data.sort((a, b) => a.timestamp - b.timestamp);

    return { data, questionsMap };
  }, [forms, enableDevMode]);

  // Inicializar selectedQuestions com todas as questões quando houver novos dados
  useEffect(() => {
    if (selectedQuestions.size === 0 && chartData.questionsMap.size > 0) {
      setSelectedQuestions(new Set(chartData.questionsMap.keys()));
    }
  }, [chartData.questionsMap.size]);

  const toggleQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const toggleAllQuestions = () => {
    if (selectedQuestions.size === chartData.questionsMap.size) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(chartData.questionsMap.keys()));
    }
  };

  if (chartData.data.length === 0) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="400px"
        bg={bgCard}
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
        gap="1rem"
      >
        <Text fontSize="18px" fontWeight="600" color="gray.500">
          Sem avaliações disponíveis
        </Text>
        <Text fontSize="14px" color="gray.400">
          As avaliações aparecerão aqui quando forem registradas
        </Text>
      </Flex>
    );
  }

  return (
    <Box bg={bgCard} borderRadius="2xl" border="1px solid" borderColor={borderColor} boxShadow="sm" overflow="hidden" p="1.5rem">
      <Flex direction="column" gap="1.5rem">
        {/* Cabeçalho e descrição */}
        <Flex direction="column" gap="1rem">
          <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
            Desempenho em Avaliações
          </Text>
          <Text fontSize="13px" color="gray.500">
            Evolução das notas por questão ao longo do tempo
          </Text>
        </Flex>

        {/* Filtros */}
        <Box bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'} border="1px solid" borderColor={borderColor} borderRadius="lg" p="1rem">
          <Flex direction="column" gap="0.75rem">
            <Flex justify="space-between" align="center">
              <Text fontSize="14px" fontWeight="600" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                Filtrar Categorias
              </Text>
              <Button size="xs" variant="ghost" colorScheme="blue" onClick={toggleAllQuestions} fontSize="12px">
                {selectedQuestions.size === chartData.questionsMap.size ? 'Limpar' : 'Todas'}
              </Button>
            </Flex>

            <Grid templateColumns="repeat(3, 1fr)" gap="1rem" columnGap="1.5rem">
              {Array.from(chartData.questionsMap.entries()).map(([questionId, questionData]) => (
                <Flex key={questionId} align="center" gap="0.5rem">
                  <Checkbox isChecked={selectedQuestions.has(questionId)} onChange={() => toggleQuestion(questionId)} colorScheme="blue" size="md" />
                  <Flex align="center" gap="0.5rem">
                    <Box w="3" h="3" borderRadius="full" bg={questionData.color} />
                    <Text fontSize="13px" color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}>
                      {questionData.title}
                    </Text>
                  </Flex>
                </Flex>
              ))}
            </Grid>
          </Flex>
        </Box>

        {/* Gráfico */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData.data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }} cursor={false}>
            <CartesianGrid strokeDasharray="3 3" stroke={colorMode === 'light' ? '#E5E7EB' : '#374151'} />
            <XAxis dataKey="date" stroke={colorMode === 'light' ? '#6B7280' : '#9CA3AF'} style={{ fontSize: '12px' }} />
            <YAxis stroke={colorMode === 'light' ? '#6B7280' : '#9CA3AF'} style={{ fontSize: '12px' }} domain={[0, 5]} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
            {showLegend && (
              <Legend
                wrapperStyle={{
                  paddingTop: '1rem',
                  color: colorMode === 'light' ? '#1F2937' : '#F3F4F6',
                }}
              />
            )}

            {Array.from(chartData.questionsMap.entries()).map(([questionId, questionData]) =>
              selectedQuestions.has(questionId) ? (
                <Bar key={questionId} dataKey={questionId} fill={questionData.color} name={questionData.title} radius={[8, 8, 0, 0]} cursor="pointer" />
              ) : null,
            )}
          </BarChart>
        </ResponsiveContainer>
      </Flex>
    </Box>
  );
};

export default StudentEvaluationChart;
