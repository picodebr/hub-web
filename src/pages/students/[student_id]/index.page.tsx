import { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import {
  Flex,
  Image,
  Link,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure,
  Avatar,
  Box,
  Button,
  Grid,
  Icon,
  IconButton,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { FiUsers, FiKey, FiMinus, FiPlus, FiTarget, FiAlertCircle } from 'react-icons/fi';
import { TbMathSymbols, TbCode } from 'react-icons/tb';

import { logError, cookieManager, formatShortName, formatCoin, showErrorToClient } from '@/_base/utils';
import { getStudent, redefineStudentPassword } from '@/_base/services/user';
import { IHubUser } from '@/_base/interfaces/user';
import { CoinIcon } from '@/components/Logo';
import { SmallModal } from '@/components/Modal/Small';
import { NumberScaleInput } from '@/components/Inputs/NumberScale';
import { useAsyncCallback, useCustomToast } from '@/_base/hooks';
import { updateStudentData } from '@/_base/services/student/updateStudentData';
import { GenericButton } from '@/components/Buttons/Generic';
import { PasswordInput } from '@/components/Inputs/Password';
import { InputValueType } from '@/_base/interfaces/shared';

interface IRedefineData {
  password: InputValueType<string>;
  password_confirmation: InputValueType<string>;
}

interface IProps {
  student: IHubUser;
}

const StudentPage: React.FC<IProps> = ({ student: _student }) => {
  const { colorMode } = useColorMode();
  const [addCoinValue, setAddCoinValue] = useState<string | null>(null);
  const [removeCoinValue, setRemoveCoinValue] = useState<string | null>(null);
  const [student, setStudent] = useState<IHubUser>(_student);
  const [isLoading, setIsLoading] = useState(false);

  const [redefineData, setRedefineData] = useState<IRedefineData>({ password: { value: '' }, password_confirmation: { value: '' } });

  const toast = useCustomToast();
  const { onOpen, isOpen, onClose } = useDisclosure();

  const canSubmit = useMemo<boolean>(
    () => !!redefineData.password.valid && redefineData.password_confirmation.value === redefineData.password.value,
    [redefineData],
  );

  const handleUpdateStudent = useAsyncCallback(async (coins: number) => {
    const toastMessage = `Moedas ${coins > (student.metadata.coins || 0) ? 'creditadas' : 'descontadas'} com sucesso!`;
    const updatedStudent = await updateStudentData(student.id, coins);
    setStudent((e) => ({ ...e, ...updatedStudent }));
    setAddCoinValue(null);
    setRemoveCoinValue(null);
    toast({ status: `success`, description: toastMessage });
  }, []);

  const handleUpdatePassword = useAsyncCallback(
    async () => {
      setIsLoading(true);
      if (!redefineData.password.value) return;
      try {
        await redefineStudentPassword(student.id, redefineData.password.value);
        toast({ description: `Senha redefinida com sucesso!`, status: `success` });
        onClose();
        setRedefineData({ password: { value: '' }, password_confirmation: { value: '' } }); // Limpa o form
      } catch (err) {
        showErrorToClient(err, toast);
      }
    },
    [student, redefineData],
    true,
    () => setIsLoading(false),
  );

  // Cores dinâmicas para Dark/Light mode
  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  return (
    <Flex direction="column" w="100%" h="100%" overflowY="auto" gap="1.5rem" pb="2rem">
      {/* 1. PERFIL PRINCIPAL (Header Card) */}
      <Box bg={bgCard} borderRadius="2xl" border="1px solid" borderColor={borderColor} boxShadow="sm" overflow="hidden">
        {/* Banner Cover */}

        <Flex
          direction={{ base: 'column', md: 'row' }}
          px={{ base: '1.5rem', md: '2.5rem' }}
          py="2rem"
          gap="2rem"
          justify="space-between"
          align={{ base: 'center', md: 'flex-start' }}
        >
          {/* Avatar e Info Básica */}
          <Flex direction={{ base: 'column', md: 'row' }} gap="1.5rem" align={{ base: 'center', md: 'flex-end' }}>
            <Avatar
              size="2xl"
              name={student.name}
              src={student.avatar || '/avatars/default.jpeg'}
              border="4px solid"
              borderColor={bgCard}
              bg="gray.100"
              boxShadow="md"
            />
            <Flex direction="column" align={{ base: 'center', md: 'flex-start' }} mb="0.5rem">
              <Text fontSize={{ base: '24px', md: '28px' }} fontWeight="800" color={colorMode === 'light' ? 'gray.800' : 'white'} lineHeight="1.2">
                {student.name}
              </Text>
              <Text fontSize="15px" color="gray.500" fontWeight="500">
                @{student.username}
              </Text>
              {student.bio && (
                <Text fontSize="14px" color="gray.600" mt="0.5rem" maxW="500px" textAlign={{ base: 'center', md: 'left' }}>
                  {student.bio}
                </Text>
              )}
            </Flex>
          </Flex>

          {/* Quick Actions (Moedas e Senha) */}
          <Flex direction={{ base: 'column', sm: 'row' }} gap="1rem" align="center" mt={{ base: '1rem', md: '0' }}>
            {/* Controle de Moedas Refatorado (Agora usável!) */}
            <Flex
              align="center"
              bg={colorMode === 'light' ? 'warning.50' : 'warning.900'}
              border="1px solid"
              borderColor={colorMode === 'light' ? 'warning.200' : 'warning.700'}
              borderRadius="full"
              p="0.25rem"
            >
              <Tooltip label="Descontar moedas">
                <IconButton
                  aria-label="Remover"
                  icon={<FiMinus />}
                  size="sm"
                  variant="ghost"
                  colorScheme="orange"
                  borderRadius="full"
                  onClick={() => setRemoveCoinValue('')}
                />
              </Tooltip>
              <Flex align="center" gap="0.35rem" px="0.75rem">
                <CoinIcon />
                <Text fontSize="18px" fontWeight="700" color={colorMode === 'light' ? 'warning.700' : 'warning.300'}>
                  {formatCoin(student.metadata.coins || 0)}
                </Text>
              </Flex>
              <Tooltip label="Creditar moedas">
                <IconButton
                  aria-label="Adicionar"
                  icon={<FiPlus />}
                  size="sm"
                  variant="ghost"
                  colorScheme="orange"
                  borderRadius="full"
                  onClick={() => setAddCoinValue('')}
                />
              </Tooltip>
            </Flex>

            <Button variant="outline" colorScheme="gray" leftIcon={<FiKey />} borderRadius="lg" onClick={onOpen} _hover={{ bg: 'gray.50' }}>
              Resetar Senha
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* 2. CONTEÚDO EM GRID (Fim dos Accordions) */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap="1.5rem">
        {/* Coluna 1: Grupos */}
        <Flex direction="column" bg={bgCard} borderRadius="2xl" border="1px solid" borderColor={borderColor} boxShadow="sm" p="1.5rem">
          <Flex align="center" gap="0.5rem" mb="1.5rem">
            <Icon as={FiUsers} fontSize="20px" color="primary.500" />
            <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
              Grupos da Turma
            </Text>
          </Flex>

          <Flex direction="column" gap="0.75rem">
            {student.groups.length > 0 ? (
              student.groups.map((group) => (
                <Link key={group.id} href={`/groups/${group.id}`} target="_blank" _hover={{ textDecoration: 'none' }}>
                  <Flex
                    align="center"
                    gap="1rem"
                    p="0.75rem 1rem"
                    borderRadius="xl"
                    bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'}
                    border="1px solid"
                    borderColor={borderColor}
                    transition="all 0.2s"
                    _hover={{ transform: 'translateY(-2px)', borderColor: 'primary.300', boxShadow: 'sm' }}
                  >
                    <Flex bg="primary.100" color="primary.600" p="0.5rem" borderRadius="lg">
                      <FiUsers size="18px" />
                    </Flex>
                    <Text fontWeight="600" fontSize="15px" color={colorMode === 'light' ? 'gray.700' : 'gray.200'}>
                      {group.display_name}
                    </Text>
                  </Flex>
                </Link>
              ))
            ) : (
              <Text color="gray.400" fontSize="14px" fontStyle="italic">
                Nenhum grupo atribuído.
              </Text>
            )}
          </Flex>
        </Flex>

        {/* Coluna 2: Habilidades */}
        <Flex direction="column" bg={bgCard} borderRadius="2xl" border="1px solid" borderColor={borderColor} boxShadow="sm" p="1.5rem">
          <Flex align="center" gap="0.5rem" mb="1.5rem">
            <Icon as={FiTarget} fontSize="20px" color="green.500" />
            <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
              Habilidades
            </Text>
          </Flex>

          {/* Exemplo de Empty State Elegante */}
          <Flex
            direction="column"
            align="center"
            justify="center"
            h="150px"
            border="2px dashed"
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
            borderRadius="xl"
            bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'}
            color="gray.400"
          >
            <Icon as={FiTarget} fontSize="28px" mb="2" opacity={0.5} />
            <Text fontSize="14px" fontWeight="500">
              Nenhuma habilidade mapeada
            </Text>
          </Flex>
        </Flex>

        {/* Coluna 3: Dificuldades */}
        <Flex direction="column" bg={bgCard} borderRadius="2xl" border="1px solid" borderColor={borderColor} boxShadow="sm" p="1.5rem">
          <Flex align="center" gap="0.5rem" mb="1.5rem">
            <Icon as={FiAlertCircle} fontSize="20px" color="red.500" />
            <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
              Dificuldades
            </Text>
          </Flex>

          {/* Exemplo de Empty State Elegante */}
          <Flex
            direction="column"
            align="center"
            justify="center"
            h="150px"
            border="2px dashed"
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
            borderRadius="xl"
            bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'}
            color="gray.400"
          >
            <Icon as={FiAlertCircle} fontSize="28px" mb="2" opacity={0.5} />
            <Text fontSize="14px" fontWeight="500">
              Nenhuma dificuldade reportada
            </Text>
          </Flex>
        </Flex>
      </Grid>

      {/* 3. MODAIS */}
      <SmallModal
        title="Creditar moedas"
        show={addCoinValue !== null}
        onConfirm={() => handleUpdateStudent(Number(addCoinValue) + (student.metadata.coins || 0))}
        onCancel={() => setAddCoinValue(null)}
        topIcon="checked"
      >
        <NumberScaleInput value={addCoinValue || ``} onInputChange={setAddCoinValue} />
      </SmallModal>

      <SmallModal
        title="Descontar moedas"
        show={removeCoinValue !== null}
        onConfirm={() => handleUpdateStudent((student.metadata.coins || 0) - Number(removeCoinValue))}
        onCancel={() => setRemoveCoinValue(null)}
        topIcon="warning"
      >
        <NumberScaleInput value={removeCoinValue || ``} onInputChange={setRemoveCoinValue} max={student.metadata.coins || 0} />
      </SmallModal>

      {/* Modal de Redefinição de Senha Profissional */}
      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={bgCard} borderRadius="2xl" overflow="hidden">
          <ModalHeader bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'} borderBottom="1px solid" borderColor={borderColor} p="1.5rem">
            <Flex direction="column" gap="1rem" align="center" justify="center" w="100%">
              <Image src="/images/redefine-pass.png" h="8rem" objectFit="contain" />
              <Text fontWeight="700" fontSize="18px" textAlign="center" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                Redefinir senha de {student?.name?.split(` `)[0] || `PiCoder`}
              </Text>
            </Flex>
          </ModalHeader>
          <Flex direction="column" p="1.5rem" gap="1rem">
            <Text fontSize="13px" color="gray.500" fontWeight="500">
              A nova senha deve conter no mínimo 8 caracteres.
            </Text>
            <PasswordInput
              label="Nova Senha"
              error={redefineData.password.error}
              value={redefineData.password.value}
              onInputChange={(value) => setRedefineData((e) => ({ ...e, password: { ...e.password, value } }))}
              onPassStrongUnreached={() => setRedefineData((e) => ({ ...e, password: { ...e.password, valid: false } }))}
              onPassStrongReached={() => setRedefineData((e) => ({ ...e, password: { ...e.password, valid: true } }))}
            />
            <PasswordInput
              label="Confirmar Nova Senha"
              error={redefineData.password_confirmation.error}
              value={redefineData.password_confirmation.value}
              onInputChange={(value) => setRedefineData((e) => ({ ...e, password_confirmation: { value } }))}
            />
            <Flex gap="1rem" mt="1rem">
              <Button variant="ghost" flex="1" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="blue"
                bg="primary.600"
                flex="1"
                isDisabled={!canSubmit}
                onClick={() => handleUpdatePassword()}
                isLoading={isLoading}
              >
                Redefinir
              </Button>
            </Flex>
          </Flex>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default StudentPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const selectedPage = 'student';

  try {
    cookieManager.updateToken(req);

    const studentId = `${query.student_id}`;
    const student = await getStudent(studentId);

    return { props: { selectedPage, pageTitle: formatShortName(student.name, true), student } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
