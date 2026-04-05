import { createClient } from '@supabase/supabase-js';

/**
 * Shared Supabase client for all DDS apps.
 * Env vars from the Vercel Marketplace Supabase integration (dds_ prefix).
 *
 * Public client (browser-safe):  createDdsSupabase()
 * Service client (server-only):  createDdsSupabaseAdmin()
 */
export function createDdsSupabase() {
  const url = process.env.NEXT_PUBLIC_dds_SUPABASE_URL ?? process.env.dds_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_dds_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      '@dds/auth: Missing NEXT_PUBLIC_dds_SUPABASE_URL or NEXT_PUBLIC_dds_SUPABASE_ANON_KEY'
    );
  }

  return createClient(url, key);
}

export function createDdsSupabaseAdmin() {
  const url = process.env.dds_SUPABASE_URL;
  const key = process.env.dds_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      '@dds/auth: Missing dds_SUPABASE_URL or dds_SUPABASE_SERVICE_ROLE_KEY (server-only)'
    );
  }

  return createClient(url, key);
}
