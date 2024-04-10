import { Avatar, Button, Divider, Flex, Img, Input, Skeleton, Text, Tooltip } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { FiMessageCircle, FiSend, FiThumbsUp, FiTrash } from 'react-icons/fi';
import { FaPaperclip } from 'react-icons/fa';
import { HiLightBulb } from 'react-icons/hi2';
import { MdOutlinePlayCircleFilled } from 'react-icons/md';
import { TbThumbUpFilled } from 'react-icons/tb';
import { IoMdHeart } from 'react-icons/io';
import { RiUserStarFill } from 'react-icons/ri';
import { useEffect, useState } from 'react';

import { CommingSoon } from '@/components/CommingSoon';
import { useAsyncCallback, useAuth, useCustomToast, useInputHandler } from '@/_base/hooks';
import { IAddProjectAnnotationParams, IProject } from '@/_base/interfaces/project';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { GenericButton } from '@/components/Buttons/Generic';
import { formatShortName } from '@/_base/utils';
import moment from 'moment';
import { EMPTY_CREATE_REPORT_DATA, ICreateHubCommunityPostParams, IHubCommunityPost, communityPostSchema } from '@/_base/interfaces/community';
import { createCommunityPost, listCommunityPosts } from '@/_base/services/community';

const Community: React.FC = () => {
  const toast = useCustomToast();
  const { user } = useAuth();

  const [communityPosts, setCommunityPosts] = useState<IHubCommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const posts = await listCommunityPosts();
        console.log(posts);
        setCommunityPosts(posts);
      } catch {
        toast({ status: `error`, description: `Não foi possível exibir os posts` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
  const { checkErrors, data, errors, onInputChange, setData, setErrors, submit } = useInputHandler<ICreateHubCommunityPostParams>({
    schema: communityPostSchema,
    data: EMPTY_CREATE_REPORT_DATA,
  });

  const handleCommunityPost = useAsyncCallback(
    async () => {
      setIsLoading(true);
      const postResponse = await createCommunityPost(data);
      postResponse.user = user;
      setCommunityPosts((state) => [postResponse, ...state]);
      setData(EMPTY_CREATE_REPORT_DATA);
    },
    [data],
    true,
    () => setIsLoading(false),
  );

  return (
    <Flex display="flex" justify="center" flexDirection="row" flexWrap="wrap" gap="32px" overflow="hidden">
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
          <TextAreaInput
            value={data.content}
            onInputChange={(value) => onInputChange('content', value)}
            rows={8}
            bg="white"
            color="gray800"
            placeholder="Comece uma publicação"
          />
          <GenericButton
            label="Enviar"
            w="113px"
            h="44px"
            bg="primary300"
            color="white"
            gap="8px"
            onClick={() => submit(handleCommunityPost)}
            leftIcon={<FiSend size="20px" />}
            _hover={{
              filter: 'brightness(0.9)',
            }}
          />
        </Flex>
        <Flex display="flex" direction="column" h="fit-content">
          <Button border="1px" borderColor="gray300" bgColor="transparent" gap="8px" w="100px" h="40px">
            <FaPaperclip />
            Anexo
          </Button>
        </Flex>
      </Flex>
      <Skeleton display="flex" flexDirection="column" gap="20px" overflow="hidden auto" w="100%" h="100%" m="auto" isLoaded={!isLoading}>
        {communityPosts.map((post) => (
          <Flex
            key={post.id}
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
              <Avatar src={post.user.avatar || ''} name={post.user.name} />
              <Flex direction="column">
                <Text fontWeight="600" color="primary500">
                  {post.user.name}
                </Text>
                <Text fontSize="14px" color="gray700">
                  @{post.user.username}
                </Text>
              </Flex>
            </Flex>
            <Flex fontWeight="500" fontSize="14px">
              {post.content}
            </Flex>
            {/* <Divider />
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
                  Alessandra!! Que projeto fenomenal. Adoraria ter um contato mais de perto contigo para replicar esse projeto para a minha turma de
                  4º ano.
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
          </Flex> */}
          </Flex>
        ))}
      </Skeleton>
    </Flex>
  );
};

export default Community;

export const getServerSideProps: GetServerSideProps = async () => {
  const selectedPage = 'community';

  return { props: { selectedPage, pageTitle: 'Comunidade PiCode', showBackButton: false } };
};
