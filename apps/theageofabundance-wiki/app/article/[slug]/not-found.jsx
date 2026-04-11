import Link from 'next/link';

export default function ArticleNotFound() {
  return (
    <main className="wiki-status" role="main">
      <h1 className="wiki-status__title">Article not found</h1>
      <p className="wiki-status__body">
        No wiki article exists at that slug yet. It may have moved, been
        renamed, or never been written.
      </p>
      <Link className="wiki-home__link" href="/">
        Back to the wiki home
      </Link>
    </main>
  );
}
