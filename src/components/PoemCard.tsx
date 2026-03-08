import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, Sparkles, Twitter, Facebook, Link2, MessageSquare, TrendingUp } from 'lucide-react';
import { Poem } from '@/types/poem';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TagBadge } from '@/components/TagBadge';
import { AudioPlayButton } from '@/components/AudioPlayButton';
import { FollowButton } from '@/components/FollowButton';
import { CommentSection } from '@/components/CommentSection';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { usePoemInteractions } from '@/hooks/usePoemInteractions';
import { useComments } from '@/hooks/useComments';
import { useNativeShare } from '@/hooks/useNativeShare';

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
  const { share, copyToClipboard, shareToTwitter, shareToFacebook, shareToWhatsApp } = useNativeShare();

  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    recordRead();
  }, []);

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

  const poemUrl = `${window.location.origin}/poem/${poem.slug || poem.id}`;
  const shareText = `"${poem.title}" by ${poem.poet.name} - ${poem.text.slice(0, 100)}...`;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const usedNativeShare = await share({
      title: poem.title || 'A poem on WordStack',
      text: shareText,
      url: poemUrl,
    });
    if (!usedNativeShare) {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleShareToTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareToTwitter(shareText, poemUrl);
    setShowShareMenu(false);
  };

  const handleShareToFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareToFacebook(poemUrl);
    setShowShareMenu(false);
  };

  const handleShareToWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareToWhatsApp(shareText, poemUrl);
    setShowShareMenu(false);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(poemUrl);
    setShowShareMenu(false);
  };

  // Preview: show first 6 lines
  const poemLines = poem.text.split('\n');
  const shouldTruncate = poemLines.length > 8;
  const previewText = shouldTruncate
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

  const handlePoemClick = () => {
    navigate(`/poem/${poem.slug || poem.id}`);
  };

  const poetBadge = poem.poet.badges[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-card border-b border-border/50 p-5 md:p-6"
    >
      {/* Title + Audio */}
      <div
        onClick={handlePoemClick}
        className="cursor-pointer mb-3"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className={cn(
            "font-serif font-semibold text-foreground leading-tight",
            poem.title ? "text-2xl md:text-3xl" : "hidden"
          )}>
            {poem.title}
          </h2>
          {poem.audioUrl && (
            <AudioPlayButton
              audioUrl={poem.audioUrl}
              size="sm"
              className="flex-shrink-0 mt-1"
            />
          )}
        </div>
      </div>

      {/* Poem Preview Text */}
      <div
        onClick={handlePoemClick}
        className="cursor-pointer mb-4 space-y-2"
      >
        <div className="font-serif text-lg leading-relaxed text-foreground whitespace-pre-line">
          {previewText}
        </div>

        {shouldTruncate && (
          <motion.button
            onClick={handlePoemClick}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline mt-1"
            whileTap={{ scale: 0.98 }}
          >
            <span>Read more</span>
          </motion.button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {poem.tags.slice(0, 4).map(tag => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>

      {/* Poet Info */}
      <div className="flex items-center justify-between mb-3">
        <Link
          to={`/poet/${poem.poet.username}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <Avatar className="h-8 w-8 ring-2 ring-border">
              <AvatarImage src={poem.poet.avatar} alt={poem.poet.name} />
              <AvatarFallback className="bg-secondary font-medium text-xs">
                {poem.poet.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {poetBadge && (
              <span className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center ring-2 ring-background",
                poetBadge.type === 'trending' && 'bg-gradient-to-br from-primary to-warm-gold',
                poetBadge.type === 'new' && 'bg-sage',
                poetBadge.type === 'rising' && 'bg-soft-coral',
              )}>
                {poetBadge.type === 'trending' && <Sparkles className="h-2 w-2 text-white" />}
                {poetBadge.type === 'new' && <span className="text-[7px] font-bold text-white">N</span>}
                {poetBadge.type === 'rising' && <TrendingUp className="h-2 w-2 text-white" />}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-foreground">{poem.poet.name}</span>
            <span className="text-xs text-muted-foreground">@{poem.poet.username}</span>
          </div>
        </Link>
        <FollowButton poetUserId={poem.poet.id} variant="outline" />
      </div>

      {/* Meta Info */}
      <div className="text-xs text-muted-foreground mb-4">
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
            <Heart className={cn("h-5 w-5", isUpvoted && "fill-current")} />
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
            <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
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
                  onClick={handleShareToTwitter}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                  <span>Twitter</span>
                </button>
                <button
                  onClick={handleShareToFacebook}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <Facebook className="h-4 w-4 text-[#1877F2]" />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={handleShareToWhatsApp}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <MessageSquare className="h-4 w-4 text-[#25D366]" />
                  <span>WhatsApp</span>
                </button>
                <Separator className="my-1" />
                <button
                  onClick={handleCopyLink}
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

      {/* Inline Comments */}
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
