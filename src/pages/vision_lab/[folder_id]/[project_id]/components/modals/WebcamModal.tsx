import React, { useEffect, useRef, useState } from 'react';
import { X, Video as VideoIcon, Disc } from 'lucide-react';
import { Box, Flex, Text, Heading, Button, IconButton, Image } from '@chakra-ui/react';
import { keyframes as emotionKeyframes } from '@emotion/react';
import { useVisionLabStore } from '@/_base/hooks';
import { getGlobalWebcam, getGlobalWebcamStream } from '@/_base/lib/webcam';
import { extractFeatures } from '@/_base/lib/ml';

// ==========================================
// ANIMAÇÕES
// ==========================================
const float = emotionKeyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const popIn = emotionKeyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const pulseRecord = emotionKeyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// ==========================================
// PALETA DE CORES E ESTILOS
// ==========================================
const piBlue = '#0052CC';

const customScrollbar = {
  '&::-webkit-scrollbar': { height: '6px' },
  '&::-webkit-scrollbar-track': { background: 'rgba(0, 0, 0, 0.05)', borderRadius: '4px' },
  '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '4px' },
  '&::-webkit-scrollbar-thumb:hover': { background: '#94a3b8' },
};

// ==========================================
// COMPONENTE: WebcamModal
// ==========================================
export function VisionLabWebcamModal() {
  const { activeModalClassId, classes, closeWebcamModal, addSample } = useVisionLabStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeClass = classes.find((c) => c.id === activeModalClassId);

  useEffect(() => {
    if (activeModalClassId !== null) {
      getGlobalWebcam()
        .then(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = getGlobalWebcamStream();
          }
        })
        .catch(console.error);
    } else {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [activeModalClassId]);

  if (activeModalClassId === null || !activeClass) return null;

  const captureFrame = async () => {
    if (!videoRef.current) return;
    try {
      const { activation, thumbnail } = await extractFeatures(videoRef.current, true);
      addSample(activeClass.id, thumbnail, activation);
    } catch (err) {
      console.error(err);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    captureFrame(); // Capture first immediately
    recordIntervalRef.current = setInterval(captureFrame, 100); // 10 FPS
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
  };

  return (
    <Flex position="fixed" inset={0} zIndex={50} align="center" justify="center" p={4} fontFamily='"Nunito", "Poppins", sans-serif'>
      {/* Backdrop */}
      <Box
        position="absolute"
        inset={0}
        bg="rgba(15, 23, 42, 0.8)" // slate-900/80
        backdropFilter="blur(4px)"
        transition="opacity 0.2s"
        onClick={closeWebcamModal}
      />

      {/* Modal Content */}
      <Flex
        position="relative"
        bg="white"
        direction="column"
        borderRadius={{ base: '2xl', sm: '3xl' }}
        overflow="hidden"
        w="full"
        maxW="xl"
        maxH="95vh"
        h="auto"
        animation={`${float} 4s ease-in-out infinite`}
        boxShadow="0 0 0 4px rgba(255, 255, 255, 0.5), 0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        fontFamily='"Nunito", "Poppins", sans-serif'
      >
        {/* Header */}
        <Flex p={{ base: 3, sm: 4 }} borderBottom="1px solid" borderColor="gray.100" justify="space-between" align="center" bg="gray.50">
          <Flex align="center" gap={2}>
            <VideoIcon color={piBlue} size={20} />
            <Heading as="h3" fontSize="lg" fontWeight="bold" color="gray.700" fontFamily='"Nunito", "Poppins", sans-serif' mb={0} lineHeight="1">
              Capturar Imagens -{' '}
              <Box as="span" color={piBlue}>
                {activeClass.name}
              </Box>
            </Heading>
          </Flex>

          <IconButton
            aria-label="Fechar"
            icon={<X size={20} />}
            variant="ghost"
            color="gray.400"
            borderRadius="full"
            w={10}
            h={10}
            _hover={{ bg: 'red.100', color: 'red.500' }}
            onClick={closeWebcamModal}
          />
        </Flex>

        {/* Body */}
        <Flex
          flex={1}
          p={{ base: 4, sm: 6 }}
          direction="column"
          align="center"
          justify="center"
          gap={4}
          bg="rgba(249, 250, 251, 0.5)" // slate-50/50
          overflowY="auto"
        >
          {/* Video Container */}
          <Box
            position="relative"
            w="full"
            maxW="lg"
            aspectRatio={1} // Substitui aspect-square
            maxH={{ base: '40vh', md: '50vh' }}
            mx="auto"
            bg="black"
            borderRadius={{ base: '2xl', sm: '3xl' }}
            overflow="hidden"
            flexShrink={0}
            boxShadow="2xl"
            border="4px solid white" // Substitui ring-4 ring-white
          >
            <Box as="video" ref={videoRef} autoPlay playsInline muted w="full" h="full" objectFit="cover" transform="scaleX(-1)" />
            {isRecording && (
              <Box
                position="absolute"
                top={4}
                right={4}
                bg="red.600"
                color="white"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="widest"
                animation={`${pulseRecord} 1s cubic-bezier(0.4, 0, 0.6, 1) infinite`}
              >
                REC
              </Box>
            )}
          </Box>

          {/* Record Button */}
          <Button
            w="full"
            maxW="lg"
            bg="red.500"
            color="white"
            fontWeight="black"
            fontSize="xl"
            py={8} // Equivalente ao py-4 para um botão
            borderRadius="2xl"
            boxShadow="0 20px 25px -5px rgba(254, 202, 202, 0.5)" // shadow-xl shadow-red-200
            transition="all 0.2s"
            gap={2}
            userSelect="none"
            _hover={{ bg: 'red.600' }}
            _active={{ transform: 'scale(0.95)', boxShadow: 'sm' }}
            // Eventos de Gravação
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
          >
            <Disc size={24} />
            SEGURE PARA GRAVAR
          </Button>
        </Flex>

        {/* Footer (Thumbnails Recentes) */}
        <Box p={4} bg="white" borderTop="1px solid" borderColor="gray.100">
          <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2} px={1}>
            Capturadas Agora ({activeClass.samples.length})
          </Text>

          <Flex gap={2} overflowX="auto" pb={2} minH="80px" sx={customScrollbar}>
            {activeClass.samples.slice(-15).map((sample) => (
              <Box
                key={sample.id}
                w={16}
                h={16}
                borderRadius="lg"
                overflow="hidden"
                border="2px solid"
                borderColor="gray.200"
                position="relative"
                flexShrink={0}
                animation={`${popIn} 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`}
              >
                <Image src={sample.thumbnail} w="full" h="full" objectFit="cover" alt="sample" />
              </Box>
            ))}
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}
