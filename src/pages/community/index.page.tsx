import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { Avatar, Button, Divider, Flex, Image, Input, Link, Text, Tooltip } from '@chakra-ui/react';
import { Checkbox } from '@chakra-ui/react';

import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { FiMessageCircle, FiSend, FiThumbsUp } from 'react-icons/fi';
import { FaPaperclip } from 'react-icons/fa';
import { HiLightBulb, HiOutlineLightBulb } from 'react-icons/hi2';
import { MdOutlinePlayCircleFilled } from 'react-icons/md';
import { TbThumbUpFilled } from 'react-icons/tb';
import { IoMdHeart } from 'react-icons/io';
import { RiUserStarFill } from 'react-icons/ri';

const Assistance: React.FC = () => {
  return (
    <Flex display="flex" justify="center" flexDirection="row" flexWrap="wrap" gap="32px" overflow="auto">
      {' '}
      <Flex
        bgColor="white"
        flexDirection="column"
        border="1px"
        borderColor="gray300"
        borderRadius="12px"
        w="100%"
        h="fit-content"
        padding="20px 20px 16px 20px"
        gap="20px"
        textAlign="left"
        display="flex"
        justify="center"
      >
        <Flex direction="row" gap="32px">
          <Input placeholder="Comece uma publicação" borderColor="gray300" />
          <Button bgColor="primary300" color="white" p="12px">
            <FiSend size="20px" />
          </Button>
        </Flex>
        <Flex display="flex" direction="column" h="fit-content">
          <Button border="1px" borderColor="gray300" bgColor="transparent" gap="8px" w="100px" h="40px">
            <FaPaperclip />
            Anexo
          </Button>
        </Flex>
      </Flex>
      <Flex
        bgColor="white"
        flexDirection="column"
        border="1px"
        borderColor="gray300"
        borderRadius="12px"
        w="100%"
        h="fit-content"
        padding="20px 20px 16px 20px"
        gap="20px"
        textAlign="left"
        display="flex"
        justify="center"
      >
        <Flex gap="12px">
          <Avatar name="Maria Alessandra" />
          <Flex direction="column">
            <Text fontWeight="600" color="primary500">
              Maria Alessandra
            </Text>
            <Text fontSize="14px" color="gray700">
              @alemari
            </Text>
          </Flex>
        </Flex>
        <Flex fontWeight="500" fontSize="14px">
          Queria muito compartilhar esse novo projeto que desenvolvi com a turma do 3º ano!
        </Flex>
        <Flex w="100%" h="174px" border="1px" borderColor="gray300" borderRadius="8px" bgColor="gray300" align="center" justify="center">
          <MdOutlinePlayCircleFilled size="64px" color="white" />
        </Flex>
        <Divider />
        <Flex gap="32px">
          <Input placeholder="Faça um comentário" borderColor="gray300" />
          <Button bgColor="transparent" border="1px" borderColor="gray300">
            <FiThumbsUp size="20px" />
          </Button>
        </Flex>
        <Flex w="93%" h="fit-content" p="20x" borderRadius="0px 10px 10px 10px" border="1px" borderColor="gray300">
          <Flex p="20px" gap="22px">
            <Avatar name="Maria Alessandra" size="sm" />
            <Flex direction="column">
              <Text fontWeight="600" color="primary500">
                Júlia Afonso
              </Text>
              <Text fontSize="14px" color="gray700">
                @juafonso
              </Text>
              <Text fontSize="14px">
                Alessandra!! Que projeto fenomenal. Adoraria ter um contato mais de perto contigo para replicar esse projeto para a minha turma de 4º
                ano.
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Flex w="100%" h="fit-content" justify="flex-end">
          <Flex w="93%" h="fit-content" p="20x" borderRadius="10px 10px 0px 10px" bgColor="primary400">
            <Flex p="20px" gap="22px">
              <Avatar name="Maria Alessandra" size="sm" />
              <Flex direction="column">
                <Text fontWeight="600" color="white">
                  Maria Alessandra
                </Text>
                <Text fontSize="14px" color="white">
                  @alemari
                </Text>
                <Flex mt="8px">
                  <Text fontSize="14px" color="white">
                    Claro Júlia! Me chama que conversamos sobre.
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex w="100%" h="fit-content" justify="space-between" fontSize="20px" mt="-12px">
          <Flex color="primary700" gap="6px" ml="83px">
            <FiMessageCircle />
            <Text fontSize="14px" fontWeight="600">
              Responder
            </Text>
          </Flex>
          <Flex gap="9px">
            <Tooltip label="Gostei">
              <span>
                <TbThumbUpFilled color="#3D7AFF" />
              </span>
            </Tooltip>
            <Tooltip label="Amei">
              <span>
                <IoMdHeart color="#FF525C" />
              </span>
            </Tooltip>
            <Tooltip label="Genial">
              <span>
                <HiLightBulb color="#F5BA3D" />
              </span>
            </Tooltip>
            <Tooltip label="Apoio">
              <span>
                <RiUserStarFill color="#21E080" />
              </span>
            </Tooltip>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Assistance;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'assistance';

  try {
    cookieManager.updateToken(req);

    await validateSession();

    return { props: { selectedPage, pageTitle: 'Suporte PiCode', showBackButton: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
