import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { QA_CATEGORIES, QACategory } from '@/types/qa';

const schema = z.object({
  title: z.string().trim().min(10, 'Question must be at least 10 characters').max(200),
  details: z.string().trim().max(1000).optional(),
  category: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface AskQuestionFormProps {
  onSubmit: (title: string, details: string, category: QACategory) => Promise<void>;
  onClose: () => void;
}

export function AskQuestionForm({ onSubmit, onClose }: AskQuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', details: '', category: 'general' },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values.title, values.details || '', values.category as QACategory);
      form.reset();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-background rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl font-semibold">Ask a Question</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Question</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. How do I write stronger metaphors?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Details <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share more context or an example line…"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {QA_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Posting…' : 'Ask Question'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
