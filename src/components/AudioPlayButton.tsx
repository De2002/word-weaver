import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Pause, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayButtonProps {
  audioUrl: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function AudioPlayButton({ audioUrl, size = 'sm', className }: AudioPlayButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={togglePlay}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-colors",
        buttonSize,
        isPlaying 
          ? "bg-primary text-primary-foreground" 
          : "bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary",
        className
      )}
      title={isPlaying ? "Pause audio" : "Listen to poet read"}
    >
      {/* Progress ring when playing */}
      {isPlaying && (
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 36 36"
        >
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-primary-foreground/20"
            strokeWidth="2"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-primary-foreground"
            strokeWidth="2"
            strokeDasharray={`${progress} 100`}
            strokeLinecap="round"
          />
        </svg>
      )}
      
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Loader2 className={cn(iconSize, "animate-spin")} />
          </motion.div>
        ) : isPlaying ? (
          <motion.div
            key="pause"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Pause className={iconSize} />
          </motion.div>
        ) : (
          <motion.div
            key="play"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Volume2 className={iconSize} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
