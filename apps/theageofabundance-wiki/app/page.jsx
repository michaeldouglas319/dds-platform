import Link from 'next/link';

export default function Home() {
  return (
    <main className="wiki-home" role="main">
      <div className="wiki-home__dot" aria-hidden="true" />
      <p className="wiki-home__title">theageofabundance.wiki</p>
      <nav className="wiki-home__nav" aria-label="Wiki entry points">
        <Link className="wiki-home__link" href="/article/welcome">
          Read the welcome article
          <span aria-hidden="true"> →</span>
        </Link>
      </nav>
    </main>
  );
}
