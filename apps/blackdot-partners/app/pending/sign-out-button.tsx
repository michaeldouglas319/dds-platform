'use client';

import { SignOutButton } from '@clerk/nextjs';

export default function PendingSignOutButton() {
  return (
    <SignOutButton>
      <button
        type="button"
        className="text-xs uppercase tracking-[0.15em] opacity-50 hover:opacity-90 transition-opacity bg-transparent border-0 cursor-pointer"
      >
        Sign out
      </button>
    </SignOutButton>
  );
}
