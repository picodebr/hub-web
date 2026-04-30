import { GetServerSideProps } from 'next';

import { Button, Flex, Grid, Progress, Skeleton, Text, useColorMode } from '@chakra-ui/react';
import { useCustomRouter, useCustomToast } from '@/_base/hooks';
import { useCallback, useEffect, useState } from 'react';
import { IHubModule } from '@/_base/interfaces/module';
import { getCourseActivity, listCourses, listModules } from '@/_base/services/course';
import { degrees, PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import { MdBlock } from 'react-icons/md';
import { IHubCourse } from '@/_base/interfaces/course';
import { formatShortName } from '@/_base/utils';
import { useProfile } from '@/components/Page/hooks';
import { PiCertificate } from 'react-icons/pi';
import { getCertificateByCourse, listUserCertificates, registerCertificate } from '@/_base/services/certificates';
import { ICertificateTemplate } from '@/_base/interfaces/certificate/ICertificateTemplate';
import { IHubCertificate } from '@/_base/interfaces/certificate';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { InternalPageHeader } from '@/components/InternalPageHeader';
import { InternalCard } from '@/components/InternalCard';
import { FaChalkboardTeacher } from 'react-icons/fa';

interface IProps {
  courseId: string;
  certificate: string;
}

// const getFormattedDate = () => {
//   const today = new Date();

//   const day = today.getDate();
//   const month = today.toLocaleString('pt-BR', { month: 'long' });
//   const year = today.getFullYear();

//   return { day, month, year };
// };

const Course: React.FC<IProps> = ({ courseId }) => {
  const [modules, setModules] = useState<(IHubModule & { finished_lessons: number })[]>([]);
  const [course, setCourse] = useState<IHubCourse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [certificateTemplate, setCertificateTemplate] = useState<ICertificateTemplate | null>(null);
  const [userCertificates, setUserCertificates] = useState<IHubCertificate[]>([]);
  const allModulesFinished = modules.every((mod) => mod.finished_lessons === mod.lessons.length);

  const { user } = useProfile();
  const toast = useCustomToast();
  const router = useCustomRouter();
  const { colorMode } = useColorMode();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [{ results }, activity, coursesResponse, certTemplate, userCerts] = await Promise.all([
          listModules(courseId),
          getCourseActivity(courseId),
          listCourses(),
          getCertificateByCourse(courseId),
          listUserCertificates(),
        ]);
        const targetCourse = coursesResponse.results.find((c) => c.id === courseId) || null;

        setCertificateTemplate(certTemplate?.templates[0] || null);
        setUserCertificates(userCerts);
        setCourse(targetCourse);
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
  useEffect(() => {
    if (allModulesFinished && certificateTemplate) {
      handleGeneratePDF();
    }
  }, [allModulesFinished, certificateTemplate]);

  const downloadCertificate = (pdfUrl: string, fileName: string, state: string) => {
    const link = document.createElement('a');
    link.setAttribute(`target`, `_blank`);
    if (state === `a`) {
      link.href = pdfUrl;
      link.download = fileName;
    }
    link.click();
  };

  const handleDownloadCertificate = () => {
    const ownCert = userCertificates.find((c) => c.hub_course_id === courseId);
    if (ownCert?.link) {
      downloadCertificate(ownCert.link, `Certificado ${course?.title || 'curso'}.pdf`, 'a');
    } else {
      toast({ status: `error`, description: `Certificado não gerado.` });
    }
  };

  const handleGeneratePDF = useCallback(async () => {
    if (!course || !certificateTemplate) return;

    try {
      setLoadingPdf(true);
      const ownCert = userCertificates.find((c) => c.hub_course_id === courseId);

      let pdfUrl = ownCert?.link;

      if (!pdfUrl) {
        const response = await fetch(certificateTemplate.link);
        const existingPdfBytes = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        pdfDoc.registerFontkit(fontkit);

        const fontBytes2 = await fetch('/fonts/noteworthy.ttf').then((res) => res.arrayBuffer());
        const noteWorthyFont = await pdfDoc.embedFont(fontBytes2);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const text = formatShortName(user?.name, true);
        const fontSize = 40;
        const maxWidth = 612;
        const textWidth = noteWorthyFont.widthOfTextAtSize(text, fontSize);
        const centeredX = 115 + (maxWidth - textWidth) / 2;
        // const { day, month, year } = getFormattedDate();
        firstPage.drawText(`${formatShortName(user?.name, true)}`, {
          x: centeredX,
          y: 298,
          size: fontSize,
          font: noteWorthyFont,
          color: rgb(0.122, 0.114, 0.239),
          rotate: degrees(0),
          maxWidth: maxWidth,
        });
        // firstPage.drawText(
        //   `concluiu com êxito o curso ${course.title}, na PiCode, com carga horária total de ${course.hours} horas, desenvolvendo habilidades essenciais para aplicar metodologias e ferramentas PiCode® em sala de aula.`,
        //   {
        //     x: 276,
        //     y: 265,
        //     size: 14,
        //     lineHeight: 24,
        //     font: fieldGothicFont,
        //     color: rgb(0.122, 0.114, 0.239),
        //     rotate: degrees(0),
        //     maxWidth: 470,

        //   },
        // );

        // firstPage.drawText(`Sorocaba, ${day} de ${month} de ${year}`, {
        //   x: 450,
        //   y: 165,
        //   size: 20,
        //   font: helveticaFont,
        //   color: rgb(0, 0, 0),
        //   rotate: degrees(0),
        // });
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        pdfUrl = URL.createObjectURL(blob);
        const presigned = await getPresignedUrl(`application/pdf`, `certificates`);
        const file = new File([blob], presigned.path.split(`/`).at(-1) || `doc.pdf`, { type: 'application/pdf' });
        await uploadFile(presigned.link, file);
        const newCertificate = await registerCertificate(courseId, presigned.path);
        setUserCertificates((e) => [...e, newCertificate]);
      }
      downloadCertificate(pdfUrl, `Certificado ${course.title}.pdf`, 'b');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert('Erro ao carregar PDF: ' + errorMessage);
    } finally {
      setLoadingPdf(false);
    }
  }, [course, certificateTemplate]);

  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  return (
    <Flex flex="1" direction="column" h="100%" overflowY="auto" overflowX="hidden" pb="2rem" pr="0.5rem">
      {/* Cabeçalho da Página */}
      <InternalPageHeader
        title={course?.title || `Curso`}
        description={course?.description || ``}
        actions={
          allModulesFinished && certificateTemplate
            ? [
                <Button
                  onClick={handleDownloadCertificate}
                  leftIcon={<PiCertificate fontSize="18px" />}
                  colorScheme="blue"
                  variant="outline"
                  isLoading={loadingPdf}
                >
                  Baixar Certificado
                </Button>,
              ]
            : undefined
        }
      />
      {/* Conteúdo Principal */}
      {isLoading ? (
        <Grid gap="1.5rem" gridTemplateColumns="repeat(auto-fill, minmax(260px, 1fr))">
          {[1, 2, 3, 4].map((i) => (
            <Flex key={i} direction="column" borderRadius="2xl" overflow="hidden" border="1px solid" borderColor={borderColor}>
              <Skeleton h="200px" w="100%" />
              <Flex direction="column" p="1.25rem" gap="1rem" bg={bgCard}>
                <Skeleton h="20px" w="80%" />
                <Skeleton h="10px" w="100%" />
              </Flex>
            </Flex>
          ))}
        </Grid>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 overflow-y-auto pb-8 px-2 content-start h-full pt-2">
          {modules.length ? (
            modules.map((mod, index) => {
              return (
                <InternalCard
                  key={mod.id}
                  index={index}
                  onClick={() => mod.is_available && router.push(`/courses/${mod.hub_course_id}/${mod.id}?_p=${mod.title}`)}
                  title={mod.title}
                  Icon={FaChalkboardTeacher}
                  footer={
                    mod.is_available ? (
                      <>
                        <Progress value={mod.finished_lessons} rounded={8} flex="1" min={0} max={mod.lessons.length || 1} size="md" />
                        <Text fontWeight="500" align="center" fontSize="14px">
                          {`${mod.finished_lessons}/${mod.lessons.length}`}
                        </Text>
                      </>
                    ) : (
                      <MdBlock fontSize="20px" />
                    )
                  }
                  showFooterIcon={mod.is_available}
                />
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground mt-10">
              <FaChalkboardTeacher className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-foreground/70">Lista vazia</p>
            </div>
          )}
        </div>
      )}
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
