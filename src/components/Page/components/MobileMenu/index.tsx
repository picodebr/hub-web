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
  Avatar,
  Box,
  Divider,
  useColorMode,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Uploader } from 'rsuite';
import { motion } from 'framer-motion';
import NextImage from 'next/image';

import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { formatClassGrade, formatCoin, formatShortName } from '@/_base/utils';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { updateProfile } from '@/_base/services/user';
import { useAvatar, useProfile } from '../../hooks';
import { IHubUser } from '@/_base/interfaces/user';
import { MenuItemType } from '../../interfaces';
import { HiMenu } from 'react-icons/hi';
import { FiCamera, FiEdit2, FiLogOut } from 'react-icons/fi';
import { customActionTypes } from '@/_base/interfaces/customActions';
import { iconList } from '@/_base/config/iconList';
import { useSelectedSchool } from '../Header';

export interface INavbarProps {
  page: string;
  user?: IHubUser;
  menuItems: MenuItemType[];
}

export const MobileMenu: React.FC<INavbarProps> = ({ page, user: _user, menuItems }) => {
  const btnRef = useRef<any>();

  const { customActions } = useSelectedSchool();
  const { colorMode } = useColorMode();
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

  // Cores dinâmicas
  const bgDrawer = colorMode === 'light' ? 'white' : 'gray900';
  const borderColor = colorMode === 'light' ? 'gray200' : 'gray700';
  const textColor = colorMode === 'light' ? 'primary900' : 'white';

  return (
    <>
      {/* Botão de Abrir o Menu (Hamburguer) */}
      <Button
        ref={btnRef}
        onClick={onOpen}
        className="only-mobile"
        variant="ghost"
        p="0"
        w="40px"
        h="40px"
        borderRadius="lg"
        _hover={{ bg: colorMode === 'light' ? 'gray100' : 'gray800' }}
      >
        <Icon as={HiMenu} fontSize="1.75rem" color={colorMode === 'light' ? 'gray700' : 'gray200'} />
      </Button>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay backdropFilter="blur(2px)" />
        <DrawerContent bg={bgDrawer}>
          <DrawerCloseButton top="1rem" right="1rem" color="gray400" _hover={{ color: 'primary500' }} />

          {/* 1. HEADER (Perfil Integrado) */}
          <DrawerHeader display="flex" flexDirection="column" p="1.5rem 1.25rem 1rem" borderBottom="1px solid" borderColor={borderColor}>
            <Flex gap="1rem" align="center" w="100%">
              {/* Avatar & Uploader */}
              <Flex position="relative">
                <NextImage
                  loader={() => avatar}
                  src={avatar}
                  width={80}
                  height={80}
                  alt=""
                  style={{ opacity: isUpdating ? `0.4` : `1`, borderRadius: `50%` }}
                  priority
                />
                {isUpdating && (
                  <Flex borderRadius="50%" position="absolute" inset="0" align="center" justify="center">
                    <Spinner size="md" color="primary500" />
                  </Flex>
                )}
                <Uploader
                  autoUpload={true}
                  accept={`img/*`}
                  draggable={false}
                  action=""
                  fileListVisible={false}
                  onChange={(e) => handleUploadAvatar(e[0]?.blobFile as File)}
                  toggleAs={(e) => (
                    <Flex
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="50%"
                      p="0.35rem"
                      bg={bgDrawer}
                      position="absolute"
                      bottom="0"
                      right="0"
                      cursor="pointer"
                      boxShadow="sm"
                      transition="all 0.2s"
                      color="gray500"
                      onClick={() => e.onClick(e)}
                    >
                      <FiCamera size="0.85rem" />
                    </Flex>
                  )}
                />
              </Flex>

              {/* Informações do Usuário */}
              <Flex flex="1" direction="column" overflow="hidden" gap="2px">
                <Flex align="center" gap="0.5rem">
                  <Text fontSize="18px" fontWeight="700" color={textColor} isTruncated>
                    {formatShortName(user?.name || '', true)}
                  </Text>
                  <Flex
                    cursor="pointer"
                    color="gray400"
                    onClick={() => {
                      router.push('/profile?opened=true');
                      onClose();
                    }}
                  >
                    <FiEdit2 size="0.9rem" />
                  </Flex>
                </Flex>

                {user?.role === `student` ? (
                  <>
                    <Text fontSize="13px" fontWeight="500" color="gray500" isTruncated>
                      {user.hub_class?.display_name}
                    </Text>
                    <Text fontSize="12px" fontWeight="400" color="gray400" isTruncated>
                      Série: {formatClassGrade(user.hub_class?.grade)}
                    </Text>
                    {/* Badge de Moedas Minimalista */}
                    <Flex
                      align="center"
                      gap="0.35rem"
                      mt="4px"
                      bg="warning50"
                      w="fit-content"
                      px="0.6rem"
                      py="0.15rem"
                      borderRadius="full"
                      border="1px solid"
                      borderColor="warning200"
                    >
                      <Image src="/icons/coin.svg" alt="Moedas" w="14px" h="14px" />
                      <Text fontSize="12px" fontWeight="700" color="warning700">
                        {formatCoin(user.metadata.coins || 0)}
                      </Text>
                    </Flex>
                  </>
                ) : (
                  <Text fontSize="13px" fontWeight="500" color="gray500" isTruncated>
                    {user?.school_group?.display_name || user?.email}
                  </Text>
                )}
              </Flex>
            </Flex>
          </DrawerHeader>

          {/* 2. CORPO (Menu e Ações) */}
          <DrawerBody display="flex" flexDirection="column" gap="1rem" p="1.25rem" overflowY="auto">
            {/* Lista de Navegação */}
            <Flex direction="column" gap="0.25rem" w="100%">
              {menuItems.map((item) => {
                const isActive = page === item.page;

                return (
                  <Flex
                    key={item.name}
                    ref={item.ref as any}
                    w="100%"
                    align="center"
                    padding="12px 16px"
                    borderRadius="xl"
                    transition="all 0.2s"
                    cursor="pointer"
                    fontSize="15px"
                    fontWeight={isActive ? '700' : '500'}
                    bg={isActive ? 'primary700' : 'transparent'}
                    color={isActive ? 'primary25' : 'gray600'}
                    _hover={{ bg: isActive ? 'primary700' : 'gray50', color: isActive ? 'primary25' : 'primary700' }}
                    onClick={() => {
                      router.push(`/${item.page}`).then(() => onClose());
                    }}
                  >
                    <Icon mr="3" fontSize="20px" as={item.icon} opacity={isActive ? 1 : 0.7} />
                    {item.name}
                  </Flex>
                );
              })}
            </Flex>

            {/* Ações Customizadas (Bottom Widgets) */}
            {!!customActionTypes.length && !!customActions.length && (
              <>
                <Divider borderColor={borderColor} my="0.5rem" opacity={0.6} />
                <Flex wrap="wrap" gap="0.75rem" justify="space-between">
                  {customActions.map((action, i) => (
                    <motion.a
                      key={action.type + i}
                      href={action.data.link}
                      target="_blank"
                      whileTap={{ scale: 0.95 }}
                      style={{
                        display: `flex`,
                        flexDirection: `column`,
                        alignItems: `center`,
                        justifyContent: `center`,
                        flex: '1 1 40%',
                        border: `1px solid #EAECF0`,
                        height: `4.5rem`,
                        minWidth: `4rem`,
                        padding: `0.5rem`,
                        gap: `0.3rem`,
                        borderRadius: `12px`,
                        cursor: `pointer`,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        background: '#F9FAFB',
                      }}
                    >
                      <Icon fontSize="22px" as={iconList[action.data.icon]} color="primary700" />
                      <Text fontSize="12px" lineHeight="1" noOfLines={1} textAlign="center" fontWeight="600" color="#1D2939" mt="1">
                        {action.data.label}
                      </Text>
                    </motion.a>
                  ))}
                </Flex>
              </>
            )}
          </DrawerBody>

          {/* 3. RODAPÉ (Logout Elegante) */}
          <DrawerFooter borderTop="1px solid" borderColor={borderColor} p="1rem 1.25rem" justifyContent="flex-start">
            <Button
              variant="ghost"
              colorScheme="red"
              w="100%"
              justifyContent="flex-start"
              alignItems="center"
              gap="0.5rem"
              fontSize="15px"
              fontWeight="600"
              p="12px 16px"
              h="auto"
              borderRadius="xl"
              color="error600"
              _hover={{ bg: 'error50' }}
              onClick={() => {
                onClose();
                router.push('/logout');
              }}
            >
              <Icon as={FiLogOut} fontSize="18px" />
              Sair da conta
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
