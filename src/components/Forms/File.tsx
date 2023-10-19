import { useCustomToast } from '@/_base/hooks';
import { AspectRatio, Box, BoxProps, Flex, forwardRef, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { useMemo } from 'react';
import { FaFile } from 'react-icons/fa6';

const PreviewImage = forwardRef<BoxProps, typeof Box>((props, ref) => {
  return (
    <Box
      bg="white"
      top="0"
      height="100%"
      width="100%"
      position="absolute"
      borderWidth="1px"
      borderStyle="solid"
      rounded="sm"
      borderColor="gray.400"
      as={motion.div}
      backgroundSize="cover"
      backgroundRepeat="no-repeat"
      backgroundPosition="center"
      backgroundImage={`url("https://image.shutterstock.com/image-photo/paella-traditional-classic-spanish-seafood-600w-1662253543.jpg")`}
      {...props}
      ref={ref}
    />
  );
});

interface IFileInputProps {
  onChange: (value: File | null | undefined) => void;
  url?: string;
  value: File | null | undefined;
  type?: 'image' | 'video' | 'application';
}

export const FileInput: React.FC<IFileInputProps> = ({ onChange, url, value, type = '' }) => {
  const typeLabel = type === 'image' ? 'images' : type === 'video' ? 'videos' : 'files';

  const toast = useCustomToast();

  const fileUrl = useMemo(() => {
    if (!value) return value !== null ? url || '' : '';

    return URL.createObjectURL(value);
  }, [value, url]);

  const handleFileChange = (file: File) => {
    const valid = file.type.startsWith(`${type}/`);
    toast({ title: `Only ${typeLabel} accepted`, status: 'error' });

    const newImage = valid ? file : undefined;
    onChange(newImage);
  };

  const controls = useAnimation();
  const startAnimation = () => controls.start('hover');
  const stopAnimation = () => controls.stop();

  return (
    <Box h="100%" w="100%">
      <AspectRatio ratio={1}>
        <Flex
          w="100%"
          border="2px dashed"
          borderColor="gray.300"
          rounded="md"
          position="relative"
          _hover={{
            shadow: 'md',
          }}
        >
          <Flex height="100%" width="100%" flexDirection="column">
            <Stack height="100%" width="100%" align="center" justify="center" spacing="3">
              <Flex fontSize="1.75rem">
                <FaFile />
              </Flex>
              <Stack textAlign="center" spacing="1">
                <Heading fontSize="md" color="gray.700" fontWeight="bold">
                  {`Drop ${typeLabel} here`}
                </Heading>
                <Text fontWeight="light">or click to upload</Text>
              </Stack>
            </Stack>
          </Flex>
          <Input
            src={fileUrl}
            value={fileUrl}
            type="file"
            height="100%"
            width="100%"
            position="absolute"
            top="0"
            left="0"
            opacity="0"
            aria-hidden="true"
            cursor="pointer"
            accept={`${type}/*`}
            onDragEnter={startAnimation}
            onDragLeave={stopAnimation}
          />
        </Flex>
      </AspectRatio>
    </Box>
  );
};
