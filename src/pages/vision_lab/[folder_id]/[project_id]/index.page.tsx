'use client';

import { Bot, Download } from 'lucide-react';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { keyframes as emotionKeyframes } from '@emotion/react';
import { useAsyncCallback, useCustomToast, useTensorFlow, useVisionLabStore } from '@/_base/hooks';
import { ClassManager } from './components/features/ClassManager';
import { TrainingPanel } from './components/features/TrainingPanel';
import { PreviewPanel } from './components/features/PreviewPanel';
import { VisionLabWebcamModal } from './components/modals/WebcamModal';
import { VisionLabConfirmModal } from './components/modals/ConfirmModal';
import { GetServerSideProps } from 'next';
import { cookieManager } from '@/_base/utils';
import { InternalPageHeader } from '@/components/InternalPageHeader';
import { getModelArtifacts, getTrainedModel, loadModelFromUrls } from '@/_base/lib/ml';
import { getPresignedUrl } from '@/_base/services/upload';
import { useEffect, useState } from 'react';
import { IVisionLabProject } from '@/_base/interfaces/visionLab/IVisionLabProject';
import { getVisionLabProject, updateVisionLabProject } from '@/_base/services/visionLab';

// ==========================================
// ANIMAÇÕES
// ==========================================
const pulse = emotionKeyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
`;

const bounce = emotionKeyframes`
  0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
`;

// ==========================================
// PALETA DE CORES E ESTILOS
// ==========================================
const piBlue = '#0052CC';

const customScrollbar = {
  '&::-webkit-scrollbar': { width: '6px', height: '6px' },
  '&::-webkit-scrollbar-track': { background: 'rgba(0, 0, 0, 0.05)', borderRadius: '4px' },
  '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' },
  '&::-webkit-scrollbar-thumb:hover': { background: '#94a3b8' },
};

// ==========================================
// PÁGINA: Home
// ==========================================
export default function VisionLab({ projectId }: { projectId: string }) {
  const [targetProject, setTargetProject] = useState<IVisionLabProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { isLoaded, error } = useTensorFlow();
  const { classes, isTrained, initFromProject } = useVisionLabStore();
  const toast = useCustomToast();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const project = await getVisionLabProject(projectId);
        console.log('project: ', project);
        setTargetProject(project);
      } catch {
        toast({ status: `error`, description: `Não foi possível obter o projeto no momento` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLoaded || !targetProject?.model_path || !targetProject?.bin_path || !targetProject.labels?.length) return;
    (async () => {
      try {
        await loadModelFromUrls(targetProject.model_path!, targetProject.bin_path!);
        initFromProject(targetProject.labels);
      } catch {}
    })();
  }, [isLoaded, targetProject]);

  const handleSave = useAsyncCallback(
    async () => {
      setIsLoading(true);
      const model = getTrainedModel();
      if (model) {
        // 1. Pega os arquivos brutos do modelo
        const { modelJson, weightData } = await getModelArtifacts();

        // 2. Pega suas Presigned URLs (garanta que estão na mesma "pasta")
        const { link: jsonLink, full_path: jsonFullPath } = await getPresignedUrl(`application/json`, `vision-lab`, `public-read`);
        const { link: binLink, full_path: binFullPath } = await getPresignedUrl(`application/octet-stream`, `vision-lab`, `public-read`);

        // 3. Faz os uploads com o `fetch` ou `axios` diretamente
        await fetch(binLink, {
          method: 'PUT',
          body: weightData,
          headers: { 'Content-Type': 'application/octet-stream' },
        });

        await fetch(jsonLink, {
          method: 'PUT',
          body: JSON.stringify(modelJson),
          headers: { 'Content-Type': 'application/json' },
        });

        await updateVisionLabProject({ id: projectId, labels: classes.map((c) => c.name), bin_path: binFullPath, model_path: jsonFullPath });

        toast({ title: 'Upload concluído com sucesso!', position: `top-right`, status: `success` });
      }
    },
    [classes],
    true,
    () => setIsLoading(false),
  );

  // Tela de Erro Crítico
  if (error) {
    return (
      <Flex flex={1} align="center" justify="center" p={4} fontFamily='"Nunito", "Poppins", sans-serif'>
        <Box bg="red.50" color="red.500" p={6} borderRadius="2xl" boxShadow="sm">
          <Heading size="md" fontWeight="bold">
            {error}
          </Heading>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex h="100%" direction="column">
      <InternalPageHeader
        title={targetProject?.name || `Projeto`}
        buttons={isTrained ? [{ label: `Salvar Modelo`, leftIcon: <Download size={14} />, onClick: handleSave, isLoading }] : undefined}
      />
      {/* Main Container */}
      <Flex
        as="main"
        flex={1}
        direction={{ base: 'column', lg: 'row' }}
        position="relative"
        p={{ base: 2, lg: 4 }}
        gap={{ base: 3, lg: 4 }}
        overflowY={{ base: 'auto', lg: 'hidden' }}
        fontFamily='"Nunito", "Poppins", sans-serif'
      >
        {/* Loading Overlay */}
        <Flex
          position="absolute"
          inset={0}
          zIndex={100}
          bg="gray.50"
          direction="column"
          align="center"
          justify="center"
          opacity={isLoaded ? 0 : 1}
          pointerEvents={isLoaded ? 'none' : 'auto'}
          transition="opacity 0.5s ease-in-out"
          fontFamily='"Nunito", "Poppins", sans-serif'
          borderRadius="1rem"
        >
          <Flex direction="column" align="center" gap={6} animation={`${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`}>
            <Box animation={`${bounce} 1s infinite`}>
              <Bot size={64} color={piBlue} />
            </Box>
            <Text as="h2" fontSize="2xl" fontWeight="black" color="gray.700" letterSpacing="tight">
              Acordando a máquina...
            </Text>
          </Flex>
        </Flex>

        {/* Coluna 1: Classes */}
        <Flex
          w={{ base: 'full', lg: '33.333%' }}
          direction="column"
          zIndex={10}
          gap={4}
          order={1}
          overflowY={{ lg: 'auto' }}
          pb={2}
          sx={customScrollbar}
        >
          <ClassManager />
        </Flex>

        {/* Coluna 2: Treinamento */}
        <Flex
          w={{ base: 'full', lg: '33.333%' }}
          direction="column"
          zIndex={10}
          align="center"
          justify="center"
          order={2}
          py={{ base: 4, lg: 0 }}
          overflowY={{ lg: 'auto' }}
          sx={customScrollbar}
        >
          <TrainingPanel />
        </Flex>

        {/* Coluna 3: Preview/Predição */}
        <Flex w={{ base: 'full', lg: '33.333%' }} direction="column" zIndex={10} order={3} overflowY={{ lg: 'auto' }} pb={2} sx={customScrollbar}>
          <PreviewPanel />
        </Flex>
      </Flex>

      {/* Modais (Renderizados no mesmo nível da página) */}
      <VisionLabWebcamModal />
      <VisionLabConfirmModal />
    </Flex>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const selectedPage = 'vision_lab';

  try {
    cookieManager.updateToken(req);
    const pageTitle = query._p || 'Vision Lab';
    const projectId = query.project_id || ``;

    return { props: { selectedPage, pageTitle, projectId } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
