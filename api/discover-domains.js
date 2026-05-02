// Vercel Cron Handler: discovers all Vercel projects, creates product_registry entries
// Runs every 1 hour via vercel.json cron job
// Path: /api/discover-domains

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VERCEL_API_BASE = 'https://api.vercel.com';

export default async function handler(req, res) {
  // Only accept cron requests
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const start = Date.now();

    // Fetch all Vercel projects
    const projectsRes = await fetch(`${VERCEL_API_BASE}/v9/projects?limit=100`, {
      headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
    });

    if (!projectsRes.ok) {
      throw new Error(`Vercel API error: ${projectsRes.status}`);
    }

    const projectsData = await projectsRes.json();
    const projects = projectsData.projects || [];

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const project of projects) {
      try {
        // Extract domain from Vercel project name (e.g., "ageofabundance-shop" → "shop")
        const appName = project.name;
        const domain = appName.split('-').pop(); // Last segment

        // Upsert into product_registry
        const { data, error } = await supabase
          .from('product_registry')
          .upsert(
            {
              domain,
              app_name: appName,
              vercel_project_id: project.id,
              name: project.name,
              description: project.description || null,
              is_active: true,
            },
            { onConflict: 'domain' }
          )
          .select();

        if (error) {
          console.error(`Failed to upsert ${domain}:`, error);
          failed++;
        } else {
          created++;
        }
      } catch (err) {
        console.error(`Error processing project ${project.name}:`, err);
        failed++;
      }
    }

    const duration = Date.now() - start;

    res.status(200).json({
      status: 'success',
      discovered: projects.length,
      created,
      updated,
      failed,
      duration_ms: duration,
    });
  } catch (error) {
    console.error('Discover domains error:', error);
    res.status(500).json({
      error: error.message,
      status: 'failed',
    });
  }
}
