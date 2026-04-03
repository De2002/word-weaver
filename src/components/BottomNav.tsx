import { LayoutList, HelpCircle, Feather, Compass, Wallet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthProvider';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutList, label: 'Feed', href: '/' },
  { icon: Compass, label: 'Explore', href: '/explore' },
  { icon: HelpCircle, label: 'Q&A', href: '/qa' },
  { icon: Feather, label: 'Classics', href: '/classics' },
  { icon: Wallet, label: 'Wallet', href: '/wallet', requiresAuth: true },
];

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="mx-auto max-w-lg pb-[env(safe-area-inset-bottom)]">
        <div className="grid h-16 grid-cols-5">
          {navItems.map((item) => {
            if (item.requiresAuth && !user) {
              return (
                <Link
                  key={item.label}
                  to="/login"
                  className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="max-w-full truncate text-[10px] font-medium leading-none">{item.label}</span>
                </Link>
              );
            }

            const active = isActive(item.href);
            
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 transition-colors",
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
                  "max-w-full truncate text-[10px] leading-none",
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
