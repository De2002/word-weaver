import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationsRealtime } from '@/hooks/useNotificationsRealtime';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'trending', label: 'Trending' },
];

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  showTabs?: boolean;
}

export function Header({ activeTab = 'for-you', onTabChange, showTabs = false }: HeaderProps) {
  const { user, profile } = useAuth();
  const { unreadCount } = useNotifications();
  const isVisible = useScrollDirection(15);
  
  useNotificationsRealtime();
  const displayName = profile?.display_name || profile?.username || user?.email || 'You';
  const avatarUrl = profile?.avatar_url || undefined;

  return (
    <motion.header 
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50"
    >
      <div className="max-w-2xl mx-auto">
        {/* Top Row: Brand + Actions */}
        <div className="flex items-center justify-between h-12 px-4">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5"
          >
            <span className="font-poem text-xl font-bold bg-gradient-to-r from-primary to-warm-gold bg-clip-text text-transparent">
              WS
            </span>
          </motion.div>

          <div className="flex items-center gap-1">

            {user && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 }}
              >
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-full hover:bg-secondary transition-colors block"
                >
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className={cn(
                      "absolute top-1 right-1 flex items-center justify-center rounded-full bg-soft-coral text-white text-xs font-bold",
                      unreadCount > 9 ? "h-5 w-5 -top-0.5 -right-0.5" : "h-4 w-4"
                    )}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
            >
              {user ? (
                <Link
                  to="/profile"
                  className="block rounded-full ring-2 ring-transparent hover:ring-primary/30 transition-all"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Button asChild size="sm" variant="secondary" className="h-8 px-3 text-sm">
                  <Link to="/login">Sign in</Link>
                </Button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Tabs Row - only shown when showTabs is true */}
        {showTabs && (
          <div className="flex items-center border-t border-border/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={cn(
                  "flex-1 relative py-3 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="headerActiveTab"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary to-warm-gold rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.header>
  );
}
