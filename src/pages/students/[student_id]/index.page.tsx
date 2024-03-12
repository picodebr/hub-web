import { GetServerSideProps } from 'next';

import { logError, cookieManager, formatShortName, formatCoin } from '@/_base/utils';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Flex, Img, Text, Tooltip, useColorMode } from '@chakra-ui/react';
import { FiUsers } from 'react-icons/fi';
import { getStudent } from '@/_base/services/user';
import { IHubUser } from '@/_base/interfaces/user';
import { CoinIcon } from '@/components/Logo';
import { FaPlus, FaMinus } from 'react-icons/fa6';
import { useState } from 'react';
import { SmallModal } from '@/components/Modal/Small';
import { NumberScaleInput } from '@/components/Inputs/NumberScale';
import { useAsyncCallback, useCustomToast } from '@/_base/hooks';
import { updateStudentData } from '@/_base/services/student/updateStudentData';

interface IProps {
  student: IHubUser;
}

const StudentPage: React.FC<IProps> = ({ student: _student }) => {
  const { colorMode } = useColorMode();
  const [addCoinValue, setAddCoinValue] = useState<string | null>(null);
  const [removeCoinValue, setRemoveCoinValue] = useState<string | null>(null);
  const [student, setStudent] = useState<IHubUser>(_student);

  const toast = useCustomToast();

  const handleUpdateStudent = useAsyncCallback(async (coins: number) => {
    const toastMessage = `Moedas ${coins > (student.metadata.coins || 0) ? 'creditadas' : 'descontadas'} com sucesso!`;
    const updatedStudent = await updateStudentData(student.id, coins);
    setStudent((e) => ({ ...e, ...updatedStudent }));
    setAddCoinValue(null);
    setRemoveCoinValue(null);
    toast({ status: `success`, description: toastMessage });
  }, []);

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
          <Flex direction="column" align="center" gap="0.5rem">
            <Flex align="center" justify="space-between" gap="0.5rem" fontWeight="400" color="gray400">
              <CoinIcon />
              <Text fontSize="1rem">{formatCoin(student.metadata.coins)}</Text>
            </Flex>
            <Flex gap="1rem" pl="0.5rem">
              <Tooltip label="Descontar moedas">
                <Flex
                  border="1px"
                  borderColor="gray200"
                  cursor="pointer"
                  p="0.35rem"
                  borderRadius="50%"
                  transition="all 0.1s"
                  _hover={{ boxShadow: `sm`, borderColor: `gray300` }}
                  onClick={() => setRemoveCoinValue(`0`)}
                >
                  <FaMinus />
                </Flex>
              </Tooltip>
              <Tooltip label="Creditar moedas">
                <Flex
                  border="1px"
                  borderColor="gray200"
                  cursor="pointer"
                  p="0.35rem"
                  borderRadius="50%"
                  transition="all 0.1s"
                  _hover={{ boxShadow: `sm`, borderColor: `gray300` }}
                  onClick={() => setAddCoinValue(`0`)}
                >
                  <FaPlus />
                </Flex>
              </Tooltip>
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
                <FiUsers fontSize="40px" color="#21E080" />
                <Flex display="column" justify="space-between">
                  <Text fontWeight="700" fontSize="18px" color="primary700">
                    {group.display_name}
                  </Text>
                </Flex>
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
