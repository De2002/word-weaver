import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AUTO_RETRY_SECONDS = 5;

interface PoemLoadErrorProps {
  error: string;
  onRetry: () => void | Promise<void>;
}

function getHelpfulMessage(error: string) {
  const message = error.toLowerCase();

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return 'This can happen when your connection is unstable. We will retry once automatically.';
  }

  if (message.includes('permission') || message.includes('jwt') || message.includes('auth')) {
    return 'Your session may have expired. Try reloading the page to sign in again.';
  }

  return 'This might be temporary (server hiccup, weak signal, or stale session).';
}

export function PoemLoadError({ error, onRetry }: PoemLoadErrorProps) {
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RETRY_SECONDS);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasAutoRetried, setHasAutoRetried] = useState(false);
  const retryLockRef = useRef(false);

  useEffect(() => {
    setSecondsLeft(AUTO_RETRY_SECONDS);
    setHasAutoRetried(false);
    setIsRetrying(false);
    retryLockRef.current = false;
  }, [error]);

  const runRetry = useCallback(async () => {
    if (retryLockRef.current) {
      return;
    }

    retryLockRef.current = true;
    setIsRetrying(true);

    try {
      await Promise.resolve(onRetry());
    } finally {
      setIsRetrying(false);
      retryLockRef.current = false;
    }
  }, [onRetry]);

  useEffect(() => {
    if (!error || hasAutoRetried || isRetrying) {
      return;
    }

    if (secondsLeft <= 0) {
      setHasAutoRetried(true);
      void runRetry();
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [error, hasAutoRetried, isRetrying, runRetry, secondsLeft]);

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="w-12 h-12 text-destructive mb-4" />
      <p className="text-base font-medium text-foreground mb-1">Couldn’t load poems</p>
      <p className="text-muted-foreground mb-2 max-w-xl">{error}</p>
      <p className="text-sm text-muted-foreground mb-5">{getHelpfulMessage(error)}</p>

      {!hasAutoRetried && (
        <p className="text-sm text-muted-foreground mb-4">
          Retrying automatically in <span className="font-semibold text-foreground">{secondsLeft}s</span>…
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => void runRetry()} variant="outline" disabled={isRetrying}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Retry now'}
        </Button>

        <Button onClick={() => window.location.reload()} variant="ghost" disabled={isRetrying}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reload page
        </Button>
      </div>
    </div>
  );
}
