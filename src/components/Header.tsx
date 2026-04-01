import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthProvider';
import { useNotificationsRealtime } from '@/hooks/useNotificationsRealtime';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { ProfileDrawer } from '@/components/ProfileDrawer';
import { cn } from '@/lib/utils';
import { useRef, useState, useEffect } from 'react';
import logoImg from '@/assets/logo.png';

const tabs = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'recent', label: 'Recent' },
];

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  showTabs?: boolean;
}

export function Header({ activeTab = 'for-you', onTabChange, showTabs = false }: HeaderProps) {
  const { user, profile } = useAuth();
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
        className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 md:left-[var(--desktop-sidebar-offset,0px)]"
      >
        <div className="max-w-2xl mx-auto">
          {/* Top Row: Avatar (left) + Brand (center) + Bell (right) */}
          <div className="flex items-center h-12 px-4">
            {/* Left: Avatar / Sign in */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="flex-none md:hidden"
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
              className="flex-1 flex justify-center md:hidden"
            >
<<<<<<< lovable-sync-1775041576
              <img src={logoImg} alt="WordStack" className="h-8 w-8 rounded-lg" />
=======
              <img
                src="/favicon.png"
                alt="Word Weaver"
                className="h-7 w-7 rounded-md"
              />
>>>>>>> main
            </motion.div>

            {/* Right: spacing to balance the centered brand */}
            <div className="flex-none w-8 md:hidden" />
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
