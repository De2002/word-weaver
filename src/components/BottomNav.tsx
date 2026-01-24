import { Home, Compass, Search, MoreHorizontal } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', href: '/home' },
  { icon: Compass, label: 'Discover', href: '/discover' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: MoreHorizontal, label: 'More', href: '/more' },
];

export function BottomNav() {
  const location = useLocation();
  
  const isActive = (href: string) => {
    if (href === '/home') return location.pathname === '/home';
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="mx-auto max-w-lg pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-6 py-2 transition-colors",
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  active && "stroke-[2.5]"
                )} />
                <span className={cn(
                  "text-[10px]",
                  active ? "font-semibold" : "font-medium"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
