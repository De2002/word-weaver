import { toast } from '@/hooks/use-toast';

interface ShareData {
  title: string;
  text: string;
  url: string;
}

export function useNativeShare() {
  const isNativeShareSupported = typeof navigator !== 'undefined' && !!navigator.share;

  const share = async (data: ShareData): Promise<boolean> => {
    // Try native Web Share API first (mainly for mobile)
    if (isNativeShareSupported) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        });
        return true; // Native share was used
      } catch (error) {
        // User cancelled or share failed - only show toast for actual errors
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
        return true; // Still return true since we attempted native share
      }
    }
    return false; // Native share not available, use fallback
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Poem link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareToTwitter = (text: string, url: string) => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareToFacebook = (url: string) => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareToWhatsApp = (text: string, url: string) => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      '_blank'
    );
  };

  return {
    isNativeShareSupported,
    share,
    copyToClipboard,
    shareToTwitter,
    shareToFacebook,
    shareToWhatsApp,
  };
}
