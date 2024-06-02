import { Flex, Grid, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import { ILessonPageProps } from '../interfaces';

export const QuizPage: React.FC<ILessonPageProps> = ({ challenge, registerAnswer }) => {
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
              background: `white`,
              height: `fit-content`,
              borderRadius: `6px`,
              display: `flex`,
            }}
            onClick={() => registerAnswer(e.text)}
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
