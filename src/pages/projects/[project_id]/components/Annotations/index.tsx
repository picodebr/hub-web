import { useState } from 'react';
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
    <>
      <Flex w="100%" h="auto" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300" overflow="hidden">
        <Flex
          w="100%"
          h="42px"
          bg="primary500"
          p="12px 20px"
          color="white"
          fontWeight="500"
          align="center"
          justify="space-between"
        >
          Anotações
        </Flex>
        <Flex direction="column" gap="12px" p="16px" flex="1" overflowY="auto" maxH="400px">
          <Flex direction="column">
            <TextAreaInput
              isDisabled={!canEdit}
              value={newAnnotation}
              onInputChange={setNewAnnotation}
              rows={4}
              bg="white"
              color="gray800"
              placeholder="Faça uma anotação"
            />
            <Flex w="100%" justify="flex-end" marginTop="8px" gap="8px" pt="4px">
              <GenericButton
                label="Enviar"
                w="113px"
                h="36px"
                bg="primary300"
                color="white"
                gap="8px"
                fontSize="13px"
                isDisabled={!canEdit}
                onClick={handleSend}
                leftIcon={<FiSend size="16px" />}
                _hover={{
                  filter: 'brightness(0.9)',
                }}
              />
            </Flex>
          </Flex>
          {project.annotations.length > 0 && (
            <Flex direction="column" gap="12px" pt="12px" borderTop="1px" borderColor="gray300">
              {project.annotations.map((annotation) => (
                <Flex key={annotation.id} direction="column" gap="8px" w="100%" p="12px" bg="gray50" borderRadius="8px">
                  <Flex pb={2} gap="6px" w="100%" justify="space-between">
                    <Flex gap="8px" direction="row" align="flex-start">
                      <Img src={annotation.user?.avatar || '/avatars/default.jpeg'} w="24px" h="24px" borderRadius="100%" flexShrink={0}></Img>
                      <Flex direction="column" gap="2px">
                        <Flex color="primary700" fontWeight="600" fontSize="13px">
                          {formatShortName(annotation.user?.name || user.name, true)}
                        </Flex>
                        <Flex color="gray400" fontSize="12px">
                          @{annotation.user?.username || user.username}
                        </Flex>
                      </Flex>
                    </Flex>
                    <Flex color="primary500" _hover={{ filter: 'brightness(0.8)' }} cursor="pointer" onClick={() => setAnnotationIdToRemove(annotation.id)} flexShrink={0}>
                      <FiTrash size="16px" />
                    </Flex>
                  </Flex>
                  <Flex px="0" gap="6px" fontSize="13px" fontWeight="400" color="gray700">
                    {annotation.metadata.message}
                  </Flex>
                  <Flex fontSize="11px" color="gray400">
                    {`${moment(annotation.created_at).format('DD/MM')} às ${moment(annotation.created_at).format('HH:mm')}`}
                  </Flex>
                </Flex>
              ))}
            </Flex>
          )}
        </Flex>
      </Flex>
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
    </>
  );
};
