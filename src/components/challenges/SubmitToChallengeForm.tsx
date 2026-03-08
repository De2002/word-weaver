import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubmitToChallenge } from '@/hooks/useChallenges';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

const schema = z.object({
  poemId: z.string().min(1, 'Select a poem'),
  note: z.string().max(400, 'Max 400 characters').optional(),
});
type FormData = z.infer<typeof schema>;

interface SubmitToChallengeFormProps {
  challengeId: string;
  onSuccess?: () => void;
}

export function SubmitToChallengeForm({ challengeId, onSuccess }: SubmitToChallengeFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const submit = useSubmitToChallenge();

  const { data: myPoems, isLoading: poemsLoading } = useQuery({
    queryKey: ['my-published-poems', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('poems')
        .select('id, title, slug')
        .eq('user_id', user.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { poemId: '', note: '' },
  });

  const onSubmit = async (values: FormData) => {
    try {
      await submit.mutateAsync({
        challengeId,
        poemId: values.poemId,
        note: values.note || undefined,
      });
      toast({ title: 'Submission received!', description: 'Your poem has been submitted for review.' });
      onSuccess?.();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="poemId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choose a poem</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={poemsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={poemsLoading ? 'Loading…' : 'Select published poem'} />
                  </SelectTrigger>
                  <SelectContent>
                    {(myPoems || []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title || 'Untitled'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover note <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell the judges what inspired this poem or how it connects to the theme…"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-right text-xs">
                {(field.value || '').length}/400
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full gap-2" disabled={submit.isPending}>
          {submit.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit poem
        </Button>
      </form>
    </Form>
  );
}
