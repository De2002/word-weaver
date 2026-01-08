import { useState } from 'react';
import { ArrowLeft, MapPin, Coffee, Heart, ExternalLink, Grid3X3, TrendingUp, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { mockPoets, mockPoems } from '@/data/mockData';
import { cn } from '@/lib/utils';

// Using first poet as the current user's profile for demo
const currentPoet = mockPoets[0];
const poetPoems = mockPoems.filter(p => p.poet.id === currentPoet.id);

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function PoemGridItem({ poem }: { poem: typeof mockPoems[0] }) {
  return (
    <motion.a
      href={`/poem/${poem.id}`}
      whileHover={{ scale: 0.98 }}
      whileTap={{ scale: 0.96 }}
      className="aspect-square bg-secondary/50 rounded-xl p-4 flex flex-col justify-between hover:bg-secondary transition-colors"
    >
      <p className="font-poem text-sm line-clamp-4 leading-relaxed text-foreground/80">
        {poem.text.slice(0, 100)}...
      </p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Heart className="h-3 w-3" /> {poem.upvotes}
        </span>
      </div>
    </motion.a>
  );
}

function SupportLinks({ links }: { links: typeof currentPoet.supportLinks }) {
  if (!links) return null;
  
  const supportOptions = [
    { key: 'kofi', label: 'Ko-fi', icon: Coffee, baseUrl: 'https://ko-fi.com/' },
    { key: 'buyMeACoffee', label: 'Buy Me a Coffee', icon: Coffee, baseUrl: 'https://buymeacoffee.com/' },
    { key: 'paypal', label: 'PayPal', icon: ExternalLink, baseUrl: 'https://paypal.me/' },
  ];

  const activeLinks = supportOptions.filter(opt => links[opt.key as keyof typeof links]);

  if (activeLinks.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeLinks.map(({ key, label, icon: Icon, baseUrl }) => (
        <a
          key={key}
          href={`${baseUrl}${links[key as keyof typeof links]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
        >
          <Icon className="h-4 w-4" />
          {label}
        </a>
      ))}
    </div>
  );
}

export default function Profile() {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <a href="/" className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </a>
          <h1 className="font-semibold">Profile</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-24">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-6 pb-4"
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-primary/20">
              <AvatarImage src={currentPoet.avatar} alt={currentPoet.name} />
              <AvatarFallback className="text-lg">{currentPoet.name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">{currentPoet.name}</h2>
                {currentPoet.badges.map((badge) => (
                  <span 
                    key={badge.type}
                    className={cn(
                      badge.type === 'trending' && 'badge-trending',
                      badge.type === 'new' && 'badge-new',
                      badge.type === 'rising' && 'badge-rising'
                    )}
                  >
                    {badge.type === 'trending' && <TrendingUp className="h-3 w-3" />}
                    {badge.type === 'rising' && <Star className="h-3 w-3" />}
                    {badge.label}
                  </span>
                ))}
              </div>
              <p className="text-muted-foreground text-sm">@{currentPoet.username}</p>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-4 text-foreground/90 leading-relaxed">{currentPoet.bio}</p>

          {/* Languages */}
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Writes in {currentPoet.languages.join(' & ')}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 py-4 border-y border-border">
            <div className="text-center">
              <p className="text-lg font-semibold">{currentPoet.totalPoems}</p>
              <p className="text-xs text-muted-foreground">Poems</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{formatNumber(currentPoet.totalReads)}</p>
              <p className="text-xs text-muted-foreground">Reads</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{formatNumber(currentPoet.totalUpvotes)}</p>
              <p className="text-xs text-muted-foreground">Upvotes</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{formatNumber(currentPoet.followersCount)}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button 
              onClick={() => setIsFollowing(!isFollowing)}
              variant={isFollowing ? "outline" : "default"}
              className="flex-1"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
            <Button variant="outline" className="flex-1">
              Message
            </Button>
          </div>

          {/* Support Links */}
          <div className="mt-4">
            <SupportLinks links={currentPoet.supportLinks} />
          </div>
        </motion.div>

        {/* Poems Tabs */}
        <Tabs defaultValue="all" className="mt-2">
          <TabsList className="w-full grid grid-cols-3 bg-secondary/50">
            <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
            <TabsTrigger value="popular" className="text-sm">Popular</TabsTrigger>
            <TabsTrigger value="saved" className="text-sm">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {poetPoems.map((poem) => (
                <PoemGridItem key={poem.id} poem={poem} />
              ))}
              {poetPoems.length === 0 && (
                <p className="col-span-2 text-center text-muted-foreground py-8">
                  No poems yet
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {poetPoems
                .sort((a, b) => b.upvotes - a.upvotes)
                .slice(0, 4)
                .map((poem) => (
                  <PoemGridItem key={poem.id} poem={poem} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {mockPoems
                .filter(p => p.isSaved)
                .map((poem) => (
                  <PoemGridItem key={poem.id} poem={poem} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
