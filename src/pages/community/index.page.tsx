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
  Skeleton,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import { useEffect, useState } from 'react';

import { useAsyncCallback, useAuth, useCustomToast, useInputHandler } from '@/_base/hooks';
import { TextAreaInput } from '@/components/Inputs/TextArea';
import { GenericButton } from '@/components/Buttons/Generic';
import { EMPTY_CREATE_POST_DATA, ICreateHubCommunityPostParams, IHubCommunityPost, communityPostSchema } from '@/_base/interfaces/community';
import { createCommunityPost, listCommunityPosts, updateCommunityPostReaction } from '@/_base/services/community';
import { FileInput, useFileInput } from '@/components/Inputs/File';
import { Divider } from 'antd';
import { TbThumbUpFilled } from 'react-icons/tb';
import { IoMdHeart } from 'react-icons/io';
import { HiLightBulb } from 'react-icons/hi';
import { RiUserStarFill } from 'react-icons/ri';
import { TextInput } from '@/components/Inputs/Text';
import { SmallModal } from '@/components/Modal/Small';
import { deleteCommunityPost } from '@/_base/services/community/deleteCommunityPost';
import { PostReaction, PostReactionKey } from '@/_base/interfaces/community/PostReaction';
import { IconType } from 'react-icons';
import moment from 'moment';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';
import { MediaGallery } from '@/components/MediaGallery';

const Community: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [communityPosts, setCommunityPosts] = useState<IHubCommunityPost[]>([]);
  const [reactions, setReactions] = useState<Record<string, PostReaction>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [lastFocusedPostId, setLastFocusedPostId] = useState(``);
  const [postToRemove, setPostToRemove] = useState<{ id: string; isReply: boolean } | null>(null);

  const toast = useCustomToast();
  const { user } = useAuth();
  const { clearFileList } = useFileInput();

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
        setLastFocusedPostId(posts[0]?.id);
        setCommunityPosts(posts);
        setReactions(
          posts.reduce(
            (acc, post) => {
              acc[post.id] = post.metadata.reactions;
              post.replies.forEach((reply) => (acc[reply.id] = reply.metadata.reactions));
              return acc;
            },
            {} as Record<string, PostReaction>,
          ),
        );
      } catch {
        toast({ status: `error`, description: `Não foi possível exibir os posts` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSentPost = useAsyncCallback(
    async () => {
      setIsSending(true);

      if (files.length) {
        const presignedUrls = await Promise.all(files.map((file) => getPresignedUrl(file.type, `community_posts`).then((r) => ({ ...r, file }))));

        await Promise.all(presignedUrls.map(({ link, file }) => uploadFile(link, file)));

        postDTO.metadata = { media: presignedUrls.map(({ path, file }) => ({ uri: path, label: file.name })) };
      }

      const postResponse = await createCommunityPost(postDTO);
      setCommunityPosts((state) => [postResponse, ...state]);
      setPostDTO(EMPTY_CREATE_POST_DATA);
      setFiles([]);
      clearFileList();
    },
    [postDTO],
    true,
    () => setIsSending(false),
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

  const handleUpdateReaction = useAsyncCallback(
    async (id: string, reaction: PostReactionKey) => {
      const updatedPost = await updateCommunityPostReaction({ id, reaction });
      setReactions((r) => {
        r[id] = updatedPost.metadata.reactions;
        return r;
      });
    },
    [],
    true,
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
            isLoading={isSending}
            color="white"
            onClick={() => submitPost(handleSentPost)}
            leftIcon={<FiSend size="18px" />}
            _hover={{
              filter: 'brightness(0.9)',
            }}
          />
        </Flex>
        <Flex display="flex" direction="column" mb="-0.7rem">
          <FileInput onChange={(e) => setFiles(e)} />
        </Flex>
        <MediaGallery files={files} />
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
                      {post.user.hub_class?.display_name || post.user.school_group?.display_name || ``}
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
              <Flex fontWeight="500" fontSize="14px" color="gray600">
                {post.content}
              </Flex>

              <MediaGallery media={post.metadata.media} />

              <Flex justify="space-between" align="flex-end" mb="-1.2rem">
                <Text mb="-0.75rem" fontSize="13px" color="gray400">
                  {moment(post.created_at).fromNow()}
                </Text>
                <Flex gap="1rem" fontSize="1.35rem">
                  {reactionsElements.map((reaction) => (
                    <Tooltip key={reaction.key} label={reaction.label}>
                      <Box
                        cursor="pointer"
                        position="relative"
                        _hover={{ filter: `brightness(0.8)` }}
                        onClick={() => handleUpdateReaction(post.id, reaction.key)}
                      >
                        <reaction.icon color={reaction.color} />
                        <Flex
                          align="center"
                          justify="center"
                          position="absolute"
                          top="0.875rem"
                          left="0.9rem"
                          fontSize="11px"
                          fontWeight="500"
                          bg={reactions[post.id] && reactions[post.id][reaction.key]?.includes(user.id) ? 'primary700' : 'red.400'}
                          minW="0.875rem"
                          h="0.875rem"
                          color="white"
                          borderRadius="md"
                          p="0.1rem 0.15rem"
                        >
                          {(reactions[post.id] && reactions[post.id][reaction.key]?.length) || 0}
                        </Flex>
                      </Box>
                    </Tooltip>
                  ))}
                </Flex>
              </Flex>

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
                    <Text fontSize="13px" color="gray600">
                      Comentários
                    </Text>
                    <AccordionIcon color="gray600" />
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
                          <Flex p="0.75rem" gap="0.75rem" bgColor={postReply.user.id === user.id ? `orange200` : undefined}>
                            <Avatar src={postReply.user.avatar || ''} name={postReply.user.name} size="sm" />
                            <Flex direction="column" flex="1">
                              <Flex direction="column" flex="1" mt="-0.25rem">
                                <Text fontWeight="600" color="primary500">
                                  {postReply.user.name}
                                </Text>
                                <Text fontSize="14px" color="gray600">
                                  {postReply.user.hub_class?.display_name || postReply.user.school_group?.display_name || ``}
                                </Text>
                              </Flex>
                              <Flex flex="1" py="0.5rem" color="gray800">
                                <Text fontSize="14px">{postReply.content}</Text>
                              </Flex>
                              <Text mb="-0.75rem" fontSize="13px" color="gray400" alignSelf="flex-end">
                                {moment(postReply.updated_at).fromNow()}
                              </Text>
                            </Flex>
                          </Flex>
                          <Flex
                            w="100%"
                            justify="space-between"
                            direction={postReply.user.id === user.id ? `row` : `row-reverse`}
                            bg={postReply.user.id === user.id ? undefined : `gray100`}
                            fontSize="20px"
                            p="0.5rem 0.875rem 0.875rem 0.5rem"
                          >
                            <Flex gap="1rem">
                              {reactionsElements.map((reaction) => (
                                <Tooltip key={reaction.key} label={reaction.label}>
                                  <Box
                                    cursor="pointer"
                                    position="relative"
                                    _hover={{ filter: `brightness(0.8)` }}
                                    onClick={() => handleUpdateReaction(postReply.id, reaction.key)}
                                  >
                                    <reaction.icon color={reaction.color} />
                                    <Flex
                                      align="center"
                                      justify="center"
                                      position="absolute"
                                      top="0.875rem"
                                      left="0.9rem"
                                      fontSize="11px"
                                      fontWeight="500"
                                      bg={
                                        reactions[postReply.id] && reactions[postReply.id][reaction.key]?.includes(user.id) ? 'primary700' : 'red.400'
                                      }
                                      minW="0.875rem"
                                      h="0.875rem"
                                      color="white"
                                      borderRadius="md"
                                      p="0.1rem 0.15rem"
                                    >
                                      {(reactions[postReply.id] && reactions[postReply.id][reaction.key]?.length) || 0}
                                    </Flex>
                                  </Box>
                                </Tooltip>
                              ))}
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

const reactionsElements: Array<{ key: PostReactionKey; label: string; icon: IconType; color: string }> = [
  { key: `like`, label: `Gostei`, color: `#3D7AFF`, icon: TbThumbUpFilled },
  { key: `love`, label: `Amei`, color: `#FF525C`, icon: IoMdHeart },
  { key: `insightful`, label: `Genial`, color: `#F5BA3D`, icon: HiLightBulb },
  { key: `aid`, label: `Apoio`, color: `#21E080`, icon: RiUserStarFill },
];

export const getServerSideProps: GetServerSideProps = async () => {
  const selectedPage = 'community';

  return { props: { selectedPage, pageTitle: 'Comunidade', showBackButton: false } };
};
