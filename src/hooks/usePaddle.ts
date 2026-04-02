import { useEffect, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

let paddleInstance: Paddle | null = null;
let paddlePromise: Promise<Paddle | undefined> | null = null;

export const PADDLE_PRICE_IDS = {
  lyric: 'pri_01kn7zx65q75grh17vscg0qjm6',
  epic: 'pri_01kjqj6pv12w6e7fve9ybcvsjg',
} as const;

function getOrInitPaddle() {
  if (paddleInstance) return Promise.resolve(paddleInstance);
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      environment: 'production',
      token: 'live_051830de1ba82e187a201b6f5a2',
    }).then((p) => {
      if (p) paddleInstance = p;
      return p;
    });
  }
  return paddlePromise;
}

export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | null>(paddleInstance);

  useEffect(() => {
    if (paddle) return;
    getOrInitPaddle().then((p) => {
      if (p) setPaddle(p);
    });
  }, [paddle]);

  const openCheckout = (priceId: string, email?: string) => {
    if (!paddle) return;
    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      ...(email ? { customer: { email } } : {}),
    });
  };

  return { paddle, openCheckout };
}
