import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Link,
  Skeleton,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import mimetype from 'mime';
import { useEffect, useState } from 'react';

import { useAsyncCallback, useAuth, useCustomToast, useInputHandler } from '@/_base/hooks';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { GenericButton } from '@/components/Buttons/Generic';
import { EMPTY_CREATE_POST_DATA, ICreateHubCommunityPostParams, IHubCommunityPost, communityPostSchema } from '@/_base/interfaces/community';
import { createCommunityPost, listCommunityPosts } from '@/_base/services/community';
import { FileInput } from '@/components/Inputs/File';
import { Divider, Image } from 'antd';
import { TbFileText, TbThumbUpFilled } from 'react-icons/tb';
import { IoMdHeart } from 'react-icons/io';
import { HiLightBulb } from 'react-icons/hi';
import { RiUserStarFill } from 'react-icons/ri';
import { TextInput } from '@/components/Inputs/Text';
import { SmallModal } from '@/components/Modal/Small';
import { deleteCommunityPost } from '@/_base/services/community/deleteCommunityPost';

const Community: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [communityPosts, setCommunityPosts] = useState<IHubCommunityPost[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [lastFocusedPostId, setLastFocusedPostId] = useState(``);
  const [postToRemove, setPostToRemove] = useState<{ id: string; isReply: boolean } | null>(null);

  const toast = useCustomToast();
  const { user } = useAuth();

  const {
    data: postDTO,
    onInputChange: onPostChange,
    setData: setPostDTO,
    submit: submitPost,
    errors: postErrors,
  } = useInputHandler<ICreateHubCommunityPostParams>({
    schema: communityPostSchema,
    data: EMPTY_CREATE_POST_DATA,
  });
  const {
    data: replyDTO,
    onInputChange: onReplyChange,
    setData: setReplyDTO,
    submit: submitReply,
    errors: replyErrors,
  } = useInputHandler<ICreateHubCommunityPostParams>({
    schema: communityPostSchema,
    data: EMPTY_CREATE_POST_DATA,
  });

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const posts = await listCommunityPosts();
        setLastFocusedPostId(posts[0].id);
        setCommunityPosts(posts);
      } catch {
        toast({ status: `error`, description: `Não foi possível exibir os posts` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSentPost = useAsyncCallback(
    async () => {
      const postResponse = await createCommunityPost(postDTO);
      setCommunityPosts((state) => [postResponse, ...state]);
      setPostDTO(EMPTY_CREATE_POST_DATA);
      setFiles([]);
    },
    [postDTO],
    true,
  );

  const handleSentReply = useAsyncCallback(
    async () => {
      if (!replyDTO.hub_community_post_id) return;
      setLastFocusedPostId(replyDTO.hub_community_post_id);

      const replyResponse = await createCommunityPost(replyDTO);
      setCommunityPosts((state) => [
        {
          ...(state.find((e) => e.id === replyDTO.hub_community_post_id) || ({} as any)),
          replies: [replyResponse, ...(state.find((e) => e.id === replyDTO.hub_community_post_id)?.replies || [])],
        },
        ...state.filter((post) => post.id !== replyDTO.hub_community_post_id),
      ]);
      setReplyDTO(EMPTY_CREATE_POST_DATA);
    },
    [replyDTO],
    true,
  );

  const handleRemovePost = useAsyncCallback(
    async () => {
      if (!postToRemove?.id) return;
      if (!postToRemove.isReply) setIsLoading(true);
      await deleteCommunityPost(postToRemove.id);

      if (!postToRemove.isReply) setCommunityPosts((state) => state.filter((post) => post.id !== postToRemove.id));
      else setCommunityPosts((state) => state.map((p) => ({ ...p, replies: p.replies.filter((r) => r.id !== postToRemove.id) })));
      setPostToRemove(null);
    },
    [postToRemove],
    true,
    () => setIsLoading(false),
  );

  return (
    <Flex direction="column" gap="2rem" overflow="hidden auto">
      <Flex
        bgColor="white"
        flexDirection="column"
        border="1px"
        borderColor="gray300"
        borderRadius="12px"
        w="100%"
        padding="1rem"
        gap="1rem"
        display="flex"
      >
        <Flex gap="1rem">
          <TextAreaInput
            value={postDTO.content}
            onInputChange={(value) => onPostChange('content', value)}
            error={postErrors.content}
            rows={6}
            bg="white"
            color="gray800"
            placeholder="Comece uma publicação"
          />
          <GenericButton
            label="Enviar"
            bg="primary300"
            color="white"
            onClick={() => submitPost(handleSentPost)}
            leftIcon={<FiSend size="18px" />}
            _hover={{
              filter: 'brightness(0.9)',
            }}
          />
        </Flex>
        <Flex display="flex" direction="column" mb="-0.7rem">
          <FileInput onChange={(e) => setFiles((f) => [...e, ...f])} />
        </Flex>
      </Flex>
      <Flex display="flex" justify="center" flexDirection="row" flexWrap="wrap" gap="32px">
        {isLoading && <Skeleton borderRadius="12px" minH="10rem" w="100%"></Skeleton>}
        {!isLoading &&
          communityPosts.map((post) => (
            <Flex
              key={post.id}
              bgColor="white"
              direction={'column'}
              border="1px"
              borderColor="gray300"
              borderRadius="12px"
              w="100%"
              padding="20px 20px 16px 20px"
              gap="0.5rem"
              textAlign="left"
              display="flex"
              justify="center"
            >
              <Flex>
                <Flex gap="12px" flex="1">
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
                {post.user.id === user.id && (
                  <Tooltip label="Excluir">
                    <Flex
                      _hover={{ color: `primary500` }}
                      color="gray500"
                      cursor="pointer"
                      fontSize="1.25rem"
                      onClick={() => setPostToRemove({ id: post.id, isReply: false })}
                    >
                      <FiTrash2 />
                    </Flex>
                  </Tooltip>
                )}
              </Flex>
              <Flex fontWeight="500" fontSize="14px">
                {post.content}
              </Flex>
              {!!post.metadata.media?.length && (
                <Grid gap="1rem" gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))" gridTemplateRows="minmax(min-content, max-content)">
                  {postDTO.metadata?.media?.map((media, i) => (
                    <Flex key={media.uri} borderRadius="md" overflow="hidden" position="relative">
                      {mimetype.getType(media.uri)?.startsWith('image') ? (
                        <Image key={`${i + 1}`} src={media.uri} width="100%" height="100%" />
                      ) : mimetype.getType(media.uri)?.startsWith('video') ? (
                        <video key={`${i + 1}`} width="100%" height="100%" controls>
                          <source src={media.uri} />
                        </video>
                      ) : (
                        <Link target="_blank" href={media.uri} w="100%" h="100%">
                          <Flex
                            key={`${i + 1}`}
                            w="100%"
                            h="100%"
                            bg="gray300"
                            overflow="hidden"
                            direction="column"
                            align="center"
                            justify="center"
                            gap="0.5rem"
                            fontWeight="500"
                          >
                            <TbFileText fontSize="2rem" />
                            <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                              {media.label.length > 20 ? `${media.label.slice(0, 14)}...${media.label.slice(-6)}` : media.label}
                            </Text>
                          </Flex>
                        </Link>
                      )}
                    </Flex>
                  ))}
                </Grid>
              )}

              <Divider />

              <Flex gap="32px" align="center">
                <TextInput
                  placeholder="Faça um comentário"
                  borderColor="gray300"
                  size="sm"
                  value={replyDTO.hub_community_post_id === post.id ? replyDTO.content : ``}
                  onInputChange={(value) => {
                    onReplyChange('content', value);
                    onReplyChange('hub_community_post_id', post.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key.toLocaleLowerCase() === `enter`) submitReply(handleSentReply);
                  }}
                  error={replyErrors.content}
                />
                <Button color="gray600" bgColor="transparent" border="1px" borderColor="gray300" p="0" onClick={() => submitReply(handleSentReply)}>
                  <FiSend />
                </Button>
              </Flex>

              <Accordion defaultIndex={lastFocusedPostId === post.id ? [0] : undefined} allowMultiple>
                <AccordionItem border="none">
                  <AccordionButton gap="0.5rem" w="fit-content" borderRadius="md">
                    <Text fontSize="13px">Comentários</Text>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    <Flex direction="column" gap="1rem">
                      {post.replies.map((postReply) => (
                        <Flex
                          key={postReply.id}
                          h="fit-content"
                          direction="column"
                          p="20x"
                          border="1px"
                          borderColor="gray300"
                          margin={postReply.user.id !== user.id ? `0 3rem 0 0` : `0 0 0 3rem`}
                          borderRadius={postReply.user.id !== user.id ? `0 10px 10px 10px` : `10px 0 10px 10px`}
                          overflow="hidden"
                        >
                          <Flex
                            p="1rem"
                            gap="1rem"
                            bgColor={postReply.user.id === user.id ? `orange200` : undefined}
                            direction={post.user.id === user.id ? 'row' : 'row-reverse'}
                          >
                            <Avatar src={postReply.user.avatar || ''} name={postReply.user.name} size="sm" />
                            <Flex direction="column" flex="1">
                              <Text fontWeight="600" color="primary500">
                                {postReply.user.name}
                              </Text>
                              <Text fontSize="14px" color="gray600">
                                @{postReply.user.username}
                              </Text>
                              <Flex flex="1" py="0.5rem" color="gray800">
                                <Text fontSize="14px">{postReply.content}</Text>
                              </Flex>
                            </Flex>
                          </Flex>
                          <Flex
                            w="100%"
                            justify="space-between"
                            direction={postReply.user.id === user.id ? `row` : `row-reverse`}
                            bg={postReply.user.id === user.id ? undefined : `gray100`}
                            fontSize="20px"
                            p="0.5rem"
                          >
                            <Flex gap="9px">
                              <Tooltip label="Gostei">
                                <Box cursor="pointer">
                                  <TbThumbUpFilled color="#3D7AFF" />
                                </Box>
                              </Tooltip>
                              <Tooltip label="Amei">
                                <Box cursor="pointer">
                                  <IoMdHeart color="#FF525C" />
                                </Box>
                              </Tooltip>
                              <Tooltip label="Genial">
                                <Box cursor="pointer">
                                  <HiLightBulb color="#F5BA3D" />
                                </Box>
                              </Tooltip>
                              <Tooltip label="Apoio">
                                <Box cursor="pointer">
                                  <RiUserStarFill color="#21E080" />
                                </Box>
                              </Tooltip>
                            </Flex>

                            {postReply.user.id === user.id && (
                              <Tooltip label="Excluir">
                                <Flex
                                  _hover={{ color: `primary500` }}
                                  color="gray500"
                                  cursor="pointer"
                                  fontSize="1.1rem"
                                  align="center"
                                  onClick={() => setPostToRemove({ id: postReply.id, isReply: true })}
                                >
                                  <FiTrash2 />
                                </Flex>
                              </Tooltip>
                            )}
                          </Flex>
                        </Flex>
                      ))}
                    </Flex>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Flex>
          ))}
      </Flex>
      <SmallModal
        show={!!postToRemove}
        topIcon="warning"
        onConfirm={handleRemovePost}
        onCancel={() => setPostToRemove(null)}
        title={`Excluir ${postToRemove?.isReply ? `comentário` : `publicação`}`}
      >
        <Text>Tem certeza disso?</Text>
      </SmallModal>
    </Flex>
  );
};

export default Community;

export const getServerSideProps: GetServerSideProps = async () => {
  const selectedPage = 'community';

  return { props: { selectedPage, pageTitle: 'Comunidade PiCode', showBackButton: false } };
};
