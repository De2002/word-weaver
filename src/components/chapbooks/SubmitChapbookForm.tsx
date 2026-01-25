import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useSubmitChapbook } from '@/hooks/useChapbooks';
import { CHAPBOOK_GENRES, CHAPBOOK_FORMATS } from '@/types/chapbook';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  poet_name: z.string().min(1, 'Poet name is required').max(100),
  cover_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().max(1000).optional(),
  genre_tags: z.array(z.string()).min(1, 'Select at least one genre'),
  is_free: z.boolean(),
  price: z.number().min(0).optional().nullable(),
  currency: z.string().default('USD'),
  format: z.enum(['pdf', 'print', 'ebook', 'multiple']),
  country: z.string().max(100).optional(),
  year: z.number().min(1900).max(new Date().getFullYear()).optional().nullable(),
  publisher_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  amazon_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  other_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

export function SubmitChapbookForm() {
  const navigate = useNavigate();
  const submitChapbook = useSubmitChapbook();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      poet_name: '',
      cover_url: '',
      description: '',
      genre_tags: [],
      is_free: false,
      price: null,
      currency: 'USD',
      format: 'pdf',
      country: '',
      year: new Date().getFullYear(),
      publisher_link: '',
      amazon_link: '',
      other_link: '',
    },
  });

  const isFree = form.watch('is_free');

  const toggleGenre = (genre: string) => {
    const updated = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    setSelectedGenres(updated);
    form.setValue('genre_tags', updated);
  };

  const onSubmit = async (data: FormData) => {
    const external_links: Record<string, string> = {};
    if (data.publisher_link) external_links.publisher = data.publisher_link;
    if (data.amazon_link) external_links.amazon = data.amazon_link;
    if (data.other_link) external_links.other = data.other_link;

    await submitChapbook.mutateAsync({
      title: data.title,
      poet_name: data.poet_name,
      cover_url: data.cover_url || null,
      description: data.description || null,
      genre_tags: data.genre_tags,
      is_free: data.is_free,
      price: data.is_free ? null : data.price,
      currency: data.currency,
      format: data.format,
      country: data.country || null,
      year: data.year || null,
      external_links,
    });

    navigate('/chapbooks');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/chapbooks')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Store
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-serif font-bold">List a Chapbook</h1>
          <p className="text-muted-foreground mt-1">
            Share your chapbook with poets around the world
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Moon Letters" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="poet_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poet Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Sarah K." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cover_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="https://example.com/cover.jpg" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Paste a link to your chapbook cover image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell readers what your chapbook is about..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genre_tags"
              render={() => (
                <FormItem>
                  <FormLabel>Genre Tags *</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CHAPBOOK_GENRES.map((genre) => (
                      <Badge
                        key={genre}
                        variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                        className="cursor-pointer transition-colors"
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CHAPBOOK_FORMATS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Published</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2024"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="is_free"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">This chapbook is free</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {!isFree && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="9.99"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="KES">KES (KSh)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Kenya, USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Purchase Links
              </h3>

              <FormField
                control={form.control}
                name="publisher_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publisher / Store Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://publisher.com/my-chapbook" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amazon_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amazon Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://amazon.com/dp/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="other_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={submitChapbook.isPending}
            >
              {submitChapbook.isPending ? 'Submitting...' : 'Publish Listing'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Your listing will be reviewed before appearing in the store.
            </p>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}
