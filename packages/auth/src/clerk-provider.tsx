'use client';

import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';

interface DdsAuthProviderProps {
  children: ReactNode;
}

/**
 * Shared Clerk auth wrapper for all DDS apps.
 * Reads NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY from env.
 * Every app wraps its root layout with this.
 */
export function DdsAuthProvider({ children }: DdsAuthProviderProps) {
  return (
    <BaseClerkProvider>
      {children}
    </BaseClerkProvider>
  );
}
