import { useCallback, useEffect, useMemo, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { Avatar, Flex, Img, Text, useUpdateEffect } from '@chakra-ui/react';
import { Result, ResultConvertOptions, createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { Button } from '@chakra-ui/react';
import { Grid, GridItem } from '@chakra-ui/react';

import { Image, Menu, MenuButton, MenuItem, MenuList, Switch } from '@chakra-ui/react';
import { cookieManager } from '@/_base/utils';
import { IAvatarOptions, IProfileComponentProps } from './interfaces';
import { customAvatarOptions, defaultAvatarOptions } from './utils';
import { GenericButton } from '@/components/Buttons/Generic';
import { useAuth, useCustomRouter } from '@/_base/hooks';

export const StudentProfile: React.FC<IProfileComponentProps> = ({ user }) => {
  const [avatarOptions, setAvatarOptions] = useState<IAvatarOptions>({ skinColor: `ccc` });
  const [rawAvatar, setRawAvatar] = useState<(Result & ResultConvertOptions) | null>(null);
  const [avatarURI, setAvatarURI] = useState(``);

  const { setUser } = useAuth();
  const router = useCustomRouter();

  const avatar = useMemo(() => {
    const raw = createAvatar(adventurer, {
      size: 200,
      skinColor: [avatarOptions?.skinColor] as any,
      earrings: [avatarOptions?.earrings] as any,
      eyebrows: [avatarOptions?.eyebrows] as any,
      eyes: [avatarOptions?.eyes] as any,
      glassesProbability: avatarOptions?.glassesProbability,
      glasses: [avatarOptions?.glasses] as any,
      hair: [avatarOptions?.hair] as any,
      hairColor: [avatarOptions?.hairColor] as any,
      mouth: [avatarOptions?.mouth] as any,
    });
    setRawAvatar(raw);

    return raw.toDataUriSync();
  }, [avatarOptions]);

  useUpdateEffect(() => {
    if (user.role === `student`) setUser({ ...user, avatar });
    cookieManager.setCookie(`${user.id}:avatar:uri`, avatar, undefined, false);
    cookieManager.setCookie(`${user.id}:avatar`, JSON.stringify(avatarOptions));
    const raw = createAvatar(adventurer, {
      size: 200,
      skinColor: [avatarOptions?.skinColor] as any,
      earrings: [avatarOptions?.earrings] as any,
      eyebrows: [avatarOptions?.eyebrows] as any,
      eyes: [avatarOptions?.eyes] as any,
      glassesProbability: avatarOptions?.glassesProbability,
      glasses: [avatarOptions?.glasses] as any,
      hair: [avatarOptions?.hair] as any,
      hairColor: [avatarOptions?.hairColor] as any,
      mouth: [avatarOptions?.mouth] as any,
    });

    setAvatarURI(raw.toDataUriSync());
  }, [avatarOptions]);

  useEffect(() => {
    const raw = createAvatar(adventurer, {
      size: 200,
      skinColor: [avatarOptions?.skinColor] as any,
      earrings: [avatarOptions?.earrings] as any,
      eyebrows: [avatarOptions?.eyebrows] as any,
      eyes: [avatarOptions?.eyes] as any,
      glassesProbability: avatarOptions?.glassesProbability,
      glasses: [avatarOptions?.glasses] as any,
      hair: [avatarOptions?.hair] as any,
      hairColor: [avatarOptions?.hairColor] as any,
      mouth: [avatarOptions?.mouth] as any,
    });

    setAvatarURI(raw.toDataUriSync());
  }, [avatarOptions]);

  useUpdateEffect(() => {
    if (user.role === `student`) setUser({ ...user, avatar });
  }, [avatar]);

  useEffect(() => {
    const avatarTemp = cookieManager.getCookie(`${user.id}:avatar`, true) as IAvatarOptions;
    if (avatarTemp?.skinColor) setAvatarOptions(avatarTemp);
  }, []);

  const downloadAvatar = useCallback(async () => {
    if (rawAvatar) await rawAvatar?.png().toFile(`${user?.name?.split(` `)[0] || ``} avatar picode`);
  }, [rawAvatar]);

  return (
    <Flex w="100%" gap="24px" direction="column">
      <Flex w="100%" direction="row" gap="12px">
        <Flex
          bgColor="white"
          direction="column"
          borderRadius="10px"
          boxShadow="md"
          w="100%"
          h="fit-content"
          padding="20px"
          gap="20px"
          textAlign="left"
          display="column"
          justify="center"
        >
          <Text w="100%" borderBottom="1px" borderColor="gray300" padding="0 20px 20px">
            Seu avatar
          </Text>
          <Flex justify="space-between" direction={{ base: 'column', sm: 'row' }}>
            <Flex direction="column" p="20px" justify="space-between" align="center">
              <Img src={avatarURI} w={{ base: '170px', sm: '200px' }} h={{ base: '170px', sm: '200px' }} alt="Avatar" />
              <GenericButton label="Download" w="fit-content" btntype="outline" size="xs" onClick={() => !!rawAvatar && downloadAvatar()} />
            </Flex>
            <Flex gap="8px" overflow="visible" align="center" justify="center">
              <Grid
                templateColumns={{ base: 'repeat(auto-fill, minmax(9rem, 1fr))', sm: 'repeat(2, 1fr)' }}
                templateRows={{ base: 'minmax(min-content, max-content)', sm: 'repeat(4, 1fr)' }}
                w="100%"
                margin="auto"
                gap={3}
              >
                {customAvatarOptions.map((opt) => (
                  <Flex w="100%" key={opt.key} align="center" justify="center">
                    <Menu>
                      <MenuButton as={Button} rightIcon={<IoIosArrowDown />} w="9.35rem" h="2rem" fontSize="15px" fontWeight="500">
                        {opt.title}
                      </MenuButton>
                      <MenuList borderColor="gray300">
                        <Grid
                          gridTemplateColumns="repeat(auto-fill, minmax(3rem, 1fr))"
                          gridTemplateRows="minmax(min-content, max-content)"
                          maxH="13rem"
                          overflow={'hidden auto'}
                        >
                          {defaultAvatarOptions[opt.key].map((param: string) => {
                            const newParam: Record<string, string[]> = {};
                            newParam[opt.key] = [param];

                            return (
                              <MenuItem
                                p="0"
                                key={param}
                                bgColor={(avatarOptions as any)[opt.key] === param ? 'lightblue' : undefined}
                                onClick={() => {
                                  const newOpt: Record<string, string[]> = {};
                                  newOpt[opt.key] = [param];
                                  setAvatarOptions((state) => ({ ...state, ...newOpt }));
                                }}
                              >
                                <Image
                                  boxSize="3rem"
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
                                  mr="12px"
                                />
                              </MenuItem>
                            );
                          })}
                        </Grid>
                      </MenuList>
                    </Menu>
                  </Flex>
                ))}

                <GridItem w="100%">
                  <Flex gap="1rem" align="center" justify="center">
                    <Text color="gray300">Usar óculos?</Text>
                    <Switch
                      value={(avatarOptions.glassesProbability || 0) * 100}
                      onChange={(e) => setAvatarOptions((state) => ({ ...state, glassesProbability: Number(e.target.checked) * 100 }))}
                    />
                  </Flex>
                </GridItem>
              </Grid>
            </Flex>
          </Flex>
        </Flex>
        <Flex
          bgColor="white"
          direction="column"
          borderRadius="10px"
          boxShadow="md"
          w="100%"
          padding="20px"
          gap="20px"
          justify="space-between"
          display={{ base: `none`, xl: `flex` }}
        >
          <Text borderBottom="1px" borderColor="gray300" padding="0 20px 20px" color="gray300">
            Seu ranking global
          </Text>
          <Flex p="20px">
            <Flex gap="8px" align="center" flex="1">
              <Avatar src={user.avatar} size="sm" />
              <Text color="gray300">{user.username}</Text>
            </Flex>
            <Text align="center" fontWeight="600" color="gray300">
              #12
            </Text>
          </Flex>
          <Flex direction="column" gap="10px" flex="1" justify="flex-end">
            <Text color="gray300">Suba seu ranking jogando os desafios diários!</Text>
            <Button onClick={() => router.push('/challenge')}>Jogar agora!</Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
