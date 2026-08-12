import { useEffect, useState } from 'react';
import { Box, Heading, Grid, Text } from '@chakra-ui/react';
import { ClassSkillChart } from '@/pages/classes/[class_id]/components/ClassSkillChart';

export default function ExportPdfPage() {
  const [fullClassData, setFullClassData] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Busca os dados injetados pelo Node.js
    const data = localStorage.getItem('pdf_export_data');
    if (data) {
      setFullClassData(JSON.parse(data));
      // Delay de segurança para garantir que a biblioteca de gráficos finalizou os traços
      setTimeout(() => setIsReady(true), 1500);
    }
  }, []);

  if (!fullClassData.length) return null;

  return (
    <Box p={4} bg="#ffffff" style={{ fontFamily: "'Inter', sans-serif" }} minH="100vh">
      {isReady && <div id="pdf-ready" style={{ display: 'none' }} />}

      {/* 1. Adicionado o 'index' no map */}
      {fullClassData.map((hubClass, index) => {
        const allEvaluations =
          hubClass?.form_links?.reduce((acc: any, form_link: any) => {
            const exams: any[] = [];
            form_link.student_relations?.forEach((studentRel: any) => {
              studentRel.questions?.forEach((q: any) => {
                exams.push({
                  category: form_link.form.questions.find((e: any) => e.id === q.question_id)?.title || 'Habilidade Desconhecida',
                  score: q.score,
                  student_id: studentRel.hub_user_id,
                  created_at: form_link.finished_at || new Date().toISOString(),
                });
              });
            });
            acc.push(...exams);
            return acc;
          }, []) || [];
        const uniqueSkills = Array.from(new Set(allEvaluations.map((e: any) => e.category))).filter(Boolean);

        return (
          <Box
            key={`export-${hubClass.id}`}
            sx={{
              pageBreakAfter: index === fullClassData.length - 1 ? 'auto' : 'always',
              breakAfter: index === fullClassData.length - 1 ? 'auto' : 'page',
            }}
          >
            <Heading size="md" color="#1A202C" pb={4}>
              {hubClass.display_name} - Histórico de Avaliações
            </Heading>

            {uniqueSkills.length > 0 && (
              // 1. Grid fixado em 3 colunas e gap reduzido para 4
              <Grid templateColumns="repeat(3, 1fr)" gap={4} width="100%">
                {uniqueSkills.map((skillName: any) => {
                  const skillEvals = allEvaluations.filter((e: any) => e.category === skillName);
                  const dailyMap = new Map<string, { sum: number; count: number }>();

                  skillEvals.forEach((ev: any) => {
                    const exactDay = new Date(ev.created_at).toLocaleDateString('pt-BR');
                    const current = dailyMap.get(exactDay) || { sum: 0, count: 0 };
                    dailyMap.set(exactDay, {
                      sum: current.sum + Number(ev.score || 0),
                      count: current.count + 1,
                    });
                  });

                  const chartData = Array.from(dailyMap.entries())
                    .map(([date, { sum, count }]) => ({
                      date,
                      média: count > 0 ? Number((sum / count).toFixed(2)) : 0,
                    }))
                    .sort((a, b) => {
                      const [dA, mA, yA] = a.date.split('/').map(Number);
                      const [dB, mB, yB] = b.date.split('/').map(Number);
                      return new Date(yA, mA - 1, dA).getTime() - new Date(yB, mB - 1, dB).getTime();
                    });

                  return <ClassSkillChart skillName={skillName} data={chartData} />;
                })}
              </Grid>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
