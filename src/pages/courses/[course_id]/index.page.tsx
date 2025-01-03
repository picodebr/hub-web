import { GetServerSideProps } from 'next';

import { Button, Flex, Progress, Skeleton, Text } from '@chakra-ui/react';
import { useAsyncCallback, useCustomRouter, useCustomToast } from '@/_base/hooks';
import { useEffect, useState } from 'react';
import { IHubModule } from '@/_base/interfaces/module';
import { getCourseActivity, listCourses, listModules } from '@/_base/services/course';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { MdBlock } from 'react-icons/md';
import { IHubCourse } from '@/_base/interfaces/course';
import { formatShortName } from '@/_base/utils';
import { useProfile } from '@/components/Page/hooks';
import { PiCertificate } from 'react-icons/pi';

interface IProps {
  courseId: string;
  certificate: string;
}

const getFormattedDate = () => {
  const today = new Date();

  const day = today.getDate();
  const month = today.toLocaleString('pt-BR', { month: 'long' });
  const year = today.getFullYear();

  return { day, month, year };
};

const Course: React.FC<IProps> = ({ courseId }) => {
  const [modules, setModules] = useState<(IHubModule & { finished_lessons: number })[]>([]);
  const [course, setCourse] = useState<IHubCourse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const allModulesFinished = modules.every((mod) => mod.finished_lessons === mod.lessons.length);

  const { user } = useProfile();
  const toast = useCustomToast();
  const router = useCustomRouter();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [{ results }, activity, coursesResponse] = await Promise.all([listModules(courseId), getCourseActivity(courseId), listCourses()]);
        setCourse(coursesResponse.results.find((c) => c.id === courseId) || null);
        setModules(
          results.map((r) => ({
            ...r,
            finished_lessons: activity.metadata?.find((m) => m.entity_id === r.id)?.lessons.filter((l) => !!l.finished_at)?.length || 0,
          })),
        );
      } catch {
        toast({ status: `error`, description: `Não foi possível listar os módulos disponíveis no momento` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleGeneratePDF = useAsyncCallback(async () => {
    if (!course) {
      alert('Curso não encontrado.');
      return;
    }

    try {
      const response = await fetch('/certificate/pdf.pdf');

      if (!response.ok) {
        throw new Error('Failed to fetch the PDF');
      }

      const existingPdfBytes = await response.arrayBuffer();

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      const { day, month, year } = getFormattedDate();

      firstPage.drawText(`${formatShortName(user?.name, true)}`, {
        x: 470,
        y: 325,
        size: 40,
        font: helveticaFont,
        color: rgb(0, 0, 0),
        rotate: degrees(0),
      });
      firstPage.drawText(
        `Por sua participação e conclusão no
curso de ${course.title}, na PiCode,`,
        {
          x: 414,
          y: 267,
          size: 20,
          font: helveticaFont,
          color: rgb(0, 0, 0),
          rotate: degrees(0),
        },
      );
      firstPage.drawText(`Tendo duração de 20 horas`, {
        x: 453,
        y: 220,
        size: 20,
        font: helveticaFont,
        color: rgb(0, 0, 0),
        rotate: degrees(0),
      });
      firstPage.drawText(`Sorocaba, ${day} de ${month} de ${year}`, {
        x: 450,
        y: 165,
        size: 20,
        font: helveticaFont,
        color: rgb(0, 0, 0),
        rotate: degrees(0),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);
      setPdfUrl(pdfUrl);

      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'modified.pdf';
      link.click();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert('Erro ao carregar PDF: ' + errorMessage);
    }
  }, [course]);

  return (
    <Flex
      flex="1"
      bgColor="white"
      direction="column"
      borderRadius="12px"
      padding="20px 0"
      gap="20px"
      textAlign="left"
      whiteSpace="nowrap"
      borderBottom="1px solid gray300"
      userSelect="none"
      overflow="hidden"
      border="1px"
      borderColor="gray300"
      boxShadow="md"
    >
      {/* <Flex>{pdfUrl && <iframe src={pdfUrl} width="100%" height="1000px" style={{ border: 'none' }} title="PDF Preview"></iframe>}</Flex> */}
      <Flex align="center" justify="space-between" borderBottom="1px" borderColor="gray300" padding="0 20px 20px">
        <Text color="gray600">Módulos</Text>
        {allModulesFinished && (
          <Button onClick={handleGeneratePDF} leftIcon={<PiCertificate fontSize="18px" />} colorScheme="blue" variant="outline">
            Baixar Certificado
          </Button>
        )}
      </Flex>
      <Flex direction="column" p="0.35rem 1rem" fontWeight="700" color="gray700" gap="6px" h="100%" maxH="400px" overflowY="auto">
        <Skeleton isLoaded={!isLoading} h="2.75rem">
          {modules
            .sort((a, b) => a.position - b.position)
            .map((mod) => (
              <Flex
                key={mod.id}
                cursor={mod.is_available ? 'pointer' : 'not-allowed'}
                p="12px 8px"
                gap="1rem"
                display="flex"
                justify="space-between"
                onClick={() => mod.is_available && router.push(`/courses/${mod.hub_course_id}/${mod.id}?_p=${mod.title}`)}
                _hover={{ bg: `gray50` }}
                _notLast={{ borderBottom: '1px', borderColor: 'gray300' }}
                opacity={mod.is_available ? `1` : `0.75`}
              >
                <Flex gap="8px" align="center">
                  <Text noOfLines={1}>{mod.title}</Text>
                </Flex>
                <Flex w="320px" gap="12px" align="center" justify="flex-end">
                  {mod.is_available ? (
                    <>
                      <Progress value={mod.finished_lessons} rounded={8} flex="1" min={0} max={mod.lessons.length || 1} size="md" />
                      <Text fontWeight="500" align="center" fontSize="14px">
                        {`${mod.finished_lessons}/${mod.lessons.length}`}
                      </Text>
                    </>
                  ) : (
                    <>
                      <MdBlock fontSize="20px" />
                    </>
                  )}
                </Flex>
              </Flex>
            ))}
        </Skeleton>
      </Flex>
    </Flex>
  );
};

export default Course;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const selectedPage = 'courses';

  const courseId = `${query.course_id}`;
  const pageTitle = `${query._p || 'Certificado'}`;

  return { props: { courseId, pageTitle, selectedPage } };
};
