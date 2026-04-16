export interface RawArticle {
  title: string;
  description?: string;
  content?: string;
  url: string;
  source: 'who' | 'interpol' | 'un' | 'whitehouse';
  published_date?: string;
  image_url?: string;
  tags?: string[];
}

export interface TransformedEntry {
  id: string;
  type: 'entry';
  slug: string;
  tag: 'disease' | 'lethal' | 'disaster' | 'famine';
  subject: {
    title: string;
    subtitle?: string;
  };
  content: string | { body: string };
  media?: {
    image?: string;
  };
  links?: Array<{
    label: string;
    url: string;
  }>;
  meta: {
    source: string;
    url: string;
    published_at: string;
  };
  status: 'active';
  featured: boolean;
  featured_rank: number | null;
}
