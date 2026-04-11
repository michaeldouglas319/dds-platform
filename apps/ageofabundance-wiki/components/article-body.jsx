import { Fragment } from 'react';
import { parseWikiLinks } from '../lib/wiki.js';
import { WikiLink } from './wiki-link.jsx';

/**
 * Render a single wiki paragraph: plain text spans interleaved with
 * wiki-links that are resolved at render time. Server component — no
 * client JS is shipped for article bodies.
 *
 * @param {{ paragraph: import('../data/articles.js').WikiArticleParagraph }} props
 */
function Paragraph({ paragraph }) {
  const tokens = parseWikiLinks(paragraph.description);
  return (
    <div className="wiki-paragraph">
      {paragraph.subtitle && <h3 className="wiki-h3">{paragraph.subtitle}</h3>}
      <p className="wiki-p">
        {tokens.map((token, i) => {
          if (token.kind === 'text') {
            return <Fragment key={i}>{token.value}</Fragment>;
          }
          return (
            <WikiLink
              key={i}
              slug={token.slug}
              display={token.display}
              target={token.target}
              broken={token.broken}
            />
          );
        })}
      </p>
    </div>
  );
}

/**
 * The article body landmark. Renders a parametric list of paragraphs
 * whose shape mirrors `UniversalSection.content.paragraphs`, so it stays
 * plugin-compatible with the default `@dds/renderer` text renderer.
 *
 * @param {{ article: import('../data/articles.js').WikiArticle }} props
 */
export function ArticleBody({ article }) {
  return (
    <div className="wiki-body">
      {article.content.paragraphs.map((paragraph, i) => (
        <Paragraph key={i} paragraph={paragraph} />
      ))}
    </div>
  );
}
