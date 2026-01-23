import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Eye, Heart, Users, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import { usePoetProfile } from '@/hooks/usePoetProfile';
import { PoemCard } from '@/components/PoemCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { cn } from '@/lib/utils';

export default function PoetProfile() {
  const { username } = useParams<{ username: string }>();
  const { poet, poems, isLoading, error, notFound } = usePoetProfile(username || '');
  const [activeTab, setActiveTab] = useState('all');

  // Sort poems for "Popular" tab (by upvotes when available)
  const sortedPoems = activeTab === 'popular'
    ? [...poems].sort((a, b) => b.upvotes - a.upvotes)
    : poems;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/discover" className="p-2 -ml-2 hover:bg-secondary rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Skeleton className="h-6 w-32" />
          </div>
        </header>
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full max-w-md" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (notFound || error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/discover" className="p-2 -ml-2 hover:bg-secondary rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-medium">Poet not found</span>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">Poet not found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find a poet with username @{username}
          </p>
          <Link to="/discover">
            <Button>Browse Poets</Button>
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const badge = poet?.badges[0];
  const BadgeIcon = badge?.type === 'trending' 
    ? Sparkles 
    : badge?.type === 'rising' 
      ? TrendingUp 
      : null;

  const supportLinks = poet?.supportLinks || {};
  const hasSupportLinks = Object.values(supportLinks).some(Boolean);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/discover" className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-medium truncate">@{poet?.username}</span>
        </div>
      </header>

      {/* Profile Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-8 text-center"
      >
        <div className="relative inline-block mb-4">
          <Avatar className="h-24 w-24 ring-4 ring-border">
            <AvatarImage src={poet?.avatar} alt={poet?.name} />
            <AvatarFallback className="text-2xl font-medium bg-secondary">
              {poet?.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          {badge && BadgeIcon && (
            <span className={cn(
              "absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center ring-3 ring-background",
              badge.type === 'trending' && 'bg-gradient-to-br from-primary to-warm-gold',
              badge.type === 'new' && 'bg-sage',
              badge.type === 'rising' && 'bg-soft-coral',
            )}>
              <BadgeIcon className="h-4 w-4 text-white" />
            </span>
          )}
        </div>

        <h1 className="text-2xl font-serif font-semibold mb-1">{poet?.name}</h1>
        <p className="text-muted-foreground mb-4">@{poet?.username}</p>

        {poet?.bio && (
          <p className="text-foreground/80 max-w-md mx-auto mb-6 leading-relaxed">
            {poet.bio}
          </p>
        )}

        <Button className="rounded-full px-6">Follow</Button>
      </motion.section>

      {/* Stats */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-2 px-4 mb-6"
      >
        {[
          { icon: FileText, label: 'Poems', value: poet?.totalPoems || 0 },
          { icon: Eye, label: 'Reads', value: poet?.totalReads || 0 },
          { icon: Heart, label: 'Upvotes', value: poet?.totalUpvotes || 0 },
          { icon: Users, label: 'Followers', value: poet?.followersCount || 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-secondary/50 rounded-xl p-3 text-center"
          >
            <stat.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="font-semibold text-lg">{stat.value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </motion.section>

      {/* Support Links */}
      {hasSupportLinks && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="px-6 mb-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Support this poet</h3>
          <div className="flex flex-wrap gap-2">
            {supportLinks.kofi && (
              <a
                href={supportLinks.kofi}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5E5B] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Ko-fi <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {supportLinks.buyMeACoffee && (
              <a
                href={supportLinks.buyMeACoffee}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFDD00] text-black rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Buy Me a Coffee <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {supportLinks.paypal && (
              <a
                href={supportLinks.paypal}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#003087] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                PayPal <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </motion.section>
      )}

      {/* Poems Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="all">All Poems</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {poems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-muted-foreground">No poems published yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPoems.map((poem, index) => (
                <PoemCard key={poem.id} poem={poem} index={index} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular" className="mt-0">
          {poems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-muted-foreground">No poems published yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPoems.map((poem, index) => (
                <PoemCard key={poem.id} poem={poem} index={index} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  );
}
