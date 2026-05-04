'use client';

import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_dds_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_dds_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Base Supabase client for client-side operations
 * Use useSupabaseClient() hook instead of this directly
 */
const baseSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Hook to get Supabase client with Clerk JWT authentication
 * Provides client with authenticated credentials for RLS enforcement
 */
export function useSupabaseClient() {
  const { getToken } = useAuth();
  const [client, setClient] = useState(baseSupabaseClient);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setupClient = async () => {
      try {
        // Try to get Clerk JWT for authenticated access
        // Falls back to base client if template doesn't exist
        try {
          const token = await getToken({ template: 'supabase' });
          if (token) {
            const authenticatedClient = createClient(supabaseUrl!, supabaseAnonKey!, {
              global: {
                headers: {
                  authorization: `Bearer ${token}`,
                },
              },
            });
            setClient(authenticatedClient);
            return;
          }
        } catch (jwtError) {
          console.debug('Clerk JWT template not found, using base client', (jwtError as any)?.message);
        }

        // Fallback to base client
        setClient(baseSupabaseClient);
      } catch (error) {
        console.error('Failed to setup Supabase client:', error);
        setClient(baseSupabaseClient);
      } finally {
        setIsLoading(false);
      }
    };

    setupClient();
  }, [getToken]);

  return { client, isLoading };
}

/**
 * Hook to subscribe to real-time channel changes
 */
export function useSupabaseChannel<T>(
  channelName: string,
  onUpdate: (data: T) => void
) {
  const { client } = useSupabaseClient();

  useEffect(() => {
    const channel = client
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        onUpdate(payload.new as T);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [client, channelName, onUpdate]);
}

/**
 * Hook to subscribe to presence changes in a channel
 */
export function useSupabasePresence(channelName: string) {
  const { client } = useSupabaseClient();
  const [presenceState, setPresenceState] = useState<Record<string, any>>({});

  useEffect(() => {
    const channel = client.channel(channelName);

    channel.on('presence', { event: 'sync' }, () => {
      setPresenceState(channel.presenceState());
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      setPresenceState((prev) => ({
        ...prev,
        [key]: newPresences,
      }));
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      setPresenceState((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [client, channelName]);

  return presenceState;
}

export default baseSupabaseClient;
