import { ReactNode } from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { FaTasks } from 'react-icons/fa';

import { HubModuleLessonType } from '@/_base/interfaces/module';
import { QuizPage } from './Quiz';
import { ILessonPageProps } from './interfaces';
import { MdTaskAlt } from 'react-icons/md';
import { AlgorithmPage } from './Algorithm';

export const LessonPage: React.FC<ILessonPageProps> = ({ challenge, dailyGame, registerAnswer }) => {
  const ContentPage: Record<HubModuleLessonType, ReactNode> = {
    quiz: <QuizPage challenge={challenge} registerAnswer={registerAnswer} />,
    algorithm: <AlgorithmPage challenge={challenge} registerAnswer={registerAnswer} />,
    map: <QuizPage challenge={challenge} registerAnswer={registerAnswer} />,
    video: <QuizPage challenge={challenge} registerAnswer={registerAnswer} />,
  };

  return (
    <Flex flex="1" bg="white" direction="column" borderRadius="md" p="1rem" gap="1rem" overflow="hidden" h="100%">
      <Flex direction="column" gap={{ base: `1rem` }}>
        <Flex justify="space-between">
          <Flex bg="#25467D" w="fit-content" justify="center" borderRadius="md" p="0.25rem 0.75rem" color="white" align="center" gap="0.5rem">
            <MdTaskAlt fontSize="1.5rem" />
            <Text fontSize="20px" whiteSpace="wrap">
              {challenge.title}
            </Text>
          </Flex>
          <Flex bg="#25467D" w="fit-content" justify="center" borderRadius="md" p="0.25rem 0.75rem" color="white" align="center" gap="0.5rem">
            <FaTasks fontSize="1.5rem" />
            <Text fontSize="20px" whiteSpace="wrap">
              {`${(dailyGame?.currentIndex || 0) + 1}/${dailyGame?.challenges.length}`}
            </Text>
          </Flex>
        </Flex>
        <Flex minH="5rem" align="center" maxW="85%" margin="auto">
          <Flex borderRadius="md" border="1px" borderColor="gray200" p="1rem 2rem" h="fit-content" margin="auto">
            <Text
              fontSize="16px"
              whiteSpace="wrap"
              dangerouslySetInnerHTML={{
                __html: challenge.description,
              }}
            />
          </Flex>
        </Flex>
      </Flex>
      {ContentPage[challenge.type]}
    </Flex>
  );
};
