import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

/**
 * Create a Supabase client for server-side operations
 * Uses Clerk JWT for authentication
 */
export async function createSupabaseServerClient() {
  const { getToken } = await auth();

  const supabaseUrl = process.env.dds_SUPABASE_URL;
  const supabaseServiceKey = process.env.dds_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase client with Clerk JWT for client operations
 * This ensures Row-Level Security (RLS) policies are enforced
 */
export async function createSupabaseClientWithAuth() {
  const { getToken } = await auth();
  const token = await getToken({ template: 'supabase' });

  const supabaseUrl = process.env.NEXT_PUBLIC_dds_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_dds_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });

  return client;
}
