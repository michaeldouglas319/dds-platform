/**
 * Schema Compatibility Test Page
 *
 * Standalone page to test schema compatibility before migration.
 * Access at: /curved-takeoff-orbit/v3/test-schema-compatibility
 */

'use client';

import React from 'react';
import { SchemaCompatibilityTest } from './components/SchemaCompatibilityTest';
import { SchemaTest } from './components/SchemaTest';

export default function TestSchemaCompatibilityPage() {
  const [view, setView] = React.useState<'compatibility' | 'demo'>('compatibility');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setView('compatibility')}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              view === 'compatibility'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Compatibility Test
          </button>
          <button
            onClick={() => setView('demo')}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              view === 'demo'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Schema UI Demo
          </button>
        </div>

        {/* Content */}
        {view === 'compatibility' ? (
          <SchemaCompatibilityTest />
        ) : (
          <SchemaTest />
        )}
      </div>
    </div>
  );
}
