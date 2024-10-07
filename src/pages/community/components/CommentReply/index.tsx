import { Dispatch, SetStateAction } from 'react';
import { Avatar, Box, Flex, Text, Tooltip } from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi';
import moment from 'moment';

import { IHubCommunityPost } from '@/_base/interfaces/community';
import { IHubUser } from '@/_base/interfaces/user';
import { reactionsElements } from '@/_base/utils/reactionsElements';
import { PostReaction, PostReactionKey } from '@/_base/interfaces/community/PostReaction';

interface IProps {
  user: IHubUser;
  reply: IHubCommunityPost;
  reactions: Record<string, PostReaction>;
  setPostToRemove: Dispatch<SetStateAction<{ id: string; isReply: boolean } | null>>;
  handleUpdateReaction: (id: string, reaction: PostReactionKey) => void;
}

export const CommentReply: React.FC<IProps> = ({ reply, user, handleUpdateReaction, reactions, setPostToRemove }) => {
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
              {reply.user.name}
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
    </Flex>
  );
};
