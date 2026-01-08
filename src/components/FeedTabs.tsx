import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'trending', label: 'Trending' },
];

interface FeedTabsProps {
  onTabChange?: (tabId: string) => void;
}

export function FeedTabs({ onTabChange }: FeedTabsProps) {
  const [activeTab, setActiveTab] = useState('for-you');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={cn(
            "relative px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap",
            activeTab === tab.id
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-primary to-warm-gold rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
