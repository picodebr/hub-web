import { Flex, Skeleton, Text } from '@chakra-ui/react';
import { PiSealCheckFill } from 'react-icons/pi';
import { ILessonPageProps } from './props';

export const QuizLesson: React.FC<ILessonPageProps> = ({ handleSubmitLesson, isLoading, lesson, lessonIsFinished }) => {
  return (
    <Flex direction="column" bgColor="white" borderRadius="md" flex="1" border="1px" borderColor="gray300" overflow="hidden" >
      <Flex p="1rem" gap="0.75rem" borderBottom="1px" borderColor="gray300" justify="center">
        <Flex direction="column" gap="0.75rem" flex="1">
          <Skeleton isLoaded={!isLoading} maxW="30%" display="flex" alignItems="center" gap="0.25rem">
            <Text noOfLines={1} fontWeight="500" fontSize="1rem" color="gray800">
              {lesson?.title || `Aula vazia`}
            </Text>
            {lessonIsFinished && (
              <Flex color="primary300">
                <PiSealCheckFill fontSize="1.2rem" filter="brightness(0.93)" />
              </Flex>
            )}
          </Skeleton>
          <Skeleton isLoaded={!isLoading} maxW="30%">
            {lesson?.description && (
              <Text noOfLines={1} color="gray500">
                {lesson.description}
              </Text>
            )}
          </Skeleton>
        </Flex>
        <Flex gap="0.5rem" align="center" h="fit-content">
          <Skeleton isLoaded={!isLoading} h="1.35rem">
            <Text noOfLines={1} color="gray800" fontSize="14px">
              {lesson?.module.title}
            </Text>
          </Skeleton>
        </Flex>
      </Flex>
      <Flex direction="column" flex="1" p={{ base: `1rem`, xl: '1rem' }} gap={{ base: `1rem`, xl: '1rem' }} overflow="hidden">
        <Flex direction="column" gap="0.5rem">
          <Skeleton isLoaded={!isLoading} minH="1.35rem">
            <Text fontSize="1rem">{lesson?.video?.title}</Text>
          </Skeleton>
          <Skeleton isLoaded={!isLoading} minH="1.35rem">
            <Text color="gray400">{lesson?.video?.description}</Text>
          </Skeleton>
        </Flex>
        <Flex flex="1" border="2px" borderColor="gray200" borderRadius="10px" overflow="hidden" justify="center">
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
            >
              <source src={lesson.video.file} type="video/mp4" />
            </video>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
