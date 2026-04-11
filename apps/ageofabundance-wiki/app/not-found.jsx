import Link from 'next/link';

export const metadata = {
  title: 'Article not found',
};

export default function NotFound() {
  return (
    <section className="wiki-404" aria-labelledby="not-found-title">
      <h1 id="not-found-title">That article does not exist yet.</h1>
      <p>
        The page you were looking for has not been written, or the wiki-link
        that brought you here is still dangling. You can help by starting from
        the index.
      </p>
      <Link href="/">Back to the wiki index</Link>
    </section>
  );
}
