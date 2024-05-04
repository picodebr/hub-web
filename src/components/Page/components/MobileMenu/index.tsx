import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Icon,
  Image,
  Spinner,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import NextImage from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Uploader } from 'rsuite';

import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { formatShortName } from '@/_base/utils';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { updateProfile } from '@/_base/services/user';
import { useAvatar, useProfile } from '../../hooks';
import { IHubUser } from '@/_base/interfaces/user';
import { MenuItemType } from '../../interfaces';
import { HiMenu } from 'react-icons/hi';
import { FiEdit2, FiLogOut } from 'react-icons/fi';

export interface INavbarProps {
  page: string;
  user?: IHubUser;
  menuItems: MenuItemType[];
}

export const MobileMenu: React.FC<INavbarProps> = ({ page, user: _user, menuItems }) => {
  const btnRef = useRef<any>();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useCustomRouter();
  const { avatar, setAvatar } = useAvatar();
  const { user, setUser } = useProfile();

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (_user) setUser({ ...user, ..._user });
    setAvatar(_user?.avatar || user.avatar);
  }, [_user]);

  const handleUploadAvatar = useCallback(async (file?: File) => {
    if (file) {
      setIsUpdating(true);
      const response = await getPresignedUrl(file.type, 'avatars');
      await uploadFile(response.link, file);

      setTimeout(async () => {
        const updatedUser = await updateProfile({ avatar: response.path });
        setAvatar(updatedUser.avatar || ``);
        setIsUpdating(false);
      }, 1000);
    }
  }, []);

  return (
    <>
      <Button ref={btnRef} onClick={onOpen} className="only-mobile">
        <Flex justify="center" fontSize="1.5rem">
          <HiMenu />
        </Flex>
      </Button>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader display="flex">
            <Flex position="relative">
              <Flex
                title="Trocar foto de perfil"
                borderRadius="50%"
                bg="gray300"
                w="4.5rem"
                h="4.5rem"
                left="50%"
                boxShadow=" 0px 4px 6px -2px"
                overflow="hidden"
                border="4px"
                borderColor="white"
              >
                <NextImage
                  loader={() => avatar}
                  src={avatar}
                  width={100}
                  height={100}
                  alt=""
                  style={{ opacity: isUpdating ? `0.4` : `1` }}
                  priority
                />
              </Flex>
              {isUpdating && (
                <Flex
                  position="absolute"
                  borderRadius="50%"
                  w="4.75rem"
                  h="4.75rem"
                  left="50%"
                  transform="translate(-50%, 0)"
                  align="center"
                  justify="center"
                >
                  <Spinner size="xl" />
                </Flex>
              )}
              <Uploader
                autoUpload={true}
                accept={`img/*`}
                draggable={false}
                action=""
                fileListVisible={false}
                onChange={(e) => {
                  handleUploadAvatar(e[0]?.blobFile as File);
                }}
                toggleAs={(e) => (
                  <Flex
                    border="1px"
                    borderColor="gray300"
                    borderRadius="50%"
                    p="0.2rem"
                    bg="white"
                    position="absolute"
                    left="calc(50% + 1.75rem)"
                    transform="translate(-50%, 0)"
                    cursor="pointer"
                    _hover={{ filter: `brightness(0.9)` }}
                    bottom="0"
                    onClick={() => e.onClick(e)}
                  >
                    <FiEdit2 size="1rem" color="#98A2B3" />
                  </Flex>
                )}
              />
            </Flex>
            <Flex flex="1" mx="1rem" direction="column" gap="0.5rem">
              <Text fontSize="18px">{formatShortName(user?.name || '', true)}</Text>
              <Text fontSize="13px" fontWeight="400" color="gray400">
                {user?.email}
              </Text>
            </Flex>
          </DrawerHeader>

          <DrawerBody display="flex" flexDirection="column" gap="2rem">
            <Flex
              fontWeight="600"
              p="0.5rem"
              gap="1.25rem"
              color="white"
              borderColor="primary600"
              bg="primary400"
              borderRadius="10px"
              justify="center"
              align="center"
              w="100%"
            >
              {user?.role === 'student' ? (
                <>
                  <Flex align="center" justify="center" gap="0.45rem">
                    <Image src="/icons/coin.svg" />
                    <Text>0</Text>
                  </Flex>
                  <Flex align="center" justify="center" gap="0.45rem" onClick={() => router.push('/ranking')}>
                    <Image src="/icons/medal.svg" />
                    <Text>#0</Text>
                  </Flex>
                  <Flex align="center" justify="center" gap="0.45rem">
                    <Image src="/icons/cash.svg" />
                    <Text>0</Text>
                  </Flex>
                </>
              ) : (
                <>
                  <Flex align="center" justify="center" gap="0.45rem">
                    <Image src="/icons/coin.svg" />
                    <Text>0</Text>
                  </Flex>
                  <Flex cursor="pointer" align="center" gap="0.45rem" justify="center" onClick={() => router.push('/store')}>
                    <Image src="/icons/cash.svg" />
                    <Text>0</Text>
                  </Flex>
                </>
              )}
            </Flex>

            {/* Menu */}
            <Flex direction="column" gap="0.5rem" overflow="hidden auto" align="flex-end" mb="1rem">
              {menuItems.map((item) => (
                <Flex key={item.name} ref={item.ref as any} w="100%" direction="column" fontWeight="600">
                  <Flex
                    align="center"
                    padding="10px 18px"
                    transition="all 0.15s"
                    borderRadius="lg"
                    fontSize={{ base: `14px`, xl: '15px' }}
                    cursor="pointer"
                    bg={page === item.page ? 'primary50' : 'primary50'}
                    color={page === item.page ? 'primary900' : 'primary700'}
                    onClick={() => {
                      router.push(`/${item.page}`).then(() => onClose());
                    }}
                  >
                    {item.icon && <Icon mr="3" fontSize="16" as={item.icon} />}
                    {item.name}
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </DrawerBody>

          <DrawerFooter justifyContent="flex-start">
            <Flex
              cursor="pointer"
              bg="#FDA29B"
              color="white"
              align="center"
              gap="1rem"
              fontWeight="500"
              fontSize="16px"
              p="10px 18px"
              transition="all 0.15s"
              borderRadius="lg"
              alignSelf="flex-start"
              _hover={{ filter: 'brightness(0.7)' }}
              onClick={() => router.push('/logout')}
            >
              <Flex transform="rotate(180deg)" fontSize="1.2rem">
                <FiLogOut />
              </Flex>
              <Text>Sair</Text>
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
