import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCard from './NotificationCard';
import { isToday, isYesterday } from 'date-fns';
import { IHubNotification } from '@/_base/interfaces/notification';
import { FiBell, FiCheck } from 'react-icons/fi';
import moment from 'moment';

interface NotificationMenuProps {
  notifications: IHubNotification[];
  currentUserId: string;
  onNotificationClick?: (notification: IHubNotification) => void;
  onMarkAllAsRead?: () => void;
  isLoading?: boolean;
}

type NotificationGroup = { date: string; notifications: IHubNotification[] };

const NotificationMenu = ({ notifications, currentUserId, onNotificationClick, onMarkAllAsRead, isLoading = false }: NotificationMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.opened_by.includes(currentUserId)).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const groupNotificationsByDate = (notifications: IHubNotification[]): NotificationGroup[] => {
    const groups: { [key: string]: IHubNotification[] } = {};

    notifications.forEach((notification) => {
      let dateKey: string;

      if (isToday(notification.created_at)) {
        dateKey = 'Hoje';
      } else if (isYesterday(notification.created_at)) {
        dateKey = 'Ontem';
      } else {
        dateKey = moment(notification.created_at).calendar();
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notification);
    });

    return Object.entries(groups).map(([date, notifications]) => ({
      date,
      notifications: notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    }));
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <FiBell />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onMarkAllAsRead}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <FiCheck className="w-4 h-4" />
                    Marcar todas como lidas
                  </motion.button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiBell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma notificação disponível</p>
                </div>
              ) : (
                <div>
                  {groupedNotifications.map((group, groupIndex) => (
                    <motion.div
                      key={group.date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.1 }}
                    >
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">{group.date}</h4>
                      </div>
                      {group.notifications.map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          currentUserId={currentUserId}
                          onClick={() => {
                            onNotificationClick?.(notification);
                            setIsOpen(false);
                          }}
                        />
                      ))}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationMenu;
