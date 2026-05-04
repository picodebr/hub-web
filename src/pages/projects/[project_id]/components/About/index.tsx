import { Flex, Text } from '@chakra-ui/react';
import { Dispatch, SetStateAction } from 'react';

import { EditableTextInput } from '@/components/Inputs/EditableText';
import { IProject } from '@/_base/interfaces/project';

interface IProps {
  project: IProject;
  setProject: Dispatch<SetStateAction<IProject>>;
  canEdit: boolean;
}

export const About: React.FC<IProps> = ({ project, setProject, canEdit }) => {
  return (
    <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300" gap="16px">
      <Flex pb={2} direction="column" gap="6px">
        <Text fontSize="14px" fontWeight="500" color="gray800">
          Nome do projeto
        </Text>
        <EditableTextInput
          isDisabled={!canEdit || !!project.project_id}
          value={project.title || ''}
          onInputChange={(title) => setProject((e) => ({ ...e, title }))}
        />
      </Flex>
      <Flex pb={2} direction="column" gap="6px">
        <Text fontSize="14px" fontWeight="500" color="gray800">
          Objetivo
        </Text>
        <EditableTextInput
          isDisabled={!canEdit || !!project.project_id}
          value={project.description || ''}
          onInputChange={(description) => setProject((e) => ({ ...e, description }))}
        />
      </Flex>
    </Flex>
  );
};
