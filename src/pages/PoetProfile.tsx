import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, FileText, Eye, Heart, Users, ExternalLink,
  Sparkles, TrendingUp, MessageCircle, Coffee, LayoutGrid,
  LayoutList, Share2, MoreHorizontal, Pin, BarChart3,
  Globe, Twitter, Instagram, Mail, Link2, Settings, BookOpen,
} from 'lucide-react';
import { usePoetProfile } from '@/hooks/usePoetProfile';
import { useAuth } from '@/context/AuthProvider';
import { PoemCard } from '@/components/PoemCard';
import { FollowButton } from '@/components/FollowButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/useSEO';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNativeShare } from '@/hooks/useNativeShare';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReportUserDialog } from '@/components/ReportUserDialog';
import { BlockUserDialog } from '@/components/messages/BlockUserDialog';

type ProfileTab = 'Poems' | 'About' | 'Links';
type SortTab = 'all' | 'popular';

export default function PoetProfile() {
  const { username } = useParams<{ username: string }>();
  const { poet, poems, pinnedPoem, isLoading, error, notFound, followerCount } = usePoetProfile(username || '');
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileTab, setProfileTab] = useState<ProfileTab>('Poems');
  const [sortTab, setSortTab] = useState<SortTab>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const isMobile = useIsMobile();
  const { share } = useNativeShare();

  const isOwnProfile = user?.id === poet?.id;
  const isAdmin = roles?.includes('admin');

  useSEO({
    title: poet ? `${poet.name} | WordStack` : 'Poet | WordStack',
    description: poet?.bio || undefined,
  });

  const handleMessage = () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to send messages', variant: 'destructive' });
      navigate('/login');
      return;
    }
    if (poet) navigate(`/messages?with=${poet.id}`);
  };

  const handleShare = () => {
    share({
      title: poet?.name || '',
      text: `Check out ${poet?.name}'s poetry on WordStack`,
      url: window.location.href,
    });
  };

  const sortedPoems = sortTab === 'popular'
    ? [...poems].sort((a, b) => b.upvotes - a.upvotes)
    : poems;

  // Non-pinned poems for the list
  const listedPoems = pinnedPoem
    ? sortedPoems.filter(p => p.id !== pinnedPoem.id)
    : sortedPoems;

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </header>
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-48 w-full" />
          <div className="px-4 -mt-12 space-y-4 pb-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full max-w-md" />
          </div>
          <div className="px-4 space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  // ─── Not found ───────────────────────────────────────────────────────────────
  if (notFound || error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <Link to="/search" className="p-2 -ml-2 hover:bg-secondary rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-medium">Poet not found</span>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">Poet not found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find a poet with username @{username}</p>
          <Link to="/search"><Button>Browse Poets</Button></Link>
        </div>
      </div>
    );
  }

  const badge = poet?.badges[0];
  const BadgeIcon = badge?.type === 'trending' ? Sparkles : badge?.type === 'rising' ? TrendingUp : null;
  const supportLinks = poet?.supportLinks as Record<string, string> || {};
  const profileTabs: ProfileTab[] = ['Poems', 'About', 'Links'];

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/search" className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="text-center min-w-0">
            <p className="font-semibold text-sm truncate flex items-center gap-1.5 justify-center">
              {poet?.name}
                          </p>
            {poems.length > 0 && (
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{poems.length} poems</p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
            {!isOwnProfile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-secondary rounded-full transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-2xl">
                  <DropdownMenuItem
                    className="text-xs font-semibold uppercase tracking-wider cursor-pointer rounded-xl"
                    onClick={() => setShowReportDialog(true)}
                  >
                    Report poet
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-xs font-semibold uppercase tracking-wider cursor-pointer text-destructive rounded-xl"
                    onClick={() => setShowBlockDialog(true)}
                  >
                    Block poet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {poet && (
        <ReportUserDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          userId={poet.id}
          userName={poet.name || poet.username || 'this poet'}
        />
      )}
      {poet && (
        <BlockUserDialog
          open={showBlockDialog}
          onOpenChange={setShowBlockDialog}
          userId={poet.id}
          userName={poet.name || poet.username || 'this poet'}
        />
      )}

      <div className="max-w-2xl mx-auto">

        {/* ── Pro Header image ──────────────────────────────────────────────── */}
        {(poet as any)?.headerImage && (
          <div className="h-44 md:h-56 w-full relative overflow-hidden">
            <img
              src={(poet as any).headerImage}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
        )}

        {/* ── Profile info block ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "px-4 pb-4",
            (poet as any)?.headerImage ? "-mt-14" : "pt-6"
          )}
        >
          {/* Avatar row */}
          <div className="flex items-end justify-between mb-4">
            <div className="relative">
              <Avatar className={cn(
                "ring-4 ring-background",
                "h-24 w-24"
              )}>
                <AvatarImage src={poet?.avatar} alt={poet?.name} />
                <AvatarFallback className="text-2xl font-medium bg-secondary">
                  {poet?.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              {badge && BadgeIcon && (
                <span className={cn(
                  "absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center ring-2 ring-background",
                  badge.type === 'trending' && 'bg-gradient-to-br from-primary to-warm-gold',
                  badge.type === 'rising' && 'bg-soft-coral',
                )}>
                  <BadgeIcon className="h-3.5 w-3.5 text-white" />
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pb-1">
              {supportLinks.buyMeACoffee && (
                <a href={supportLinks.buyMeACoffee} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="rounded-full h-9 w-9 border-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-700">
                    <Coffee className="h-4 w-4 text-amber-500" />
                  </Button>
                </a>
              )}
              {!isOwnProfile && poet && (
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9" onClick={handleMessage} title="Send message">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
              {isOwnProfile && (
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9" asChild>
                  <Link to="/profile"><Settings className="h-4 w-4" /></Link>
                </Button>
              )}
              {poet && <FollowButton poetUserId={poet.id} />}
            </div>
          </div>

          {/* Name + handle */}
          <div className="mb-3">
            <h1 className="text-xl font-semibold flex items-center gap-2 flex-wrap">
              {poet?.name}
                          </h1>
            <p className="text-sm text-muted-foreground">@{poet?.username}</p>
          </div>

          {/* Bio */}
          {poet?.bio && (
            <p className="text-sm text-foreground/80 leading-relaxed mb-4">{poet.bio}</p>
          )}

          {/* Follower stats row */}
          <div className="flex items-center gap-6 text-sm mb-4">
            <div>
              <span className="font-bold">{followerCount.toLocaleString()}</span>
              <span className="text-muted-foreground text-xs ml-1 uppercase tracking-wider font-medium">Followers</span>
            </div>
            <div>
              <span className="font-bold">{poems.length.toLocaleString()}</span>
              <span className="text-muted-foreground text-xs ml-1 uppercase tracking-wider font-medium">Poems</span>
            </div>
            <div>
              <span className="font-bold">{(poet?.totalReads || 0).toLocaleString()}</span>
              <span className="text-muted-foreground text-xs ml-1 uppercase tracking-wider font-medium">Reads</span>
            </div>
          </div>
        </motion.div>

        {/* ── Own-profile analytics ─────────────────────────────────────────── */}
        {isOwnProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-4 mb-5 p-5 bg-secondary/60 rounded-2xl border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                Your Stats
              </p>
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Stats</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Reads', value: poet?.totalReads || 0, icon: Eye },
                { label: 'Upvotes', value: poet?.totalUpvotes || 0, icon: Heart },
                { label: 'Saves', value: (poet as any)?.totalSaves || 0, icon: BookOpen },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-background rounded-xl p-3">
                  <Icon className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                  <p className="font-bold text-base">{value.toLocaleString()}</p>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Pinned poem ──────────────────────────────────────────────────── */}
        {pinnedPoem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mx-4 mb-6"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 text-muted-foreground mb-3">
              <Pin className="h-3 w-3 rotate-45" />
              Pinned Poem
            </p>
            <Link to={`/poem/${pinnedPoem.slug}`} className="block group">
              <div className="p-6 border-2 border-foreground/10 rounded-2xl hover:border-foreground/30 hover:bg-secondary/40 transition-all">
                {pinnedPoem.title && (
                  <h2 className="font-serif text-xl font-semibold mb-2 group-hover:opacity-70 transition-opacity">
                    {pinnedPoem.title}
                  </h2>
                )}
                <p className="text-sm text-muted-foreground font-serif leading-relaxed line-clamp-3">
                  {pinnedPoem.text}
                </p>
                <p className="text-xs text-primary font-semibold mt-3">Read more →</p>
              </div>
            </Link>
          </motion.div>
        )}

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        {profileTabs.length > 1 && (
          <div className="border-b border-border px-4 mb-6">
            <div className="flex gap-6">
              {profileTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setProfileTab(tab)}
                  className={cn(
                    "pb-3 text-xs font-bold tracking-[0.15em] uppercase relative transition-all",
                    profileTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
                  )}
                >
                  {tab}
                  {profileTab === tab && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-foreground rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Poems tab ─────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {profileTab === 'Poems' && (
            <motion.div
              key="poems"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4"
            >
              {/* Sort + view controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
                  {(['all', 'popular'] as SortTab[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setSortTab(s)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors",
                        sortTab === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s === 'all' ? 'Latest' : 'Popular'}
                    </button>
                  ))}
                </div>
                {!isMobile && (
                  <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}
                    >
                      <LayoutList className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {listedPoems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">✨</div>
                  <p className="text-muted-foreground">No poems published yet</p>
                </div>
              ) : (
                <div className={cn(
                  viewMode === 'grid' && !isMobile
                    ? "grid grid-cols-2 gap-4"
                    : "space-y-4 max-w-xl mx-auto"
                )}>
                  {listedPoems.map((poem, index) => (
                    <PoemCard key={poem.id} poem={poem} index={index} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── About tab ───────────────────────────────────────────────────── */}
          {profileTab === 'About' && (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 max-w-prose"
            >
              {(poet as any)?.about ? (
                <p className="font-serif text-lg leading-[1.9] text-foreground/80 whitespace-pre-wrap">
                  {(poet as any).about}
                </p>
              ) : (
                <div className="text-center py-16">
                  <p className="font-serif text-lg text-muted-foreground">
                    {poet?.name} hasn't written an About yet.
                  </p>
                  {isOwnProfile && (
                    <Button asChild variant="outline" className="mt-6">
                      <Link to="/profile">Add your story</Link>
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Links tab ───────────────────────────────────────────────────── */}
          {profileTab === 'Links' && (
            <motion.div
              key="links"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 space-y-3 max-w-sm"
            >
              {supportLinks.buyMeACoffee && (
                <a
                  href={supportLinks.buyMeACoffee}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors group border border-amber-200/50 dark:border-amber-800/50"
                >
                  <Coffee className="h-5 w-5 text-amber-500 shrink-0" />
                  <span className="text-sm font-semibold flex-1">
                    {supportLinks.buyMeACoffee.includes('ko-fi') ? 'Support on Ko-fi' : 'Buy Me a Coffee'}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              )}
              {supportLinks.kofi && (
                <a
                  href={supportLinks.kofi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-secondary rounded-2xl hover:bg-secondary/80 transition-colors group border border-border"
                >
                  <Coffee className="h-5 w-5 text-soft-coral shrink-0" />
                  <span className="text-sm font-semibold flex-1">Ko-fi</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              )}
              {supportLinks.twitter && (
                <a
                  href={supportLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-secondary rounded-2xl hover:bg-secondary/80 transition-colors group border border-border"
                >
                  <Twitter className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-semibold flex-1">Twitter / X</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              )}
              {supportLinks.instagram && (
                <a
                  href={supportLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-secondary rounded-2xl hover:bg-secondary/80 transition-colors group border border-border"
                >
                  <Instagram className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-semibold flex-1">Instagram</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              )}
              {supportLinks.website && (
                <a
                  href={supportLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-secondary rounded-2xl hover:bg-secondary/80 transition-colors group border border-border"
                >
                  <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-semibold flex-1">Website</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              )}
              {!Object.values(supportLinks).some(Boolean) && (
                <div className="text-center py-16">
                  <p className="font-serif text-lg text-muted-foreground">No links added yet.</p>
                  {isOwnProfile && (
                    <Button asChild variant="outline" className="mt-6">
                      <Link to="/profile">Add links</Link>
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
