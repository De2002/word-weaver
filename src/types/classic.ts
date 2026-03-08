export interface ClassicPoet {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  about: string | null;
  born_year: number | null;
  died_year: number | null;
  nationality: string | null;
  image_url: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
  poem_count?: number;
}

export interface ClassicPoem {
  id: string;
  poet_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  tags: string[];
  published_year: number | null;
  source: string | null;
  featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  poet?: ClassicPoet;
}
