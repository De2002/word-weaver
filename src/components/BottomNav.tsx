import { Home, Compass, PenLine, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', href: '/', isActive: true },
  { icon: Compass, label: 'Discover', href: '/discover' },
  { icon: PenLine, label: 'Post', href: '/post' },
  { icon: Bell, label: 'Alerts', href: '/notifications' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-lg px-4 pb-[env(safe-area-inset-bottom)]">
        <div className="mb-2 flex items-center justify-around rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg px-2 py-2">
          {navItems.map((item) => (
            <motion.a
              key={item.label}
              href={item.href}
              whileTap={{ scale: 0.92 }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200",
                item.isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label === 'Post' ? (
                <div className="flex items-center justify-center w-12 h-12 -mt-6 rounded-full bg-gradient-to-br from-primary to-warm-gold shadow-lg shadow-primary/30">
                  <item.icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
              ) : (
                <>
                  <item.icon className={cn(
                    "h-5 w-5 transition-all",
                    item.isActive && "stroke-[2.5]"
                  )} />
                  <span className={cn(
                    "text-[10px] font-medium transition-all",
                    item.isActive && "font-semibold"
                  )}>
                    {item.label}
                  </span>
                  {item.isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </>
              )}
            </motion.a>
          ))}
        </div>
      </div>
    </nav>
  );
}
