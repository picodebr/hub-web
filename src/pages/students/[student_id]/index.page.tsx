import { GetServerSideProps } from 'next';

import { logError, cookieManager, formatShortName } from '@/_base/utils';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Flex, Img, Text, useColorMode } from '@chakra-ui/react';
import { FiUsers } from 'react-icons/fi';
import { getStudent } from '@/_base/services/user';
import { IHubUser } from '@/_base/interfaces/user';

interface IProps {
  student: IHubUser;
}

const StudentPage: React.FC<IProps> = ({ student }) => {
  const { colorMode } = useColorMode();
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
        {/* Left Content */}
        <Flex direction="column" gap="32px" flex="1">
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
          {/* <Flex direction="row" align="center" justify="space-between" gap="0.5rem" fontWeight="400" color="gray400">
            <Text>0</Text>
            <Text>5</Text>
          </Flex>
          <Flex direction="row" align="center" justify="space-between" gap="0.5rem" fontWeight="400" color="gray400">
            <Progress value={0} rounded={8} flex="1" min={0} max={5} size="sm" w="50%" />
          </Flex> */}
        </Flex>
        {/* Right Content */}
        {/* <Flex border="1px" borderRadius="8px" borderColor="primary300" justifyContent="center">
          <Text>Engajamento</Text>
        </Flex> */}
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
              <Flex key={group.id} direction="row" gap="16px" align="center">
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
