import { NextResponse } from 'next/server';
import { createDdsSupabase } from '@dds/auth/supabase';

export async function POST(req: Request) {
  try {
    const { email, domain } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const supabase = createDdsSupabase();

    const { error } = await supabase
      .from('email_subscribers')
      .upsert(
        { email: email.toLowerCase().trim(), domain, subscribed_at: new Date().toISOString() },
        { onConflict: 'email,domain' }
      );

    if (error) {
      console.error('[subscribe]', error.message);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
