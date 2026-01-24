import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Heart, MessageCircle, Bookmark, Share2, 
  Sparkles, TrendingUp, Twitter, Facebook, Link2, MessageSquare
} from 'lucide-react';
import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TagBadge } from '@/components/TagBadge';
import { AudioPlayButton } from '@/components/AudioPlayButton';
import { FollowButton } from '@/components/FollowButton';
import { CommentSection } from '@/components/CommentSection';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { usePoemInteractions } from '@/hooks/usePoemInteractions';
import { useComments } from '@/hooks/useComments';
import { db } from '@/lib/db';
import { Poem } from '@/types/poem';
import { AnimatePresence } from 'framer-motion';

export default function PoemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Fetch poem from database
  const { data: poem, isLoading, error } = useQuery({
    queryKey: ['poem-detail', id],
    queryFn: async (): Promise<Poem | null> => {
      if (!id) return null;

      const { data: poemData, error: poemError } = await db
        .from('poems')
        .select(`
          id,
          title,
          content,
          tags,
          created_at,
          user_id,
          profiles!inner(display_name, username, avatar_url, user_id, created_at)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (poemError) throw poemError;
      if (!poemData) return null;

      // Determine poet badge based on profile age
      const profileCreatedAt = new Date((poemData.profiles as any)?.created_at || poemData.created_at);
      const daysSinceJoined = (Date.now() - profileCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
      
      let badges: { type: 'new' | 'rising' | 'trending'; label: string }[] = [];
      if (daysSinceJoined <= 14) {
        badges = [{ type: 'new', label: 'New Voice' }];
      } else if (daysSinceJoined <= 30) {
        badges = [{ type: 'rising', label: 'Rising' }];
      }

      return {
        id: poemData.id,
        title: poemData.title || undefined,
        text: poemData.content,
        tags: poemData.tags || [],
        createdAt: poemData.created_at,
        language: 'en',
        upvotes: 0,
        comments: 0,
        saves: 0,
        reads: 0,
        poet: {
          id: (poemData.profiles as any)?.user_id || poemData.user_id,
          name: (poemData.profiles as any)?.display_name || 'Anonymous',
          username: (poemData.profiles as any)?.username || 'anonymous',
          avatar: (poemData.profiles as any)?.avatar_url || '',
          bio: '',
          languages: [],
          totalReads: 0,
          totalUpvotes: 0,
          totalPoems: 0,
          followersCount: 0,
          badges,
        },
      } as Poem;
    },
    enabled: !!id,
  });

  const {
    isUpvoted,
    isSaved,
    upvoteCount,
    saveCount,
    readCount,
    toggleUpvote,
    toggleSave,
    recordRead,
  } = usePoemInteractions(id || '');

  const { commentCount } = useComments(id || '');

  // Record read when poem is viewed
  useEffect(() => {
    if (id) {
      recordRead();
    }
  }, [id]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-medium">Poem</span>
          </div>
        </header>
        <main className="max-w-2xl mx-auto p-5 space-y-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
        </main>
      </div>
    );
  }

  if (error || !poem) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-medium">Poem</span>
          </div>
        </header>
        <main className="max-w-2xl mx-auto p-5 text-center py-20">
          <h2 className="text-lg font-medium text-foreground mb-2">Poem not found</h2>
          <p className="text-muted-foreground">This poem may have been removed or doesn't exist.</p>
        </main>
      </div>
    );
  }

  const poemUrl = `${window.location.origin}/poem/${poem.id}`;
  const shareText = `"${poem.title || 'Untitled'}" by ${poem.poet.name} - ${poem.text.slice(0, 100)}...`;

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

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleUpvote();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave();
  };

  const poetBadge = poem.poet.badges[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <span className="font-medium">Poem</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto pb-24">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border-b border-border/50 p-5 md:p-6"
        >
          {/* Poet Header - Same as PoemCard */}
          <header className="flex items-center justify-between mb-4">
            <Link
              to={`/poet/${poem.poet.username}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
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

          {/* Poem Content - Full display */}
          <div className="space-y-3 mb-4">
            <div className="flex items-start justify-between gap-3">
              {poem.title && (
                <h1 className="font-serif text-xl md:text-2xl font-semibold text-foreground">
                  {poem.title}
                </h1>
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
              {poem.text}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {poem.tags.map(tag => (
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

          {/* Actions - Same as PoemCard */}
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

              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium text-sm">{commentCount}</span>
              </div>

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

          <Separator className="my-4" />

          {/* Full Comments Section - Always visible on detail page */}
          <CommentSection poemId={poem.id} />
        </motion.article>
      </main>
    </div>
  );
}
