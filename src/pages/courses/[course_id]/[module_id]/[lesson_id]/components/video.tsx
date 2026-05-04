import { Flex, Skeleton, Text, Badge, Icon, Button } from '@chakra-ui/react';
import { PiSealCheckFill } from 'react-icons/pi';
import { ArrowLeft } from 'lucide-react';
import { useCustomRouter } from '@/_base/hooks';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
import { ILessonPageProps } from './props';

export const VideoLesson: React.FC<ILessonPageProps> = ({ handleSubmitLesson, isLoading, lesson, lessonIsFinished }) => {
  const router = useCustomRouter();
  const { colorMode } = useDarkMode();

  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  return (
    <Flex direction="column" h="100%" gap="1.5rem" pb="2rem">
      {/* HEADER com Botão de Voltar e Status */}
      <Flex direction="column" gap="0.5rem">
        <Flex align="center" justify="space-between" gap="1rem">
          <Flex align="center" gap="1rem">
            <Flex
              userSelect="none"
              cursor="pointer"
              fontWeight="600"
              onClick={() => router.back()}
              pb="0.5rem"
              w="fit-content"
              pt="10px"
              transition="all 0.2s"
              _hover={{ transform: `scale(1.2)` }}
            >
              <ArrowLeft size={20} color={colorMode === 'dark' ? 'white' : 'black'} />
            </Flex>
            <Skeleton isLoaded={!isLoading} display="flex" alignItems="center" gap="0.5rem">
              <Text fontWeight="700" fontSize="22px" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                {lesson?.title || `Aula vazia`}
              </Text>
            </Skeleton>
          </Flex>
          
          {/* Badge de Status */}
          {lessonIsFinished && (
            <Skeleton isLoaded={!isLoading}>
              <Badge colorScheme="blue" variant="solid" borderRadius="full" px="3" py="1" display="flex" alignItems="center" gap="1" fontSize="12px" fontWeight="700">
                <Icon as={PiSealCheckFill} w="4" h="4" />
                Concluído
              </Badge>
            </Skeleton>
          )}
        </Flex>

        {/* Breadcrumb */}
        <Skeleton isLoaded={!isLoading} maxW="50%">
          <Flex align="center" gap="0.5rem" color="gray.500" fontSize="13px" ml="2.5rem">
            <Text>{lesson?.module.hub_course?.title || lesson?.module.title || `...`}</Text>
            <Text>·</Text>
            <Text>{lesson?.module.title || `...`}</Text>
          </Flex>
        </Skeleton>
      </Flex>

      {/* VIDEO PLAYER - Grande e Responsivo */}
      <Flex
        flex="1"
        direction="column"
        gap="1rem"
        bg={bgCard}
        p="1.5rem"
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
      >
        <Flex flex="1" borderRadius="xl" overflow="hidden" justify="center" align="center" bg="gray.900">
          {!!lesson?.video && (
            <video
              controls
              preload="none"
              autoPlay
              controlsList="nodownload"
              poster={lesson.video.thumbnail}
              onTimeUpdate={(e) =>
                ((e.target as any).currentTime / (e.target as any).duration) * 100 > 90 && !lessonIsFinished && handleSubmitLesson()
              }
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            >
              <source src={lesson.video.file} type="video/mp4" />
            </video>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
