import { Dispatch, SetStateAction } from 'react';
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
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import { FaReply } from 'react-icons/fa6';
import moment from 'moment';

import { ICreateHubCommunityPostParams, IHubCommunityPost } from '@/_base/interfaces/community';
import { IHubUser } from '@/_base/interfaces/user';
import { reactionsElements } from '@/_base/utils/reactionsElements';
import { PostReaction, PostReactionKey } from '@/_base/interfaces/community/PostReaction';
import { TextInput } from '@/components/Inputs/Text';
import { InputHandlerErrorType } from '@/_base/hooks/InputHandler/interfaces';
import { CommentReply } from '../CommentReply';
import { getTime } from '@/_base/utils/getTime';
import { capitalizeString } from '@/_base/utils';

interface IProps {
  user: IHubUser;
  reply: IHubCommunityPost;
  reactions: Record<string, PostReaction>;
  setPostToRemove: Dispatch<SetStateAction<{ id: string; isReply: boolean } | null>>;
  replyDTO: ICreateHubCommunityPostParams;
  handleUpdateReaction: (id: string, reaction: PostReactionKey) => void;
  onReplyChange: (field: keyof ICreateHubCommunityPostParams, value: any) => void;
  onSubmit: () => void;
  replyErrors: InputHandlerErrorType<ICreateHubCommunityPostParams>;
}

export const PostReply: React.FC<IProps> = ({
  reply,
  user,
  handleUpdateReaction,
  reactions,
  setPostToRemove,
  onSubmit,
  replyDTO,
  onReplyChange,
  replyErrors,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSubmit = () => {
    onClose();
    onSubmit();
  };

  return (
    <Flex
      key={reply.id}
      h="fit-content"
      direction="column"
      p="20x"
      border="1px"
      borderColor="gray300"
      margin={reply.user.id !== user.id ? `0 3rem 0 0` : `0 0 0 3rem`}
      borderRadius={reply.user.id !== user.id ? `0 10px 10px 10px` : `10px 0 10px 10px`}
      overflow="hidden"
    >
      <Flex p="0.75rem" gap="0.75rem" bgColor={reply.user.id === user.id ? `orange200` : undefined}>
        <Avatar src={reply.user.avatar || ''} name={reply.user.name} size="sm" />
        <Flex direction="column" flex="1">
          <Flex direction="column" flex="1" mt="-0.25rem">
            <Text fontWeight="600" color="primary500">
              {capitalizeString(reply.user.name)}
            </Text>
            <Text fontSize="14px" color="gray600">
              {reply.user.hub_class?.display_name || reply.user.school_group?.display_name || ``}
            </Text>
          </Flex>
          <Flex flex="1" py="0.5rem" color="gray800">
            <Text fontSize="14px">{reply.content}</Text>
          </Flex>
          <Text mb="-0.75rem" fontSize="13px" color="gray400" alignSelf="flex-end">
            {moment(reply.created_at).fromNow()}
          </Text>
        </Flex>
      </Flex>
      <Flex
        w="100%"
        justify="space-between"
        direction={reply.user.id === user.id ? `row` : `row-reverse`}
        bg={reply.user.id === user.id ? undefined : `gray100`}
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
                onClick={() => handleUpdateReaction(reply.id, reaction.key)}
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
                  bg={reactions[reply.id] && reactions[reply.id][reaction.key]?.includes(user.id) ? 'primary700' : 'red.400'}
                  minW="0.875rem"
                  h="0.875rem"
                  color="white"
                  borderRadius="md"
                  p="0.1rem 0.15rem"
                >
                  {(reactions[reply.id] && reactions[reply.id][reaction.key]?.length) || 0}
                </Flex>
              </Box>
            </Tooltip>
          ))}
        </Flex>
        {!isOpen && (
          <Flex align="center" gap={3}>
            <Tooltip label="Responder">
              <Button color="gray600" bgColor="transparent" border="1px" borderColor="gray300" p="0" onClick={onOpen}>
                <FaReply />
              </Button>
            </Tooltip>
            {reply.user.id === user.id && (
              <Tooltip label="Excluir">
                <Flex
                  _hover={{ color: `primary500` }}
                  color="gray500"
                  cursor="pointer"
                  fontSize="1.1rem"
                  align="center"
                  onClick={() => setPostToRemove({ id: reply.id, isReply: true })}
                >
                  <FiTrash2 />
                </Flex>
              </Tooltip>
            )}
          </Flex>
        )}
      </Flex>
      {isOpen && (
        <Flex align="center" gap="32px" p="0.875rem">
          <TextInput
            placeholder="Responda este comentário"
            borderColor="gray300"
            size="sm"
            value={replyDTO.hub_community_post_id === reply.id ? replyDTO.content : ``}
            onInputChange={(value) => {
              onReplyChange('content', value);
              onReplyChange('hub_community_post_id', reply.id);
            }}
            onKeyDown={(e) => {
              if (e.key.toLocaleLowerCase() === `enter`) handleSubmit();
            }}
            error={replyErrors.content}
          />
          <Button color="gray600" bgColor="transparent" border="1px" borderColor="gray300" p="0" onClick={handleSubmit}>
            <FiSend />
          </Button>
        </Flex>
      )}
      <Accordion allowMultiple defaultIndex={0}>
        <AccordionItem border="none">
          <AccordionButton gap="0.5rem" w="fit-content" borderRadius="md">
            <Text fontSize="13px" color="gray600">
              Comentários
            </Text>
            <AccordionIcon color="gray600" />
          </AccordionButton>
          <AccordionPanel>
            <Flex direction="column" gap="1rem">
              {reply.replies
                ?.sort((a, b) => getTime(b.created_at) - getTime(a.created_at))
                .map((commentReply) => (
                  <CommentReply
                    key={commentReply.id}
                    user={user}
                    reply={commentReply}
                    reactions={reactions}
                    setPostToRemove={setPostToRemove}
                    handleUpdateReaction={handleUpdateReaction}
                  />
                ))}
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Flex>
  );
};
