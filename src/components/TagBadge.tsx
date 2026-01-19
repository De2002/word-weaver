import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { tagToSlug } from '@/lib/tags';
import { cn } from '@/lib/utils';

interface TagBadgeProps {
  tag: string;
  className?: string;
  clickable?: boolean;
}

export function TagBadge({ tag, className, clickable = true }: TagBadgeProps) {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    if (!clickable) return;
    e.stopPropagation();
    e.preventDefault();
    navigate(`/tag/${tagToSlug(tag)}`);
  };
  
  return (
    <Badge 
      variant="secondary"
      onClick={handleClick}
      className={cn(
        "text-xs font-normal px-2.5 py-1",
        clickable && "cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors",
        className
      )}
    >
      #{tag}
    </Badge>
  );
}
