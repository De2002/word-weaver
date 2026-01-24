import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'trending', label: 'Trending' },
  { id: 'rising', label: 'Rising' },
];

interface FeedTabsProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function FeedTabs({ activeTab: controlledActiveTab, onTabChange }: FeedTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState('for-you');
  const activeTab = controlledActiveTab ?? internalActiveTab;
  
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeButton = tabRefs.current.get(activeTab);
    if (activeButton) {
      const container = activeButton.parentElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        setIndicatorStyle({
          left: buttonRect.left - containerRect.left,
          width: buttonRect.width,
        });
      }
    }
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    setInternalActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="relative flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
      {/* Animated background indicator */}
      <motion.div
        className="absolute top-2 bottom-2 bg-gradient-to-r from-primary to-warm-gold rounded-full"
        initial={false}
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
      />
      
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => {
            if (el) tabRefs.current.set(tab.id, el);
          }}
          onClick={() => handleTabChange(tab.id)}
          className={cn(
            "relative px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap z-10",
            activeTab === tab.id
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
