import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Feather, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  // Mock user data - would come from auth context in real app
  const user = {
    name: 'You',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="bg-gradient-to-r from-primary to-warm-gold p-1.5 rounded-lg">
            <Feather className="h-5 w-5 text-white" />
          </div>
          <span className="font-poem text-xl font-semibold text-gradient-warm">
            WordStack
          </span>
        </motion.div>

        <div className="flex items-center gap-2">
          <motion.button 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Link 
              to="/profile"
              className="block rounded-full ring-2 ring-transparent hover:ring-primary/30 transition-all"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
