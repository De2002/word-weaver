import { LayoutList, HelpCircle, Trophy, Feather } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  description: string;
}

const navItems: NavItem[] = [
  { icon: LayoutList, label: 'Feed', href: '/', description: 'Latest poems and discovery' },
  { icon: HelpCircle, label: 'Q&A', href: '/qa', description: 'Poetry questions and answers' },
  { icon: Trophy, label: 'Challenges', href: '/challenges', description: 'Prompts and contests' },
  { icon: Feather, label: 'Classics', href: '/classics', description: 'Classic poetry library' },
];

export function DesktopSidebar() {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex w-full flex-col p-4">
        <Link to="/" className="mb-6 px-2 py-3">
          <div className="font-poem text-2xl font-bold bg-gradient-to-r from-primary to-warm-gold bg-clip-text text-transparent">
            WordStack
          </div>
          <p className="text-xs text-muted-foreground mt-1">Desktop navigation</p>
        </Link>

        <nav className="space-y-1.5" aria-label="Desktop main navigation">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  'group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className={cn('mt-0.5 h-5 w-5 shrink-0', active && 'stroke-[2.5]')} />
                <div>
                  <p className="text-sm font-semibold leading-tight">{item.label}</p>
                  <p className={cn('text-xs leading-tight mt-1', active ? 'text-primary/80' : 'text-muted-foreground')}>
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
