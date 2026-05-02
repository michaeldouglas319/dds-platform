import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const product_id = searchParams.get('product_id');
  const domain = searchParams.get('domain');
  const status = searchParams.get('status');

  try {
    if (id) {
      const { data, error } = await supabase
        .from('enhancement_tasks')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    let query = supabase.from('enhancement_tasks').select('*');

    if (product_id) query = query.eq('product_id', product_id);
    if (domain) query = query.eq('domain', domain);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_id,
      domain,
      app_name,
      rule_name,
      task_type,
      title,
      description,
      priority,
    } = body;

    if (!product_id || !rule_name || !task_type || !title) {
      return NextResponse.json(
        { error: 'product_id, rule_name, task_type, title required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('enhancement_tasks')
      .insert([
        {
          product_id,
          domain: domain || '',
          app_name: app_name || '',
          rule_name,
          task_type,
          title,
          description,
          status: 'pending',
          priority: priority ?? 0,
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
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
      .from('enhancement_tasks')
      .update(body)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0]);
  } catch (error) {
    console.error('PUT /api/tasks error:', error);
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
      .from('enhancement_tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/tasks error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
