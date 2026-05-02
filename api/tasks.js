// CRUD API for enhancement tasks
// GET /api/tasks - list tasks (filtered by status, product, domain)
// POST /api/tasks - create new task
// PUT /api/tasks/:id - update task
// DELETE /api/tasks/:id - delete task

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
        return await handleGet(query, res);
      case 'POST':
        return await handlePost(body, res);
      case 'PUT':
        return await handlePut(query, body, res);
      case 'DELETE':
        return await handleDelete(query, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Task API error:', error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

async function handleGet(query, res) {
  const { id, product_id, domain, status } = query;

  if (id) {
    // Get single task by ID
    const { data, error } = await supabase
      .from('enhancement_tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return res.status(200).json(data);
  }

  let q = supabase.from('enhancement_tasks').select('*');

  // Filter by product_id if provided
  if (product_id) {
    q = q.eq('product_id', product_id);
  }

  // Filter by domain if provided
  if (domain) {
    q = q.eq('domain', domain);
  }

  // Filter by status if provided
  if (status) {
    q = q.eq('status', status);
  }

  // Order by created_at descending
  q = q.order('created_at', { ascending: false });

  const { data, error } = await q;

  if (error) throw error;
  return res.status(200).json(data);
}

async function handlePost(body, res) {
  const { product_id, domain, app_name, rule_name, task_type, title, description } = body;

  if (!product_id || !rule_name || !task_type || !title) {
    return res.status(400).json({
      error: 'product_id, rule_name, task_type, title required',
    });
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
        priority: 0,
      },
    ])
    .select();

  if (error) throw error;
  return res.status(201).json(data[0]);
}

async function handlePut(query, body, res) {
  const { id } = query;

  if (!id) {
    return res.status(400).json({ error: 'id required' });
  }

  const { data, error } = await supabase
    .from('enhancement_tasks')
    .update(body)
    .eq('id', id)
    .select();

  if (error) throw error;
  return res.status(200).json(data[0]);
}

async function handleDelete(query, res) {
  const { id } = query;

  if (!id) {
    return res.status(400).json({ error: 'id required' });
  }

  const { error } = await supabase
    .from('enhancement_tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return res.status(204).end();
}
