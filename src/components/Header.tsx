import { motion } from 'framer-motion';
import { Feather, Search } from 'lucide-react';

export function Header() {
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
            Poewi
          </span>
        </motion.div>

        <motion.button 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
        </motion.button>
      </div>
    </header>
  );
}
