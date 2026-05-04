/**
 * Component Showcase Page
 *
 * Interactive component catalog with search, filtering, and live previews.
 * Development-only page - automatically redirects or shows 404 in production.
 */

import { notFound } from 'next/navigation';
import { ShowcaseClient } from './components/ShowcaseClient';

/**
 * Showcase page
 *
 * Available in development mode only. Shows a comprehensive catalog of all
 * components in the codebase with search, filtering, and preview capabilities.
 */
export default function ShowcasePage() {
  // Block access in production
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return <ShowcaseClient />;
}
