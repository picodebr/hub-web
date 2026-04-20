import { motion } from 'framer-motion';
import { AssessmentQuestionType, AssessmentSection } from '@/components/Tailwind/HubForm/components/AssessmentSection';
import AnnouncementSection from '@/components/Tailwind/HubForm/components/AnnouncementSection';
import { GetServerSideProps } from 'next';
import { cookieManager, logError } from '@/_base/utils';
import { useEffect, useState } from 'react';
import { getProject } from '@/_base/services/project';
import { IProject } from '@/_base/interfaces/project';
import { useCustomRouter } from '@/_base/hooks';
import { IHubUser } from '@/_base/interfaces/user';
import { getStudent } from '@/_base/services/user';
import { HubFormHeader } from '@/components/Tailwind/HubForm/components/Header';

interface IPageProps {
  projectId: string;
  studentId: string;
}

const ExamForm: React.FC<IPageProps> = ({ projectId, studentId }) => {
  const [project, setProject] = useState<IProject | null>(null);
  const [student, setStudent] = useState<IHubUser | null>(null);

  const router = useCustomRouter();

  useEffect(() => {
    if (!projectId || !studentId) {
      router.back();
      return;
    }

    (async () => {
      const [p, s] = await Promise.all([getProject(projectId), getStudent(studentId)]);
      setProject(p);
      setStudent(s);
    })();
  }, []);

  return (
    <motion.div
      className="bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ overflow: `hidden auto`, borderRadius: `8px`, border: `1px solid #D0D5DD` }}
    >
      <HubFormHeader project={project} student={student} />

      <div className="container max-w-4xl mx-auto px-4 py-6">
        <AnnouncementSection project={project || ({} as any)} student={student} />
        <AssessmentSection project={project || ({} as any)} student={student} questions={initialQuestions} />
      </div>
    </motion.div>
  );
};

export default ExamForm;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const selectedPage = 'exam';

  const pageTitle = query.p ? `Avaliação do projeto ${query.p}` : `Avaliação de projeto`;

  try {
    cookieManager.updateToken(req);

    return { props: { selectedPage, pageTitle, studentId: query.s || ``, projectId: query.id } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};

const initialQuestions: AssessmentQuestionType[] = [
  {
    id: 'q1',
    type: 'rating',
    title: 'Compreensão do problema',
    question: 'Comunica-se de forma clara, demonstrando compreensão do contexto e dos objetivos do projeto.',
    rating: null,
  },
  {
    id: 'q2',
    type: 'rating',
    title: 'Intencionalidades',
    question: 'Planeja e organiza suas ações de maneira a contribuir efetivamente para a construção do projeto.',
    rating: null,
  },
  {
    id: 'q3',
    type: 'rating',
    title: 'Coordenação Motora',
    question: 'Manipula as peças com cuidado e precisão, realizando encaixes, dobras e conexões corretamente.',
    rating: null,
  },
  {
    id: 'q4',
    type: 'rating',
    title: 'Criatividade',
    question: 'Dedica-se à personalização do projeto, demonstrando atenção ao design com criatividade e originalidade.',
    rating: null,
  },
  {
    id: 'q5',
    type: 'rating',
    title: 'Sequências e Instruções',
    question: 'Segue com precisão as orientações e etapas do manual de montagem.',
    rating: null,
  },
  {
    id: 'q6',
    type: 'rating',
    title: 'Letramento Digital',
    question: 'Reconhece e utiliza adequadamente os recursos tecnológicos disponíveis para o desenvolvimento do projeto.',
    rating: null,
  },
  {
    id: 'q7',
    type: 'rating',
    title: 'Autonomia',
    question: 'Circula pela sala de forma proativa em busca de materiais, ferramentas e trocas de ideias com outros grupos.',
    rating: null,
  },
  {
    id: 'q8',
    type: 'rating',
    title: 'Comunicação',
    question: 'Expressa suas ideias com clareza, organizando e sintetizando informações de forma coerente.',
    rating: null,
  },
  // {
  //   id: 'q1',
  //   type: 'multiple-choice',
  //   title: 'Questão 1',
  //   question: 'Qual é o resultado da expressão 3x + 7 = 22 quando resolvemos para x?',
  //   options: ['x = 5', 'x = 7', 'x = 15', 'x = 8'],
  //   selectedOption: null,
  // },
  // {
  //   id: 'q2',
  //   type: 'multiple-choice',
  //   title: 'Questão 2',
  //   question: 'Um triângulo equilátero tem todos os lados iguais a 12 cm. Qual é o perímetro deste triângulo?',
  //   options: ['12 cm', '24 cm', '36 cm', '48 cm'],
  //   selectedOption: null,
  // },
  // {
  //   id: 'q3',
  //   type: 'open',
  //   title: 'Questão 3',
  //   question: 'Explique com suas palavras o Teorema de Pitágoras e dê um exemplo de sua aplicação no dia a dia.',
  //   answer: '',
  // },
  // {
  //   id: 'q4',
  //   type: 'rating',
  //   title: 'Avaliação de Conteúdo',
  //   question: 'Quão claro foi o conteúdo sobre equações de primeiro grau apresentado em aula?',
  //   rating: null,
  // },
  // {
  //   id: 'q5',
  //   type: 'multiple-choice',
  //   title: 'Questão 4',
  //   question: 'Um ciclista percorre 15 km em 45 minutos. Se ele mantiver a mesma velocidade, quanto tempo levará para percorrer 25 km?',
  //   options: ['1 hora e 15 minutos', '1 hora e 30 minutos', '50 minutos', '1 hora'],
  //   selectedOption: null,
  // },
];
