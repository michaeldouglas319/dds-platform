import { createDdsSupabase } from '@dds/auth/supabase';
import { fetchWhoAlerts } from './sources/who';
import { fetchInterpolNotices } from './sources/interpol';
import { fetchUnHumanitarian } from './sources/un';
import { fetchWhiteHouseNews } from './sources/whitehouse';
import { batchTransformArticles } from './transform';
import type { TransformedEntry } from './types';

async function seedEntries() {
  console.log('🔄 Starting news scraper seed...\n');

  try {
    // Fetch from all sources in parallel
    console.log('📰 Fetching from official sources...');
    const [whoAlerts, interpolNotices, unNews, whiteHouseNews] = await Promise.all([
      fetchWhoAlerts(),
      fetchInterpolNotices(),
      fetchUnHumanitarian(),
      fetchWhiteHouseNews(),
    ]);

    const allArticles = [...whoAlerts, ...interpolNotices, ...unNews, ...whiteHouseNews];
    console.log(`✅ Fetched ${allArticles.length} articles total\n`);

    // Transform to schema
    console.log('🔄 Transforming articles to entry schema...');
    const entries = batchTransformArticles(allArticles);
    console.log(`✅ Transformed ${entries.length} entries\n`);

    // Initialize Supabase client
    const supabase = createDdsSupabase();

    // Upsert to database
    console.log('💾 Upserting to public.entries table...');
    const { error, count } = await supabase.from('entries').upsert(entries, {
      onConflict: 'id',
    });

    if (error) {
      console.error('❌ Error upserting entries:', error);
      process.exit(1);
    }

    console.log(`✅ Upserted ${count} entries\n`);

    // Print summary
    const tagCounts = entries.reduce((acc, entry) => {
      acc[entry.tag] = (acc[entry.tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 Summary by tag:');
    Object.entries(tagCounts).forEach(([tag, count]) => {
      console.log(`  ${tag}: ${count} entries`);
    });

    console.log('\n🎉 Seed complete! Visit http://localhost:3001/e to view entries\n');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

seedEntries();
