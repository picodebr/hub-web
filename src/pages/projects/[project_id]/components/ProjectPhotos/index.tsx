import { Flex, Text, Img } from '@chakra-ui/react';
import { Dispatch, SetStateAction } from 'react';
import { MdAdd } from 'react-icons/md';

import { IProject } from '@/_base/interfaces/project';
import { GenericButton } from '@/components/Buttons/Generic';

interface IProps {
  project: IProject;
  onChangeFiles: (data: File[]) => void;
  canEdit: boolean;
}

export const ProjectPhotos: React.FC<IProps> = ({ project, onChangeFiles, canEdit }) => {
  const attachments = project.metadata?.attachments || [];

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onChangeFiles(files);
    }
  };

  return (
    <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300" gap="16px">
      <Flex justify="space-between" align="center" pb="8px" borderBottom="1px" borderColor="gray300">
        <Text fontSize="16px" fontWeight="600" color="gray800">
          Fotos do Projeto
        </Text>
        {canEdit && (
          <GenericButton
            label="Adicionar fotos"
            w="fit-content"
            h="36px"
            bg="primary500"
            color="white"
            fontSize="13px"
            gap="6px"
            leftIcon={<MdAdd size="18px" />}
            as="label"
            cursor="pointer"
            _hover={{ filter: 'brightness(0.9)' }}
          >
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAddPhotos}
              style={{ display: 'none' }}
            />
          </GenericButton>
        )}
      </Flex>
      {attachments.length > 0 ? (
        <Flex gap="12px" wrap="wrap">
          {attachments.map((attachment, index) => (
            <Flex
              key={index}
              w="120px"
              h="120px"
              borderRadius="8px"
              overflow="hidden"
              border="1px"
              borderColor="gray300"
              bg="gray100"
            >
              <Img
                src={attachment}
                alt={`Foto ${index + 1}`}
                w="100%"
                h="100%"
                objectFit="cover"
              />
            </Flex>
          ))}
        </Flex>
      ) : (
        <Flex
          w="100%"
          h="200px"
          borderRadius="8px"
          border="2px"
          borderStyle="dashed"
          borderColor="gray300"
          align="center"
          justify="center"
          direction="column"
          gap="8px"
          cursor={canEdit ? 'pointer' : 'default'}
          bg="gray50"
          as="label"
        >
          <MdAdd size="32px" color="gray400" />
          <Text fontSize="14px" color="gray600" textAlign="center">
            Clique para adicionar fotos
          </Text>
          <Text fontSize="12px" color="gray500">
            PNG, JPG ou WEBP
          </Text>
          {canEdit && (
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAddPhotos}
              style={{ display: 'none' }}
            />
          )}
        </Flex>
      )}
    </Flex>
  );
};
