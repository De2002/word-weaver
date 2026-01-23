import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Feather, Search, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, profile } = useAuth();
  const { unreadCount } = useNotifications();
  const displayName = profile?.display_name || profile?.username || user?.email || 'You';
  const avatarUrl = profile?.avatar_url || undefined;

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="bg-gradient-to-r from-primary to-warm-gold p-1.5 rounded-lg">
            <Feather className="h-5 w-5 text-white" />
          </div>
          <span className="font-poem text-xl font-semibold text-gradient-warm">
            WordStack
          </span>
        </motion.div>

        <div className="flex items-center gap-2">
          <motion.button 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </motion.button>

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
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Button asChild size="sm" variant="secondary">
                <Link to="/login">Sign in</Link>
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
}
