import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus, Reply, Check, Trash2, Loader2 } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

function NotificationIcon({ type }: { type: Notification['type'] }) {
  switch (type) {
    case 'follow':
      return <UserPlus className="h-4 w-4 text-primary" />;
    case 'upvote':
      return <Heart className="h-4 w-4 text-soft-coral" />;
    case 'comment':
      return <MessageCircle className="h-4 w-4 text-sage" />;
    case 'reply':
      return <Reply className="h-4 w-4 text-warm-gold" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

function getNotificationMessage(notification: Notification): string {
  const { type, actor, poem } = notification;
  const poemTitle = poem?.title ? `"${poem.title}"` : 'your poem';

  switch (type) {
    case 'follow':
      return `started following you`;
    case 'upvote':
      return `liked ${poemTitle}`;
    case 'comment':
      return `commented on ${poemTitle}`;
    case 'reply':
      return `replied to your comment on ${poemTitle}`;
    default:
      return 'interacted with you';
  }
}

function getNotificationLink(notification: Notification): string {
  const { type, poemId, actorId } = notification;

  switch (type) {
    case 'follow':
      return `/poet/${notification.actor.username}`;
    case 'upvote':
    case 'comment':
    case 'reply':
      return poemId ? `/poem/${poemId}` : '/';
    default:
      return '/';
  }
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const link = getNotificationLink(notification);
  const message = getNotificationMessage(notification);

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "relative flex items-start gap-3 p-4 border-b border-border/50 transition-colors",
        !notification.isRead && "bg-primary/5"
      )}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
      )}

      <Link to={link} onClick={handleClick} className="flex-shrink-0">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={notification.actor.avatar} alt={notification.actor.name} />
            <AvatarFallback>{notification.actor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background border-2 border-background flex items-center justify-center">
            <NotificationIcon type={notification.type} />
          </span>
        </div>
      </Link>

      <Link to={link} onClick={handleClick} className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium text-foreground">{notification.actor.name}</span>{' '}
          <span className="text-muted-foreground">{message}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </Link>

      <div className="flex items-center gap-1">
        {!notification.isRead && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-full transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 border-b border-border/50">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export default function Notifications() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/home" className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-semibold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </header>

      {/* Loading State */}
      {isLoading && (
        <div>
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium mb-2">No notifications yet</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            When someone follows you, likes your poems, or comments on your work, you'll see it here.
          </p>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && notifications.length > 0 && (
        <div>
          <AnimatePresence>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
