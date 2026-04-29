import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCamera } from 'react-icons/fi';
import { Uploader } from 'rsuite';
import { Flex, Text, Badge, Button, Spinner } from '@chakra-ui/react';
import NextImage from 'next/image';

import { cookieManager } from '@/_base/utils';
import { IAvatarOptions, IProfileComponentProps } from './interfaces';
import { useAsyncCallback, useAuth } from '@/_base/hooks';
import { getStudentExtract, IStudentExtract, updateProfile } from '@/_base/services/user';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { useAvatar } from '@/components/Page/hooks';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
import { Result, ResultConvertOptions, createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';


export const StudentProfile: React.FC<IProfileComponentProps & { certificates?: any[] }> = ({ user }) => {
  const [avatarOptions, setAvatarOptions] = useState<IAvatarOptions>({ skinColor: `ccc` });
  const [rawAvatar, setRawAvatar] = useState<(Result & ResultConvertOptions) | null>(null);
  const [avatarURI, setAvatarURI] = useState(``);
  const [isUpdating, setIsUpdating] = useState(false);

  const { setUser } = useAuth();
  const { setAvatar } = useAvatar();
  const { colorMode } = useDarkMode();

  const generateAvatar = (options: any) =>
    createAvatar(adventurer, {
      size: 200,
      skinColor: [options?.skinColor] as any,
      earrings: [options?.earrings] as any,
      eyebrows: [options?.eyebrows] as any,
      eyes: [options?.eyes] as any,
      glassesProbability: options?.glassesProbability,
      glasses: [options?.glasses] as any,
      hair: [options?.hair] as any,
      hairColor: [options?.hairColor] as any,
      mouth: [options?.mouth] as any,
    });

  const avatar = useMemo(() => {
    const raw = generateAvatar(avatarOptions);
    setRawAvatar(raw);
    return raw.toDataUriSync();
  }, [avatarOptions]);

  useEffect(() => {
    setAvatarURI(generateAvatar(avatarOptions).toDataUriSync());
  }, [avatarOptions]);

  useEffect(() => {
    if (user.role === `student`) setUser({ ...user, avatar });
  }, [avatar, user, setUser]);

  useEffect(() => {
    const avatarTemp = cookieManager.getCookie(`${user.id}:avatar`, true) as IAvatarOptions;
    if (avatarTemp?.skinColor) setAvatarOptions(avatarTemp);
  }, [user.id]);

  // Coletar disciplinas únicas do usuário
  const disciplines = user?.metadata?.disciplines || (user?.hub_class ? ['Robótica', 'Programação'] : []);

  return (
    <Flex
      direction="column"
      align="center"
      gap="1.5rem"
      bg={colorMode === 'dark' ? 'gray.800' : 'white'}
      borderRadius="2xl"
      border="1px solid"
      borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
      boxShadow="sm"
      p="2rem 1.5rem"
      mx="1.5rem"
    >
      {/* Avatar com Upload */}
      <Flex position="relative">
        <Flex
          w="120px"
          h="120px"
          borderRadius="full"
          border="4px solid"
          borderColor={colorMode === 'dark' ? 'gray.700' : 'white'}
          boxShadow="lg"
          overflow="hidden"
          bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
          align="center"
          justify="center"
        >
          {user.avatar ? (
            <NextImage
              loader={() => user.avatar}
              src={user.avatar}
              width={120}
              height={120}
              alt="Avatar"
              style={{ opacity: isUpdating ? 0.4 : 1, borderRadius: '50%', objectFit: 'cover' }}
              priority
            />
          ) : (
            <img src={avatarURI} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {isUpdating && (
            <Flex borderRadius="50%" position="absolute" inset="0" align="center" justify="center" bg="rgba(0,0,0,0.3)">
              <Spinner size="sm" color="primary500" />
            </Flex>
          )}
        </Flex>

        {/* Botão de câmera para upload */}
        <Uploader
          autoUpload={true}
          accept={`image/*`}
          draggable={false}
          action=""
          fileListVisible={false}
          onChange={(e) => {
            const file = e[0]?.blobFile as File;
            if (file) {
              const handleUploadAvatar = async () => {
                setIsUpdating(true);
                const response = await getPresignedUrl(file.type, 'avatars');
                await uploadFile(response.link, file);
                setTimeout(async () => {
                  const updatedUser = await updateProfile({ avatar: response.path });
                  setAvatar(updatedUser.avatar || ``);
                  setIsUpdating(false);
                }, 1000);
              };
              handleUploadAvatar();
            }
          }}
          toggleAs={(e) => (
            <Flex
              border="2px solid"
              borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
              borderRadius="full"
              p="0.5rem"
              bg={colorMode === 'dark' ? 'gray.700' : 'white'}
              position="absolute"
              bottom="-2px"
              right="-2px"
              cursor="pointer"
              boxShadow="md"
              transition="all 0.2s"
              _hover={{ transform: 'scale(1.1)', borderColor: 'primary500' }}
              color="gray500"
              onClick={() => e.onClick(e)}
            >
              <FiCamera size="1rem" />
            </Flex>
          )}
        />
      </Flex>

      {/* Nome */}
      <Flex direction="column" align="center" gap="0.5rem" textAlign="center">
        <Text fontSize="22px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.900'}>
          {user?.name || 'Usuário'}
        </Text>

        {/* E-mail */}
        <Text fontSize="13px" color="gray.500" fontWeight="500">
          {user?.email || 'email@picode.com.br'}
        </Text>

        {/* Biografia */}
        {user?.bio && (
          <Text fontSize="13px" color="gray.600" fontWeight="400" maxW="400px" mt="0.5rem">
            {user.bio}
          </Text>
        )}
      </Flex>

      {/* Disciplinas */}
      {Array.isArray(disciplines) && disciplines.length > 0 && (
        <Flex direction="column" w="100%" gap="0.75rem">
          <Text fontSize="12px" fontWeight="600" color="gray.500" textTransform="uppercase">
            Disciplinas
          </Text>
          <Flex gap="0.5rem" wrap="wrap" justify="center">
            {disciplines.map((discipline, idx) => (
              <Badge
                key={idx}
                bg="primary.50"
                color="primary.700"
                borderRadius="full"
                px="0.75rem"
                py="0.25rem"
                fontSize="12px"
                fontWeight="600"
                border="1px solid"
                borderColor="primary.200"
              >
                {typeof discipline === 'string' ? discipline : 'Disciplina'}
              </Badge>
            ))}
            <Button
              size="sm"
              variant="ghost"
              fontSize="12px"
              fontWeight="600"
              color="primary.500"
              _hover={{ bg: 'primary.50' }}
              px="0.75rem"
            >
              + Adicionar
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
