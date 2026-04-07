import { useCallback, useEffect, useMemo, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import {
  Flex,
  Img,
  Text,
  useUpdateEffect,
  Button,
  Grid,
  GridItem,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Switch,
  Icon,
  Box,
  useColorMode,
} from '@chakra-ui/react';
import { Result, ResultConvertOptions, createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { FiEdit3, FiTrendingUp, FiTrendingDown, FiList } from 'react-icons/fi';
import moment from 'moment';

import { cookieManager, formatCoin } from '@/_base/utils';
import { IAvatarOptions, IProfileComponentProps } from './interfaces';
import { customAvatarOptions, defaultAvatarOptions } from './utils';
import { useAsyncCallback, useAuth } from '@/_base/hooks';
import { getStudentExtract, IStudentExtract, updateProfile } from '@/_base/services/user';
import { SmallModal } from '@/components/Modal/Small';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { useAvatar } from '@/components/Page/hooks';

export const StudentProfile: React.FC<IProfileComponentProps> = ({ user }) => {
  const { colorMode } = useColorMode();
  const [avatarOptions, setAvatarOptions] = useState<IAvatarOptions>({ skinColor: `ccc` });
  const [rawAvatar, setRawAvatar] = useState<(Result & ResultConvertOptions) | null>(null);
  const [avatarURI, setAvatarURI] = useState(``);
  const [userExtract, setUserExtract] = useState<IStudentExtract[]>([]);
  const [avatarEditorIsOpen, setAvatarEditorIsOpen] = useState(false);

  const { setUser } = useAuth();
  const { setAvatar } = useAvatar();

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

  useUpdateEffect(() => {
    setAvatarURI(generateAvatar(avatarOptions).toDataUriSync());
  }, [avatarOptions]);
  useEffect(() => {
    setAvatarURI(generateAvatar(avatarOptions).toDataUriSync());
  }, [avatarOptions]);

  useUpdateEffect(() => {
    if (user.role === `student`) setUser({ ...user, avatar });
  }, [avatar]);

  useEffect(() => {
    const avatarTemp = cookieManager.getCookie(`${user.id}:avatar`, true) as IAvatarOptions;
    if (avatarTemp?.skinColor) setAvatarOptions(avatarTemp);
    getExtract();
  }, []);

  const getExtract = useAsyncCallback(async () => {
    const extract = await getStudentExtract();
    setUserExtract(extract);
  }, []);

  const downloadAvatar = useCallback(async () => {
    if (!rawAvatar) return;
    const arrayBuffer = await rawAvatar?.png().toArrayBuffer();
    const { link, path } = await getPresignedUrl(`image/png`, `avatars`);
    const blob = new Blob([arrayBuffer as any], { type: 'application/octet-stream' });
    const file = new File([blob], 'avatar.png', { type: 'application/octet-stream', lastModified: Date.now() });
    await uploadFile(link, file);
    const updatedUser = await updateProfile({ avatar: path });
    setAvatar(updatedUser.avatar || ``);
  }, [rawAvatar]);

  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  return (
    <Flex w="100%" gap="1.5rem" direction="column">
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1.5fr' }} gap="1.5rem">
        {/* Painel do Avatar */}
        <Flex
          bg={bgCard}
          direction="column"
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="sm"
          p="1.5rem"
          h={{ base: 'auto', lg: '380px' }}
        >
          <Flex align="center" gap="0.5rem" mb="1.5rem">
            <Icon as={FiEdit3} color="primary.500" fontSize="20px" />
            <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
              Seu Avatar
            </Text>
          </Flex>

          <Flex direction="column" align="center" justify="center" flex="1" gap="1.5rem">
            <Flex
              bgGradient={colorMode === 'light' ? 'linear(to-br, primary.50, purple.50)' : 'linear(to-br, primary.900, purple.900)'}
              w="180px"
              h="180px"
              borderRadius="full"
              align="center"
              justify="center"
              border="4px solid"
              borderColor="white"
              boxShadow="lg"
            >
              <Img src={avatarURI} w="100%" h="100%" alt="Avatar" objectFit="contain" />
            </Flex>
            <Button colorScheme="blue" variant="outline" borderRadius="full" size="sm" onClick={() => setAvatarEditorIsOpen(true)}>
              Customizar Avatar
            </Button>
          </Flex>
        </Flex>

        {/* Painel de Extrato */}
        <Flex
          bg={bgCard}
          direction="column"
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="sm"
          p="1.5rem"
          h={{ base: '400px', lg: '380px' }}
        >
          <Flex align="center" gap="0.5rem" mb="1rem">
            <Icon as={FiList} color="orange.500" fontSize="20px" />
            <Text fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
              Meu Extrato
            </Text>
          </Flex>

          <Flex direction="column" overflowY="auto" pr="0.5rem" flex="1">
            {userExtract.length > 0 ? (
              userExtract.map((extract, i) => (
                <Flex
                  key={extract.label + i}
                  align="center"
                  justify="space-between"
                  py="0.75rem"
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  _last={{ borderBottom: 'none' }}
                >
                  <Flex align="center" gap="1rem">
                    <Flex
                      bg={extract.type === 'plus' ? 'green.50' : 'red.50'}
                      color={extract.type === 'plus' ? 'green.500' : 'red.500'}
                      p="0.5rem"
                      borderRadius="full"
                    >
                      <Icon as={extract.type === 'plus' ? FiTrendingUp : FiTrendingDown} />
                    </Flex>
                    <Box>
                      <Text fontWeight="600" color={colorMode === 'dark' ? 'white' : 'gray.800'} fontSize="14px" noOfLines={1} maxW="200px">
                        {extract.label}
                      </Text>
                      <Text fontSize="12px" color="gray.500">
                        {moment(extract.date).format(`DD/MM/YYYY`)}
                      </Text>
                    </Box>
                  </Flex>
                  <Flex
                    align="center"
                    gap="0.25rem"
                    bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'}
                    px="0.75rem"
                    py="0.25rem"
                    borderRadius="full"
                  >
                    <Text fontWeight="700" fontSize="14px" color={extract.type === `plus` ? 'green.500' : 'red.500'}>
                      {extract.type === `plus` ? `+` : `-`} {formatCoin(extract.value)}
                    </Text>
                    <Image src="/icons/coin.svg" w="14px" h="14px" />
                  </Flex>
                </Flex>
              ))
            ) : (
              <Flex align="center" justify="center" h="100%" color="gray.400">
                <Text>Você ainda não possui transações.</Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Grid>

      {/* Os modais (SmallModal) de edição de avatar permanecem inalterados mas herdam o tema base */}
      <SmallModal
        show={avatarEditorIsOpen}
        onConfirm={() => {
          if (rawAvatar) downloadAvatar();
          setAvatarEditorIsOpen(false);
        }}
        onCancel={() => setAvatarEditorIsOpen(false)}
        topIcon="ray"
        size={{ base: `full`, sm: 'xl' }}
      >
        <Flex justify="space-between" direction={{ base: 'column', sm: 'row' }}>
          <Flex direction="column" justify="center" align="center" mb={{ base: '1rem', sm: '0' }}>
            <Img src={avatarURI} w={{ base: '170px', sm: '200px' }} h={{ base: '170px', sm: '200px' }} alt="Avatar" />
          </Flex>
          <Flex gap="8px" align="center" justify="center" flex="1">
            <Grid templateColumns={{ base: 'repeat(auto-fill, minmax(9rem, 1fr))', sm: 'repeat(2, 1fr)' }} gap={3} w="100%">
              {customAvatarOptions.map((opt) => (
                <Flex w="100%" key={opt.key} align="center" justify="center">
                  <Menu>
                    <MenuButton
                      as={Button}
                      rightIcon={<IoIosArrowDown />}
                      w="100%"
                      h="2.5rem"
                      fontSize="14px"
                      fontWeight="500"
                      bg={colorMode === 'light' ? 'gray.100' : 'whiteAlpha.200'}
                    >
                      {opt.title}
                    </MenuButton>
                    <MenuList borderColor={borderColor} zIndex={10}>
                      <Grid gridTemplateColumns="repeat(auto-fill, minmax(3rem, 1fr))" maxH="13rem" overflow="auto" p="2">
                        {defaultAvatarOptions[opt.key].map((param: string) => {
                          const newParam: Record<string, string[]> = {};
                          newParam[opt.key] = [param];
                          return (
                            <MenuItem
                              key={param}
                              p="1"
                              borderRadius="md"
                              bg={(avatarOptions as any)[opt.key] === param ? 'primary.100' : 'transparent'}
                              onClick={() => {
                                const newOpt: Record<string, string[]> = {};
                                newOpt[opt.key] = [param];
                                setAvatarOptions((state) => ({ ...state, ...newOpt }));
                              }}
                            >
                              <Image
                                boxSize="2.5rem"
                                borderRadius="full"
                                src={createAvatar(adventurer, {
                                  size: 200,
                                  skinColor: [avatarOptions.skinColor] as any,
                                  earrings: [avatarOptions.earrings] as any,
                                  eyebrows: [avatarOptions.eyebrows] as any,
                                  eyes: [avatarOptions.eyes] as any,
                                  glassesProbability: avatarOptions.glassesProbability,
                                  glasses: [avatarOptions.glasses] as any,
                                  hair: [avatarOptions.hair] as any,
                                  hairColor: [avatarOptions.hairColor] as any,
                                  mouth: [avatarOptions.mouth] as any,
                                  ...newParam,
                                }).toDataUriSync()}
                              />
                            </MenuItem>
                          );
                        })}
                      </Grid>
                    </MenuList>
                  </Menu>
                </Flex>
              ))}
              <GridItem w="100%" colSpan={{ base: 1, sm: 2 }}>
                <Flex
                  gap="1rem"
                  align="center"
                  justify="center"
                  bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'}
                  p="0.5rem"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <Text fontSize="14px" fontWeight="600">
                    Usar óculos?
                  </Text>
                  <Switch
                    colorScheme="blue"
                    isChecked={(avatarOptions.glassesProbability || 0) > 0}
                    onChange={(e) => setAvatarOptions((state) => ({ ...state, glassesProbability: Number(e.target.checked) * 100 }))}
                  />
                </Flex>
              </GridItem>
            </Grid>
          </Flex>
        </Flex>
      </SmallModal>
    </Flex>
  );
};
