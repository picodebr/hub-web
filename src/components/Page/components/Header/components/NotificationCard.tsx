import { Flex, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { FcIdea } from 'react-icons/fc';
import moment from 'moment';
import { IHubNotification } from '@/_base/interfaces/notification';
import { SmallModal } from '@/components/Modal/Small';
import { useState } from 'react';

interface IProps {
  notification: IHubNotification;
  onRemoveNotification: () => void;
}

export const NotificationCard: React.FC<IProps> = ({ notification, onRemoveNotification }) => {
  const [notificationToRemove, setNotificationToRemove] = useState<IHubNotification | null>(null);
  return (
    <motion.button
      whileHover={{ scale: 1.03, boxShadow: `-2px 10px 10px -9px rgba(0,0,0,0.65)` }}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      style={{
        display: `flex`,
        gap: `0.5rem`,
        padding: `0.5rem`,
        border: `1px solid #D0D5DD`,
        borderRadius: `6px`,
        boxShadow: `-2px 10px 5px -13px rgba(0,0,0,0.65)`,
        height: `100%`,
        minHeight: `4.5rem`,
        maxHeight: `15rem`,
        width: `100%`,
        maxWidth: `380px`,
        overflow: `hidden`,
        background: `#fff`,
      }}
    >
      <Flex h="100%" direction="column">
        <FcIdea fontSize="32px" />
      </Flex>
      <Flex h="100%" direction="column" flex="1">
        <Flex gap="0.5rem" color="gray500">
          <Text color="gray800" fontWeight="500">
            Notificação
          </Text>
          |<Text>{moment(notification.created_at).fromNow()}</Text>
        </Flex>
        <Flex overflow="hidden auto" maxH="12.5rem">
          <Text textAlign="left">{notification.message}</Text>
        </Flex>
      </Flex>
      <Flex
        direction="column"
        h="100%"
        transition="0.1s"
        p="0.3rem"
        overflow="hidden"
        _hover={{ color: `primary500`, transform: `scale(2)` }}
        onClick={() => setNotificationToRemove(notification)}
      >
        <IoClose />
      </Flex>
      <SmallModal
        title="Atenção!"
        show={!!notificationToRemove}
        onConfirm={() => {
          onRemoveNotification();
          setNotificationToRemove(null);
        }}
        onCancel={() => setNotificationToRemove(null)}
        onCloseModal={() => setNotificationToRemove(null)}
        okText="Confirmar"
        cancelText="Cancelar"
        topIcon="warning"
      >
        <Flex direction="column" gap="1rem">
          <Text color="gray500" fontSize="15px">
            Excluir essa notificação para sempre?
          </Text>
        </Flex>
      </SmallModal>
    </motion.button>
  );
};
