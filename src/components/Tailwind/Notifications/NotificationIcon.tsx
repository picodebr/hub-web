import { HubNotificationContentType } from '@/_base/interfaces/notification';
import { FaCoins } from 'react-icons/fa';
import { FiAlertTriangle, FiBell, FiBook, FiFileText, FiList, FiZap } from 'react-icons/fi';

interface NotificationIconProps {
  targetType: HubNotificationContentType;
  className?: string;
}

const NotificationIcon = ({ targetType, className = 'w-5 h-5' }: NotificationIconProps) => {
  const getIconAndColor = () => {
    switch (targetType) {
      case 'course_certificate_available':
        return { Icon: FiFileText, color: 'text-blue-500 bg-blue-100' };
      case 'picode_project_activity_finished':
        return { Icon: FiZap, color: 'text-yellow-500 bg-yellow-100' };
      // case 'course_added':
      //   return { Icon: FiList, color: 'text-yellow-500 bg-yellow-100' };
      case 'book_added':
        return { Icon: FiBook, color: 'text-yellow-500 bg-yellow-100' };
      case 'received_coins':
        return { Icon: FaCoins, color: 'text-yellow-500 bg-yellow-100' };
      // case 'user':
      //   return { Icon: FiUser, color: 'text-green-500 bg-green-100' };
      case 'alert':
        return { Icon: FiAlertTriangle, color: 'text-red-500 bg-red-100' };
      default:
        return { Icon: FiBell, color: 'text-gray-500 bg-gray-100' };
    }
  };

  const { Icon, color } = getIconAndColor();

  return (
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon className={className} />
    </div>
  );
};

export default NotificationIcon;
