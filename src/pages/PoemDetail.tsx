import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Heart, MessageCircle, Bookmark, Share2, 
  Send, MoreHorizontal, Sparkles 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TagBadge } from '@/components/TagBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { mockPoems } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
  likes: number;
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: {
      name: 'Maya Thompson',
      username: 'mayapoetry',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    },
    text: 'This touched my soul. The imagery of counting puddles like blessings is beautiful.',
    createdAt: '2026-01-08T12:00:00Z',
    likes: 12,
  },
  {
    id: '2',
    author: {
      name: 'David Park',
      username: 'davidwrites',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },
    text: 'The way you capture solitude without loneliness is masterful.',
    createdAt: '2026-01-08T14:30:00Z',
    likes: 8,
  },
  {
    id: '3',
    author: {
      name: 'Lily Chen',
      username: 'lilyverses',
      avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
    },
    text: 'Reading this on a rainy evening hits different. Thank you for this.',
    createdAt: '2026-01-09T09:15:00Z',
    likes: 5,
  },
];

export default function PoemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const poem = mockPoems.find(p => p.id === id) || mockPoems[0];
  
  const [isUpvoted, setIsUpvoted] = useState(poem.isUpvoted);
  const [isSaved, setIsSaved] = useState(poem.isSaved);
  const [upvotes, setUpvotes] = useState(poem.upvotes);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(mockComments);

  const handleUpvote = () => {
    setIsUpvoted(!isUpvoted);
    setUpvotes(prev => isUpvoted ? prev - 1 : prev + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        username: 'you',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      },
      text: commentText,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
  };

  const poetBadge = poem.poet.badges[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>
            <span className="font-medium">Poem</span>
          </div>
          <button className="p-2 rounded-full hover:bg-secondary transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto pb-24">
        {/* Poem Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 space-y-5"
        >
          {/* Poet Header */}
          <header className="flex items-center justify-between">
            <a 
              href="/profile" 
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-12 w-12 ring-2 ring-border">
                <AvatarImage src={poem.poet.avatar} alt={poem.poet.name} />
                <AvatarFallback className="bg-secondary font-medium">
                  {poem.poet.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{poem.poet.name}</span>
                  {poetBadge && (
                    <span className={cn(
                      poetBadge.type === 'trending' && 'badge-trending',
                      poetBadge.type === 'new' && 'badge-new',
                      poetBadge.type === 'rising' && 'badge-rising',
                    )}>
                      {poetBadge.type === 'trending' && <Sparkles className="h-3 w-3" />}
                      {poetBadge.label}
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">@{poem.poet.username}</span>
              </div>
            </a>
            <Button variant="outline" size="sm" className="rounded-full">
              Follow
            </Button>
          </header>

          {/* Full Poem */}
          <div className="space-y-4 py-4">
            {poem.title && (
              <h1 className="font-serif text-2xl font-semibold text-foreground">
                {poem.title}
              </h1>
            )}
            <p className="font-serif text-lg leading-relaxed text-foreground/90 whitespace-pre-line">
              {poem.text}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {poem.tags.map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>

          {/* Meta Info */}
          <div className="text-sm text-muted-foreground">
            <span>{poem.reads.toLocaleString()} reads</span>
            <span className="mx-2">·</span>
            <span>{formatDistanceToNow(new Date(poem.createdAt), { addSuffix: true })}</span>
          </div>

          <Separator />

          {/* Interaction Buttons */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleUpvote}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  isUpvoted ? "text-soft-coral" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Heart className={cn("h-6 w-6", isUpvoted && "fill-current")} />
                <span className="font-medium">{upvotes}</span>
              </motion.button>

              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-6 w-6" />
                <span className="font-medium">{comments.length}</span>
              </button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSave}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  isSaved ? "text-warm-gold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Bookmark className={cn("h-6 w-6", isSaved && "fill-current")} />
              </motion.button>
            </div>

            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Share2 className="h-6 w-6" />
            </button>
          </div>

          <Separator />

          {/* Comment Input */}
          <div className="flex items-center gap-3 py-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" />
              <AvatarFallback>Y</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                className="flex-1 bg-secondary/50 border-0"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  commentText.trim() 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-muted-foreground"
                )}
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-2">
            <h3 className="font-semibold text-sm">Comments ({comments.length})</h3>
            
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                  <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90">{comment.text}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Heart className="h-3.5 w-3.5" />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.article>
      </main>
    </div>
  );
}
