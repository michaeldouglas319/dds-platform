'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { VideoProjection } from '@/app/portfolio/components/loaders/VideoProjection';
import { GoogleLogo3D } from '@/app/portfolio/components/GoogleLogo3D';
import { GlassButtonBar } from '@/app/portfolio/components/shared/GlassButtonBar';
import { useAuth } from '@/lib/contexts/AuthContext';
import { AccessLevel } from '@/lib/types/auth.types';
import type { GlassButtonConfig } from '@/app/portfolio/components/shared/GlassButtonBar';

/**
 * LandingV4 - Video Projection Cube Grid Landing
 *
 * Uses Clerk (Google sign-in popup) + app AuthContext and state:
 * - Not logged in: limited button bar (Explore, Help, Sign In)
 * - Logged in: full button bar by accessLevel (state); ADMIN/PARTNER get extra actions
 */
export const LandingV4: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const showErrorMessage = !!errorMessage;

  const router = useRouter();
  const { isAuthenticated, accessLevel } = useAuth();
  const { openSignIn, signOut } = useClerk();

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
    setProgress(100);
  }, []);

  /** Open Clerk sign-in modal (Google / OAuth options inside) */
  const handleSignIn = useCallback(() => {
    openSignIn?.({
      redirectUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }, [openSignIn]);

  const handleSignOut = useCallback(async () => {
    try {
      setErrorMessage(null);
      await signOut?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Sign out failed';
      setErrorMessage(msg);
      console.error('Sign out error:', msg);
    }
  }, [signOut]);

  /** Buttons when NOT logged in (Authenticate only, with 3D Google icon) */
  const unauthenticatedButtons: GlassButtonConfig[] = useMemo(
    () => [
      {
        label: 'Authenticate',
        onClick: handleSignIn,
        icon: <GoogleLogo3D size={28} />,
      },
    ],
    [handleSignIn]
  );

  /** Buttons when logged in: MEMBER = Resume + Prediction; MEMBER_PLUS = + Ideas; PARTNER/ADMIN = full nav */
  const authenticatedButtons: GlassButtonConfig[] = useMemo(() => {
    if (accessLevel === AccessLevel.MEMBER) {
      return [
        { label: 'Resume', onClick: () => router.push('/resumev3') },
        { label: 'Prediction', onClick: () => router.push('/prediction') },
        { label: 'Sign Out', onClick: handleSignOut },
      ];
    }
    if (accessLevel === AccessLevel.MEMBER_PLUS) {
      return [
        { label: 'Resume', onClick: () => router.push('/resumev3') },
        { label: 'Prediction', onClick: () => router.push('/prediction') },
        { label: 'Ideas', onClick: () => router.push('/ideas') },
        { label: 'Sign Out', onClick: handleSignOut },
      ];
    }
    const base: GlassButtonConfig[] = [
      { label: 'Home', onClick: () => router.push('/') },
      { label: 'Resume', onClick: () => router.push('/resumev3') },
      { label: 'Prediction', onClick: () => router.push('/prediction') },
      { label: 'Ideas', onClick: () => router.push('/ideas') },
      { label: 'Components', onClick: () => router.push('http://localhost:5174') },
      { label: 'About', onClick: () => router.push('/about') },
      { label: 'Profile', onClick: () => console.log('Profile') },
      { label: 'Sign Out', onClick: handleSignOut },
    ];
    if (accessLevel === AccessLevel.ADMIN) {
      base.splice(-1, 0, { label: 'Admin', onClick: () => router.push('/admin') });
    }
    if (accessLevel === AccessLevel.PARTNER || accessLevel === AccessLevel.ADMIN) {
      base.splice(-1, 0, { label: 'Dashboard', onClick: () => router.push('/dashboard') });
    }
    return base;
  }, [handleSignOut, accessLevel, router]);

  const buttonActions = isAuthenticated ? authenticatedButtons : unauthenticatedButtons;

  React.useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  // Simulate progress
  React.useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.random() * 30 : p));
    }, 300);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',

        inset: 0,
        background: '#0a0a0f',
        overflow: 'hidden',
      }}
    >
      {/* Video Projection - cube grid with t-pose video */}
      <VideoProjection
        opacity={isAuthenticated ? 1 : 0.2}
        videoUrl="/assets/videos/tpose-loop.mp4"
        gridSize={24}
        onLoadComplete={handleLoadComplete}
      />

      {/* Loading UI Overlay */}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            background: 'rgba(10, 10, 15, 0.3)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              color: 'white',
              padding: '2rem 2.5rem',
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            }}
          >
            <h1
              style={{
                fontSize: '3rem',
                fontWeight: 700,
                margin: '0 0 1rem 0',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #c0c0c0, #0a0a0f)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Loading Experience
            </h1>

            {/* Progress Bar */}
            <div
              style={{
                width: '300px',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #c0c0c0, #0a0a0f)',
                  width: `${progress}%`,
                  transition: 'width 0.3s ease-out',
                }}
              />
            </div>

            <p
              style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.6)',
                margin: 0,
              }}
            >
              {Math.round(progress)}%
            </p>
          </div>
        </div>
      )}

      {/* Content Layer - Hero; welcome text always full opacity; background grid fades when signed out */}
      {!isLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 200,
            pointerEvents: 'none',
            animation: 'fadeIn 0.8s ease-out',
          }}
        >
          <div
          >
          <h2
            style={{
              fontSize: '2.5rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              textAlign: 'center',
              maxWidth: '80vw',
              animation: 'slideUp 0.8s ease-out 0.2s both',
            }}
          >
            Welcome
          </h2>

          <p
          className='text-bold'
            style={{
              fontSize: '1.125rem',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.7)',
              marginTop: '0.5rem',
              textAlign: 'center',
              maxWidth: '60vw',
              animation: 'slideUp 0.8s ease-out 0.4s both',
            }}
          >
~ Michael Douglas
          </p>
          </div>
        </div>
      )}

      <GlassButtonBar
        buttons={buttonActions}
        bottom="5rem"
      />

      {/* Contact + copyright footer across bottom */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 130,
          padding: '10px 16px',
          background: 'rgba(10, 10, 15, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <a
          href="tel:+13194274736"
          style={{
            fontSize: '0.9rem',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.85)',
            textDecoration: 'none',
            letterSpacing: '0.02em',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
          }}
          aria-label="Call 319-427-4736"
        >
          Contact: 319-427-4736
        </a>
        <p
          style={{
            margin: 0,
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          © 2026 Michael Douglas. All rights reserved.
        </p>
      </footer>

      {showErrorMessage && errorMessage && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 11000,
            background: 'rgba(239, 68, 68, 0.95)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: '0.9rem',
            border: '1px solid rgba(239, 68, 68, 1)',
            maxWidth: '300px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          }}
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {/* Global animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-4px);
          }
        }

        html, body {
          margin: 0;
          padding: 0;
          background: #0a0a0f;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default LandingV4;
