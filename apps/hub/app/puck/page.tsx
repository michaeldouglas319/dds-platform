'use client';

/**
 * Puck editor route — /puck
 *
 * Auth-gate this route before going to production.
 * Scaffold: renders the editor for the current domain.
 * Persistence: swap out the save handler for your DB of choice.
 */

import dynamic from 'next/dynamic';

// Load editor client-only (Puck requires browser APIs)
const PuckEditor = dynamic(
  () => import('../../renderers/puck/editor').then((m) => m.PuckEditor),
  { ssr: false }
);

export default function PuckEditorPage() {
  const domain =
    typeof window !== 'undefined'
      ? window.location.hostname
      : 'unknown';

  async function handlePublish(data: unknown) {
    // TODO: persist to DB (Supabase, KV, etc.) keyed by domain
    console.log('[puck] publish', domain, data);
  }

  return <PuckEditor domain={domain} onPublish={handlePublish} />;
}
