export interface Chapbook {
  id: string;
  user_id: string;
  title: string;
  poet_name: string;
  cover_url: string | null;
  description: string | null;
  genre_tags: string[];
  price: number | null;
  currency: string;
  is_free: boolean;
  format: 'pdf' | 'print' | 'ebook' | 'multiple';
  country: string | null;
  year: number | null;
  external_links: {
    publisher?: string;
    amazon?: string;
    other?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ChapbookFilters {
  search?: string;
  genre?: string;
  priceRange?: 'free' | 'under5' | '5to10' | '10to20' | 'over20';
  format?: string;
  country?: string;
  year?: number;
}

export const CHAPBOOK_GENRES = [
  'Love',
  'Nature',
  'Grief',
  'Political',
  'Spiritual',
  'Experimental',
  'Narrative',
  'Confessional',
  'Urban',
  'Rural',
  'Identity',
  'Family',
  'Memory',
  'Travel',
  'Social Justice',
] as const;

export const CHAPBOOK_FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'print', label: 'Print' },
  { value: 'ebook', label: 'eBook' },
  { value: 'multiple', label: 'Multiple Formats' },
] as const;
