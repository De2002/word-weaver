import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthProvider';
import { toast } from '@/hooks/use-toast';

export function useInkPour() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: wallet } = useQuery({
    queryKey: ['ink-wallet', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await db
        .from('ink_wallets')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  const pourMutation = useMutation({
    mutationFn: async ({
      poemId,
      poetUserId,
      amount,
    }: {
      poemId: string;
      poetUserId: string;
      amount: number;
    }) => {
      if (!userId) throw new Error('Must be logged in');
      if (userId === poetUserId) throw new Error("You can't pour ink on your own poem");
      if ((wallet?.balance ?? 0) < amount) throw new Error('Not enough ink');

      // Get current payout period
      const { data: period } = await db
        .from('payout_periods')
        .select('id')
        .eq('status', 'active')
        .order('period_start', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Insert transaction
      const { error: txError } = await db.from('ink_transactions').insert({
        from_user_id: userId,
        to_user_id: poetUserId,
        poem_id: poemId,
        amount,
        period_id: period?.id || null,
        note: 'Poured ink on poem',
      });
      if (txError) throw txError;

      // Deduct from sender wallet
      const { error: deductError } = await db
        .from('ink_wallets')
        .update({
          balance: (wallet?.balance ?? 0) - amount,
          total_poured: (wallet as any)?.total_poured
            ? (wallet as any).total_poured + amount
            : amount,
        })
        .eq('user_id', userId);
      if (deductError) throw deductError;

      // Upsert recipient wallet
      const { data: recipientWallet } = await db
        .from('ink_wallets')
        .select('balance, total_received')
        .eq('user_id', poetUserId)
        .maybeSingle();

      if (recipientWallet) {
        await db
          .from('ink_wallets')
          .update({
            balance: recipientWallet.balance + amount,
            total_received: recipientWallet.total_received + amount,
          })
          .eq('user_id', poetUserId);
      }
      // If no wallet exists for recipient, the edge function / trigger should handle creation
      // For now we skip — the poet will see it when they next get credited
    },
    onSuccess: (_data, vars) => {
      toast({ title: 'Ink poured!', description: `You poured ${vars.amount} ink on this poem.` });
      queryClient.invalidateQueries({ queryKey: ['ink-wallet', userId] });
    },
    onError: (err: Error) => {
      toast({ title: 'Could not pour ink', description: err.message, variant: 'destructive' });
    },
  });

  return {
    balance: wallet?.balance ?? 0,
    pourInk: pourMutation.mutate,
    isPouring: pourMutation.isPending,
  };
}
