import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Grid,
  Icon,
  Button,
  Spinner,
  Avatar,
  Badge,
} from '@chakra-ui/react';
import { FiAward, FiBook, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa6';
import NextImage from 'next/image';
import moment from 'moment';

import { IHubUser } from '@/_base/interfaces/user';
import { IHubCertificate } from '@/_base/interfaces/certificate';
import { getStudentExtract, IStudentExtract } from '@/_base/services/user';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
import { formatCoin } from '@/_base/utils';

interface StudentProfilePageProps {
  user: IHubUser;
  certificates: IHubCertificate[];
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ user, certificates }) => {
  const { colorMode } = useDarkMode();
  const [extract, setExtract] = useState<IStudentExtract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getStudentExtract();
        setExtract(data);
      } catch (error) {
        console.error('Erro ao carregar extrato:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Calculate streak (dias desde o primeiro acesso)
  const calculateStreak = () => {
    if (!user?.metadata?.first_access) return 0;
    const firstAccessDate = new Date(user.metadata.first_access);
    const today = new Date();
    const days = Math.floor((today.getTime() - firstAccessDate.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Calculate totals
  const totalCoins = user?.metadata?.coins || 0;
  const coursesCount = user?.hub_class ? 1 : 0; // Simplificado: 1 se tem classe
  const certificatesCount = certificates?.length || 0;
  const streak = calculateStreak();

  // Extract totals
  const totalPositive = extract
    .filter((e) => e.type === 'plus')
    .reduce((sum, e) => sum + parseFloat(e.value.toString()), 0);

  const totalNegative = extract
    .filter((e) => e.type === 'minor')
    .reduce((sum, e) => sum + parseFloat(e.value.toString()), 0);

  const bgColor = colorMode === 'dark' ? 'gray.800' : 'white';
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'gray.200';
  const textColor = colorMode === 'dark' ? 'white' : 'gray.900';
  const subtextColor = colorMode === 'dark' ? 'gray.400' : 'gray.600';

  return (
    <Flex direction="column" gap="1.5rem" w="100%" maxW="1000px" mx="auto" px="1.5rem">
      {/* ===== CARD TOPO - Resumo do Aluno ===== */}
      <Flex
        direction="column"
        align="center"
        gap="1.5rem"
        bg={bgColor}
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
        p="2rem 1.5rem"
      >
        {/* Avatar + Informações Básicas */}
        <Flex direction="column" align="center" gap="1rem" textAlign="center">
          {/* Avatar */}
          <Box position="relative">
            <Avatar
              name={user?.name}
              src={user?.avatar || ''}
              size="2xl"
              border="4px solid"
              borderColor={colorMode === 'dark' ? 'gray.700' : 'white'}
              boxShadow="lg"
            />
          </Box>

          {/* Nome + Username */}
          <Flex direction="column" gap="0.25rem">
            <Text fontSize="24px" fontWeight="700" color={textColor}>
              {user?.name}
            </Text>
            <Text fontSize="14px" color={subtextColor} fontWeight="500">
              @{user?.username}
            </Text>
          </Flex>
        </Flex>

        {/* Divider */}
        <Box w="100%" h="1px" bg={borderColor} />

        {/* Grid de Estatísticas */}
        <Grid templateColumns={{ base: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }} gap="1.5rem" w="100%">
          {/* Moedas */}
          <Flex direction="column" align="center" gap="0.5rem" p="1rem" borderRadius="lg" bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}>
            <Text fontSize="12px" fontWeight="600" color={subtextColor} textTransform="uppercase">
              Moedas
            </Text>
            <Text fontSize="20px" fontWeight="700" color="primary.500">
              {formatCoin(totalCoins)}
            </Text>
          </Flex>

          {/* Certificados */}
          <Flex direction="column" align="center" gap="0.5rem" p="1rem" borderRadius="lg" bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}>
            <Text fontSize="12px" fontWeight="600" color={subtextColor} textTransform="uppercase">
              Certificados
            </Text>
            <Text fontSize="20px" fontWeight="700" color="orange.500">
              {certificatesCount}
            </Text>
          </Flex>

          {/* Cursos */}
          <Flex direction="column" align="center" gap="0.5rem" p="1rem" borderRadius="lg" bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}>
            <Text fontSize="12px" fontWeight="600" color={subtextColor} textTransform="uppercase">
              Cursos
            </Text>
            <Text fontSize="20px" fontWeight="700" color="blue.500">
              {coursesCount}
            </Text>
          </Flex>

          {/* Sequência de Login (Streak) */}
          <Flex direction="column" align="center" gap="0.5rem" p="1rem" borderRadius="lg" bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}>
            <Text fontSize="12px" fontWeight="600" color={subtextColor} textTransform="uppercase">
              Sequência
            </Text>
            <Flex align="center" gap="0.5rem">
              <Icon as={FaFire} color="orange.400" fontSize="16px" />
              <Text fontSize="20px" fontWeight="700" color="orange.500">
                {streak}d
              </Text>
            </Flex>
          </Flex>
        </Grid>
      </Flex>

      {/* ===== CARDS ABAIXO - Extrato + Certificados ===== */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap="1.5rem" w="100%">
        {/* ESQUERDA - Extrato */}
        <Flex
          direction="column"
          bg={bgColor}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="sm"
          p="1.5rem"
          gap="1.5rem"
        >
          {/* Header */}
          <Flex align="center" gap="0.5rem">
            <Icon as={FiTrendingUp} color="primary.500" fontSize="20px" />
            <Text fontSize="18px" fontWeight="700" color={textColor}>
              Meu Extrato
            </Text>
          </Flex>

          {/* Summary Cards */}
          <Grid templateColumns="1fr 1fr" gap="1rem">
            {/* Entradas */}
            <Flex
              direction="column"
              gap="0.5rem"
              p="1rem"
              borderRadius="lg"
              bg={colorMode === 'dark' ? 'green.900/20' : 'green.50'}
              border="1px solid"
              borderColor={colorMode === 'dark' ? 'green.700/50' : 'green.200'}
            >
              <Flex align="center" gap="0.5rem">
                <Icon as={FiTrendingUp} color="green.500" fontSize="16px" />
                <Text fontSize="12px" fontWeight="600" color={colorMode === 'dark' ? 'green.400' : 'green.700'} textTransform="uppercase">
                  Recebido
                </Text>
              </Flex>
              <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'green.300' : 'green.600'}>
                +{formatCoin(totalPositive)}
              </Text>
            </Flex>

            {/* Saídas */}
            <Flex
              direction="column"
              gap="0.5rem"
              p="1rem"
              borderRadius="lg"
              bg={colorMode === 'dark' ? 'red.900/20' : 'red.50'}
              border="1px solid"
              borderColor={colorMode === 'dark' ? 'red.700/50' : 'red.200'}
            >
              <Flex align="center" gap="0.5rem">
                <Icon as={FiTrendingDown} color="red.500" fontSize="16px" />
                <Text fontSize="12px" fontWeight="600" color={colorMode === 'dark' ? 'red.400' : 'red.700'} textTransform="uppercase">
                  Gasto
                </Text>
              </Flex>
              <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'red.300' : 'red.600'}>
                -{formatCoin(totalNegative)}
              </Text>
            </Flex>
          </Grid>

          {/* Divider */}
          <Box w="100%" h="1px" bg={borderColor} />

          {/* Lista de Transações */}
          {loading ? (
            <Flex align="center" justify="center" h="200px">
              <Spinner size="md" color="primary.500" />
            </Flex>
          ) : extract.length > 0 ? (
            <Flex direction="column" gap="0.75rem" maxH="300px" overflowY="auto">
              {extract.slice(0, 8).map((item, idx) => (
                <Flex
                  key={`${item.label}-${idx}`}
                  align="center"
                  justify="space-between"
                  p="1rem"
                  bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                >
                  {/* Icon + Label */}
                  <Flex align="center" gap="0.75rem" flex="1" minW="0">
                    <Flex
                      w="36px"
                      h="36px"
                      borderRadius="full"
                      align="center"
                      justify="center"
                      flexShrink={0}
                      bg={item.type === 'plus' ? 'green.100' : 'red.100'}
                    >
                      <Icon
                        as={item.type === 'plus' ? FiTrendingUp : FiTrendingDown}
                        color={item.type === 'plus' ? 'green.600' : 'red.600'}
                        fontSize="16px"
                      />
                    </Flex>
                    <Flex direction="column" gap="0.125rem" minW="0">
                      <Text fontSize="13px" fontWeight="600" color={textColor} noOfLines={1}>
                        {item.label}
                      </Text>
                      <Text fontSize="12px" color={subtextColor}>
                        {moment(item.date).format('DD/MM/YYYY')}
                      </Text>
                    </Flex>
                  </Flex>

                  {/* Amount */}
                  <Text
                    fontSize="13px"
                    fontWeight="700"
                    color={item.type === 'plus' ? 'green.600' : 'red.600'}
                    ml="1rem"
                  >
                    {item.type === 'plus' ? '+' : '-'}
                    {formatCoin(parseFloat(item.value.toString()))}
                  </Text>
                </Flex>
              ))}
            </Flex>
          ) : (
            <Flex direction="column" align="center" justify="center" h="200px" color={subtextColor}>
              <Icon as={FiTrendingUp} fontSize="28px" mb="1rem" opacity={0.5} />
              <Text fontSize="14px" fontWeight="500">
                Nenhuma transação ainda
              </Text>
            </Flex>
          )}
        </Flex>

        {/* DIREITA - Certificados */}
        <Flex
          direction="column"
          bg={bgColor}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="sm"
          p="1.5rem"
          gap="1.5rem"
        >
          {/* Header */}
          <Flex align="center" gap="0.5rem">
            <Icon as={FiAward} color="orange.400" fontSize="20px" />
            <Text fontSize="18px" fontWeight="700" color={textColor}>
              Meus Certificados
            </Text>
          </Flex>

          {/* Lista de Certificados */}
          {certificates.length > 0 ? (
            <Flex direction="column" gap="0.75rem" maxH="400px" overflowY="auto">
              {certificates.map((certificate, index) => (
                <Flex
                  key={certificate.id}
                  direction="column"
                  gap="0.75rem"
                  p="1rem"
                  bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                  borderLeft="3px solid"
                  borderLeftColor="orange.400"
                  transition="all 0.2s"
                  _hover={{
                    bg: colorMode === 'dark' ? 'gray.600' : 'gray.100',
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                  }}
                >
                  {/* Título + Data */}
                  <Flex justify="space-between" align="flex-start">
                    <Flex direction="column" gap="0.25rem" flex="1">
                      <Text fontSize="14px" fontWeight="600" color={textColor} noOfLines={1}>
                        {certificate.title}
                      </Text>
                      <Text fontSize="12px" color={subtextColor}>
                        {moment(certificate.created_at).format('DD/MM/YYYY')}
                      </Text>
                    </Flex>
                    <Badge bg="orange.100" color="orange.700" borderRadius="md" fontSize="11px" fontWeight="600" ml="0.5rem" flexShrink={0}>
                      #{index + 1}
                    </Badge>
                  </Flex>

                  {/* Botão Visualizar */}
                  <Button
                    as="a"
                    href={certificate.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    variant="ghost"
                    colorScheme="orange"
                    fontSize="12px"
                    fontWeight="600"
                    w="fit-content"
                    _hover={{
                      bg: colorMode === 'dark' ? 'orange.900/30' : 'orange.100',
                      color: 'orange.600',
                    }}
                  >
                    Visualizar Certificado →
                  </Button>
                </Flex>
              ))}
            </Flex>
          ) : (
            <Flex direction="column" align="center" justify="center" h="200px" color={subtextColor}>
              <Icon as={FiAward} fontSize="28px" mb="1rem" opacity={0.5} />
              <Text fontSize="14px" fontWeight="500">
                Nenhum certificado obtido ainda
              </Text>
            </Flex>
          )}
        </Flex>
      </Grid>
    </Flex>
  );
};
