import Link from 'next/link';

export default function WikiArticleNotFound() {
  return (
    <main className="wiki-shell wiki-shell--center" data-testid="wiki-article-not-found">
      <div className="wiki-notfound">
        <p className="wiki-category">Not found</p>
        <h1 className="wiki-title">This article does not exist yet.</h1>
        <p className="wiki-summary">
          The wiki article you were looking for has not been written — or the link
          you followed is broken. You can return to the wiki home and browse what
          has been published so far.
        </p>
        <Link className="wiki-footer__link" href="/">
          ← Back to wiki home
        </Link>
      </div>
    </main>
  );
}
