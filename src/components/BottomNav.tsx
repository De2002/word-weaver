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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2 pb-safe">
        {navItems.map((item) => (
          <motion.a
            key={item.label}
            href={item.href}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors",
              item.isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label === 'Post' ? (
              <div className="bg-gradient-to-r from-primary to-warm-gold p-2.5 rounded-full -mt-4 shadow-lg">
                <item.icon className="h-5 w-5 text-white" />
              </div>
            ) : (
              <>
                <item.icon className={cn(
                  "h-5 w-5",
                  item.isActive && "stroke-[2.5]"
                )} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </motion.a>
        ))}
      </div>
    </nav>
  );
}
