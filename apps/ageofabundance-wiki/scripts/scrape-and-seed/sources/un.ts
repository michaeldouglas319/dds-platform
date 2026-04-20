import type { RawArticle } from '../types';

const UN_OCHA_RSS = 'https://www.unocha.org/node/all/crises/feed';

export async function fetchUnHumanitarian(): Promise<RawArticle[]> {
  try {
    const response = await fetch(UN_OCHA_RSS);

    if (!response.ok) {
      console.error(`UN OCHA RSS fetch failed: ${response.status}`);
      return [];
    }

    const text = await response.text();
    const articles = parseUnRss(text);
    return articles;
  } catch (error) {
    console.error('Error fetching UN humanitarian data:', error);
    return [];
  }
}

function parseUnRss(xml: string): RawArticle[] {
  const articles: RawArticle[] = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/.exec(itemXml);
    const title = titleMatch ? titleMatch[1] || titleMatch[2] : '';

    const descMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/.exec(itemXml);
    const description = descMatch ? descMatch[1] || descMatch[2] : '';

    const linkMatch = /<link>(.*?)<\/link>/.exec(itemXml);
    const url = linkMatch ? linkMatch[1] : '';

    const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemXml);
    const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

    if (title && url) {
      articles.push({
        title,
        description,
        url,
        source: 'un',
        published_date: pubDate,
      });
    }
  }

  return articles;
}
