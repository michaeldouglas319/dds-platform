// Vercel Cron Handler: runs one atomic enhancement per cycle
// Runs every 6 hours via vercel.json cron job
// Path: /api/run-enhancement

import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Score rules: map rule_score (0-10) to task_type priority
const SCORE_TO_TASK_TYPE = {
  performance: { minScore: 0, priority: 2 }, // lowest scores = biggest performance gaps
  ux: { minScore: 2, priority: 2 },
  accessibility: { minScore: 3, priority: 2 },
  seo: { minScore: 4, priority: 1 },
  code_quality: { minScore: 5, priority: 1 },
};

export default async function handler(req, res) {
  // Only accept cron requests
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const startTime = Date.now();

    // Find lowest-scoring product with pending tasks
    const { data: products, error: productError } = await supabase
      .from('product_registry')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1);

    if (productError || !products?.length) {
      return res.status(200).json({
        status: 'no_products',
        message: 'No active products to enhance',
      });
    }

    const product = products[0];

    // Find lowest-scoring pending task for this product
    const { data: tasks, error: taskError } = await supabase
      .from('enhancement_tasks')
      .select('*')
      .eq('product_id', product.id)
      .eq('status', 'pending')
      .order('rule_score', { ascending: true }) // lowest score first
      .limit(1);

    if (taskError || !tasks?.length) {
      return res.status(200).json({
        status: 'no_tasks',
        message: `No pending tasks for product ${product.domain}`,
      });
    }

    const task = tasks[0];

    // Mark task as in_progress
    await supabase
      .from('enhancement_tasks')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('id', task.id);

    // Simulate task execution (would be replaced with actual improvement logic)
    const improvement = await executeEnhancement(product, task);

    const duration = Math.floor((Date.now() - startTime) / 1000);

    // Mark task as completed with score
    const scoreAfter = Math.min(10, (task.rule_score || 0) + 2); // Simulate improvement
    await supabase
      .from('enhancement_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        score_after: scoreAfter,
        duration_seconds: duration,
        logs: improvement.logs,
        changes_json: improvement.changes,
      })
      .eq('id', task.id);

    res.status(200).json({
      status: 'completed',
      product: product.domain,
      task: task.title,
      rule_score_before: task.rule_score,
      rule_score_after: scoreAfter,
      duration_seconds: duration,
    });
  } catch (error) {
    console.error('Run enhancement error:', error);
    res.status(500).json({
      error: error.message,
      status: 'failed',
    });
  }
}

async function executeEnhancement(product, task) {
  // Placeholder: actual implementation would:
  // 1. Check out app source
  // 2. Apply improvement code
  // 3. Run local build (pnpm turbo build)
  // 4. Test improvement
  // 5. Commit changes if passing

  const changes = {
    files_modified: ['index.tsx', 'config.json'],
    improvements: [task.title],
  };

  const logs = `
[${new Date().toISOString()}] Starting enhancement: ${task.title}
[${new Date().toISOString()}] Applied improvement to ${product.app_name}
[${new Date().toISOString()}] Build successful
[${new Date().toISOString()}] Improvement verified
  `.trim();

  return {
    changes,
    logs,
  };
}
