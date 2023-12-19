import { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import { FaPlus, FaRegFolder } from 'react-icons/fa';
import { FiHelpCircle, FiMoreVertical, FiUsers } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import { FaArrowDownLong } from 'react-icons/fa6';

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  AvatarGroup,
  Box,
  ButtonGroup,
  FormControl,
  FormLabel,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Switch,
} from '@chakra-ui/react';
import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { Flex, Img, Link, Progress, Text } from '@chakra-ui/react';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { Button } from '@chakra-ui/react';
import { Grid, GridItem } from '@chakra-ui/react';

interface IAvatarOptions {
  skinColor?: string;
  earrings?: string;
  eyebrows?: string;
  eyes?: string;
  glassesProbability?: number;
  glasses?: string;
  mouth?: string;
  hair?: string;
  hairColor?: string;
}

const defaultAvatarOptions = {
  skinColor: ['9e5622', '763900', 'ecad80', 'f2d3b1'],
  earrings: ['variant01', 'variant02', 'variant03', 'variant05', 'variant05', 'variant06'],
  hair: [
    'long01',
    'long02',
    'long03',
    'long04',
    'long05',
    'long06',
    'long07',
    'long08',
    'long09',
    'long10',
    'long11',
    'long12',
    'long13',
    'long14',
    'long15',
    'long16',
    'long17',
    'long18',
    'long19',
    'long20',
    'long21',
    'long22',
    'long23',
    'long24',
    'long25',
    'long26',
    'short01',
    'short02',
    'short03',
    'short04',
    'short05',
    'short06',
    'short07',
    'short08',
    'short09',
    'short10',
    'short11',
    'short12',
    'short13',
    'short14',
    'short15',
    'short16',
    'short17',
    'short18',
    'short19',
  ],
  hairColor: ['0e0e0e', '6a4e35', '796a45', '562306', 'ac6511', 'afafaf', 'b9a05f', 'cb6820', 'e5d7a3', '3ac2c', '85c2c6', '592454', 'ab2a18'],
  eyebrows: [
    'variant01',
    'variant02',
    'variant03',
    'variant04',
    'variant05',
    'variant06',
    'variant07',
    'variant08',
    'variant09',
    'variant10',
    'variant11',
    'variant12',
    'variant13',
    'variant14',
    'variant15',
  ],
  eyes: [
    'variant01',
    'variant02',
    'variant03',
    'variant04',
    'variant05',
    'variant06',
    'variant07',
    'variant08',
    'variant09',
    'variant10',
    'variant11',
    'variant12',
    'variant13',
    'variant14',
    'variant15',
    'variant16',
    'variant17',
    'variant18',
    'variant19',
    'variant20',
    'variant21',
    'variant22',
    'variant23',
    'variant24',
    'variant25',
    'variant26',
  ],
  glassesProbability: 0,
  glasses: ['variant01', 'variant02', 'variant03', 'variant04', 'variant05'],
  mouth: [
    'variant01',
    'variant02',
    'variant03',
    'variant04',
    'variant05',
    'variant06',
    'variant07',
    'variant08',
    'variant09',
    'variant10',
    'variant11',
    'variant12',
    'variant13',
    'variant14',
    'variant15',
    'variant16',
    'variant17',
    'variant18',
    'variant19',
    'variant20',
    'variant21',
    'variant22',
    'variant23',
    'variant24',
    'variant25',
    'variant26',
    'variant27',
    'variant28',
    'variant29',
    'variant30',
  ],
};

export const StudentProfile: React.FC = () => {
  const [avatarOptions, setAvatarOptions] = useState<IAvatarOptions>({});
  const avatar = useMemo(() => {
    return createAvatar(adventurer, {
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
    }).toDataUriSync();
  }, [avatarOptions]);
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
          <Flex direction="column" p="20px" justify="space-between">
            <Img src={avatar} w="200px" h="200px" alt="Avatar" />
          </Flex>
          <Flex gap="8px" overflow="visible" align="center">
            <Grid templateColumns="repeat(3, 1fr)" templateRows="repeat(3, 1fr)" gap={6}>
              <GridItem w="100%" h="10">
                <Menu>
                  <MenuButton as={Button} rightIcon={<IoIosArrowDown />}>
                    Cor da pele
                  </MenuButton>
                  <MenuList>
                    {defaultAvatarOptions.skinColor.map((skinColor, index) => (
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
              <GridItem w="100%" h="10">
                <Menu>
                  <MenuButton as={Button} rightIcon={<IoIosArrowDown />}>
                    Cabelos
                  </MenuButton>
                  <MenuList overflow="hidden auto" h="15rem">
                    {defaultAvatarOptions.hair.map((hair, index) => (
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
              <GridItem w="100%" h="10">
                <Menu>
                  <MenuButton as={Button} rightIcon={<IoIosArrowDown />}>
                    Cor do Cabelo
                  </MenuButton>
                  <MenuList overflow="hidden auto" h="15rem">
                    {defaultAvatarOptions.hairColor.map((hairColor, index) => (
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
              <GridItem w="100%" h="10">
                <Menu>
                  <MenuButton as={Button} rightIcon={<IoIosArrowDown />}>
                    Olhos
                  </MenuButton>
                  <MenuList overflow="hidden auto" h="15rem">
                    {defaultAvatarOptions.eyes.map((eyes, index) => (
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
              <GridItem w="100%" h="10">
                <Menu>
                  <MenuButton as={Button} rightIcon={<IoIosArrowDown />}>
                    Sobrancelhas
                  </MenuButton>
                  <MenuList overflow="hidden auto" h="15rem">
                    {defaultAvatarOptions.eyebrows.map((eyebrows, index) => (
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

              <GridItem w="100%" h="10">
                <Menu>
                  <MenuButton as={Button} rightIcon={<IoIosArrowDown />}>
                    Bocas
                  </MenuButton>
                  <MenuList overflow="hidden auto" h="15rem">
                    {defaultAvatarOptions.mouth.map((mouth, index) => (
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
              <GridItem w="100%" h="10">
                <Flex>
                  <Text>Usar óculos?</Text>
                  <Switch
                    value={(avatarOptions.glassesProbability || 0) * 100}
                    onChange={(e) => setAvatarOptions((state) => ({ ...state, glassesProbability: Number(e.target.checked) * 100 }))}
                  />
                </Flex>
              </GridItem>
              {!!avatarOptions.glassesProbability && (
                <GridItem w="100%" h="10">
                  <Menu>
                    <MenuButton as={Button} rightIcon={<IoIosArrowDown />}>
                      Óculos
                    </MenuButton>
                    <MenuList overflow="hidden auto" h="15rem">
                      {defaultAvatarOptions.glasses.map((glasses, index) => (
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
