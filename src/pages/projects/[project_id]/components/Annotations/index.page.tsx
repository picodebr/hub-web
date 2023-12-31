import { Dispatch, SetStateAction } from 'react';
import { FaPaperclip } from 'react-icons/fa';
import { FiSend, FiTrash } from 'react-icons/fi';

import { Button, Flex, Img, Input } from '@chakra-ui/react';
import { IProject } from '@/_base/interfaces/project';

interface IProps {
  project: IProject;
  setProject: Dispatch<SetStateAction<IProject>>;
}

export const Annotations: React.FC<IProps> = () => {
  return (
    <Flex w="100%" overflow="auto" direction="column" gap="24px">
      <Flex direction="column">
        <Flex w="100%" h="164px" border="1px" borderColor="gray300" borderRadius="10px" gap="32px" bg="white">
          <Input p="14px" variant="unstyled" placeholder="Faça uma anotação" />
        </Flex>
        <Flex w="100%" justify="flex-end" marginTop="4px" gap="8px" pt="8px">
          <Button w="fit-content" h="44px" bg="primary600" color="white" gap="8px">
            <FaPaperclip size="20px" />
            Anexar arquivo
          </Button>
          <Button w="113px" h="44px" bg="primary300" color="white" gap="8px">
            <FiSend size="20px" />
            Enviar
          </Button>
        </Flex>
      </Flex>
      <Flex direction="column" gap="24px" w="100%">
        <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300">
          <Flex pb={4} gap="6px" w="100%" justify="space-between">
            <Flex fontSize="14px" fontWeight="500" align="center" direction="column">
              <Flex gap="10px" direction="row" align="center">
                <Img src="/avatars/default.jpeg" w="32px" h="32px" borderRadius="100%"></Img>
                <Flex color="primary700" fontWeight="600" fontSize="17px" direction="column">
                  Carlos Luis
                  <Flex color="gray400" fontSize="14px">
                    @carlosluis
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <FiTrash color="red" size="16px" />
          </Flex>
          <Flex pl="20px" gap="6px" fontSize="14px" fontWeight="500" justify="space-between">
            Os alunos estão realizando uma atividade extra nessa data.
          </Flex>
          <Flex p="20px" fontSize="13px" color="gray400" direction="column">
            11/12/2023 às 12:31
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
