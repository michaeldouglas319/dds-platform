'use client';

/**
 * `wiki-infobox` renderer plugin.
 *
 * Consumes a `UniversalSection` and renders a compact sidebar card with the
 * article's at-a-glance facts — category, title, summary, and a stack of
 * labelled highlight rows. Pure presentation; no data fetching here.
 *
 * Plugged into the registry under the `wiki-infobox` layout key inside
 * `WikiArticleRenderer`, so it's additive and the core `@dds/renderer`
 * package is not touched.
 */
export function WikiInfobox({ section }) {
  const title = section?.subject?.title ?? section?.name ?? 'Untitled';
  const category = section?.subject?.category;
  const body = section?.content?.body;
  const highlights = section?.content?.highlights ?? [];

  return (
    <aside
      className="wiki-infobox"
      aria-label={`Infobox for ${title}`}
      data-testid="wiki-infobox"
    >
      {category && (
        <p className="wiki-infobox__category" aria-hidden="false">
          {category}
        </p>
      )}
      <h2 className="wiki-infobox__title">{title}</h2>
      {body && <p className="wiki-infobox__body">{body}</p>}
      {highlights.length > 0 && (
        <dl className="wiki-infobox__facts">
          {highlights.map((item, index) => (
            <div className="wiki-infobox__row" key={`${item.subtitle ?? 'row'}-${index}`}>
              {item.subtitle && <dt>{item.subtitle}</dt>}
              {item.description && <dd>{item.description}</dd>}
            </div>
          ))}
        </dl>
      )}
    </aside>
  );
}
