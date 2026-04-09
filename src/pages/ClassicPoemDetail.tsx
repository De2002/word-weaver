import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User2, CalendarDays, BookOpen, Share2, Feather } from 'lucide-react';
import { Header } from '@/components/Header';
import { CreateButton } from '@/components/CreateButton';
import { useClassicPoem } from '@/hooks/useClassics';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PoemReadingControls } from '@/components/PoemReadingControls';
import { DEFAULT_READING_PREFERENCES, fontStyles, type ReadingPreferences } from '@/lib/poemReading';

export default function ClassicPoemDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: poem, isLoading } = useClassicPoem(slug ?? '');
  const [readingPreferences, setReadingPreferences] = useState<ReadingPreferences>(DEFAULT_READING_PREFERENCES);

  // Advanced SEO meta
  useEffect(() => {
    if (!poem) return;
    const poet = poem.poet;
    const title = `${poem.title} by ${poet?.name ?? 'Unknown'} — Classic Poetry`;
    const description = poem.excerpt
      ?? `Read "${poem.title}" by ${poet?.name ?? 'Unknown'}${poem.published_year ? ` (${poem.published_year})` : ''}. A classic poem in the WordStack Classic Poetry Library.`;
    const firstLines = poem.content.split('\n').slice(0, 4).join(' ');
    const fullDesc = poem.excerpt ?? firstLines;

    document.title = title;
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', 'content', fullDesc);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', fullDesc);
    setMeta('meta[property="og:type"]', 'content', 'article');
    if (poet?.image_url) setMeta('meta[property="og:image"]', 'content', poet.image_url);

    // JSON-LD structured data
    const existing = document.getElementById('classic-poem-jsonld');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = 'classic-poem-jsonld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: poem.title,
      author: poet ? {
        '@type': 'Person',
        name: poet.name,
        url: `${window.location.origin}/classics/poet/${poet.slug}`,
      } : undefined,
      datePublished: poem.published_year ? `${poem.published_year}` : undefined,
      description: fullDesc,
      genre: poem.tags,
      inLanguage: 'en',
      url: window.location.href,
    });
    document.head.appendChild(script);

    return () => {
      const s = document.getElementById('classic-poem-jsonld');
      if (s) s.remove();
    };
  }, [poem]);

  useEffect(() => {
    const stored = localStorage.getItem('poem-reading-preferences');
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as Partial<ReadingPreferences>;
      setReadingPreferences((prev) => ({
        ...prev,
        ...parsed,
      }));
    } catch {
      setReadingPreferences(DEFAULT_READING_PREFERENCES);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('poem-reading-preferences', JSON.stringify(readingPreferences));
  }, [readingPreferences]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: poem?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 pt-20 pb-28">
          <Skeleton className="h-8 w-2/3 mb-3 mt-4" />
          <Skeleton className="h-5 w-1/3 mb-8" />
          <div className="space-y-2">
            {Array.from({ length: 16 }).map((_, i) => <Skeleton key={i} className={`h-4 rounded ${i % 4 === 3 ? 'mb-4' : ''}`} style={{ width: `${50 + Math.random() * 50}%` }} />)}
          </div>
        </main>
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 pt-24 pb-28 text-center">
          <Feather className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h1 className="text-lg font-semibold text-foreground">Poem not found</h1>
          <Link to="/classics" className="text-sm text-primary hover:underline mt-2 inline-block">
            Back to Classics
          </Link>
        </main>
      </div>
    );
  }

  const poet = poem.poet;
  const stanzas = poem.content.split(/\n\s*\n/).filter(Boolean);
  const poemStyles = {
    fontFamily: fontStyles[readingPreferences.font].family,
    fontSize: `${readingPreferences.fontSize}px`,
    lineHeight: readingPreferences.lineHeight,
    maxWidth: `${readingPreferences.lineWidth}px`,
  } as const;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-28">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 pt-4 mb-6 text-xs text-muted-foreground flex-wrap">
          <Link to="/classics" className="hover:text-foreground transition">Classics</Link>
          <span>/</span>
          {poet && (
            <>
              <Link to={`/classics/poet/${poet.slug}`} className="hover:text-foreground transition truncate max-w-[120px]">{poet.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground truncate max-w-[160px]">{poem.title}</span>
        </div>

        {/* Title & Poet */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground font-poem leading-tight mb-3">
            {poem.title}
          </h1>

          {poet && (
            <Link
              to={`/classics/poet/${poet.slug}`}
              className="flex items-center gap-2.5 group w-fit"
            >
              <div className="h-8 w-8 rounded-full bg-muted overflow-hidden border border-border shrink-0">
                {poet.image_url ? (
                  <img src={poet.image_url} alt={poet.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition">
                  {poet.name}
                </p>
                {(poet.nationality || poem.published_year) && (
                  <p className="text-xs text-muted-foreground">
                    {[poet.nationality, poem.published_year ? `${poem.published_year}` : null].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </Link>
          )}
        </motion.div>

        {/* Poem Content */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <PoemReadingControls
            preferences={readingPreferences}
            onChange={setReadingPreferences}
          />
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div
              className="mx-auto whitespace-pre-wrap break-words text-foreground"
              style={poemStyles}
            >
              {stanzas.map((stanza, index) => (
                <p
                  key={`${index}-${stanza.slice(0, 20)}`}
                  className="m-0"
                  style={{ marginBottom: index === stanzas.length - 1 ? 0 : `${readingPreferences.lineHeight}em` }}
                >
                  {stanza}
                </p>
              ))}
            </div>
          </div>
        </motion.article>

        {/* Meta Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="flex items-center justify-between gap-4 mb-6"
        >
          <div className="flex flex-wrap gap-1.5">
            {poem.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition shrink-0"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
        </motion.div>

        {/* Source */}
        {poem.source && (
          <p className="text-xs text-muted-foreground mb-6 italic">Source: {poem.source}</p>
        )}

        {/* More by poet */}
        {poet && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="p-4 rounded-xl border border-border bg-card"
          >
            <Link
              to={`/classics/poet/${poet.slug}`}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition">
                    More by {poet.name}
                  </p>
                  <p className="text-xs text-muted-foreground">View all poems</p>
                </div>
              </div>
              <span className="text-xs text-primary">View →</span>
            </Link>
          </motion.div>
        )}
      </main>
      <CreateButton />
    </div>
  );
}
