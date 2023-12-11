import { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import { FaPlus, FaRegFolder } from 'react-icons/fa';
import { FiDivide, FiHelpCircle, FiMoreVertical, FiUsers } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import { Header } from 'rsuite';

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
import teacherProfile from './components/TeacherProfile';
import studentProfile from './components/StudentProfile';
import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { Flex, Img, Link, Progress, Text } from '@chakra-ui/react';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { Button } from '@chakra-ui/react';
import { FaArrowDownLong } from 'react-icons/fa6';
import { IconType } from 'react-icons';
import { IHubUser } from '@/_base/interfaces/user';
import { useCustomRouter } from '@/_base/hooks';
import { IoChevronForward } from 'react-icons/io5';
import { MdOutlinePlayCircleFilled } from 'react-icons/md';

interface IPropss {
  page: string;
  user?: IHubUser;
}

const Profile: React.FC<IPropss> = ({ page, user }) => {
  const componentUser = user?.role === 'student' ? studentProfile : teacherProfile;
  return <>{componentUser({ page, user })}</>;
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
