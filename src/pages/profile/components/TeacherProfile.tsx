import { useState, useEffect } from 'react';
import { FiFileText, FiHelpCircle, FiFolder, FiCamera, FiExternalLink } from 'react-icons/fi';
import moment from 'moment';
import { Uploader } from 'rsuite';
import { Spinner } from 'rsuite';
import {
  Flex,
  Grid,
  Text,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
} from '@chakra-ui/react';
import NextImage from 'next/image';

import { IProfileComponentProps } from './interfaces';
import { useCustomRouter } from '@/_base/hooks';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { updateProfile } from '@/_base/services/user';
import { useAvatar } from '@/components/Page/hooks';

type GuideType = { label: string; instructions: string };

export const TeacherProfile: React.FC<IProfileComponentProps> = ({ projects, user }) => {
  const { colorMode } = useDarkMode();
  const router = useCustomRouter();
  const { setAvatar } = useAvatar();
  const [isUpdating, setIsUpdating] = useState(false);

  const guides: GuideType[] = [
    {
      label: 'Como navegar pela plataforma?',
      instructions: 'Você pode navegar pelo Hub utilizando o menu à esquerda e selecionando a sessão que deseja ver.',
    },
    {
      label: 'Como abrir o livro na plataforma?',
      instructions:
        'Para abrir um livro, basta entrar na sessão "Biblioteca" e selecionar, no menu superior, o tipo do livro desejado. Caso deseje consultar um planejamento, este se encontrará em "Materiais Complementares".',
    },
    {
      label: 'Como criar um novo projeto?',
      instructions:
        'Para criar um novo projeto, entre em "Turmas", selecione a turma, navegue até a aba "Projetos" e clique em "Novo Projeto". Você pode usar nossa IA para mapear tudo rapidamente.',
    },
    {
      label: 'Como acessar minhas turmas?',
      instructions: 'Selecione "Turmas" no menu à esquerda. Se não aparecerem, clique em "Adicionar turmas" e selecione as que você é responsável.',
    },
    {
      label: 'O que fazer se meu aluno esquecer a senha?',
      instructions: 'Acesse "Turmas" > Selecione a Turma > Aba "Alunos" > Clique no aluno > Clique no botão "Resetar Senha".',
    },
    {
      label: 'Como pedir um novo produto na loja?',
      instructions: 'Os alunos compram no ambiente do projeto. Você deve aprovar o pedido deles pelo Hub, na sessão "Estoque Maker", aba "Pedidos".',
    },
  ];

  const handleUploadAvatar = async (file?: File) => {
    if (file) {
      setIsUpdating(true);
      const response = await getPresignedUrl(file.type, 'avatars');
      await uploadFile(response.link, file);

      setTimeout(async () => {
        const updatedUser = await updateProfile({ avatar: response.path });
        setAvatar(updatedUser.avatar || ``);
        setIsUpdating(false);
      }, 1000);
    }
  };

  return (
    <Flex direction="column" gap="0" w="100%">
      {/* Seção de Perfil Principal */}
      <Flex
        direction="column"
        align="center"
        gap="1.5rem"
        bg={colorMode === 'dark' ? 'gray.800' : 'white'}
        borderRadius="2xl"
        border="1px solid"
        borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        boxShadow="sm"
        p="2rem 1.5rem"
        mx="1.5rem"
      >
        {/* Avatar com Upload */}
        <Flex position="relative">
          <Flex
            w="120px"
            h="120px"
            borderRadius="full"
            border="4px solid"
            borderColor={colorMode === 'dark' ? 'gray.700' : 'white'}
            boxShadow="lg"
            overflow="hidden"
            bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
            align="center"
            justify="center"
          >
            <NextImage
              loader={() => user?.avatar}
              src={user?.avatar || ''}
              width={120}
              height={120}
              alt="Avatar"
              style={{ opacity: isUpdating ? 0.4 : 1, borderRadius: '50%', objectFit: 'cover' }}
              priority
            />
            {isUpdating && (
              <Flex borderRadius="50%" position="absolute" inset="0" align="center" justify="center" bg="rgba(0,0,0,0.3)">
                <Spinner size="sm" />
              </Flex>
            )}
          </Flex>

          {/* Botão de câmera para upload */}
          <Uploader
            autoUpload={true}
            accept={`image/*`}
            draggable={false}
            action=""
            fileListVisible={false}
            onChange={(e) => handleUploadAvatar(e[0]?.blobFile as File)}
            toggleAs={(e) => (
              <Flex
                border="2px solid"
                borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
                borderRadius="full"
                p="0.5rem"
                bg={colorMode === 'dark' ? 'gray.700' : 'white'}
                position="absolute"
                bottom="-2px"
                right="-2px"
                cursor="pointer"
                boxShadow="md"
                transition="all 0.2s"
                _hover={{ transform: 'scale(1.1)', borderColor: 'primary500' }}
                color="gray500"
                onClick={() => e.onClick(e)}
              >
                <FiCamera size="1rem" />
              </Flex>
            )}
          />
        </Flex>

        {/* Nome e Email */}
        <Flex direction="column" align="center" gap="0.5rem" textAlign="center">
          <Text fontSize="22px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.900'}>
            {user?.name || 'Professor'}
          </Text>

          {/* E-mail */}
          <Text fontSize="13px" color="gray.500" fontWeight="500">
            {user?.email || 'email@picode.com.br'}
          </Text>

          {/* Biografia */}
          {user?.bio && (
            <Text fontSize="13px" color="gray.600" fontWeight="400" maxW="400px" mt="0.5rem">
              {user.bio}
            </Text>
          )}
        </Flex>
      </Flex>

      {/* Seção Superior: Guia e Vídeo */}
      <Grid templateColumns={{ base: '1fr', xl: '1.25fr 0.75fr' }} gap="1.5rem" mt="1.5rem" mx="1.5rem">
        {/* Guia Rápido (FAQ) */}
        <Flex
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          direction="column"
          borderRadius="2xl"
          border="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
          boxShadow="sm"
          p="1.5rem"
          maxH="380px"
          overflow="hidden"
        >
          <Flex align="center" gap="0.5rem" mb="1rem">
            <Icon as={FiHelpCircle} color="primary.500" fontSize="20px" />
            <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
              Guia Rápido
            </Text>
          </Flex>
          <Flex direction="column" flex="1" overflowY="auto" pr="0.5rem">
            <Accordion allowToggle>
              {guides.map((guide, i) => (
                <AccordionItem
                  key={i}
                  border="1px"
                  mb="0.5rem"
                  bg={colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.50'}
                  borderRadius="lg"
                  borderColor={colorMode === 'dark' ? '#2D3748' : '#E2E8F0'}
                >
                  <AccordionButton _hover={{ bg: 'transparent' }} borderRadius="lg">
                    <Box flex="1" textAlign="left" fontWeight="600" fontSize="14px" color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}>
                      {guide.label}
                    </Box>
                    <AccordionIcon color="gray.500" />
                  </AccordionButton>
                  <AccordionPanel pb={4} pt={0} fontSize="13px" color="gray.500" lineHeight="1.6">
                    {guide.instructions}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Flex>
        </Flex>

        {/* Vídeo de Boas Vindas */}
        <Flex
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          direction="column"
          borderRadius="2xl"
          border="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
          boxShadow="sm"
          p="1.5rem"
          maxH="380px"
          display={{ base: 'none', xl: 'flex' }}
        >
          <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'} mb="1rem">
            Boas-vindas à PiCode 🚀
          </Text>
          <Flex flex="1" borderRadius="xl" overflow="hidden" justify="center" align="center">
            <video width="100%" height="100%" controls preload="metadata" style={{ objectFit: 'cover' }}>
              <source src="https://picode-public.s3.amazonaws.com/hub-videos/Apresenta%C3%A7%C3%A3o+professores+com+intro+.mp4" type="video/mp4" />
            </video>
          </Flex>
        </Flex>
      </Grid>

      {/* Seção Inferior: Projetos Recentes */}
      {projects?.length > 0 && (
        <Flex bg={colorMode === 'dark' ? 'gray.800' : 'white'} direction="column" borderRadius="2xl" border="1px solid" borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'} boxShadow="sm" p="2rem" mt="1.5rem" mx="1.5rem">
          <Flex align="center" justify="space-between" mb="2rem">
            <Flex align="center" gap="0.75rem">
              <Flex w="10" h="10" borderRadius="lg" bg="primary.500" align="center" justify="center">
                <Icon as={FiFolder} color="white" fontSize="20px" />
              </Flex>
              <Text fontSize="20px" fontWeight="800" color={colorMode === 'dark' ? 'white' : 'gray.900'}>
                Meus Projetos Recentes
              </Text>
            </Flex>
            <Button size="sm" variant="ghost" colorScheme="primary" fontSize="13px" fontWeight="600" onClick={() => router.push('/projects')}>
              Ver todos →
            </Button>
          </Flex>

          <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }} gap="1.5rem">
            {projects
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .slice(0, 6)
              .map((project, index) => {
                const colors = ['cyan', 'purple', 'orange', 'pink', 'green', 'blue'];
                const colorScheme = colors[index % colors.length];
                
                return (
                  <Flex
                    key={project.id}
                    direction="column"
                    justify="space-between"
                    p="1.5rem"
                    bg={colorMode === 'dark' ? 'whiteAlpha.50' : `${colorScheme}.50`}
                    borderRadius="xl"
                    border="2px solid"
                    borderColor={colorMode === 'dark' ? 'whiteAlpha.100' : `${colorScheme}.100`}
                    borderLeft="5px solid"
                    borderLeftColor={`${colorScheme}.500`}
                    cursor="pointer"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    position="relative"
                    overflow="hidden"
                    _hover={{
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
                      bg: colorMode === 'dark' ? 'whiteAlpha.100' : `${colorScheme}.100`,
                      borderColor: colorMode === 'dark' ? 'whiteAlpha.200' : `${colorScheme}.200`,
                    }}
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    {/* Background decoration */}
                    <Box
                      position="absolute"
                      top="-40px"
                      right="-40px"
                      w="100px"
                      h="100px"
                      borderRadius="full"
                      bg={`${colorScheme}.200`}
                      opacity="0.1"
                      pointerEvents="none"
                    />
                    
                    <Box>
                      <Flex align="center" gap="0.75rem" mb="1rem">
                        <Flex
                          w="9"
                          h="9"
                          borderRadius="md"
                          bg={`${colorScheme}.500`}
                          align="center"
                          justify="center"
                          flexShrink={0}
                        >
                          <Icon as={FiFolder} color="white" fontSize="18px" />
                        </Flex>
                        <Text fontWeight="700" fontSize="15px" color={colorMode === 'dark' ? 'white' : 'gray.900'} noOfLines={2}>
                          {project.title}
                        </Text>
                      </Flex>
                    </Box>
                    
                    <Flex justify="space-between" align="center" pt="1rem" borderTop="1px solid" borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : `${colorScheme}.200`}>
                      <Text fontSize="12px" color={colorMode === 'dark' ? 'whiteAlpha.700' : 'gray.600'} fontWeight="500">
                        {moment(project.updated_at).format('DD/MM/YYYY')}
                      </Text>
                      <Icon as={FiExternalLink} color={`${colorScheme}.500`} fontSize="16px" transition="all 0.2s" />
                    </Flex>
                  </Flex>
                );
              })}
          </Grid>
        </Flex>
      )}
    </Flex>
  );
};
