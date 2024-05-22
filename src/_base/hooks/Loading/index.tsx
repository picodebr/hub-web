import { PropsWithChildren, useContext, useEffect, useState, createContext } from 'react';
import { Flex, Image, Slide, Text, useColorMode } from '@chakra-ui/react';

import { ILoadingConfig, ILoadingContext, ILoadingProviderProps } from './interfaces';
import { useAuth } from '../Auth';
import { Logo } from '@/components/Logo';
import { formatShortName } from '@/_base/utils';

const defaultConfig: ILoadingConfig = { isLoading: false, type: 'spinner' };

const LoadingContext = createContext<ILoadingContext>({
  loadingConfig: { ...defaultConfig },
  setLoadingConfig: () => ({}),
  runTransition: () => ({}),
});

export const LoadingProvider: React.FC<PropsWithChildren<ILoadingProviderProps>> = ({ children, changeSignal }) => {
  const [loadingConfig, setLoadingConfig] = useState({ ...defaultConfig });
  const [randomMsg, setRandomMsg] = useState('');
  const { colorMode } = useColorMode();

  const { user } = useAuth();

  useEffect(() => {
    setLoadingConfig(() => ({ ...defaultConfig }));
    setRandomMsg(getRandomMessage());
  }, [changeSignal]);

  const runTransition = (time = 500) => {
    setLoadingConfig({ isLoading: true });
    setTimeout(() => setLoadingConfig({ isLoading: false }), time);
  };

  const getRandomMessage = () => {
    const randomMessage = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];

    return randomMessage;
  };

  return (
    <LoadingContext.Provider value={{ loadingConfig, setLoadingConfig, runTransition }}>
      <Flex
        position="fixed"
        overflow="hidden"
        width="100vw"
        height="100vh"
        zIndex="9999"
        bgColor="#00000055"
        // bg={loadingConfig.type === 'spinner' ? 'transparent' : 'primary100'}
        transition="all 0.35s"
        opacity={loadingConfig.isLoading ? '1' : '0'}
        pointerEvents={loadingConfig.isLoading ? 'auto' : 'none'}
      >
        {loadingConfig.type !== 'spinner' && (
          <>
            {/* <Image src="/patterns/line-pattern.svg" zIndex="-1" h={{ base: '0', lg: '445px' }} position="absolute" left="0" top="11.5rem" />
            <Image src="/patterns/line-pattern.svg" zIndex="-1" h={{ base: '0', lg: '445px' }} position="absolute" bottom="0" right="-5rem" /> */}
            <Image src={`/patterns/bg-${colorMode}.svg`} zIndex="-1" h={{ base: '0', lg: '0' }} />
          </>
        )}

        {loadingConfig.type === 'fullscreen' && (
          <Flex position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)">
            <Image src="/loading/rocket-loading.gif" />
          </Flex>
        )}

        {loadingConfig.type === 'spinner' && (
          <Slide direction="bottom" in={loadingConfig.isLoading} style={{ zIndex: 10, justifyContent: 'flex-end', display: 'flex' }}>
            <Flex w="100vw" h="100vh" align="center" justify="center">
              <Image src="/loading/rocket-picode.gif" h="16rem" m={{ base: '0 0 -2.5rem', sm: '0 1rem -1.5rem 0' }} />
            </Flex>
          </Slide>
        )}

        {loadingConfig.type === 'fullscreen-with-info' && (
          <Flex h="100%" width="100%" justifyContent="center" alignItems="center" boxShadow="md">
            <Flex
              bgColor="white"
              display="flex"
              w={{ base: '100%', sm: '450px' }}
              h={{ base: 'fit-content', sm: '557px' }}
              p="24px"
              direction="column"
              align="center"
              justifyContent="center"
              gap="2rem"
              borderRadius="12px"
              boxShadow="md"
            >
              <Logo size="md"></Logo>
              <Image src="/loading/rocket-loading.gif" />
              <Flex h="auto" w="100%" gap="1rem" direction="column">
                <Flex direction="column" justify="center">
                  {!!user?.name && (
                    <Flex gap="5px" direction="row">
                      <Text textAlign="center" color="gray900" fontWeight="600" fontSize="20px">
                        {(user.metadata.first_access || 0) > Date.now() - 1000 * 60 ? ` Seja muito bem-vindo(a),` : `Bem-vindo(a) de volta,`}
                      </Text>
                      <Text textAlign="center" color="primary300" fontWeight="600" fontSize="20px">
                        {formatShortName(user?.name, true)}
                      </Text>
                    </Flex>
                  )}
                </Flex>
                <Text fontSize="16px" color="gray500">
                  {randomMsg}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        )}
      </Flex>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

const LOADING_MESSAGES = [
  'Com determinação e esforço, cada desafio se transforma em uma oportunidade de aprendizado.',
  'É melhor você tentar algo, vê-lo não funcionar e aprender com isso, do que não fazer nada.',
  'Nossa maior fraqueza é desistir. O caminho mais certo para o sucesso é sempre tentar apenas uma vez mais.',
  'O tempo de estudo nunca é um tempo perdido.',
  'Estudar é investir no seu futuro.',
  'O sucesso não cai do céu. Ele exige muita luta, esforço, estudo e força de vontade.',
  'O fracasso é uma ótima oportunidade para começar de novo de forma mais inteligente.',
  'A melhor forma de prever o futuro é criá-lo.',
  'Sucesso é o acúmulo de pequenos esforços, repetidos dia e noite.',
  'Uma pessoa que nunca cometeu um erro nunca tentou nada novo.',
  'Seja claro no que você deseja e persevere através dos estudos. Dessa forma, você vai colher os frutos de todo este tempo investido.',
  'Comece de onde você está. Use o que você tiver. Faça o que você puder.',
  'Para grandes resultados não existem atalhos.',
  'Não deseje que as coisas sejam mais fáceis; deseje que você seja melhor.',
  'O único lugar onde o sucesso vem antes do trabalho é no dicionário.',
  'Motivação é aquilo que te faz começar. Hábito é o que te faz continuar.',
  'Educação é a arma mais poderosa que você pode usar para mudar o mundo.',
  'Aquele que faz perguntas é um bobo por cinco minutos. Mas aquele que jamais questiona é um bobo para sempre.',
  'O futuro pertence aqueles que acreditam na beleza dos seus sonhos.',
  'Professores podem abrir a porta, mas você precisa passar por ela por você mesmo.',
  'Se você não for atrás do que deseja, nunca o terá. Se você não perguntar, a resposta será sempre não. Se você não der um passo à frente, estará sempre no mesmo lugar.',
  'Não se culpe pelo que você não estudou ontem. Comece hoje e vá à luta!',
  'Não importa o quão devagar você vá, desde que você não pare.',
  'Por menor que seja o seu tempo de estudo, estude! Não tenha medo de crescer lentamente, tenha medo apenas de ficar parado!',
  'Acerte em tudo que puder acertar. Mas não se torture com seus erros. ',
  'A possibilidade de realizarmos um sonho é o que torna a vida interessante. ',
  'A vida é uma grande universidade, mas pouco ensina a quem não sabe ser aluno.',
  'Por medo de diminuir, deixamos de crescer. Por medo de chorar, deixamos de rir.',
  'Por meio do estudo você encontrará tudo que precisa para conquistar seus sonhos.',
  'Busque sempre o progresso, não a perfeição.',
  'Não deixe que a preguiça te impeça de estudar, ela só vai te atrasar a chegar ao seu objetivo.',
];
