import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Flex,
  Text,
} from '@chakra-ui/react';

import { IProject } from '@/_base/interfaces/project';
import { FaPlus } from 'react-icons/fa6';
import { FiUsers } from 'react-icons/fi';
import { Dispatch, SetStateAction } from 'react';

interface IProps {
  project: IProject;
  setProject: Dispatch<SetStateAction<IProject>>;
}

export const Groups: React.FC<IProps> = () => {
  return (
    <Flex w="100%" h="100%" direction="column" gap="24px">
      <Flex w="100%" overflow="auto" direction="column" gap="24px" bgColor="warning25" borderRadius="10px" boxShadow="md">
        <Flex w="100%" h="108px" p="12px 32px" justify="space-between" align="center">
          <Flex>
            <Text color="warning700" fontWeight="500">
              Nome do grupo
            </Text>
            <AvatarGroup children={undefined}></AvatarGroup>
          </Flex>
          <Flex color="warning500" fontSize="14px">
            19/11/2023
          </Flex>
          <Flex h="100%" direction="column" gap="12px">
            <Button bg="success600" color="white">
              Aprovar
            </Button>
            <Button bg="white" color="gray700" border="1px" borderColor="gray300">
              Recusar
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Flex w="100%" gap="32px">
        <Flex h="144px" w="100%" bg="gray100" border="1px" borderRadius="10px" borderColor="gray300" />
        <Flex h="144px" w="100%" bg="gray100" border="1px" borderRadius="10px" borderColor="gray300" />
        <Flex h="144px" w="100%" bg="gray100" border="1px" borderRadius="10px" borderColor="gray300" />
        <Flex h="144px" w="100%" bg="gray100" border="1px" borderRadius="10px" borderColor="gray300" />
        <Flex h="144px" w="100%" bg="gray100" border="1px" borderRadius="10px" borderColor="gray300" align="center" justify="center">
          <FaPlus />
        </Flex>
      </Flex>
      <Flex w="100%" h="auto" bg="white" borderRadius="10px" border="1px" borderColor="gray300" p="20px">
        <Accordion w="100%" border="transparent" allowToggle>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left" fontSize="15px" color="gray600">
                  Grupos
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel display="flex" gap="16px" alignItems="center">
              <FiUsers size="50px" color="#21E080" />
              <Flex direction="column">
                <Text color="primary700" fontSize="18px" fontWeight="700" gap="4px">
                  Grupo dos meninos
                </Text>
                <AvatarGroup size="sm" max={6}>
                  <Avatar></Avatar>
                  <Avatar></Avatar>
                  <Avatar></Avatar>
                  <Avatar></Avatar>
                  <Avatar></Avatar>
                  <Avatar></Avatar>
                  <Avatar></Avatar>
                  <Avatar></Avatar>
                  <Avatar></Avatar>
                </AvatarGroup>
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Flex>
    </Flex>
  );
};
