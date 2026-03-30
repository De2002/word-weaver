import { useState } from 'react';
import { LayoutList, HelpCircle, Trophy, Feather, User, BookOpen, Bookmark, Bell, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';

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
  { icon: LayoutList, label: 'Feed', href: '/', description: 'Latest poems and discovery' },
  { icon: HelpCircle, label: 'Q&A', href: '/qa', description: 'Poetry questions and answers' },
  { icon: Trophy, label: 'Challenges', href: '/challenges', description: 'Prompts and contests' },
  { icon: Feather, label: 'Classics', href: '/classics', description: 'Classic poetry library' },
];

const accountNavItems: NavItem[] = [
  { icon: User, label: 'Profile', href: '/poet/:username', requiresAuth: true, dynamic: true },
  { icon: BookOpen, label: 'My Poems', href: '/my-poems', requiresAuth: true },
  { icon: Bookmark, label: 'Saved Poems', href: '/saved', requiresAuth: true },
  { icon: Bell, label: 'Notifications', href: '/notifications', requiresAuth: true, showBadge: true },
  { icon: Settings, label: 'Edit Profile', href: '/profile', requiresAuth: true },
];

export function DesktopSidebar() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const { unreadCount } = useNotifications();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
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

    return (
      <Link
        key={item.label}
        to={href}
        className={cn(
          'group flex items-center rounded-xl px-3 py-3 transition-colors',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
          isCollapsed ? 'justify-center' : 'gap-3'
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <div className="relative">
          <item.icon className={cn('h-5 w-5 shrink-0', active && 'stroke-[2.5]')} />
          {item.showBadge && unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-soft-coral text-white text-[10px] font-bold leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        {!isCollapsed && (
          <div>
            <p className="text-sm font-semibold leading-tight">{item.label}</p>
            {item.description && (
              <p className={cn('text-xs leading-tight mt-1', active ? 'text-primary/80' : 'text-muted-foreground')}>
                {item.description}
              </p>
            )}
          </div>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'hidden md:flex h-screen border-r border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-[width] duration-200',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex w-full flex-col p-4">
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
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav className="space-y-1.5" aria-label="Desktop main navigation">
          {mainNavItems.map(renderNavLink)}
        </nav>

        {user && (
          <>
            <div className="my-4 border-t border-border/60" />
            {!isCollapsed && (
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account
              </p>
            )}
            <nav className="space-y-1.5" aria-label="Desktop account navigation">
              {accountNavItems.map(renderNavLink)}
            </nav>
          </>
        )}
      </div>
    </aside>
  );
}
