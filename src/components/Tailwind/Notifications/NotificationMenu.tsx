import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCard from './NotificationCard';
import { isToday, isYesterday } from 'date-fns';
import { IHubNotification } from '@/_base/interfaces/notification';
import { FiBell, FiCheck } from 'react-icons/fi';
import moment from 'moment';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button } from '@chakra-ui/react';
import { IHubUser } from '@/_base/interfaces/user';
import { KanbanColumnData, kanbanColumnLabel, KanbanItemType } from '@/components/Kanban/interfaces';
import { IStoreMakerSchool } from '@/_base/interfaces/storeMaker';
import { useRouter } from 'next/router';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

interface NotificationMenuProps {
  notifications: IHubNotification[];
  user?: IHubUser;
  onNotificationClick?: (notification: IHubNotification) => void;
  onKanbanClick?: (kanban: KanbanItemType) => void;
  onMarkAllAsRead?: () => void;
  onRemoveAll?: () => void;
  isLoading?: boolean;
  stockItems?: IStoreMakerSchool[];
}

type NotificationGroup = { date: string; notifications: IHubNotification[] };

interface IKanbanNotification extends KanbanItemType {
  message: string;
}

const NotificationMenu = ({
  notifications,
  user,
  onNotificationClick,
  onMarkAllAsRead,
  isLoading = false,
  onRemoveAll,
  onKanbanClick,
  stockItems = [],
}: NotificationMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alertModalIsOpen, setAlertModalIsOpen] = useState(false);
  const [kanbanItemsDue, setKanbanItemsDue] = useState<IKanbanNotification[]>([]);

  const menuRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<any>();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    try {
      const kanban: (Omit<KanbanColumnData, `items`> & { items: IKanbanNotification[] })[] = JSON.parse(user.metadata?.kanban || `[]`);
      const dueItems = kanban
        .flatMap((e) => e.items.filter((k) => k.end_date && new Date(k.end_date).getTime() < Date.now() + ONE_WEEK))
        .map((e) => {
          let dateMessage = ``;
          if (e.end_date && isToday(new Date(e.end_date))) {
            dateMessage = 'Atividade vencendo hoje';
          } else if (e.end_date && isYesterday(new Date(e.end_date))) {
            dateMessage = 'Atividade vencida desde ontem';
          } else {
            dateMessage = `Atividade vencida desde ${moment(e.end_date).calendar()}`;
          }

          e.message = dateMessage;
          return e;
        });

      if (kanban?.length) setKanbanItemsDue(dueItems);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Individual kanban parse error`, err);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemoveItem = useCallback(() => {
    if (onRemoveAll) onRemoveAll();
    setAlertModalIsOpen(false);
  }, [alertModalIsOpen]);

  const groupedNotifications = useMemo<NotificationGroup[]>(() => {
    const groups: { [key: string]: IHubNotification[] } = {};

    notifications
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .forEach((notification) => {
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
  }, [notifications]);

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

  const notificationCount = stockItems.length + notifications.filter((n) => !n.opened_by.includes(user?.id || ``)).length + kanbanItemsDue.length;

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <FiBell />
        {!!notificationCount && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {notificationCount > 9 ? '9+' : notificationCount}
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
                {notifications.filter((n) => !n.opened_by.includes(user?.id || ``)).length > 0 && (
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
                {!notifications.filter((n) => !n.opened_by.includes(user?.id || ``)).length && !!notifications.length && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAlertModalIsOpen(true)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <FiCheck className="w-4 h-4" />
                    Remover todas notificações
                  </motion.button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : !notifications.length && !kanbanItemsDue.length && !stockItems.length ? (
                <div className="text-center py-8 text-gray-500">
                  <FiBell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p style={{ fontSize: `16px` }}>Nenhuma notificação disponível</p>
                </div>
              ) : (
                <div>
                  {!!kanbanItemsDue.length && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Kanban</h4>
                      </div>
                      {kanbanItemsDue.map((kanban) => (
                        <NotificationCard
                          key={kanban.id}
                          notification={
                            {
                              id: kanban.id,
                              created_at: new Date(kanban.end_date || ``),
                              message: `${kanban.title} - ${kanbanColumnLabel[kanban.column]}`,
                              metadata: { title: kanban.message },
                              target_type: `alert`,
                            } as unknown as IHubNotification
                          }
                          currentUserId={user?.id || ``}
                          onClick={() => {
                            onKanbanClick?.(kanban);
                            setIsOpen(false);
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                  {!!stockItems.length && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estoque Maker</h4>
                      </div>
                      {stockItems.map((stock) => (
                        <NotificationCard
                          key={stock.id}
                          notification={
                            {
                              id: stock.id,
                              message: `${stock.metadata?.name || stock.store_item.name} - ${stock.quantity} un`,
                              metadata: { title: !stock.quantity ? `Item em falta no estoque` : `Item acabando no estoque` },
                              target_type: `alert`,
                            } as unknown as IHubNotification
                          }
                          currentUserId={user?.id || ``}
                          onClick={() => {
                            router.push(`/stock`);
                            setIsOpen(false);
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
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
                          currentUserId={user?.id || ``}
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
      <AlertDialog isOpen={alertModalIsOpen} leastDestructiveRef={cancelRef} onClose={() => setAlertModalIsOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Remover notificações
            </AlertDialogHeader>

            <AlertDialogBody>Todas notificações serão excluídas permanentemente, você tem certeza disso?</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setAlertModalIsOpen(false)}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleRemoveItem} ml={3}>
                Remover
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  );
};

export default NotificationMenu;
