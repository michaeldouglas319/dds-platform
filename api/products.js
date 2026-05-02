// CRUD API for product registry
// GET /api/products - list all products
// POST /api/products - create new product
// PUT /api/products/:id - update product
// DELETE /api/products/:id - delete product

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(query);
      case 'POST':
        return handlePost(body);
      case 'PUT':
        return handlePut(query, body);
      case 'DELETE':
        return handleDelete(query);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Product API error:', error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

async function handleGet(query) {
  const { id, domain } = query;

  if (id) {
    // Get single product by ID
    const { data, error } = await supabase
      .from('product_registry')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { status: 200, json: data };
  }

  if (domain) {
    // Get single product by domain
    const { data, error } = await supabase
      .from('product_registry')
      .select('*')
      .eq('domain', domain)
      .single();

    if (error) throw error;
    return { status: 200, json: data };
  }

  // List all products
  const { data, error } = await supabase
    .from('product_registry')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { status: 200, json: data };
}

async function handlePost(body) {
  const { domain, app_name, name, description, rules_json } = body;

  if (!domain || !app_name) {
    return { status: 400, json: { error: 'domain and app_name required' } };
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
  return { status: 201, json: data[0] };
}

async function handlePut(query, body) {
  const { id } = query;

  if (!id) {
    return { status: 400, json: { error: 'id required' } };
  }

  const { data, error } = await supabase
    .from('product_registry')
    .update(body)
    .eq('id', id)
    .select();

  if (error) throw error;
  return { status: 200, json: data[0] };
}

async function handleDelete(query) {
  const { id } = query;

  if (!id) {
    return { status: 400, json: { error: 'id required' } };
  }

  const { error } = await supabase
    .from('product_registry')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { status: 204, json: null };
}
