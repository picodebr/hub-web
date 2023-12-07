import { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import { FaPlus, FaRegFolder } from 'react-icons/fa';
import { FiMoreVertical, FiUsers } from 'react-icons/fi';
import { Header } from 'rsuite';

import { Avatar, AvatarGroup, ButtonGroup, Image, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { Flex, Img, Link, Progress, Text } from '@chakra-ui/react';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { Button } from '@chakra-ui/react';
import { FaArrowDownLong } from 'react-icons/fa6';

//TODO: add all as ?: string
interface IAvatarOptions {
  seed?: string;
  radius?: string;
  eyes?: string;
  eyebrows?: string;
  mouth?: string;
  hair?: string;
}

//TODO: add all avatar options
const defaultAvatarOptions = {
  hair: ['long01', 'long02', 'long03', 'long04', 'long05', 'long06', 'long07', 'long19', 'short08', 'short09', 'short16'],
  mouth: ['variant01', 'variant02', 'variant03'],
};

const Profile: React.FC = () => {
  const [avatarOptions, setAvatarOptions] = useState<IAvatarOptions>({});
  const avatar = useMemo(() => {
    return createAvatar(adventurer, {
      //TODO: add avatar options here
      seed: avatarOptions.seed,
      eyes: [avatarOptions.eyes] as any,
      hair: [avatarOptions.hair] as any,
      eyebrows: [avatarOptions.eyebrows] as any,
      mouth: [avatarOptions.mouth] as any,
    }).toDataUriSync();
  }, [avatarOptions]);

  return (
    <Flex w="100%">
      <Flex
        bgColor="white"
        flexDirection="row"
        borderRadius="10px"
        boxShadow="md"
        w="100%"
        h="fit-content"
        padding="20px"
        gap="20px"
        textAlign="left"
        display="row"
        justify="center"
        border="1px"
      >
        <Text w="100%" borderBottom="1px" borderColor="gray300" padding="0 20px 20px">
          Seu avatar
        </Text>
        <Flex direction="column" p="20px" justify="space-between">
          <Img src={avatar} w="200px" h="200px" alt="Avatar" />
        </Flex>
        //TODO: Add avatarOptions as menu list
        <Menu>
          <MenuButton as={Button} rightIcon={<FaArrowDownLong />}>
            Cabelos
          </MenuButton>
          <MenuList>
            {defaultAvatarOptions.hair.map((hair, index) => (
              <MenuItem
                key={hair}
                bgColor={avatarOptions.hair === hair ? 'lightblue' : undefined}
                onClick={() => setAvatarOptions((state) => ({ ...state, hair }))}
              >
                Cabelo {index + 1}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button} rightIcon={<FaArrowDownLong />}>
            Bocas
          </MenuButton>
          <MenuList>
            {defaultAvatarOptions.mouth.map((mouth, index) => (
              <MenuItem
                key={mouth}
                bgColor={avatarOptions.hair === mouth ? 'lightblue' : undefined}
                onClick={() => setAvatarOptions((state) => ({ ...state, mouth }))}
              >
                Boca {index + 1}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default Profile;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'profile';

  try {
    cookieManager.updateToken(req);

    // await validateSession();

    return { props: { selectedPage, pageTitle: 'Meu perfil' } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
