import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, BookOpen, Bookmark, Bell, Settings, LogOut, Sun, Moon, Trophy, Calendar, MessageCircle, Newspaper, Info, ScrollText, FileText, Shield, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { db } from '@/lib/db';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: User, label: 'Profile', href: '/poet/:username', dynamic: true },
  { icon: BookOpen, label: 'My Poems', href: '/my-poems' },
  { icon: Trophy, label: 'Challenges', href: '/challenges' },
  { icon: Bookmark, label: 'Saved Poems', href: '/saved' },
  { icon: Bell, label: 'Notifications', href: '/notifications', showBadge: true },
  { icon: Settings, label: 'Edit Profile', href: '/profile' },
];

const moreMenuItems = [
  { icon: Calendar, label: 'Events', href: '/events' },
  { icon: MessageCircle, label: 'Messages', href: '/messages', requiresAuth: true },
  { icon: BookOpen, label: 'Bookstore', href: '/bookstore' },
  { icon: Newspaper, label: 'Journals', href: '/journals' },
  { icon: Info, label: 'About', href: '/about' },
  { icon: ScrollText, label: 'Rules', href: '/rules' },
  { icon: FileText, label: 'User Agreement', href: '/user-agreement' },
  { icon: Shield, label: 'Privacy Policy', href: '/privacy-policy' },
  { icon: DollarSign, label: 'Refund Policy', href: '/refund-policy' },
];

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { unreadCount } = useNotifications();

  const displayName = profile?.display_name || profile?.username || user?.email || 'You';
  const username = profile?.username;
  const avatarUrl = profile?.avatar_url || undefined;
  const userId = user?.id;

  // Live follower count — people following me
  const { data: followerCount = 0 } = useQuery({
    queryKey: ['follower-count', userId],
    queryFn: async () => {
      const { count, error } = await db
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId!);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!userId && open,
  });

  // Live following count — people I follow
  const { data: followingCount = 0 } = useQuery({
    queryKey: ['following-count', userId],
    queryFn: async () => {
      const { count, error } = await db
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId!);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!userId && open,
  });

  const handleSignOut = async () => {
    onClose();
    await signOut();
    navigate('/');
  };

  const handleNavClick = () => {
    onClose();
  };

  const resolvedHref = (item: typeof menuItems[0]) => {
    if (item.dynamic && username) return `/poet/${username}`;
    return item.href;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed left-0 top-0 z-50 w-[80vw] max-w-xs bg-background flex flex-col shadow-2xl"
            style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
          >
            {/* Header area */}
            <div className="p-5 pt-12">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Avatar + name */}
              <div className="flex flex-col gap-3">
                <Avatar className="h-14 w-14 ring-2 ring-border">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground text-base leading-tight">{displayName}</span>
                  </div>
                  {username && (
                    <span className="text-sm text-muted-foreground">@{username}</span>
                  )}
                </div>

                {/* Live follower / following counts */}
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{followingCount.toLocaleString()}</span> Following
                  </span>
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{followerCount.toLocaleString()}</span> Followers
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-2 pb-4">
              {menuItems.map((item) => {
                const href = resolvedHref(item);
                // Hide "Profile" if no username yet
                if (item.dynamic && !username) return null;

                return (
                  <Link
                    key={item.label}
                    to={href}
                    onClick={handleNavClick}
                    className="flex items-center gap-4 px-5 py-3.5 text-foreground hover:bg-secondary/60 transition-colors group"
                  >
                    <div className="relative">
                      <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      {item.showBadge && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-soft-coral text-white text-[10px] font-bold leading-none">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-base flex-1">{item.label}</span>
                    {item.showBadge && unreadCount > 0 && (
                      <span className="text-xs font-medium text-soft-coral">{unreadCount}</span>
                    )}
                  </Link>
                );
              })}

              <Separator className="my-2" />

              {moreMenuItems.map((item) => {
                if (item.requiresAuth && !user) return null;

                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={handleNavClick}
                    className="flex items-center gap-4 px-5 py-3.5 text-foreground hover:bg-secondary/60 transition-colors group"
                  >
                    <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="font-medium text-base">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom: theme toggle + sign out */}
            <div className="p-4 border-t border-border flex flex-col gap-1">
              {/* Theme toggle: Light / System / Dark */}
              <div className="flex flex-col gap-1.5 px-3 py-2.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Theme</span>
                <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
                  {([
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'system', icon: null, label: 'Auto' },
                    { value: 'dark', icon: Moon, label: 'Dark' },
                  ] as const).map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      aria-label={`${label} theme`}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
                        theme === value
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {!Icon && (
                        <span className="h-3.5 w-3.5 flex items-center justify-center text-[10px]">⚙</span>
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
