import { Button, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaPaperclip } from 'react-icons/fa6';
import { Uploader } from 'rsuite';
import { create } from 'zustand';

type FileInputHookType = { clearFileList: () => void; toogle: boolean };

export const useFileInput = create<FileInputHookType>((set) => ({
  toogle: false,
  clearFileList: () => set((d) => ({ toogle: !d.toogle })),
}));

interface IFileInputProps {
  onChange: (files: File[]) => void;
  fileUrl?: string;
  type?: 'image' | 'video';
}

export const FileInput: React.FC<IFileInputProps> = ({ type, onChange }) => {
  const [toogleState, setToogleState] = useState<Array<any> | undefined>();
  const { toogle } = useFileInput();
  useEffect(() => {
    setToogleState([]);
    const tm = setTimeout(() => {
      setToogleState(undefined);
    }, 1000);

    return () => {
      clearTimeout(tm);
    };
  }, [toogle]);

  return (
    <Flex direction="column" w="100%" overflow="hidden">
      <Uploader
        autoUpload={false}
        accept={`${type}/*`}
        fileList={toogleState}
        draggable
        action=""
        multiple
        onChange={(e) => {
          onChange(e.map((file) => file.blobFile as File));
        }}
        toggleAs={(e) => (
          <Button gap="8px" onClick={() => e.onClick(e)} fontSize="14px">
            <FaPaperclip />
            Anexar arquivo
          </Button>
        )}
      />
    </Flex>
  );
};
