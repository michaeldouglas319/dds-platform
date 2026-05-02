import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const domain = searchParams.get('domain');

  try {
    if (id) {
      const { data, error } = await supabase
        .from('product_registry')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (domain) {
      const { data, error } = await supabase
        .from('product_registry')
        .select('*')
        .eq('domain', domain)
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from('product_registry')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, app_name, name, description, rules_json } = body;

    if (!domain || !app_name) {
      return NextResponse.json(
        { error: 'domain and app_name required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('product_registry')
      .insert([
        {
          domain,
          app_name,
          name: name || app_name,
          description,
          rules_json: rules_json || {},
          is_active: true,
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const body = await request.json();
    const { data, error } = await supabase
      .from('product_registry')
      .update(body)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0]);
  } catch (error) {
    console.error('PUT /api/products error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('product_registry')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/products error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
