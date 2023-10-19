import { Flex, Grid, Input, Popover, PopoverBody, PopoverContent, PopoverTrigger, Text, Tooltip } from '@chakra-ui/react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { BiCloudUpload } from 'react-icons/bi';
import { FcFolder } from 'react-icons/fc';

import { useCustomToast } from '@/_base/hooks';
import { IAssetFolder } from '@/_base/interfaces/ad_assets';
import { copyToClipboard, getFilenameFromUrl } from '@/_base/utils';
import { BsFillArrowLeftCircleFill } from 'react-icons/bs';
import { FaTrash } from 'react-icons/fa6';
import { AlertDialogModal } from '../AlertDialogModal';
import { AppButton } from '../Forms/Button';
import { AppInput } from '../Forms/Input';

interface IProps {
  folders: IAssetFolder[];
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (folder_id: string) => void;
  onCreateFile: (file: File[], folder_id: string) => void;
  onDeleteFile: (file_id: string) => void;
  onEditFolder: (data: IAssetFolder) => void;
}

export const AssetFolders: React.FC<IProps> = ({ folders, onCreateFile, onCreateFolder, onDeleteFolder, onDeleteFile, onEditFolder }) => {
  const [selectedFolder, setSelectedFolder] = useState<IAssetFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [inputError, setInputError] = useState('');
  const [folderIdToRemove, setFolderIdToRemove] = useState('');
  const [fileIdToRemove, setFileIdToRemove] = useState('');

  const [targetFolderEdit, setTargetFolderEdit] = useState<IAssetFolder | null>(null);

  const toast = useCustomToast();

  useEffect(() => {
    setSelectedFolder((e) => (e ? folders.find((folder) => folder.id === e.id) || null : null));
  }, [folders]);

  const handleImageChange = useCallback(
    (e: any) => {
      if (!selectedFolder) return;
      const selectedFiles: File[] = Array.from(e.target.files);

      if (selectedFiles.length <= 15) {
        onCreateFile(selectedFiles, selectedFolder.id);
      } else {
        toast({ status: 'error', title: 'File limit exceeded' });
      }
    },
    [onCreateFile, selectedFolder, toast],
  );

  const handleCreateFolder = useCallback(() => {
    if (!newFolderName) {
      setInputError('Enter the folder name');
      return;
    }
    setInputError('');

    onCreateFolder(newFolderName);

    setNewFolderName('');
  }, [newFolderName, onCreateFolder]);

  const handleRemoveFolder = () => {
    if (!folderIdToRemove) return;
    onDeleteFolder(folderIdToRemove);
    setFolderIdToRemove('');
  };

  const handleRemoveFile = () => {
    if (!fileIdToRemove) return;

    onDeleteFile(fileIdToRemove);
    setFileIdToRemove('');
  };

  const handleEditFolderName = () => {
    if (!targetFolderEdit) return;
    const target = folders.find((e) => e.id === targetFolderEdit.id);

    if (target && target.name.trim() !== targetFolderEdit.name.trim()) onEditFolder(targetFolderEdit);

    setTargetFolderEdit(null);
  };

  return (
    <Flex h="100%" position="relative">
      {/* FOLDER SECTION*/}
      <Flex
        direction="column"
        position="absolute"
        w="100%"
        h="100%"
        transform={!selectedFolder ? '' : 'translateX(-150%)'}
        transition="all 1.1s cubic-bezier(1, -0.4, 0.22, 1.3)"
        opacity={!selectedFolder ? '1' : '0'}
      >
        <Flex w="100%" paddingBottom="0.5rem" gap="0.5rem">
          <AppInput
            placeholder="New folder name"
            error={inputError ? { type: 'validate', message: inputError } : undefined}
            bg="#f7f7f7"
            autoComplete="off"
            borderColor="primaryLight"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <AppButton label="Create folder" btntype="outline" size="md" bg="white" onClick={handleCreateFolder} />
        </Flex>
        <Grid
          gap="1rem"
          w="100%"
          overflow="auto"
          gridTemplateColumns="repeat(auto-fill, minmax(10rem, 1fr))"
          gridTemplateRows="minmax(min-content, max-content)"
        >
          {folders.map((folder) => (
            <Flex
              key={folder.id}
              className="folder-wrapper"
              direction="column"
              border="1px solid"
              borderColor="border.light"
              borderRadius="md"
              maxW="15rem"
              aspectRatio={1}
              cursor="pointer"
              transition="all 0.175s"
              _hover={{ boxShadow: 'md', transform: 'translateY(-1px)' }}
              onClick={() => setSelectedFolder(folder)}
              margin="0.5rem"
              position="relative"
            >
              <Flex
                position="absolute"
                top="0.75rem"
                right="0.75rem"
                opacity="0"
                transform="scale(10%)"
                transition="all 0.15s"
                color="text.gray"
                sx={{ '.folder-wrapper:hover &': { opacity: '1', transform: 'scale(100%)' } }}
                _hover={{ color: 'error', transform: 'scale(120%) !important' }}
                borderRadius="50%"
                fontSize="1.15rem"
                onClick={(e) => {
                  e.stopPropagation();
                  setFolderIdToRemove(folder.id);
                }}
              >
                <AlertDialogModal
                  isOpen={!!folderIdToRemove}
                  title="Are you sure you want to remove this folder?"
                  message="By deleting the folder, all files contained there in will also be permanently deleted."
                  onConfirm={() => handleRemoveFolder()}
                  onCancel={() => setFolderIdToRemove('')}
                />
                <FaTrash />
              </Flex>
              <Flex fontSize="6rem" align="center" justify="center">
                <FcFolder />
              </Flex>
              <Flex direction="column" align="center" marginTop="0.35rem" onClick={(e) => e.stopPropagation()}>
                <Popover onClose={handleEditFolderName}>
                  <PopoverTrigger>
                    <Text
                      color="text.black"
                      textOverflow="ellipsis"
                      overflow="hidden"
                      whiteSpace="nowrap"
                      px="0.25rem"
                      borderRadius="md"
                      transition="all 0.1s"
                      _hover={{ background: 'bg.gray' }}
                    >
                      {folder.name}
                    </Text>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverBody display="flex" flexDirection="column" gap="0.5rem">
                      <AppInput
                        value={targetFolderEdit?.name || folder.name}
                        onChange={(e) => setTargetFolderEdit({ ...folder, name: e.target.value || '' })}
                        size="xs"
                        onKeyDown={(e) => e.key === 'Enter' && handleEditFolderName()}
                      />
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
                <Text color="GrayText" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
                  {`${folder.files.length} ${folder.files.length === 1 ? 'file' : 'files'}`}
                </Text>
                <Text color="GrayText" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
                  {moment(folder.created_at).format('DD/MM/YYYY - HH:mm')}
                </Text>
              </Flex>
            </Flex>
          ))}
        </Grid>
      </Flex>

      {/* FILES SECTION */}
      <Flex
        direction="column"
        position="absolute"
        w="100%"
        h="100%"
        transform={selectedFolder ? '' : 'translateX(150%)'}
        transition="all 1.1s cubic-bezier(1, -0.4, 0.22, 1.3)"
        opacity={selectedFolder ? '1' : '0'}
      >
        <Flex w="100%" paddingBottom="0.5rem" justify="space-between">
          <Flex
            align="center"
            gap="0.5rem"
            color="text.gray"
            cursor="pointer"
            transition="all 0.15s"
            _hover={{ filter: 'brightness(0.8)' }}
            onClick={() => setSelectedFolder(null)}
          >
            <BsFillArrowLeftCircleFill />
            <Text>Back to folders</Text>
          </Flex>
          <Flex
            position="relative"
            border="1px"
            borderColor="primaryLight"
            padding="0.25rem 0.5rem"
            borderRadius="md"
            color="primaryLight"
            cursor="pointer"
            align="center"
            gap="0.5rem"
            zIndex="1"
            transition="all 0.15s"
            _hover={{ boxShadow: 'lg', filter: 'brightness(0.9)' }}
          >
            <Input
              multiple
              onChange={handleImageChange}
              type="file"
              height="100%"
              width="100%"
              position="absolute"
              bottom="0"
              right="0"
              opacity="0"
              cursor="pointer"
              zIndex="2"
            />
            <BiCloudUpload fontSize="1.25rem" cursor="pointer" />
            <Text cursor="pointer">Upload file</Text>
          </Flex>
        </Flex>
        <Grid
          gap="1rem"
          w="100%"
          overflow="auto"
          gridTemplateColumns="repeat(auto-fill, minmax(10rem, 1fr))"
          gridTemplateRows="minmax(min-content, max-content)"
        >
          {selectedFolder?.files.map((file) => (
            <Flex key={file.id} direction="column" border="1px" borderColor="gray.200" borderRadius="6px" maxW="15rem" aspectRatio={1}>
              <Flex className="file-wrapper" position="relative">
                <Flex
                  position="absolute"
                  top="0.75rem"
                  right="0.75rem"
                  opacity="0"
                  transform="scale(10%)"
                  transition="all 0.15s"
                  color="text.gray"
                  sx={{ '.file-wrapper:hover &': { opacity: '1', transform: 'scale(100%)' } }}
                  _hover={{ color: 'error', transform: 'scale(120%) !important' }}
                  borderRadius="50%"
                  fontSize="1.15rem"
                  cursor="pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFileIdToRemove(file.id);
                  }}
                >
                  <AlertDialogModal
                    isOpen={!!fileIdToRemove}
                    title="Are you sure you want to remove this file?"
                    message="This action is irreversible and may leave some ad creatives inoperative"
                    onConfirm={() => handleRemoveFile()}
                    onCancel={() => setFileIdToRemove('')}
                  />
                  <FaTrash />
                </Flex>
                <Flex
                  backgroundImage={file.url}
                  w="100%"
                  borderRadius="6px 6px 0 0"
                  borderBottom="1px"
                  borderColor="gray.200"
                  aspectRatio={1}
                  backgroundSize="cover"
                  backgroundPosition="center"
                  backgroundRepeat="no-repeat"
                />
              </Flex>
              <Flex direction="column" align="center" padding="0.25rem ">
                <Tooltip label="File prefix (Click to copy)" closeOnClick={false}>
                  <Text
                    onClick={() =>
                      copyToClipboard(file.url, () =>
                        toast({ status: 'success', title: 'File prefix copied to clipboard', position: 'top', duration: 2500 }),
                      )
                    }
                    color="text.black"
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    cursor="pointer"
                    w="100%"
                    textAlign="center"
                    borderRadius="md"
                    _hover={{
                      bg: 'bg.gray',
                    }}
                  >
                    {`adw_lib_file-${getFilenameFromUrl(file.url)}`}
                  </Text>
                </Tooltip>
                <Text color="GrayText" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
                  {moment(file.created_at).format('DD/MM/YYYY - HH:mm')}
                </Text>
              </Flex>
            </Flex>
          ))}
        </Grid>
      </Flex>
    </Flex>
  );
};
