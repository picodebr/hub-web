import { motion } from 'framer-motion';
import NotificationIcon from './NotificationIcon';
import { IHubNotification } from '@/_base/interfaces/notification';
import moment from 'moment';
import { ClassProjectMetadataReward } from '@/_base/interfaces/project/IClassProjectMetadata';
import { Image } from '@chakra-ui/react';

interface NotificationCardProps {
  notification: IHubNotification;
  currentUserId: string;
  onClick?: () => void;
}

const NotificationCard = ({ notification, currentUserId, onClick }: NotificationCardProps) => {
  const isUnread = !notification.opened_by?.includes(currentUserId);
  const timeAgo = moment(notification.created_at).fromNow();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02 }}
      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${isUnread ? 'bg-blue-50/50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <NotificationIcon targetType={notification.target_type} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {notification.metadata.author && <span className="text-sm text-gray-500 font-medium">{notification.metadata.author}</span>}
            {isUnread && notification.opened_by && <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>}
          </div>

          {notification.metadata.title ? (
            <>
              <div className={`text-sm mb-1 ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{notification.metadata.title}</div>
              <div className={`text-sm mb-2 ${isUnread ? 'font-medium text-gray-800' : 'text-gray-600'}`}>{notification.message}</div>
            </>
          ) : (
            <div className={`text-sm mb-1 ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{notification.message}</div>
          )}

          {notification.target_type === `picode_project_activity_finished` && !!notification.metadata.cashback_steps?.length && (
            <div className="text-sm text-gray-500 mb-2 flex items-center gap-[2px]">
              <Image src="/icons/coin.svg" w="17px" h="17px" />
              {`${sumCashbacks(notification.metadata.cashback_steps)} moedas recebidas em ${notification.metadata.cashback_steps?.length || 0} atividades`}
            </div>
          )}

          {notification.created_at && <div className="text-xs text-gray-400">{timeAgo}</div>}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationCard;
const sumCashbacks = (data: ClassProjectMetadataReward[]): number => {
  return data.reduce((acc, v) => (acc += Number(v.is_missing ? 0 : v.reward_value || 0)), 0);
};
