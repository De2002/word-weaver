import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/context/AuthProvider';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  poetUserId: string;
  variant?: 'default' | 'compact' | 'outline';
  className?: string;
}

export function FollowButton({ poetUserId, variant = 'default', className }: FollowButtonProps) {
  const { session } = useAuth();
  const { isFollowing, isLoading, toggleFollow } = useFollow(poetUserId);
  
  // Don't show follow button if viewing own profile
  if (session?.user?.id === poetUserId) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFollow();
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "text-xs font-medium shrink-0 transition-colors",
          isFollowing 
            ? "text-muted-foreground hover:text-destructive" 
            : "text-primary hover:underline",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isFollowing ? (
          'Following'
        ) : (
          'Follow'
        )}
      </button>
    );
  }

  if (variant === 'outline') {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "text-sm font-medium px-3 py-1.5 rounded-full border transition-colors",
          isFollowing 
            ? "border-border text-muted-foreground hover:border-destructive hover:text-destructive" 
            : "border-primary/30 text-primary hover:bg-primary/5",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isFollowing ? (
          'Following'
        ) : (
          'Follow'
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "rounded-full px-6 py-2 font-medium text-sm transition-colors",
        isFollowing 
          ? "bg-secondary text-muted-foreground hover:bg-destructive/10 hover:text-destructive" 
          : "bg-primary text-primary-foreground hover:bg-primary/90",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
      ) : isFollowing ? (
        'Following'
      ) : (
        'Follow'
      )}
    </motion.button>
  );
}
