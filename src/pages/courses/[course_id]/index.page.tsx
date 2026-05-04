import { GetServerSideProps } from 'next';

import { Button, Flex, Grid, Progress, Skeleton, Text, useColorMode, Badge, Icon, Box } from '@chakra-ui/react';
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
import { FaChalkboardTeacher } from 'react-icons/fa';
import { FiBook } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8 pt-2 w-full max-w-6xl mx-auto">
          {modules.length ? (
            modules.map((mod, index) => {
              const gradients = [
                'from-sky-400 to-blue-600',
                'from-violet-400 to-purple-600',
                'from-emerald-400 to-teal-600',
                'from-amber-400 to-orange-600',
                'from-pink-400 to-rose-600',
                'from-cyan-400 to-sky-600',
              ];
              const gradient = gradients[index % gradients.length];
              const percentage = mod.lessons.length > 0 ? Math.ceil((mod.finished_lessons / mod.lessons.length) * 100) : 0;
              const isFinished = percentage === 100 && mod.lessons.length > 0;
              const isStarted = percentage > 0;

              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={mod.is_available ? { y: -4 } : {}}
                  onClick={() => mod.is_available && router.push(`/courses/${mod.hub_course_id}/${mod.id}?_p=${mod.title}`)}
                  className={`group relative rounded-2xl hover:shadow-lg transition-all duration-300 ${mod.is_available ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'} border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col h-fit p-4`}
                >
                  {/* Gradiente Superior com Número do Módulo */}
                  <div
                    className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden shrink-0 rounded-xl`}
                  >
                    {/* Padrão decorativo de linhas */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(255,255,255,0.8) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.8) 2px, transparent 2px)',
                        backgroundSize: '16px 16px',
                        zIndex: 1,
                      }}
                    />
                    {/* Número do Módulo */}
                    <Flex position="absolute" inset="0" align="center" justify="center" zIndex={2}>
                      <Text fontSize="4xl" fontWeight="900" color="white" opacity={0.8}>
                        {index + 1}
                      </Text>
                    </Flex>

                    {/* Status Badge - Top Right */}
                    <Box position="absolute" top="2" right="2" zIndex={10}>
                      {mod.is_available ? (
                        isFinished ? (
                          <Badge colorScheme="green" variant="solid" borderRadius="full" px="2" py="1" fontSize="10px" fontWeight="700">
                            NOVO
                          </Badge>
                        ) : isStarted ? (
                          <Badge colorScheme="blue" variant="solid" borderRadius="full" px="2" py="1" fontSize="10px" fontWeight="700">
                            {percentage}%
                          </Badge>
                        ) : (
                          <Badge colorScheme="blue" variant="solid" borderRadius="full" px="2" py="1" fontSize="10px" fontWeight="700">
                            NOVO
                          </Badge>
                        )
                      ) : (
                        <Badge colorScheme="red" variant="solid" borderRadius="full" px="2" py="1" fontSize="10px" fontWeight="700">
                          BLOQUEADO
                        </Badge>
                      )}
                    </Box>
                  </div>

                  {/* Conteúdo do Módulo */}
                  <Flex direction="column" gap="0.75rem" flex="1" mt="0.5rem">
                    {/* Título */}
                    <Text fontSize="14px" fontWeight="700" color={colorMode === 'light' ? 'gray.800' : 'gray.100'} noOfLines={2}>
                      {mod.title}
                    </Text>

                    {/* Quantidade de Aulas */}
                    <Text fontSize="12px" color={colorMode === 'light' ? 'gray.600' : 'gray.400'} fontWeight="500">
                      {mod.lessons.length} aula{mod.lessons.length !== 1 ? 's' : ''}
                    </Text>

                    {/* Barra de Progresso */}
                    {mod.is_available && (
                      <>
                        <Progress value={percentage} min={0} max={100} size="sm" borderRadius="full" colorScheme={isFinished ? 'green' : 'blue'} bg={colorMode === 'light' ? 'gray.200' : 'gray.700'} mt="0.25rem" />

                        {/* Aulas Concluídas */}
                        <Text fontSize="11px" color={colorMode === 'light' ? 'gray.600' : 'gray.400'} fontWeight="500">
                          {mod.finished_lessons}/{mod.lessons.length} aulas concluídas
                        </Text>
                      </>
                    )}
                  </Flex>
                </motion.div>
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
