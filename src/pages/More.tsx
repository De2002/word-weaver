import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Map, 
  BookOpen, 
  Award, 
  Newspaper, 
  FileText, 
  Info, 
  Shield, 
  ScrollText,
  Users,
  Calendar,
  Headphones,
  Bookmark,
  MessageCircle,
  Sparkles,
  TrendingUp,
  DollarSign,
  Heart,
  Star,
  Crown,
  ChevronRight
} from 'lucide-react';
import { Header } from '@/components/Header';
import { CreateButton } from '@/components/CreateButton';
import { cn } from '@/lib/utils';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  description?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  comingSoon?: boolean;
}

const menuSections: MenuSection[] = [
  {
    title: 'Community',
    items: [
      { icon: Users, label: 'Meet', href: '/meet', description: 'Introduce yourself' },
      { icon: Calendar, label: 'Events', href: '/events', description: 'Local happenings' },
      { icon: Headphones, label: 'Podcast', href: '/podcast', description: 'Platform podcasts' },
    ],
  },
  {
    title: 'Your Space',
    items: [
      { icon: Bookmark, label: 'Saved', href: '/saved', description: 'Your saved poems' },
      { icon: MessageCircle, label: 'Messages', href: '/messages', description: 'Your conversations' },
    ],
  },
  {
    title: 'Explore',
    items: [
      { icon: Map, label: 'Trails', href: '/trails', description: 'Poetry journeys' },
      { icon: BookOpen, label: 'Chapbooks Store', href: '/chapbooks', description: 'Browse collections' },
      { icon: Award, label: 'Poets of the Month', href: '/poets-of-the-month', description: 'Featured poets' },
      { icon: Newspaper, label: 'Blog', href: '/blog', description: 'Latest updates' },
    ],
  },
  {
    title: 'Ways to Earn',
    comingSoon: true,
    items: [
      { icon: Sparkles, label: 'Featured in Trails', href: '/earn/trails', description: 'Get featured' },
      { icon: TrendingUp, label: 'Poet Fund Bonuses', href: '/earn/poet-fund', description: 'Monthly bonuses' },
      { icon: BookOpen, label: 'Chapbook Listing', href: '/earn/chapbook', description: 'Sell your work' },
      { icon: Heart, label: 'Fan Tips', href: '/earn/tips', description: 'Receive support' },
      { icon: Star, label: 'Poets of the Month', href: '/earn/potm', description: 'Win recognition' },
      { icon: Crown, label: "Founder's Outstanding Poet", href: '/earn/founders', description: 'Top honor' },
    ],
  },
  {
    title: 'Information',
    items: [
      { icon: Info, label: 'About', href: '/about', description: 'About WordStack' },
      { icon: ScrollText, label: 'WordStack Rules', href: '/rules', description: 'Community guidelines' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { icon: FileText, label: 'User Agreement', href: '/user-agreement', description: 'Terms of use' },
      { icon: Shield, label: 'Privacy Policy', href: '/privacy-policy', description: 'Your privacy' },
    ],
  },
];

export default function More() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-foreground mb-6 font-poem"
        >
          More
        </motion.h1>

        <div className="space-y-8">
          {menuSections.map((section, sectionIndex) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h2>
                {section.comingSoon && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    Coming Soon
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {section.items.map((item, itemIndex) => (
                  <Link
                    key={item.label}
                    to={section.comingSoon ? '#' : item.href}
                    className={cn(
                      "group flex flex-col p-4 rounded-xl border border-border bg-card transition-all",
                      section.comingSoon 
                        ? "opacity-60 cursor-not-allowed" 
                        : "hover:bg-secondary hover:border-primary/20 hover:shadow-sm"
                    )}
                    onClick={section.comingSoon ? (e) => e.preventDefault() : undefined}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        section.comingSoon 
                          ? "bg-muted" 
                          : "bg-primary/10 group-hover:bg-primary/20"
                      )}>
                        <item.icon className={cn(
                          "h-5 w-5",
                          section.comingSoon ? "text-muted-foreground" : "text-primary"
                        )} />
                      </div>
                      {!section.comingSoon && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-foreground mb-0.5">
                      {item.label}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} WordStack. All rights reserved.
          </p>
        </div>
      </main>

      <CreateButton />
    </div>
  );
}
