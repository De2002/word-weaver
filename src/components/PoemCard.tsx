import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, Sparkles, ChevronDown, ChevronUp, Twitter, Facebook, Link2, MessageSquare, TrendingUp } from 'lucide-react';
import { Poem } from '@/types/poem';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TagBadge } from '@/components/TagBadge';
import { AudioPlayButton } from '@/components/AudioPlayButton';
import { FollowButton } from '@/components/FollowButton';
import { CommentSection } from '@/components/CommentSection';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { usePoemInteractions } from '@/hooks/usePoemInteractions';
import { useComments } from '@/hooks/useComments';

interface PoemCardProps {
  poem: Poem;
  index?: number;
}

export function PoemCard({ poem, index = 0 }: PoemCardProps) {
  const navigate = useNavigate();
  const {
    isUpvoted,
    isSaved,
    upvoteCount,
    saveCount,
    readCount,
    toggleUpvote,
    toggleSave,
    recordRead,
  } = usePoemInteractions(poem.id);

  const { commentCount } = useComments(poem.id);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Record read when poem is viewed
  useEffect(() => {
    recordRead();
  }, []);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    
    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  const poemUrl = `${window.location.origin}/poem/${poem.id}`;
  const shareText = `"${poem.title}" by ${poem.poet.name} - ${poem.text.slice(0, 100)}...`;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const shareToTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(poemUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(poemUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + poemUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(poemUrl);
    toast({
      title: "Link copied!",
      description: "Poem link has been copied to clipboard.",
    });
    setShowShareMenu(false);
  };

  const poemLines = poem.text.split('\n');
  const shouldTruncate = poemLines.length > 8;
  const displayText = shouldTruncate && !isExpanded 
    ? poemLines.slice(0, 6).join('\n') 
    : poem.text;

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleUpvote();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave();
  };

  const handleToggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  const handlePoemClick = () => {
    navigate(`/poem/${poem.id}`);
  };

  const poetBadge = poem.poet.badges[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-card border-b border-border/50 p-5 md:p-6"
    >
      {/* Poet Header */}
      <header className="flex items-center justify-between mb-4">
        <Link
          to={`/poet/${poem.poet.username}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-border">
              <AvatarImage src={poem.poet.avatar} alt={poem.poet.name} />
              <AvatarFallback className="bg-secondary font-medium text-sm">
                {poem.poet.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {poetBadge && (
              <span className={cn(
                "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-background",
                poetBadge.type === 'trending' && 'bg-gradient-to-br from-primary to-warm-gold',
                poetBadge.type === 'new' && 'bg-sage',
                poetBadge.type === 'rising' && 'bg-soft-coral',
              )}>
                {poetBadge.type === 'trending' && <Sparkles className="h-2.5 w-2.5 text-white" />}
                {poetBadge.type === 'new' && <span className="text-[8px] font-bold text-white">N</span>}
                {poetBadge.type === 'rising' && <TrendingUp className="h-2.5 w-2.5 text-white" />}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-foreground">{poem.poet.name}</span>
            <span className="text-xs text-muted-foreground">@{poem.poet.username}</span>
          </div>
        </Link>
        <FollowButton poetUserId={poem.poet.id} variant="outline" />
      </header>

      {/* Poem Content - Clickable */}
      <div 
        onClick={handlePoemClick}
        className="cursor-pointer space-y-3 mb-4"
      >
        <div className="flex items-start justify-between gap-3">
          {poem.title && (
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground">
              {poem.title}
            </h2>
          )}
          {poem.audioUrl && (
            <AudioPlayButton 
              audioUrl={poem.audioUrl} 
              size="sm"
              className="flex-shrink-0 mt-1"
            />
          )}
        </div>
        
        <div className="font-serif text-lg leading-relaxed text-foreground whitespace-pre-line">
          {displayText}
        </div>

        {shouldTruncate && (
          <motion.button
            onClick={handleReadMore}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline mt-2"
            whileTap={{ scale: 0.98 }}
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Read more</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {poem.tags.slice(0, 4).map(tag => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>

      {/* Meta Info */}
      <div className="text-sm text-muted-foreground mb-4">
        <span>{readCount.toLocaleString()} reads</span>
        <span className="mx-2">·</span>
        <span>{formatDistanceToNow(new Date(poem.createdAt), { addSuffix: true })}</span>
      </div>

      <Separator className="mb-4" />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleUpvote}
            className={cn(
              "flex items-center gap-2 transition-colors",
              isUpvoted ? "text-soft-coral" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart 
              className={cn("h-5 w-5", isUpvoted && "fill-current")} 
            />
            <span className="font-medium text-sm">{upvoteCount}</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleComments}
            className={cn(
              "flex items-center gap-2 transition-colors",
              showComments ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageCircle className={cn("h-5 w-5", showComments && "fill-primary/20")} />
            <span className="font-medium text-sm">{commentCount}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 transition-colors",
              isSaved ? "text-warm-gold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Bookmark 
              className={cn("h-5 w-5", isSaved && "fill-current")} 
            />
            <span className="font-medium text-sm">{saveCount}</span>
          </motion.button>
        </div>

        <div className="relative" ref={shareMenuRef}>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className={cn(
              "text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full",
              showShareMenu && "bg-secondary text-foreground"
            )}
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </motion.button>

          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-xl shadow-lg p-2 min-w-[160px] z-50"
              >
                <button
                  onClick={shareToTwitter}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                  <span>Twitter</span>
                </button>
                <button
                  onClick={shareToFacebook}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <Facebook className="h-4 w-4 text-[#1877F2]" />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={shareToWhatsApp}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <MessageSquare className="h-4 w-4 text-[#25D366]" />
                  <span>WhatsApp</span>
                </button>
                <Separator className="my-1" />
                <button
                  onClick={copyLink}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <Link2 className="h-4 w-4" />
                  <span>Copy link</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Inline Comments Section */}
      <AnimatePresence>
        {showComments && (
          <CommentSection 
            poemId={poem.id} 
            onViewAll={handlePoemClick}
            maxComments={3}
          />
        )}
      </AnimatePresence>
    </motion.article>
  );
}
