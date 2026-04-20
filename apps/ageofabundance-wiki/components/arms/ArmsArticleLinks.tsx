import { articles } from '../../content/articles'
import { deriveWikiMeta } from '../../content/wiki-meta'
import { EVENT_TAG_TO_WIKI_TAGS } from '../../lib/arms-tag-crosswalk'

type ArmsArticleLinksProps = {
  eventTag?: string | null
}

export function ArmsArticleLinks({ eventTag }: ArmsArticleLinksProps) {
  if (!eventTag) return null

  const wikiTags = EVENT_TAG_TO_WIKI_TAGS[eventTag] ?? []
  if (wikiTags.length === 0) return null

  const matched = articles
    .filter((a) => {
      const meta = deriveWikiMeta(a)
      return meta.tags.some((t) => wikiTags.includes(t))
    })
    .slice(0, 6)

  if (matched.length === 0) return null

  return (
    <div className="arms-articles-section">
      <h3 className="arms-articles-title">Related Articles</h3>
      <div className="arms-article-list">
        {matched.map((article) => {
          const meta = deriveWikiMeta(article)
          return (
            <a
              key={article.id}
              href={`/a/${article.id}`}
              className="arms-article-chip"
              target="_blank"
              rel="noreferrer"
            >
              <span className="arms-article-title">{article.subject?.title || article.id}</span>
              {meta.tags.length > 0 && (
                <span className="arms-article-tag">{meta.tags.join(' • ')}</span>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}
