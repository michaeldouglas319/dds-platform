'use client';

import { useState } from 'react';
import Link from 'next/link';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Vision', href: '/vision' },
  { label: 'Playground', href: '/playground' },
  { label: 'Showcase', href: '/showcase' },
  { label: 'Variants', href: '/variants' },
];

const externalLinks = [
  { label: 'michaeldouglas.app', href: 'https://michaeldouglas.app' },
];

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 100,
      background: 'rgba(10, 10, 10, 0.65)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    }}>
      <div style={{
        maxWidth: 'var(--content-max, 64rem)',
        margin: '0 auto',
        padding: '0 var(--content-pad, 2rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '3.5rem',
      }}>
        {/* Brand */}
        <Link href="/" style={{
          color: 'rgba(255, 255, 255, 0.85)',
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: 600,
          letterSpacing: '0.03em',
          whiteSpace: 'nowrap',
        }}>
          The Age of Abundance
        </Link>

        {/* Desktop links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
        }} className="nav-links-desktop">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} style={{
              color: 'rgba(255, 255, 255, 0.6)',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              letterSpacing: '0.02em',
              transition: 'color 0.2s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)')}
            >
              {link.label}
            </Link>
          ))}
          {externalLinks.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" style={{
              color: 'rgba(255, 255, 255, 0.6)',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              letterSpacing: '0.02em',
              transition: 'color 0.2s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)')}
            >
              {link.label}
              <span style={{ fontSize: '0.65rem', marginLeft: '0.25rem', opacity: 0.5 }}>&#8599;</span>
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.4rem',
            cursor: 'pointer',
            padding: '0.25rem',
          }}
        >
          {menuOpen ? '\u2715' : '\u2630'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="nav-mobile-menu" style={{
          padding: '0.5rem var(--content-pad, 2rem) 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}>
              {link.label}
            </Link>
          ))}
          {externalLinks.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} style={{
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}>
              {link.label} &#8599;
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
