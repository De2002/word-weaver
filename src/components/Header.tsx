import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider';
import { useNotificationsRealtime } from '@/hooks/useNotificationsRealtime';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { ProfileDrawer } from '@/components/ProfileDrawer';
import { cn } from '@/lib/utils';
import { useRef, useState, useEffect } from 'react';

const tabs = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'trending', label: 'Trending' },
  { id: 'rising', label: 'Rising' },
];

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  showTabs?: boolean;
}

export function Header({ activeTab = 'for-you', onTabChange, showTabs = false }: HeaderProps) {
  const { user, profile, roles } = useAuth();
  const isVisible = useScrollDirection(15);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useNotificationsRealtime();
  const displayName = profile?.display_name || profile?.username || user?.email || 'You';
  const avatarUrl = profile?.avatar_url || undefined;

  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = tabRefs.current.get(activeTab);
      if (activeButton) {
        const container = activeButton.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const buttonRect = activeButton.getBoundingClientRect();
          setIndicatorStyle({
            left: buttonRect.left - containerRect.left + buttonRect.width / 2 - 24,
            width: 48,
          });
        }
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab]);

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-2xl mx-auto">
          {/* Top Row: Avatar (left) + Brand (center) + Bell (right) */}
          <div className="flex items-center h-12 px-4">
            {/* Left: Avatar / Sign in */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="flex-none"
            >
              {user ? (
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="block rounded-full ring-2 ring-transparent hover:ring-primary/30 transition-all"
                  aria-label="Open profile menu"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              ) : (
                <Button asChild size="sm" variant="secondary" className="h-8 px-3 text-sm">
                  <Link to="/login">Sign in</Link>
                </Button>
              )}
            </motion.div>

            {/* Center: Brand */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex justify-center"
            >
              <span className="font-poem text-xl font-bold bg-gradient-to-r from-primary to-warm-gold bg-clip-text text-transparent">
                WS
              </span>
            </motion.div>

            {/* Right: Upgrade crown for non-pro / empty spacer for pro (bell is in Profile Drawer) */}
            {/* Right: Upgrade crown for non-pro / empty spacer for pro (bell is in Profile Drawer) */}
            <div className="flex-none flex items-center gap-1">
              {user && !roles.includes('pro') && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 }}
                >
                  <Link
                    to="/upgrade"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-90"
                    style={{
                      background: 'linear-gradient(135deg, hsl(24 80% 50%), hsl(38 80% 50%))',
                      color: 'hsl(0 0% 100%)',
                    }}
                  >
                    <Crown className="h-3 w-3" />
                    Pro
                  </Link>
                </motion.div>
              )}
              {(!user || !roles.includes('pro')) && !roles.includes('pro') && !user && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 }}>
                  <Link
                    to="/upgrade"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, hsl(24 80% 50%), hsl(38 80% 50%))', color: 'hsl(0 0% 100%)' }}
                  >
                    <Crown className="h-3 w-3" />
                    Pro
                  </Link>
                </motion.div>
              )}
            </div>
          </div>

          {/* Tabs Row */}
          {showTabs && (
            <div className="relative flex items-center border-t border-border/30">
              <motion.div
                className="absolute bottom-0 h-1 bg-gradient-to-r from-primary to-warm-gold rounded-full"
                initial={false}
                animate={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />

              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  ref={(el) => {
                    if (el) tabRefs.current.set(tab.id, el);
                  }}
                  onClick={() => onTabChange?.(tab.id)}
                  className={cn(
                    "flex-1 relative py-3 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.header>

      {/* Profile drawer */}
      <ProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
