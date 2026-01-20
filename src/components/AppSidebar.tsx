import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  BookOpen, 
  Award, 
  Newspaper, 
  FileText, 
  Info, 
  Shield, 
  ScrollText,
  ChevronDown,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarSection {
  title: string;
  items: {
    label: string;
    icon: React.ElementType;
    href: string;
  }[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'Explore',
    items: [
      { label: 'Trails', icon: Map, href: '/trails' },
      { label: 'Chapbooks Store', icon: BookOpen, href: '/chapbooks' },
      { label: 'Poets of the Month', icon: Award, href: '/poets-of-the-month' },
      { label: 'Blog', icon: Newspaper, href: '/blog' },
    ],
  },
  {
    title: 'Information',
    items: [
      { label: 'About', icon: Info, href: '/about' },
      { label: 'WordStack Rules', icon: ScrollText, href: '/rules' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'User Agreement', icon: FileText, href: '/user-agreement' },
      { label: 'Privacy Policy', icon: Shield, href: '/privacy-policy' },
    ],
  },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(
    sidebarSections.map(s => s.title)
  );

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar-background border-r border-sidebar-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
              <span className="text-lg font-semibold text-sidebar-foreground font-poem">
                WordStack
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <X className="h-5 w-5 text-sidebar-foreground" />
              </button>
            </div>

            {/* Menu Sections */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
              {sidebarSections.map((section) => {
                const isExpanded = expandedSections.includes(section.title);
                
                return (
                  <div key={section.title} className="space-y-1">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors group"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {section.title}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    </button>

                    {/* Section Items */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-0.5 pl-2">
                            {section.items.map((item) => (
                              <Link
                                key={item.label}
                                to={item.href}
                                onClick={onClose}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  "group"
                                )}
                              >
                                <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-sm font-medium">{item.label}</span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-sidebar-border">
              <p className="text-xs text-muted-foreground text-center">
                © {currentYear} WordStack. All rights reserved.
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
