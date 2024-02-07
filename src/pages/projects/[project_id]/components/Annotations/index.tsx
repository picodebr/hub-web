import { useState } from 'react';
import { FaPaperclip } from 'react-icons/fa';
import { FiSend, FiTrash } from 'react-icons/fi';
import { Flex, Img, Text } from '@chakra-ui/react';
import moment from 'moment';

import { IAddProjectAnnotationParams, IProject } from '@/_base/interfaces/project';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { formatShortName } from '@/_base/utils';
import { GenericButton } from '@/components/Buttons/Generic';
import { SmallModal } from '@/components/Modal/Small';
import { useAuth } from '@/_base/hooks';

interface IProps {
  project: IProject;
  onAddAnnotation: (data: IAddProjectAnnotationParams) => void;
  onRemoveAnnotation: (id: string) => void;
  canEdit: boolean;
}

export const Annotations: React.FC<IProps> = ({ project, onAddAnnotation, onRemoveAnnotation, canEdit }) => {
  const [newAnnotation, setNewAnnotation] = useState('');
  const [annotationIdToRemove, setAnnotationIdToRemove] = useState('');

  const { user } = useAuth();

  const handleSend = () => {
    onAddAnnotation({ hub_project_class_id: project.id, metadata: { message: newAnnotation, attachments: [] } });
    setNewAnnotation('');
  };

  return (
    <Flex w="100%" overflow="auto" direction="column" gap="24px" pr="0.25rem">
      <Flex direction="column">
        <TextAreaInput
          isDisabled={!canEdit}
          value={newAnnotation}
          onInputChange={setNewAnnotation}
          rows={8}
          bg="white"
          placeholder="Faça uma anotação"
        />
        <Flex w="100%" justify="flex-end" marginTop="4px" gap="8px" pt="8px">
          <GenericButton
            label="Anexar arquivo"
            w="fit-content"
            h="44px"
            bg="primary600"
            color="white"
            gap="8px"
            isDisabled={!canEdit}
            leftIcon={<FaPaperclip size="20px" />}
            _hover={{
              filter: 'brightness(0.9)',
            }}
          />

          <GenericButton
            label="Enviar"
            w="113px"
            h="44px"
            bg="primary300"
            color="white"
            gap="8px"
            isDisabled={!canEdit}
            onClick={handleSend}
            leftIcon={<FiSend size="20px" />}
            _hover={{
              filter: 'brightness(0.9)',
            }}
          />
        </Flex>
      </Flex>
      {project.annotations.map((annotation) => (
        <Flex key={annotation.id} direction="column" gap="24px" w="100%">
          <Flex w="100%" h="auto" p="1rem" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300">
            <Flex pb={4} gap="6px" w="100%" justify="space-between">
              <Flex fontSize="14px" fontWeight="500" align="center" direction="column">
                <Flex gap="10px" direction="row" align="center">
                  <Img src={annotation.user?.avatar || '/avatars/default.jpeg'} w="32px" h="32px" borderRadius="100%"></Img>
                  <Flex color="primary700" fontWeight="600" fontSize="17px" direction="column">
                    {formatShortName(annotation.user?.name || user.name, true)}
                    <Flex color="gray400" fontSize="14px">
                      @{annotation.user?.username || user.username}
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Flex color="primary500" _hover={{ filter: 'brightness(0.8)' }} cursor="pointer" onClick={() => setAnnotationIdToRemove(annotation.id)}>
                <FiTrash />
              </Flex>
            </Flex>
            <Flex px="20px" gap="6px" fontSize="14px" fontWeight="500" justify="space-between">
              {annotation.metadata.message}
            </Flex>
            <Flex p="1rem 1rem 0 1rem" fontSize="13px" color="gray400" direction="column">
              {`${moment(annotation.created_at).format('DD/MM/YYYY')} às ${moment(annotation.created_at).format('HH:mm')}`}
            </Flex>
          </Flex>
        </Flex>
      ))}
      <SmallModal
        title="Excluir anotação"
        show={!!annotationIdToRemove}
        onConfirm={() => {
          onRemoveAnnotation(annotationIdToRemove);
          setAnnotationIdToRemove('');
        }}
        okText="Confirmar"
        onCancel={() => setAnnotationIdToRemove('')}
        topIcon="warning"
      >
        <Flex direction="column" gap="1rem">
          <Text color="gray500" fontSize="15px">
            Tem certeza que deseja excluir essa anotação?
          </Text>
        </Flex>
      </SmallModal>
    </Flex>
  );
};
