'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PredictionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your personalized prediction and insights live here.</p>
            <p className="text-sm text-slate-400 mt-4">
              Member-only. Upgrade to Member+ for more features.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 text-sm text-slate-300 hover:text-white underline"
            >
              Back to home
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
