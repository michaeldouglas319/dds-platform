'use client';

// The home page is a Client Component because it constructs a renderer
// registry containing function references. Next.js still statically prerenders
// it at build time — there are no client-only data dependencies yet.
import { SectionBatchRenderer } from '@dds/renderer';
import { wikiRegistry } from '../lib/wiki-registry';
import { homeArticle } from '../data/home-article';

export default function WikiHome() {
  return (
    <SectionBatchRenderer sections={[homeArticle]} registry={wikiRegistry} />
  );
}
