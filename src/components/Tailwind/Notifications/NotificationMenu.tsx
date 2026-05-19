import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isToday, isYesterday } from 'date-fns';
import moment from 'moment';
import { useRouter } from 'next/router';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button } from '@chakra-ui/react';

// Icons: Lucide React
import { Bell, BellOff, CheckCheck, Trash2, Calendar, KanbanSquare, Box } from 'lucide-react';

import { hubNotificationLabels, IHubNotification } from '@/_base/interfaces/notification';
import { IHubUser } from '@/_base/interfaces/user';
import { KanbanColumnData, kanbanColumnLabel, KanbanItemType } from '@/components/Kanban/interfaces';
import { IStoreMakerSchool } from '@/_base/interfaces/storeMaker';

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

  // 2. Lógica de Negócio Mantida (Kanban)
  useEffect(() => {
    if (!user) return;
    try {
      const kanban: (Omit<KanbanColumnData, 'items'> & { items: IKanbanNotification[] })[] = JSON.parse(user.metadata?.kanban || '[]');
      const dueItems = kanban
        .flatMap((e) => e.items.filter((k) => k.end_date && new Date(k.end_date).getTime() < Date.now() + ONE_WEEK))
        .map((e) => {
          let dateMessage = '';
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
      console.error('Individual kanban parse error', err);
    }
  }, [user]);

  // Click outside listener
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
  }, [onRemoveAll, alertModalIsOpen]);

  // Agrupamento por data mantido
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

    return Object.entries(groups).map(([date, notifs]) => ({
      date,
      notifications: notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    }));
  }, [notifications]);

  const unreadNotifications = notifications.filter((n) => !n.opened_by?.includes(user?.id || ''));
  const notificationCount = stockItems.length + unreadNotifications.length + kanbanItemsDue.length;

  return (
    <div className="relative" ref={menuRef}>
      {/* Gatilho (Trigger) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5" />
        {!!notificationCount && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-3 right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm"
          >
            {notificationCount > 9 ? '9+' : notificationCount}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-12 w-[22rem] sm:w-[26rem] max-h-[75vh] rounded-3xl border border-border bg-white shadow-2xl shadow-foreground/20 overflow-hidden flex flex-col z-50"
          >
            {/* Gradiente de Fundo do Header */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/8 via-primary/3 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-5 pt-4 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground leading-tight">Notificações</h3>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {notificationCount > 0 ? `${notificationCount} não ${notificationCount === 1 ? 'lida' : 'lidas'}` : 'Tudo em dia'}
                  </p>
                </div>
              </div>

              {/* Botões de Ação Dinâmicos */}
              <div className="flex items-center gap-1">
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-primary px-2.5 py-1.5 rounded-xl hover:bg-primary/10 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Marcar todas
                  </button>
                )}
                {!unreadNotifications.length && !!notifications.length && (
                  <button
                    onClick={() => setAlertModalIsOpen(true)}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-red-600 px-2.5 py-1.5 rounded-xl hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                )}
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent shrink-0" />

            {/* Conteúdo Scrollável */}
            <div className="overflow-y-auto flex-1 px-2 py-2 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : !notifications.length && !kanbanItemsDue.length && !stockItems.length ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-accent/50 flex items-center justify-center mb-3">
                    <BellOff className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Nenhuma notificação</p>
                  <p className="text-xs text-muted-foreground mt-1">Você está em dia com tudo</p>
                </div>
              ) : (
                <>
                  {/* Seção Kanban */}
                  {!!kanbanItemsDue.length && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-3 pt-1 pb-1.5">
                        <KanbanSquare className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-[10px] font-bold text-muted-foreground tracking-[0.12em] uppercase">Kanban</span>
                        <div className="flex-1 h-px bg-border/40" />
                        <span className="text-[10px] font-medium text-muted-foreground/70">{kanbanItemsDue.length}</span>
                      </div>

                      {kanbanItemsDue.map((kanban, idx) => (
                        <motion.div
                          key={`kanban-${kanban.id}`}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.025, duration: 0.2 }}
                          onClick={() => {
                            onKanbanClick?.(kanban);
                            setIsOpen(false);
                          }}
                          className="relative flex items-start gap-3 px-3 py-3 mx-1 rounded-2xl transition-all duration-200 group cursor-pointer bg-primary/5 hover:bg-primary/10"
                        >
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary" />
                          <div className="mt-0.5 w-9 h-9 rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20 flex items-center justify-center shrink-0">
                            <KanbanSquare className="w-4 h-4 text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm leading-snug font-semibold text-foreground">
                                {kanban.title} - {kanbanColumnLabel[kanban.column]}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{kanban.message}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Seção Estoque Maker */}
                  {!!stockItems.length && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-3 pt-1 pb-1.5 mt-2">
                        <Box className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-[10px] font-bold text-muted-foreground tracking-[0.12em] uppercase">Estoque Maker</span>
                        <div className="flex-1 h-px bg-border/40" />
                        <span className="text-[10px] font-medium text-muted-foreground/70">{stockItems.length}</span>
                      </div>

                      {stockItems.map((stock, idx) => (
                        <motion.div
                          key={`stock-${stock.id}`}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.025, duration: 0.2 }}
                          onClick={() => {
                            router.push('/stock');
                            setIsOpen(false);
                          }}
                          className="relative flex items-start gap-3 px-3 py-3 mx-1 rounded-2xl transition-all duration-200 group cursor-pointer bg-primary/5 hover:bg-primary/10"
                        >
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary" />
                          <div className="mt-0.5 w-9 h-9 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 flex items-center justify-center shrink-0">
                            <Box className="w-4 h-4 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm leading-snug font-semibold text-foreground">
                                {!stock.quantity ? 'Item em falta no estoque' : 'Item acabando no estoque'}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                              {stock.metadata?.name || stock.store_item?.name} - {stock.quantity} un
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Agrupamentos de Notificações Padrão (Por Data) */}
                  {groupedNotifications.map((group) => (
                    <div key={group.date} className="space-y-1">
                      <div className="flex items-center gap-2 px-3 pt-1 pb-1.5 mt-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground tracking-[0.12em] uppercase">{group.date}</span>
                        <div className="flex-1 h-px bg-border/40" />
                        <span className="text-[10px] font-medium text-muted-foreground/70">{group.notifications.length}</span>
                      </div>

                      {group.notifications.map((n, idx) => {
                        const isRead = n.opened_by?.includes(user?.id || '') ?? false;
                        const conf = hubNotificationLabels[n.target_type] || {
                          Icon: Bell,
                          color: 'text-primary',
                          bg: 'bg-primary/10',
                          ring: 'ring-primary/20',
                        };
                        const NIcon = conf.Icon;

                        return (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.025, duration: 0.2 }}
                            onClick={() => {
                              onNotificationClick?.(n);
                              setIsOpen(false);
                            }}
                            className={`relative flex items-start gap-3 px-3 py-3 mx-1 rounded-2xl transition-all duration-200 group cursor-pointer ${
                              !isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent/50'
                            }`}
                          >
                            {!isRead && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary" />}
                            <div className={`mt-0.5 w-9 h-9 rounded-xl ${conf.bg} ring-1 ${conf.ring} flex items-center justify-center shrink-0`}>
                              <NIcon className={`w-4 h-4 ${conf.color}`} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm leading-snug ${!isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/85'}`}>
                                  {n.message}
                                </p>
                                <span className="text-[10px] font-medium text-muted-foreground/80 shrink-0 mt-0.5">
                                  {moment(n.created_at).format('HH:mm')}
                                </span>
                              </div>
                              {n.metadata?.title && <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{n.metadata.title}</p>}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Alerta de Remoção Mantido Intacto */}
      <AlertDialog isOpen={alertModalIsOpen} leastDestructiveRef={cancelRef} onClose={() => setAlertModalIsOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Remover notificações
            </AlertDialogHeader>

            <AlertDialogBody>Todas as notificações serão excluídas permanentemente, você tem certeza disso?</AlertDialogBody>

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
