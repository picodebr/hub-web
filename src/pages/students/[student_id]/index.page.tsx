import { GetServerSideProps } from 'next';

import { logError, cookieManager, formatShortName, formatCoin, showErrorToClient } from '@/_base/utils';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
  Image,
  Img,
  Link,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { FiUsers } from 'react-icons/fi';
import { getStudent, redefinePassword, redefineStudentPassword } from '@/_base/services/user';
import { IHubUser } from '@/_base/interfaces/user';
import { CoinIcon } from '@/components/Logo';
import { FaPlus, FaMinus } from 'react-icons/fa6';
import { useMemo, useState } from 'react';
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
  const { onOpen, isOpen, onClose } = useDisclosure()
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


  const handleUpdatePassword = useAsyncCallback(async () => {
    setIsLoading(true)
    if (!redefineData.password.value) return;
    try {
      await redefineStudentPassword(student.id, redefineData.password.value);
      toast({ description: `Senha redefinida com sucesso!`, status: `success` });
      onClose()
    } catch (err) {
      showErrorToClient(err, toast);
    }
  }, [student, redefineData], true, () => setIsLoading(false));

  return (
    <Flex direction="column" w="100%" h="100%" overflow="auto">
      <Flex bg={colorMode === 'light' ? 'primary900' : 'primary400'} h="102px" position="relative" borderRadius="10px" minH="102px" gap="-24px">
        <Flex
          position="absolute"
          borderRadius="50%"
          bg="gray300"
          bottom="-2rem"
          w="6rem"
          h="6rem"
          left="50%"
          boxShadow=" 0px 4px 6px -2px"
          transform="translate(-50%, 0)"
          overflow="hidden"
          border="4px"
          borderColor="white"
        >
          <Img src={student.avatar || '/avatars/default.jpeg'} w="100%" h="100%" />
        </Flex>
      </Flex>
      <Flex border="1px" borderColor="gray300" borderRadius="10px" bg="white" padding="40px" gap="32px">
        <Flex gap="32px" flex="1" align="center" justify="space-between">
          <Flex h="fit-content" display="flex" direction="column" justify="end">
            <Text fontSize="18px" fontWeight="600" color="primary500">
              {student.name}
            </Text>
            <Text fontSize="12px" color="gray400">
              @{student.username}
            </Text>
            <Text fontSize="14px" margin="8px 0 8px 0" color="gray600">
              {student.bio || `.`}
            </Text>
          </Flex>
          <Flex direction="column" align="center" gap="0.5rem" justify="space-between" h="100%">
            <Flex align="center" justify="space-between" gap="0.5rem" fontWeight="400" color="gray400">
              <CoinIcon />
              <Text fontSize="1rem">{formatCoin(student.metadata.coins)}</Text>
            </Flex>
            <Flex align="center" justify="space-between" gap="0.5rem" fontWeight="400" color="gray400" mt="1rem">
              <GenericButton label="Resetar senha" onClick={onOpen} />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Accordion allowMultiple bg="white" border="1px" borderColor="gray300" borderRadius="10px" margin="24px 0 0 0">
        <AccordionItem border="none" borderRadius="10px">
          <AccordionButton borderRadius="md">
            <Text flex="1" textAlign="left" padding="20px" color="gray600" fontSize="14px">
              Grupos
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel padding="20px">
            {student.groups.map((group) => (
              <Flex key={group.id} direction="row" gap="16px" align="center" _notLast={{ mb: `1rem` }}>
                <Link display="flex" alignContent="center" gap="1rem" href={`/groups/${group.id}`} target="_blank">
                  <FiUsers fontSize="40px" color="#21E080" />

                  <Text fontWeight="700" fontSize="18px" color="primary700" pt="7px">
                    {group.display_name}
                  </Text>
                </Link>
              </Flex>
            ))}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Accordion allowMultiple bg="white" border="1px" borderColor="gray300" borderRadius="10px" margin="24px 0 0 0">
        <AccordionItem border="none" borderRadius="10px">
          <AccordionButton borderRadius="md">
            <Text flex="1" textAlign="left" padding="20px" color="gray600" fontSize="14px">
              Dificuldades
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel padding="20px">
            {/* <Flex direction="row" gap="16px" align="center">
              <TbMathSymbols fontSize="40px" color="" />
              <Flex display="column" justify="space-between">
                <Text fontWeight="700" fontSize="18px" color="primary700">
                  Matemática
                </Text>
                <Text>Equações de segundo grau</Text>
              </Flex>
            </Flex>
            <Flex direction="row" gap="16px" align="center" marginTop="20px">
              <TbCode fontSize="40px" color="" />
              <Flex display="column" justify="space-between">
                <Text fontWeight="700" fontSize="18px" color="primary700">
                  Programação
                </Text>
                <Text>Lógica de programação e algoritmos</Text>
              </Flex>
            </Flex> */}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Accordion allowMultiple bg="white" border="1px" borderColor="gray300" borderRadius="10px" margin="24px 0 0 0">
        <AccordionItem border="none" borderRadius="10px">
          <AccordionButton borderRadius="md">
            <Text flex="1" textAlign="left" padding="20px" color="gray600" fontSize="14px">
              Habilidades
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel padding="20px">
            {/* <Flex direction="row" gap="16px" align="center">
              <TbMathSymbols fontSize="40px" color="" />
              <Flex display="column" justify="space-between">
                <Text fontWeight="700" fontSize="18px" color="primary700">
                  Matemática
                </Text>
                <Text>Equações de primeiro grau</Text>
              </Flex>
            </Flex>
            <Flex direction="row" gap="16px" align="center" marginTop="20px">
              <TbCode fontSize="40px" color="" />
              <Flex display="column" justify="space-between">
                <Text fontWeight="700" fontSize="18px" color="primary700">
                  Programação
                </Text>
                <Text>Lógica de programação e algoritmos</Text>
              </Flex>
            </Flex> */}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
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

      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} closeOnEsc={false} isCentered autoFocus>
        <ModalOverlay />
        <ModalContent bg="white" p="0.75rem" maxH="100%" overflow="hidden auto">
          <ModalHeader opacity="0.9" display="flex" >
            <Flex direction="column" gap="1.5rem" align="center" justify="center" w="100%">
              <Text fontWeight="500" opacity="0.8" fontSize="18px">
                {`Redefinição de senha de  ${student?.name?.split(` `)[0] || `PiCoder`}`}
              </Text>
              <Image src="/images/redefine-pass.png" border="1px" borderColor="gray200" borderRadius="md" h="12rem" />
            </Flex>
          </ModalHeader>
          <Flex direction="column" p="1rem" gap="1rem">
            <Text opacity="0.8">
              Minímo de 8 caracteres
            </Text>
            <PasswordInput
              label="Senha"
              error={redefineData.password.error}
              value={redefineData.password.value}
              onInputChange={(value) => setRedefineData((e) => ({ ...e, password: { ...e.password, value } }))}
              onPassStrongUnreached={() => setRedefineData((e) => ({ ...e, password: { ...e.password, valid: false } }))}
              onPassStrongReached={() => setRedefineData((e) => ({ ...e, password: { ...e.password, valid: true } }))}
            />
            <PasswordInput
              label="Confirmar Senha"
              error={redefineData.password_confirmation.error}
              value={redefineData.password_confirmation.value}
              onInputChange={(value) => setRedefineData((e) => ({ ...e, password_confirmation: { value } }))}
            />
            <GenericButton label="Redefinir" mt="2rem" isDisabled={!canSubmit} onClick={() => handleUpdatePassword()} isLoading={isLoading} />
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

    // TODO: add in use effect
    const student = await getStudent(studentId);

    return { props: { selectedPage, pageTitle: formatShortName(student.name, true), student } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
