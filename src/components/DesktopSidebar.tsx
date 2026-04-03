import { LayoutList, HelpCircle, Trophy, Feather, User, BookOpen, Bookmark, Bell, Settings, ChevronLeft, ChevronRight, Compass, Wallet, Calendar, MessageCircle, Newspaper, Info, ScrollText, FileText, Shield, DollarSign } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  description?: string;
  requiresAuth?: boolean;
  dynamic?: boolean;
  showBadge?: boolean;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutList, label: 'Feed', href: '/feed', description: 'Latest poems and discovery' },
  { icon: Compass, label: 'Explore', href: '/explore', description: 'Browse all tags' },
  { icon: HelpCircle, label: 'Q&A', href: '/qa', description: 'Poetry questions and answers' },
  { icon: Trophy, label: 'Challenges', href: '/challenges', description: 'Prompts and contests' },
  { icon: Feather, label: 'Classics', href: '/classics', description: 'Classic poetry library' },
];

const accountNavItems: NavItem[] = [
  { icon: User, label: 'Profile', href: '/poet/:username', requiresAuth: true, dynamic: true },
  { icon: BookOpen, label: 'My Poems', href: '/my-poems', requiresAuth: true },
  { icon: Bookmark, label: 'Saved Poems', href: '/saved', requiresAuth: true },
  { icon: Wallet, label: 'Wallet', href: '/wallet', requiresAuth: true },
  { icon: Bell, label: 'Notifications', href: '/notifications', requiresAuth: true, showBadge: true },
  { icon: Settings, label: 'Edit Profile', href: '/profile', requiresAuth: true },
];

const moreNavItems: NavItem[] = [
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

interface DesktopSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function DesktopSidebar({ isCollapsed, onToggle }: DesktopSidebarProps) {
  const location = useLocation();
  const { user, profile } = useAuth();
  const { unreadCount } = useNotifications();

  const isActive = (href: string) => {
    if (href === '/feed') return location.pathname === '/feed';
    return location.pathname.startsWith(href);
  };

  const resolveHref = (item: NavItem) => {
    if (item.dynamic) {
      const username = profile?.username;
      if (!username) return null;
      return `/poet/${username}`;
    }

    return item.href;
  };

  const renderNavLink = (item: NavItem) => {
    if (item.requiresAuth && !user) return null;

    const href = resolveHref(item);
    if (!href) return null;

    const active = isActive(href);

    const link = (
      <Link
        key={item.label}
        to={href}
        className={cn(
          'group flex items-center rounded-xl px-3 py-3 transition-all duration-300 ease-in-out',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
          isCollapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <div className="relative">
          <item.icon className={cn('h-5 w-5 shrink-0', active && 'stroke-[2.5]')} />
          {item.showBadge && unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-soft-coral text-white text-[10px] font-bold leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[220px] opacity-100'
          )}
        >
          <p className="text-sm font-semibold leading-tight whitespace-nowrap">{item.label}</p>
          {item.description && (
            <p className={cn('text-xs leading-tight mt-1 whitespace-nowrap', active ? 'text-primary/80' : 'text-muted-foreground')}>
              {item.description}
            </p>
          )}
        </div>
      </Link>
    );

    if (!isCollapsed) return link;

    return (
      <Tooltip key={item.label}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 hidden h-screen border-r border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:flex transition-[width] duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      <div className="flex w-full flex-col overflow-y-auto p-4">
        <div className={cn('mb-6 flex items-center', isCollapsed ? 'justify-center' : 'justify-between')}>
          {!isCollapsed && (
            <Link to="/" className="px-2 py-1">
              <div className="font-poem text-2xl font-bold bg-gradient-to-r from-primary to-warm-gold bg-clip-text text-transparent">
                WordStack
              </div>
              <p className="text-xs text-muted-foreground mt-1">Desktop navigation</p>
            </Link>
          )}

          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-300"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5 transition-transform duration-300" /> : <ChevronLeft className="h-5 w-5 transition-transform duration-300" />}
          </button>
        </div>

        <nav className="space-y-1.5" aria-label="Desktop main navigation">
          {mainNavItems.map(renderNavLink)}
        </nav>

        {user && (
          <>
            <div className="my-4 border-t border-border/60" />
            <p
              className={cn(
                'px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-300',
                isCollapsed ? 'opacity-0' : 'opacity-100'
              )}
            >
                Account
            </p>
            <nav className="space-y-1.5" aria-label="Desktop account navigation">
              {accountNavItems.map(renderNavLink)}
            </nav>
          </>
        )}

        <div className="my-4 border-t border-border/60" />
        <p
          className={cn(
            'px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-300',
            isCollapsed ? 'opacity-0' : 'opacity-100'
          )}
        >
          More
        </p>
        <nav className="space-y-1.5" aria-label="Desktop more navigation">
          {moreNavItems.map(renderNavLink)}
        </nav>
      </div>
    </aside>
  );
}
