import { Flex, Grid, Link, Text } from '@chakra-ui/react';
import { Image } from 'antd';
import { TbFileText } from 'react-icons/tb';
import mimetype from 'mime';
import { HubMediaType } from '@/_base/interfaces/shared';

interface IMediaGalleryProps {
  files?: File[];
  media?: HubMediaType[];
}

export const MediaGallery: React.FC<IMediaGalleryProps> = ({ files = [], media = [] }) => {
  if (!files.length && !media.length) return null;

  return (
    <Grid gap="1.5rem" gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))" gridTemplateRows="minmax(min-content, max-content)">
      {files.map((file, i) => (
        <Flex
          key={file.name}
          borderRadius="md"
          overflow="hidden"
          position="relative"
          h="100%"
          border="1px"
          borderColor="gray200"
          justify="center"
          align="center"
        >
          {file.type.startsWith('image') ? (
            <Image key={`${i + 1}`} src={URL.createObjectURL(file)} width="100%" height="100%" style={{ aspectRatio: 1 }} />
          ) : file.type.startsWith('video') ? (
            <video key={`${i + 1}`} width="100%" height="100%" controls>
              <source src={URL.createObjectURL(file)} />
            </video>
          ) : (
            <Link target="_blank" href={URL.createObjectURL(file)} w="100%" h="100%">
              <Flex
                key={`${i + 1}`}
                w="100%"
                h="100%"
                bg="gray300"
                overflow="hidden"
                direction="column"
                align="center"
                justify="center"
                gap="0.5rem"
                fontWeight="500"
              >
                <TbFileText fontSize="2rem" />
                <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                  {file.name.length > 20 ? `${file.name.slice(0, 14)}...${file.name.slice(-6)}` : file.name}
                </Text>
              </Flex>
            </Link>
          )}
        </Flex>
      ))}
      {media.map((mediaItem, i) => (
        <Flex
          key={mediaItem.uri}
          borderRadius="md"
          overflow="hidden"
          position="relative"
          h="100%"
          border="1px"
          borderColor="gray200"
          justify="center"
          align="center"
          p="0.5rem"
        >
          {mimetype.getType(mediaItem.uri.split('?')[0])?.startsWith('image') ? (
            <Image key={`${i + 1}`} src={mediaItem.uri} width="100%" height="100%" />
          ) : mimetype.getType(mediaItem.uri.split('?')[0])?.startsWith('video') ? (
            <video key={`${i + 1}`} width="100%" height="100%" controls>
              <source src={mediaItem.uri} />
            </video>
          ) : (
            <Link target="_blank" href={mediaItem.uri} w="100%" h="100%">
              <Flex
                key={`${i + 1}`}
                w="100%"
                h="100%"
                bg="gray300"
                overflow="hidden"
                direction="column"
                align="center"
                justify="center"
                gap="0.5rem"
                fontWeight="500"
              >
                <TbFileText fontSize="2rem" />
                <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                  {mediaItem.label.length > 20 ? `${mediaItem.label.slice(0, 14)}...${mediaItem.label.slice(-6)}` : mediaItem.label}
                </Text>
              </Flex>
            </Link>
          )}
        </Flex>
      ))}
    </Grid>
  );
};
