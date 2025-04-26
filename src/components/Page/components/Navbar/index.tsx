import { Flex, Icon, Image, Spinner, Text, useColorMode } from '@chakra-ui/react';
import NextImage from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { Uploader } from 'rsuite';
import { motion } from 'framer-motion';

import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { dimensions } from '@/styles/global';
import { formatCoin, formatShortName } from '@/_base/utils';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { updateProfile } from '@/_base/services/user';
import { useAvatar, useProfile } from '../../hooks';
import { IHubUser } from '@/_base/interfaces/user';
import { MenuItemType } from '../../interfaces';
import { iconList } from '@/_base/config/iconList';
import { useSelectedSchool } from '../Header';
import { CustomActions } from '@/_base/interfaces/customActions';

export interface INavbarProps {
  page: string;
  user?: IHubUser;
  menuItems: MenuItemType[];
}

export const Navbar: React.FC<INavbarProps> = ({ page, user: _user, menuItems }) => {
  const router = useCustomRouter();
  const { colorMode } = useColorMode();
  const { avatar, setAvatar } = useAvatar();
  const { user, setUser } = useProfile();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [actions, setActions] = useState<CustomActions[]>([]);

  const { customActions } = useSelectedSchool();

  useEffect(() => {
    if (_user) setUser({ ...user, ..._user });
    setAvatar(_user?.avatar || user.avatar);
  }, [_user]);

  useEffect(() => {
    setActions(customActions);
  }, [_user, customActions]);

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

  useEffect(() => {
    setTimeout(() => {
      setIsOpen(true);
    }, 250);
  }, []);

  return (
    <Flex
      direction="column"
      bg="white"
      minW={{ base: `calc(${dimensions.navbar.width} - 3rem)`, xl: dimensions.navbar.width }}
      maxW={{ base: `calc(${dimensions.navbar.width} - 3rem)`, xl: dimensions.navbar.width }}
      gap={{ base: `0.6rem`, xl: '1rem' }}
      overflow="hidden"
      userSelect="none"
      borderRadius="8px"
      boxShadow="md"
      margin={{ base: '1rem', xl: '1.5rem' }}
      display={{ base: `none`, lg: `flex` }}
    >
      <Flex direction="column" gap={{ base: '0.5rem', xl: '1rem' }}>
        {/* Avatar */}
        <Flex
          bg={colorMode === 'light' ? 'primary900' : 'primary400'}
          h={{ base: `85px`, xl: '102px' }}
          position="relative"
          borderRadius="8px"
          minH={{ base: `85px`, xl: '102px' }}
        >
          <Flex
            title="Trocar foto de perfil"
            position="absolute"
            borderRadius="50%"
            bg="gray300"
            bottom={{ base: `-1.2rem`, xl: '-2rem' }}
            w={{ base: `4.75rem`, xl: '6rem' }}
            h={{ base: `4.75rem`, xl: '6rem' }}
            left="50%"
            transform="translate(-50%, 0)"
            boxShadow=" 0px 4px 6px -2px"
            overflow="hidden"
            border="4px"
            borderColor="white"
          >
            <NextImage loader={() => avatar} src={avatar} width={100} height={100} alt="" style={{ opacity: isUpdating ? `0.4` : `1` }} priority />
          </Flex>
          {isUpdating && (
            <Flex
              position="absolute"
              borderRadius="50%"
              bottom={{ base: `-1.2rem`, xl: '-2rem' }}
              w={{ base: `4.75rem`, xl: '6rem' }}
              h={{ base: `4.75rem`, xl: '6rem' }}
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
                p="0.25rem"
                bg="white"
                position="absolute"
                left={{ base: `calc(50% + 1.75rem)`, xl: 'calc(50% + 2.5rem)' }}
                transform="translate(-50%, 0)"
                cursor={'pointer'}
                _hover={{ filter: `brightness(0.9)` }}
                bottom="-1.5rem"
                onClick={() => e.onClick(e)}
              >
                <FiEdit2 size="1rem" color="#98A2B3" />
              </Flex>
            )}
          />
        </Flex>

        {/* Informações */}
        <Flex bg="white" display="column" padding={{ base: `0 1.5rem`, xl: '0 2.5rem' }} gap="0.5rem" h="fit-content" mt="1.5rem">
          <Flex fontSize={{ base: `16px`, xl: '18px' }} fontWeight="600" flex="1 0 0" color="primary900" justify="space-between" align="center">
            {formatShortName(user?.name || '', true)}
            <Flex cursor="pointer" transition="all 0.12s" _hover={{ filter: 'brightness(0.7)' }} onClick={() => router.push('/profile?opened=true')}>
              <FiEdit2 size="1rem" color="#98A2B3" />
            </Flex>
          </Flex>
          <Flex fontSize="12px" fontWeight="400" color="gray400" h="18px" display="column">
            {user?.email}
          </Flex>
          <Flex fontSize="13px" color="gray600" fontWeight="400" marginTop="0.5rem" maxH="8rem" overflow="auto" opacity={user?.bio ? '1' : '0'}>
            {user?.bio || '.'}
          </Flex>
        </Flex>

        {/* Ranking */}
        <Flex bg="white" display="column" p={{ base: `0 1.5rem`, xl: '0 2.5rem' }} gap="0.5rem" h="fit-content">
          {user?.role === 'student' && (
            <Flex
              fontWeight="600"
              p={{ base: '0.5rem', xl: '1rem 0.5rem' }}
              gap="1.25rem"
              color="white"
              borderColor="primary600"
              bg="primary400"
              borderRadius="10px"
              justify="center"
              align="center"
              w="100%"
            >
              <>
                <Flex align="center" justify="center" gap="0.45rem">
                  <Image src="/icons/coin.svg" />
                  <Text>{formatCoin(user.metadata.coins || 0)}</Text>
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
            </Flex>
          )}
        </Flex>
      </Flex>

      {/* Menu */}
      <motion.div
        style={{
          display: `flex`,
          margin: '0 1.25rem 0 0',
          padding: '0.5rem 0.25rem 0.5rem 1.5rem',
          flexDirection: 'column',
          gap: '0.5rem',
          overflow: 'hidden auto',
          alignItems: 'flex-end',
          marginBottom: `1rem`,
        }}
        animate={isOpen ? 'open' : 'closed'}
        variants={{
          open: {
            clipPath: 'inset(0% 0% 0% 0% round 10px)',
            transition: {
              type: 'spring',
              bounce: 0,
              duration: 0.7,
              delayChildren: 0.3,
              staggerChildren: 0.05,
            },
          },
          closed: {
            opacity: 0,
            clipPath: 'inset(10% 50% 90% 50% round 10px)',
            transition: {
              type: 'spring',
              bounce: 0,
              duration: 0.3,
            },
          },
        }}
      >
        {menuItems.map((item) => (
          <motion.div
            key={item.name}
            ref={item.ref as any}
            style={{ width: `100%`, flexDirection: `column`, fontWeight: `600` }}
            // initial={{ opacity: 0, scale: 0 }}
            // animate={{ opacity: 1, scale: 1, x: [0, 100, 500, 100, 0] }}

            variants={{
              open: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 300, damping: 24 },
              },
              closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
            }}
          >
            <Flex
              align="center"
              padding="10px 18px"
              transition="all 0.15s"
              borderRadius="8px"
              fontSize={{ base: `14px`, xl: '15px' }}
              cursor="pointer"
              _hover={{ outline: '1px solid #3356B7' }}
              bg={page === item.page ? 'primary700' : 'primary50'}
              color={page === item.page && colorMode === 'dark'
                ? 'primary25'
                : page !== item.page && colorMode === 'dark'
                ? 'primary25'
                : page === item.page && colorMode === 'light'
                ? 'primary25'
                : 'primary800'}
              onClick={() => router.push(`/${item.page}`)}
            >
              {item.icon && <Icon mr="3" fontSize="16" as={item.icon} />}
              {item.name}
            </Flex>
          </motion.div>
        ))}
      </motion.div>

      {!!actions.length && (
        <Flex flex="1" color="primary700" gap="1.25rem" justify="center" align="flex-end" p="1rem 1rem 2rem">
          {actions.map((action, i) => (
            <motion.a
              key={action.type + i}
              href={action.data.link}
              target="_blank"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              style={{
                display: `flex`,
                flexDirection: `column`,
                alignItems: `center`,
                justifyContent: `center`,
                background: `#F9F5FF`,
                border: `1px solid #d9d5dd88`,
                height: `3.25rem`,
                minWidth: `4rem`,
                padding: `0.25rem`,
                gap: `0.23rem`,
                borderRadius: `8px`,
                cursor: `pointer`,
              }}
            >
              <Icon fontSize="20" as={iconList[action.data.icon]} />
              <Text lineHeight="1" noOfLines={1} textAlign="center" letterSpacing={0.5} fontWeight="500">
                {action.data.label}
              </Text>
            </motion.a>
          ))}
        </Flex>
      )}
    </Flex>
  );
};
