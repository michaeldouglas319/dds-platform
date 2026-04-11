export const metadata = {
  title: 'Not found — ageofabundance.wiki',
  description: 'This page could not be found.',
};

export default function NotFound() {
  return (
    <main id="main-content" className="wiki-not-found">
      <div className="wiki-not-found__inner">
        <p className="wiki-not-found__code" aria-hidden="true">404</p>
        <h1 className="wiki-not-found__title">Not found</h1>
        <p className="wiki-not-found__body">
          This page isn&rsquo;t in the wiki yet. It may have been renamed,
          unpublished, or not yet written.
        </p>
        <p className="wiki-not-found__cta">
          <a className="wiki-not-found__link" href="/">
            <span aria-hidden="true">←</span> Back to the wiki home
          </a>
        </p>
      </div>
    </main>
  );
}
