import { useState } from 'react';
import { toast } from 'sonner';

export const PADDLE_PRICE_IDS = {
  lyric: 'pri_01kn7zx65q75grh17vscg0qjm6',
  epic: 'pri_01kjqj6pv12w6e7fve9ybcvsjg',
} as const;

export function usePaddle() {
  const [paddle] = useState<null>(null);

  const openCheckout = (priceId: string, _email?: string) => {
    // Paddle integration coming soon - show user feedback
    toast.info('Checkout coming soon!', {
      description: `Subscription plans will be available shortly. Price ID: ${priceId.slice(0, 10)}...`,
    });
    console.log('[usePaddle] Checkout requested for price:', priceId);
  };

  return { paddle, openCheckout };
}
