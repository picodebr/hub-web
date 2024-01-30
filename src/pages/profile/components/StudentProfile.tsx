import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiHelpCircle } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import { Flex, Img, Text, useUpdateEffect } from '@chakra-ui/react';
import { Result, ResultConvertOptions, createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { Button } from '@chakra-ui/react';
import { Grid, GridItem } from '@chakra-ui/react';

import { Image, Menu, MenuButton, MenuItem, MenuList, Switch } from '@chakra-ui/react';
import { cookieManager } from '@/_base/utils';
import { IAvatarOptions, IProfileComponentProps } from './interfaces';
import { defaultAvatarOptions } from './utils';
import { GenericButton } from '@/components/Buttons/Generic';
import { useAuth } from '@/_base/hooks';

export const StudentProfile: React.FC<IProfileComponentProps> = ({ user }) => {
  const [avatarOptions, setAvatarOptions] = useState<IAvatarOptions>({ skinColor: `ccc` });
  const [rawAvatar, setRawAvatar] = useState<(Result & ResultConvertOptions) | null>(null);
  const { setUser } = useAuth();

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
    cookieManager.setCookie(`avatar:uri`, avatar, undefined, false);
    cookieManager.setCookie(`avatar`, JSON.stringify(avatarOptions));
    if (user.role === `student`) setUser({ ...user, avatar });
  }, [avatarOptions]);

  useUpdateEffect(() => {
    if (user.role === `student`) setUser({ ...user, avatar });
  }, [avatar]);

  useEffect(() => {
    const avatarTemp = cookieManager.getCookie(`avatar`, true) as IAvatarOptions;
    if (avatarTemp?.skinColor) setAvatarOptions(avatarTemp);
  }, []);

  const downloadAvatar = useCallback(async () => {
    if (rawAvatar) await rawAvatar?.png().toFile(`${user?.name?.split(` `)[0] || ``} avatar picode`);
  }, [rawAvatar]);

  return (
    <Flex w="100%" gap="24px" direction="column">
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
        <Flex justify="space-between">
          <Flex direction="column" p="20px" justify="space-between" align="center">
            <Img src={avatar} w="200px" h="200px" alt="Avatar" />
            <GenericButton label="Download" w="fit-content" btntype="outline" size="xs" onClick={() => !!rawAvatar && downloadAvatar()} />
          </Flex>
          <Flex gap="8px" overflow="visible" align="center">
            <Grid templateColumns="repeat(2, 1fr)" templateRows="repeat(4, 1fr)" gap={3}>
              <GridItem w="100%">
                <Menu>
                  <MenuButton as={Button} rightIcon={<IoIosArrowDown />} w="9.35rem" h="2rem" fontSize="15px" fontWeight="500">
                    Cor da pele
                  </MenuButton>
                  <MenuList>
                    {defaultAvatarOptions.skinColor.map((skinColor) => (
                      <MenuItem
                        key={skinColor}
                        bgColor={avatarOptions.hair === skinColor ? 'lightblue' : undefined}
                        onClick={() => setAvatarOptions((state) => ({ ...state, skinColor }))}
                      >
                        <Image
                          boxSize="2rem"
                          borderRadius="full"
                          src={createAvatar(adventurer, {
                            size: 200,
                            skinColor: [skinColor] as any,
                            earrings: [avatarOptions.earrings] as any,
                            eyebrows: [avatarOptions.eyebrows] as any,
                            eyes: [avatarOptions.eyes] as any,
                            glassesProbability: avatarOptions.glassesProbability,
                            glasses: [avatarOptions.glasses] as any,
                            hair: [avatarOptions.hair] as any,
                            hairColor: [avatarOptions.hairColor] as any,
                            mouth: [avatarOptions.mouth] as any,
                          }).toDataUriSync()}
                          alt="anderson viado"
                          mr="12px"
                        />
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </GridItem>

              <GridItem w="100%">
                <Menu>
                  <MenuButton as={Button} rightIcon={<IoIosArrowDown />} w="9.35rem" h="2rem" fontSize="15px" fontWeight="500">
                    Cabelos
                  </MenuButton>
                  <MenuList overflow="hidden auto" h="15rem">
                    {defaultAvatarOptions.hair.map((hair) => (
                      <MenuItem
                        key={hair}
                        bgColor={avatarOptions.hair === hair ? 'lightblue' : undefined}
                        onClick={() => setAvatarOptions((state) => ({ ...state, hair }))}
                      >
                        <Image
                          boxSize="2rem"
                          borderRadius="full"
                          src={createAvatar(adventurer, {
                            size: 200,
                            skinColor: [avatarOptions.skinColor] as any,
                            earrings: [avatarOptions.earrings] as any,
                            eyebrows: [avatarOptions.eyebrows] as any,
                            eyes: [avatarOptions.eyes] as any,
                            glassesProbability: avatarOptions.glassesProbability,
                            glasses: [avatarOptions.glasses] as any,
                            hair: [hair] as any,
                            hairColor: [avatarOptions.hairColor] as any,
                            mouth: [avatarOptions.mouth] as any,
                          }).toDataUriSync()}
                          alt=""
                          mr="12px"
                        />
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </GridItem>

              <GridItem w="100%">
                <Menu>
                  <MenuButton as={Button} rightIcon={<IoIosArrowDown />} w="9.35rem" h="2rem" fontSize="15px" fontWeight="500">
                    Cor do Cabelo
                  </MenuButton>
                  <MenuList overflow="hidden auto" h="15rem">
                    {defaultAvatarOptions.hairColor.map((hairColor) => (
                      <MenuItem
                        key={hairColor}
                        bgColor={avatarOptions.hairColor === hairColor ? 'lightblue' : undefined}
                        onClick={() => setAvatarOptions((state) => ({ ...state, hairColor }))}
                      >
                        <Image
                          boxSize="2rem"
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
                            hairColor: [hairColor] as any,
                            mouth: [avatarOptions.mouth] as any,
                          }).toDataUriSync()}
                          alt=""
                          mr="12px"
                        />
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </GridItem>

              <GridItem w="100%">
                <Menu>
                  <MenuButton as={Button} rightIcon={<IoIosArrowDown />} w="9.35rem" h="2rem" fontSize="15px" fontWeight="500">
                    Olhos
                  </MenuButton>
                  <MenuList overflow="hidden auto" h="15rem">
                    {defaultAvatarOptions.eyes.map((eyes) => (
                      <MenuItem
                        key={eyes}
                        bgColor={avatarOptions.eyes === eyes ? 'lightblue' : undefined}
                        onClick={() => setAvatarOptions((state) => ({ ...state, eyes }))}
                      >
                        <Image
                          boxSize="2rem"
                          borderRadius="full"
                          src={createAvatar(adventurer, {
                            size: 200,
                            skinColor: [avatarOptions.skinColor] as any,
                            earrings: [avatarOptions.earrings] as any,
                            eyebrows: [avatarOptions.eyebrows] as any,
                            eyes: [eyes] as any,
                            glassesProbability: avatarOptions.glassesProbability,
                            glasses: [avatarOptions.glasses] as any,
                            hair: [avatarOptions.hair] as any,
                            hairColor: [avatarOptions.hairColor] as any,
                            mouth: [avatarOptions.mouth] as any,
                          }).toDataUriSync()}
                          alt=""
                          mr="12px"
                        />
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </GridItem>

              <GridItem w="100%">
                <Menu>
                  <MenuButton as={Button} rightIcon={<IoIosArrowDown />} w="9.35rem" h="2rem" fontSize="15px" fontWeight="500">
                    Sobrancelhas
                  </MenuButton>
                  <MenuList overflow="hidden auto" h="15rem">
                    {defaultAvatarOptions.eyebrows.map((eyebrows) => (
                      <MenuItem
                        key={eyebrows}
                        bgColor={avatarOptions.eyebrows === eyebrows ? 'lightblue' : undefined}
                        onClick={() => setAvatarOptions((state) => ({ ...state, eyebrows }))}
                      >
                        <Image
                          boxSize="2rem"
                          borderRadius="full"
                          src={createAvatar(adventurer, {
                            size: 200,
                            skinColor: [avatarOptions.skinColor] as any,
                            earrings: [avatarOptions.earrings] as any,
                            eyebrows: [eyebrows] as any,
                            eyes: [avatarOptions.eyes] as any,
                            glassesProbability: avatarOptions.glassesProbability,
                            glasses: [avatarOptions.glasses] as any,
                            hair: [avatarOptions.hair] as any,
                            hairColor: [avatarOptions.hairColor] as any,
                            mouth: [avatarOptions.mouth] as any,
                          }).toDataUriSync()}
                          alt=""
                          mr="12px"
                        />
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </GridItem>

              <GridItem w="100%">
                <Menu>
                  <MenuButton as={Button} rightIcon={<IoIosArrowDown />} w="9.35rem" h="2rem" fontSize="15px" fontWeight="500">
                    Bocas
                  </MenuButton>
                  <MenuList overflow="hidden auto" h="15rem">
                    {defaultAvatarOptions.mouth.map((mouth) => (
                      <MenuItem
                        key={mouth}
                        bgColor={avatarOptions.hair === mouth ? 'lightblue' : undefined}
                        onClick={() => setAvatarOptions((state) => ({ ...state, mouth }))}
                      >
                        <Image
                          boxSize="2rem"
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
                            mouth: [mouth] as any,
                          }).toDataUriSync()}
                          alt=""
                          mr="12px"
                        />
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </GridItem>

              <GridItem w="100%">
                <Flex gap="1rem" align="center" justify="center">
                  <Text>Usar óculos?</Text>
                  <Switch
                    value={(avatarOptions.glassesProbability || 0) * 100}
                    onChange={(e) => setAvatarOptions((state) => ({ ...state, glassesProbability: Number(e.target.checked) * 100 }))}
                  />
                </Flex>
              </GridItem>

              {!!avatarOptions.glassesProbability && (
                <GridItem w="100%">
                  <Menu>
                    <MenuButton as={Button} rightIcon={<IoIosArrowDown />} w="9.35rem" h="2rem" fontSize="15px" fontWeight="500">
                      Óculos
                    </MenuButton>
                    <MenuList overflow="hidden auto" h="15rem">
                      {defaultAvatarOptions.glasses.map((glasses) => (
                        <MenuItem
                          key={glasses}
                          bgColor={avatarOptions.glasses === glasses ? 'lightblue' : undefined}
                          onClick={() => setAvatarOptions((state) => ({ ...state, glasses }))}
                        >
                          <Image
                            boxSize="2rem"
                            borderRadius="full"
                            src={createAvatar(adventurer, {
                              size: 200,
                              skinColor: [avatarOptions.skinColor] as any,
                              earrings: [avatarOptions.earrings] as any,
                              eyebrows: [avatarOptions.eyebrows] as any,
                              eyes: [avatarOptions.eyes] as any,
                              glassesProbability: avatarOptions.glassesProbability,
                              glasses: [glasses] as any,
                              hair: [avatarOptions.hair] as any,
                              hairColor: [avatarOptions.hairColor] as any,
                              mouth: [avatarOptions.mouth] as any,
                            }).toDataUriSync()}
                            alt=""
                            mr="12px"
                          />
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </GridItem>
              )}
            </Grid>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        bgColor="white"
        flexDirection="column"
        borderRadius="10px"
        boxShadow="md"
        w="100%"
        h="fit-content"
        padding="1.25rem"
        gap="1.25rem"
        textAlign="left"
        display="column"
        justify="space-between"
        color="gray600"
      >
        <Flex display="flex" justify="space-between" direction="row">
          <Text>Suporte Picode</Text>
          <FiHelpCircle color="#D0D5DD" />
        </Flex>
      </Flex>
    </Flex>
  );
};
