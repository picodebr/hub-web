import { Flex, Text } from '@chakra-ui/react';
import { IProject } from '@/_base/interfaces/project';
import { FiPlus, FiTrash } from 'react-icons/fi';
import { FaArrowUp } from 'react-icons/fa6';
import { Dispatch, SetStateAction, useState } from 'react';
import { TextInput } from '@/components/Inputs/Text';
import { InputValueType } from '@/_base/interfaces/shared';

interface IProps {
  project: IProject;
  setProject: Dispatch<SetStateAction<IProject>>;
  canEdit: boolean;
}
export const Materials: React.FC<IProps> = ({ project, setProject, canEdit }) => {
  const [newMaterial, setNewMaterial] = useState<InputValueType<string>>({ value: '' });

  const handleAddMaterial = () => {
    if (!newMaterial.value) {
      setNewMaterial({ error: 'Campo obrigatório', value: '' });
      return;
    }
    setProject((e) => ({ ...e, metadata: { ...e.metadata, tools: [...(e.metadata.tools || []), newMaterial.value] } }));
    setNewMaterial({ value: '' });
  };

  const handleRemoveMaterial = (tool: string) => {
    setProject((e) => ({ ...e, metadata: { ...e.metadata, tools: e.metadata.tools?.filter((t) => t !== tool) } }));
  };

  return (
    <Flex w="100%" overflow="auto" direction="column" gap="24px">
      <Flex w="100%" borderColor="gray300" borderRadius="10px" gap="32px">
        <TextInput
          bg="white"
          p="0.5rem"
          color="gray800"
          placeholder="Adicione um material"
          value={newMaterial.value}
          error={newMaterial.error}
          onChange={(e) => setNewMaterial({ value: e.target.value })}
          isDisabled={!canEdit}
        />
        <Flex
          w="40px"
          h="40px"
          direction="row"
          align="center"
          justify="center"
          bg="primary300"
          color="white"
          cursor="pointer"
          borderRadius="10px"
          _hover={{ filter: 'brightness(0.95)' }}
          onClick={() => canEdit && handleAddMaterial()}
        >
          <FiPlus size="20px" />
        </Flex>
      </Flex>
      <Flex direction="column" gap="24px" w="100%">
        <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300">
          <Flex pb={4} gap="6px" w="100%" justify="space-between" borderBottom="1px" borderColor="gray300">
            <Flex fontSize="14px" fontWeight="500" align="center" gap="8px" color="gray800">
              Nome
              <FaArrowUp size="10px" color="#98A2B3" />
            </Flex>
            <Text fontSize="14px" fontWeight="500" color="gray800">
              Ação
            </Text>
          </Flex>
          {project.metadata.tools?.map((tool) => (
            <Flex p="20px" gap="6px" borderBottom="1px" borderColor="gray300" fontSize="14px" fontWeight="500" justify="space-between">
              {tool}
              <Flex cursor="pointer" _hover={{ filter: 'brightness(0.8)' }} onClick={() => canEdit && handleRemoveMaterial(tool)}>
                <FiTrash color="red" />
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};
