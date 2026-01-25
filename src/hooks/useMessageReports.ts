import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthProvider';

export type ReportReason = 
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'inappropriate_content'
  | 'threats'
  | 'other';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam or scam' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'threats', label: 'Threats or violence' },
  { value: 'other', label: 'Other' },
];

export function useReportMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      reason,
      details,
    }: {
      messageId: string;
      reason: ReportReason;
      details?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await db
        .from('message_reports')
        .insert({
          reporter_id: user.id,
          message_id: messageId,
          reason,
          details: details?.trim() || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already reported this message');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
  });
}
