import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { db } from '@/lib/db';

export type UserReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'impersonation'
  | 'inappropriate_content'
  | 'threats'
  | 'other';

export const USER_REPORT_REASONS: { value: UserReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam or scam' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'threats', label: 'Threats or violence' },
  { value: 'other', label: 'Other' },
];

export type AccountAction = 'suspend' | 'ban' | 'terminate' | 'restore';

export interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  details: string | null;
  status: string;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  reporter?: { username: string | null; display_name: string | null; avatar_url: string | null };
  reported?: { username: string | null; display_name: string | null; avatar_url: string | null; account_status: string };
}

export function useReportUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportedUserId,
      reason,
      details,
    }: {
      reportedUserId: string;
      reason: UserReportReason;
      details?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await db
        .from('user_reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: reportedUserId,
          reason,
          details: details?.trim() || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') throw new Error('You have already reported this user');
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-reports'] });
    },
  });
}

export function useAdminUserReports() {
  return useQuery({
    queryKey: ['admin-user-reports'],
    queryFn: async (): Promise<UserReport[]> => {
      const { data, error } = await db
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const reporterIds = [...new Set(data.map((r: any) => r.reporter_id))];
      const reportedIds = [...new Set(data.map((r: any) => r.reported_user_id))];
      const allIds = [...new Set([...reporterIds, ...reportedIds])];

      const { data: profiles } = await db
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, account_status')
        .in('user_id', allIds);

      const profileMap = new Map<string, any>();
      (profiles || []).forEach((p: any) => profileMap.set(p.user_id, p));

      return data.map((r: any) => ({
        ...r,
        reporter: profileMap.get(r.reporter_id) || null,
        reported: profileMap.get(r.reported_user_id) || null,
      }));
    },
    staleTime: 15000,
  });
}

export function useAdminMessageReports() {
  return useQuery({
    queryKey: ['admin-message-reports'],
    queryFn: async () => {
      const { data, error } = await db
        .from('message_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const reporterIds = [...new Set(data.map((r: any) => r.reporter_id))];
      const { data: profiles } = await db
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', reporterIds);

      const profileMap = new Map<string, any>();
      (profiles || []).forEach((p: any) => profileMap.set(p.user_id, p));

      return data.map((r: any) => ({
        ...r,
        reporter: profileMap.get(r.reporter_id) || null,
      }));
    },
    staleTime: 15000,
  });
}

export function useAdminAccountAction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetUserId,
      action,
      reportId,
      adminNote,
    }: {
      targetUserId: string;
      action: AccountAction;
      reportId?: string;
      adminNote?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const statusMap: Record<AccountAction, string> = {
        suspend: 'suspended',
        ban: 'banned',
        terminate: 'terminated',
        restore: 'active',
      };

      // Update profile account_status
      const { error: profileError } = await db
        .from('profiles')
        .update({ account_status: statusMap[action] })
        .eq('user_id', targetUserId);

      if (profileError) throw profileError;

      // If a report was associated, mark it as resolved
      if (reportId) {
        await db
          .from('user_reports')
          .update({
            status: 'resolved',
            admin_note: adminNote || null,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', reportId);
      }

      return { targetUserId, action };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

export function useAdminMessageReportAction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
      adminNote,
    }: {
      reportId: string;
      status: 'resolved' | 'dismissed';
      adminNote?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await db
        .from('message_reports')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;
      return { reportId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-message-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}
