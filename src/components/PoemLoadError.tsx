import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PoemLoadErrorProps {
  error: string;
  onRetry: () => void | Promise<void>;
}

export function PoemLoadError({ error, onRetry }: PoemLoadErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="w-12 h-12 text-destructive mb-4" />
      <p className="text-base font-medium text-foreground mb-2">
        We&apos;re having trouble loading the feed.
      </p>
      <p className="text-sm text-muted-foreground mb-5 max-w-xl">{error}</p>

      <Button onClick={() => void onRetry()} variant="outline">
        Refresh
      </Button>
    </div>
  );
}
