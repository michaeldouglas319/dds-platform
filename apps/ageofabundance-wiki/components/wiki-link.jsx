import Link from 'next/link';

/**
 * Render a single wiki-link, with an explicit visual and semantic state
 * when the target cannot be resolved. Broken links still render as text
 * with a `title` attribute and `aria-disabled` so screen readers can
 * announce that the reference is dead.
 *
 * @param {{
 *   slug: string|null,
 *   display: string,
 *   target: string,
 *   broken: boolean,
 * }} props
 */
export function WikiLink({ slug, display, target, broken }) {
  if (broken || !slug) {
    return (
      <span
        className="wiki-link wiki-link--broken"
        data-broken="true"
        role="link"
        aria-disabled="true"
        title={`No article named “${target}” yet`}
      >
        {display}
      </span>
    );
  }

  return (
    <Link
      href={`/wiki/${slug}`}
      className="wiki-link"
      data-broken="false"
      title={`Read “${display}”`}
    >
      {display}
    </Link>
  );
}
