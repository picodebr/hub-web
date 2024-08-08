import { Flex, Grid, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import { ILessonPageProps } from '../interfaces';
import { ISendQuizParams } from '@/_base/interfaces/challenges';
import { useEffect, useState } from 'react';

export const QuizPage: React.FC<Omit<ILessonPageProps, `onPageChange` | `onFinish`>> = ({ challenge, registerAnswer, answers }) => {
  const quizAnswers = answers as ISendQuizParams[];
  const [selectedAnswer, setSelectedAnswer] = useState<string>(quizAnswers.find((e) => e.hub_challenge_id === challenge.id)?.option || ``);

  useEffect(() => {
    setSelectedAnswer(quizAnswers.find((e) => e.hub_challenge_id === challenge.id)?.option || ``);
  }, [challenge, answers]);

  const onRegisterAnswer = (data: ISendQuizParams) => {
    setSelectedAnswer(data.option);
    registerAnswer(data);
  };
  return (
    <Flex flex="1" w="100%" p="2rem" bgImage="/patterns/cloudy.svg" bgPosition="bottom" bgSize="cover" borderRadius="md" justify="center">
      <Grid
        justifySelf="center"
        p="1rem"
        w="600px"
        h="fit-content"
        gap="1.5rem"
        gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))"
        gridTemplateRows="minmax(min-content, max-content)"
      >
        {challenge.data.quiz_answers?.map((e) => (
          <motion.button
            key={e.text}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            style={{
              padding: `0.5rem`,
              background: e.text === selectedAnswer ? `#32D583` : `white`,
              height: `fit-content`,
              borderRadius: `6px`,
              border: e.text === selectedAnswer ? `1px solid #D1FADF` : undefined,
              color: e.text === selectedAnswer ? `#fefefe` : undefined,
              display: `flex`,
            }}
            onClick={() => onRegisterAnswer({ hub_challenge_id: challenge.id, option: e.text })}
          >
            <Text textAlign="center" w="100%" whiteSpace="wrap" fontWeight="500">
              {e.text}
            </Text>
          </motion.button>
        ))}
      </Grid>
    </Flex>
  );
};
