import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import type { ClassicPoet, ClassicPoem } from '@/types/classic';

// ── Poets ──────────────────────────────────────────────────────────────────

export function useCreateClassicPoet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (poet: Omit<ClassicPoet, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await db.from('classic_poets').insert(poet).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classic-poets'] });
      qc.invalidateQueries({ queryKey: ['featured-classic-poets'] });
      toast.success('Poet added to the library');
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateClassicPoet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClassicPoet> & { id: string }) => {
      const { data, error } = await db.from('classic_poets').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['classic-poets'] });
      qc.invalidateQueries({ queryKey: ['classic-poet'] });
      toast.success('Poet updated');
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteClassicPoet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from('classic_poets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classic-poets'] });
      toast.success('Poet removed from library');
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ── Poems ──────────────────────────────────────────────────────────────────

export function useCreateClassicPoem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (poem: Omit<ClassicPoem, 'id' | 'created_at' | 'updated_at' | 'poet'>) => {
      const { data, error } = await db.from('classic_poems').insert(poem).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classic-poet-poems'] });
      qc.invalidateQueries({ queryKey: ['recent-classic-poems'] });
      toast.success('Poem added to library');
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateClassicPoem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClassicPoem> & { id: string }) => {
      const { data, error } = await db.from('classic_poems').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classic-poet-poems'] });
      qc.invalidateQueries({ queryKey: ['classic-poem'] });
      toast.success('Poem updated');
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteClassicPoem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from('classic_poems').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classic-poet-poems'] });
      qc.invalidateQueries({ queryKey: ['recent-classic-poems'] });
      toast.success('Poem removed from library');
    },
    onError: (e: any) => toast.error(e.message),
  });
}
