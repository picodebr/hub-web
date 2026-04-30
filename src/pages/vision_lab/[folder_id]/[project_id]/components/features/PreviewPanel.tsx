import React, { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, X, Download } from 'lucide-react';
import { Box, Flex, Text, Heading, Button, IconButton, Image, Input } from '@chakra-ui/react';
import { keyframes as emotionKeyframes } from '@emotion/react';
import { useVisionLabStore } from '@/_base/hooks';
import { getModelArtifacts, getTrainedModel, predictImage } from '@/_base/lib/ml';
import { getGlobalWebcam, getGlobalWebcamStream } from '@/_base/lib/webcam';
import { getPresignedUrl } from '@/_base/services/upload';

// ==========================================
// ANIMAÇÕES
// ==========================================
const pulse = emotionKeyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// ==========================================
// PALETA DE CORES E ESTILOS
// ==========================================
const piBlue = '#0052CC';
const piGreen = '#10B981';

const customScrollbar = {
  '&::-webkit-scrollbar': { width: '6px', height: '6px' },
  '&::-webkit-scrollbar-track': { background: 'rgba(0, 0, 0, 0.05)', borderRadius: '4px' },
  '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' },
  '&::-webkit-scrollbar-thumb:hover': { background: '#94a3b8' },
};

// ==========================================
// COMPONENTE: PreviewPanel
// ==========================================
export function PreviewPanel() {
  const { classes, isTrained } = useVisionLabStore();
  const [mode, setMode] = useState<'webcam' | 'file'>('webcam');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [predictions, setPredictions] = useState<number[]>([]);
  const isPredictingRef = useRef(false);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!isTrained) return;

    const runPredictLoop = async () => {
      if (mode === 'webcam' && videoRef.current) {
        try {
          const scores = await predictImage(videoRef.current, true);
          setPredictions(scores);
        } catch (e) {}
      }

      if (isPredictingRef.current) {
        requestAnimationFrame(runPredictLoop);
      }
    };

    if (mode === 'webcam') {
      isPredictingRef.current = true;
      getGlobalWebcam().then((videoEl) => {
        if (videoRef.current && videoEl) {
          videoRef.current.srcObject = getGlobalWebcamStream();
          runPredictLoop();
        }
      });
    } else {
      isPredictingRef.current = false;
    }

    return () => {
      isPredictingRef.current = false;
    };
  }, [mode, isTrained]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    }
  };

  const onImageLoad = async () => {
    if (imageRef.current && isTrained) {
      try {
        const scores = await predictImage(imageRef.current, false);
        setPredictions(scores);
      } catch (e) {}
    }
  };

  const clearFile = () => {
    setFileUrl(null);
    setPredictions([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = async () => {
    const { link, full_path } = await getPresignedUrl(`application/octet-stream`, `vision-lab`, `public-read`);
    const model = getTrainedModel();
    if (model) {
      await model.save(link);

      const metadata = {
        labels: classes.map((c) => c.name),
        createdAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'picode-metadata.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // const handleExport = async () => {
  //   try {
  //     const model = getTrainedModel();
  //     if (model) {
  //       // 1. Pega os arquivos brutos do modelo
  //       const { modelJson, weightData } = await getModelArtifacts();

  //       // 2. Pega suas Presigned URLs (garanta que estão na mesma "pasta")
  //       const { link: jsonLink, full_path: jsonFullPath } = await getPresignedUrl(`application/json`, `vision-lab`, `public-read`);
  //       const { link: binLink, full_path: binFullPath } = await getPresignedUrl(`application/octet-stream`, `vision-lab`, `public-read`);
  //       console.log('binFullPath: ', binFullPath);
  //       console.log('jsonFullPath: ', jsonFullPath);

  //       // 3. Faz os uploads com o `fetch` ou `axios` diretamente
  //       await fetch(binLink, {
  //         method: 'PUT',
  //         body: weightData,
  //         headers: { 'Content-Type': 'application/octet-stream' },
  //       });

  //       await fetch(jsonLink, {
  //         method: 'PUT',
  //         body: JSON.stringify(modelJson),
  //         headers: { 'Content-Type': 'application/json' },
  //       });

  //       console.log('Upload concluído com sucesso!');
  //     }
  //   } catch (error) {
  //     console.error('Erro ao subir modelo:', error);
  //   }
  // };

  return (
    <Flex
      direction="column"
      bg="white"
      borderRadius="24px"
      p={{ base: 5, sm: 6 }}
      boxShadow="0 25px 50px -12px rgba(226, 232, 240, 0.5)"
      border="1px solid"
      borderColor="gray.100"
      flex={1}
      position="relative"
      overflow="hidden"
      minH={{ base: '450px', lg: '0' }}
      fontFamily='"Nunito", "Poppins", sans-serif'
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={3}>
          <Box
            w="10px"
            h="10px"
            borderRadius="full"
            bg={piGreen}
            boxShadow={`0 0 8px ${piGreen}`}
            animation={`${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`}
          />
          <Text size="md" fontWeight="black" color="gray.800" letterSpacing="tight">
            Câmera IA
          </Text>
        </Flex>

        <Flex align="center" gap={4}>
          <Flex bg="#F1F5F9" p={1} borderRadius="xl" boxShadow="inner">
            <Button
              size="sm"
              variant="unstyled"
              px={5}
              py={1.5}
              h="auto"
              borderRadius="lg"
              fontSize="xs"
              fontWeight="black"
              bg={mode === 'webcam' ? 'white' : 'transparent'}
              color={mode === 'webcam' ? piBlue : 'gray.400'}
              boxShadow={mode === 'webcam' ? 'sm' : 'none'}
              _hover={{ color: mode === 'webcam' ? piBlue : 'gray.600' }}
              onClick={() => setMode('webcam')}
            >
              Webcam
            </Button>
            <Button
              size="sm"
              variant="unstyled"
              px={5}
              py={1.5}
              h="auto"
              borderRadius="lg"
              fontSize="xs"
              fontWeight="black"
              bg={mode === 'file' ? 'white' : 'transparent'}
              color={mode === 'file' ? piBlue : 'gray.400'}
              boxShadow={mode === 'file' ? 'sm' : 'none'}
              _hover={{ color: mode === 'file' ? piBlue : 'gray.600' }}
              onClick={() => setMode('file')}
            >
              Arquivo
            </Button>
          </Flex>
          <Flex gap={1.5}>
            <IconButton
              aria-label="Fechar"
              icon={<X size={16} />}
              size="sm"
              bg="#F1F5F9"
              color="gray.400"
              borderRadius="lg"
              _hover={{ bg: 'gray.200' }}
            />
          </Flex>
        </Flex>
      </Flex>

      <Flex direction="column" flex={1} align="center" overflowY="auto" pr={1} sx={customScrollbar} minH="0">
        {/* Preview Area */}
        <Box w="full" maxW="360px" aspectRatio={4 / 3} mx="auto" mb={6} flexShrink={0} position="relative" role="group">
          <Box
            w="full"
            h="full"
            bg="black"
            borderRadius="32px"
            boxShadow="0 20px 50px -10px rgba(0,0,0,0.15)"
            overflow="hidden"
            position="relative"
            border="4px solid white"
          >
            {mode === 'webcam' ? (
              <Box as="video" ref={videoRef} autoPlay playsInline muted w="full" h="full" objectFit="cover" transform="scaleX(-1)" />
            ) : (
              <Flex w="full" h="full" position="relative" bg="gray.50" direction="column">
                {!fileUrl ? (
                  <Flex
                    flex={1}
                    direction="column"
                    align="center"
                    justify="center"
                    cursor="pointer"
                    border="4px dashed"
                    borderColor="gray.200"
                    m={5}
                    borderRadius="28px"
                    transition="all 0.2s"
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => fileInputRef.current?.click()}
                    role="group"
                  >
                    <Box
                      bg="white"
                      p={5}
                      borderRadius="full"
                      boxShadow="sm"
                      mb={3}
                      transition="transform 0.2s"
                      _groupHover={{ transform: 'scale(1.1)' }}
                    >
                      <ImageIcon size={32} color={piBlue} />
                    </Box>
                    <Text fontWeight="black" color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">
                      Enviar Foto
                    </Text>
                  </Flex>
                ) : (
                  <Box w="full" h="full" position="relative" p={2}>
                    <Image
                      ref={imageRef}
                      src={fileUrl}
                      onLoad={onImageLoad}
                      alt="Predição"
                      w="full"
                      h="full"
                      objectFit="contain"
                      borderRadius="24px"
                    />
                    <IconButton
                      aria-label="Limpar imagem"
                      icon={<X size={20} />}
                      position="absolute"
                      top={4}
                      right={4}
                      bg="rgba(255, 255, 255, 0.9)"
                      backdropFilter="blur(4px)"
                      color="red.500"
                      p={2.5}
                      borderRadius="2xl"
                      boxShadow="xl"
                      zIndex={20}
                      _hover={{ bg: 'red.50' }}
                      onClick={clearFile}
                    />
                  </Box>
                )}
              </Flex>
            )}
          </Box>
        </Box>

        {/* Progress Bars */}
        <Box w="full" px={1} flex={1} overflowY="auto" sx={customScrollbar} display="flex" flexDirection="column" gap={3}>
          {!isTrained ? (
            <Box bg="gray.50" p={5} borderRadius="2xl" border="1px solid" borderColor="gray.100" textAlign="center">
              <Text
                color="gray.400"
                fontSize="10px"
                fontWeight="black"
                textTransform="uppercase"
                letterSpacing="widest"
                animation={`${pulse} 2s infinite`}
              >
                Aguardando Treinamento...
              </Text>
            </Box>
          ) : (
            classes.map((cls, index) => {
              const score = predictions[index] || 0;
              const percent = Math.round(score * 100);
              return (
                <Flex key={cls.id} align="center" gap={2} role="group">
                  <Text
                    w={{ base: '14', sm: '16' }}
                    fontWeight="black"
                    fontSize="10px"
                    color="gray.400"
                    letterSpacing="widest"
                    isTruncated
                    textAlign="right"
                  >
                    {cls.name}
                  </Text>
                  <Box
                    flex={1}
                    h="8"
                    bg="#F1F5F9"
                    borderRadius="full"
                    position="relative"
                    overflow="hidden"
                    boxShadow="inner"
                    border="1px solid"
                    borderColor="whiteAlpha.500"
                  >
                    <Box
                      position="absolute"
                      left={0}
                      top={0}
                      h="full"
                      bg={piBlue}
                      transition={mode === 'webcam' ? 'none' : 'width 0.5s ease-out'}
                      borderRadius="full"
                      boxShadow="4px 0 12px rgba(0,82,204,0.2)"
                      w={`${percent}%`}
                    />
                    <Flex position="absolute" inset={0} align="center" justify="center">
                      <Text
                        fontSize={{ base: '10px', sm: 'xs' }}
                        fontWeight="black"
                        color="gray.400"
                        letterSpacing="tighter"
                        mixBlendMode="difference"
                        sx={{ color: 'white' }}
                      >
                        {percent}%
                      </Text>
                    </Flex>
                  </Box>
                </Flex>
              );
            })
          )}
        </Box>
      </Flex>

      {/* Input de arquivo invisível */}
      <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} display="none" />
    </Flex>
  );
}
