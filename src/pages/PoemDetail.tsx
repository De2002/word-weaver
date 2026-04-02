import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Heart, MessageCircle, Bookmark, Share2, 
  Sparkles, TrendingUp, Twitter, Facebook, Link2, MessageSquare, PaintBucket, Droplets
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TagBadge } from '@/components/TagBadge';
import { AudioPlayButton } from '@/components/AudioPlayButton';
import { FollowButton } from '@/components/FollowButton';
import { CommentSection } from '@/components/CommentSection';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { usePoemInteractions } from '@/hooks/usePoemInteractions';
import { useComments } from '@/hooks/useComments';
import { usePoemRealtime } from '@/hooks/usePoemRealtime';
import { useNativeShare } from '@/hooks/useNativeShare';
import { db } from '@/lib/db';
import { Poem } from '@/types/poem';
export default function PoemDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showInkSheet, setShowInkSheet] = useState(false);
  const [isPouringInk, setIsPouringInk] = useState(false);
  const [pouredAmount, setPouredAmount] = useState<number | null>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const inkOptions = [5, 10, 25, 50, 100];

  // Extract comment ID from URL hash (e.g., #comment-abc123)
  const highlightCommentId = useMemo(() => {
    const hash = location.hash;
    if (hash.startsWith('#comment-')) {
      return hash.replace('#comment-', '');
    }
    return null;
  }, [location.hash]);

  // Fetch poem from database (using separate queries like feed to handle missing profiles)
  const { data: poem, isLoading, error } = useQuery({
    queryKey: ['poem-detail', slug],
    queryFn: async (): Promise<Poem | null> => {
      if (!slug) return null;

      // First fetch the poem - only query by UUID if slug looks like one
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      let query = db
        .from('poems')
        .select('id, slug, title, content, tags, created_at, user_id')
        .eq('status', 'published');
      
      if (isUuid) {
        query = query.or(`slug.eq.${slug},id.eq.${slug}`);
      } else {
        query = query.eq('slug', slug);
      }
      
      const { data: poemData, error: poemError } = await query.maybeSingle();

      if (poemError) throw poemError;
      if (!poemData) return null;

      // Then fetch the profile separately (allows fallback if missing)
      const { data: profileData } = await db
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, bio, created_at')
        .eq('user_id', poemData.user_id)
        .maybeSingle();

      // Determine poet badge based on profile age
      const profileCreatedAt = new Date(profileData?.created_at || poemData.created_at);
      const daysSinceJoined = (Date.now() - profileCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
      
      let badges: { type: 'new' | 'rising' | 'trending'; label: string }[] = [];
      if (daysSinceJoined <= 14) {
        badges = [{ type: 'new', label: 'New Voice' }];
      } else if (daysSinceJoined <= 30) {
        badges = [{ type: 'rising', label: 'Rising' }];
      }

      return {
        id: poemData.id,
        slug: poemData.slug,
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
          id: profileData?.user_id || poemData.user_id,
          name: profileData?.display_name || 'Anonymous',
          username: profileData?.username || 'anonymous',
          avatar: profileData?.avatar_url || '',
          bio: profileData?.bio || '',
          languages: [],
          totalReads: 0,
          totalUpvotes: 0,
          totalPoems: 0,
          followersCount: 0,
          badges,
        },
      } as Poem;
    },
    enabled: !!slug,
  });

  // Set SEO title dynamically
  useEffect(() => {
    if (poem) {
      const poemTitle = poem.title || 'Untitled';
      document.title = `${poemTitle} by ${poem.poet.name} | WordStack`;
    }
    return () => {
      document.title = 'WordStack';
    };
  }, [poem]);

  const {
    isUpvoted,
    isSaved,
    upvoteCount,
    saveCount,
    readCount,
    toggleUpvote,
    toggleSave,
    recordRead,
  } = usePoemInteractions(poem?.id || '');

  const { commentCount } = useComments(poem?.id || '');
  const { share, copyToClipboard, shareToTwitter, shareToFacebook, shareToWhatsApp } = useNativeShare();
  // Subscribe to real-time updates for this poem
  usePoemRealtime(poem?.id || '');
  useEffect(() => {
    if (poem?.id) {
      recordRead();
    }
  }, [poem?.id]);

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

  const poemUrl = `${window.location.origin}/poem/${poem.slug || poem.id}`;
  const shareText = `"${poem.title || 'Untitled'}" by ${poem.poet.name} - ${poem.text.slice(0, 100)}...`;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Try native share first (mobile devices)
    const usedNativeShare = await share({
      title: poem.title || 'A poem on WordStack',
      text: shareText,
      url: poemUrl,
    });
    
    // If native share not available, show fallback menu
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

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleUpvote();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave();
  };

  const handlePourInk = (amount: number) => {
    if (isPouringInk) return;
    setPouredAmount(amount);
    setIsPouringInk(true);
    window.setTimeout(() => {
      setIsPouringInk(false);
      setShowInkSheet(false);
    }, 1800);
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto text-primary"
            aria-label="Give ink"
            onClick={() => setShowInkSheet(true)}
          >
            <PaintBucket className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto pb-24">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border-b border-border/50 p-5 md:p-6"
        >
          {/* Title + Audio */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-3">
              {poem.title && (
                <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground leading-tight">
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
          </div>

          {/* Poem Full Text */}
          <div className="mb-5">
            <div className="poem-text text-[1.55rem] md:text-3xl text-foreground">
              {poem.text}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {poem.tags.map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>

          {/* Poet Info */}
          <div className="flex items-center justify-between mb-3">
            <Link
              to={`/poet/${poem.poet.username}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
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
          </div>

          {/* Meta Info */}
          <div className="text-xs text-muted-foreground mb-3">
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

          <Separator className="my-4" />

          {/* Full Comments Section - Always visible on detail page */}
          <CommentSection poemId={poem.id} highlightCommentId={highlightCommentId} />
        </motion.article>
      </main>
      <Drawer
        open={showInkSheet}
        onOpenChange={(open) => {
          setShowInkSheet(open);
          if (!open) {
            setIsPouringInk(false);
            setPouredAmount(null);
          }
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Pour ink</DrawerTitle>
            <DrawerDescription>Support this poem with an ink amount.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-2 grid grid-cols-3 gap-2">
            {inkOptions.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                className="h-11"
                disabled={isPouringInk}
                onClick={() => handlePourInk(amount)}
              >
                {amount} ink
              </Button>
            ))}
          </div>
          <AnimatePresence>
            {isPouringInk && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 pb-2"
              >
                <motion.div
                  initial={{ scale: 0.92, opacity: 0.5 }}
                  animate={{ scale: [0.92, 1.05, 1], opacity: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/10 py-6 text-center"
                >
                  <motion.div
                    initial={{ y: -10, rotate: -8 }}
                    animate={{ y: [0, -2, 0], rotate: [-8, 8, 0] }}
                    transition={{ duration: 0.9 }}
                    className="mx-auto mb-2 w-fit"
                  >
                    <PaintBucket className="h-8 w-8 text-primary" />
                  </motion.div>
                  <p className="text-sm font-semibold text-foreground">Pouring {pouredAmount} ink…</p>
                  <p className="text-xs text-muted-foreground mt-1">Your support is landing on this poem ✨</p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0], y: [0, -14] }}
                    transition={{ duration: 1.1 }}
                    className="absolute left-6 bottom-3"
                  >
                    <Droplets className="h-4 w-4 text-primary" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0], y: [0, -16] }}
                    transition={{ duration: 1.2, delay: 0.08 }}
                    className="absolute right-7 bottom-4"
                  >
                    <Droplets className="h-4 w-4 text-primary" />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <DrawerFooter>
            <Button variant="secondary" disabled={isPouringInk} onClick={() => setShowInkSheet(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
