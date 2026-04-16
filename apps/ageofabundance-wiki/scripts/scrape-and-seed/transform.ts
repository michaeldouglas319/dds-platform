import type { RawArticle, TransformedEntry } from './types';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[?]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function mapSourceToTag(source: RawArticle['source']): TransformedEntry['tag'] {
  const tagMap: Record<string, TransformedEntry['tag']> = {
    who: 'disease',
    interpol: 'lethal',
    un: 'disaster',
    whitehouse: 'disaster', // Default to disaster for mixed announcements
  };
  return tagMap[source] || 'disaster';
}

export function transformArticleToEntry(article: RawArticle): TransformedEntry {
  const slug = generateSlug(article.title);
  const tag = mapSourceToTag(article.source);
  const content = article.content || article.description || '';

  const entry: TransformedEntry = {
    id: `${article.source}-${slug}`,
    type: 'entry',
    slug,
    tag,
    subject: {
      title: article.title,
      subtitle: article.description,
    },
    content,
    media: article.image_url ? { image: article.image_url } : undefined,
    links: [
      {
        label: 'Read full article',
        url: article.url,
      },
    ],
    meta: {
      source: article.source,
      url: article.url,
      published_at: article.published_date || new Date().toISOString(),
    },
    status: 'active',
    featured: false,
    featured_rank: null,
  };

  return entry;
}

export function batchTransformArticles(articles: RawArticle[]): TransformedEntry[] {
  return articles.map(transformArticleToEntry);
}
