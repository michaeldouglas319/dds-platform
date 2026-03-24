#!/usr/bin/env node

/**
 * Create a new site from the site template
 *
 * Usage: node scripts/create-site.mjs <site-name>
 * Example: node scripts/create-site.mjs ageofabundance-shop
 */

import { cpSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const siteName = process.argv[2];

if (!siteName) {
  console.error('Usage: node scripts/create-site.mjs <site-name>');
  console.error('Example: node scripts/create-site.mjs ageofabundance-shop');
  process.exit(1);
}

const templateDir = resolve(root, 'templates/site-template');
const targetDir = resolve(root, 'apps', siteName);

if (existsSync(targetDir)) {
  console.error(`Error: ${targetDir} already exists`);
  process.exit(1);
}

console.log(`Creating new site: ${siteName}`);
console.log(`  From: ${templateDir}`);
console.log(`  To:   ${targetDir}`);

// Copy template
cpSync(templateDir, targetDir, { recursive: true });

// Replace SITE_NAME placeholders
const filesToPatch = [
  'package.json',
  'data/site.config.json',
];

for (const file of filesToPatch) {
  const filePath = resolve(targetDir, file);
  let content = readFileSync(filePath, 'utf-8');
  content = content.replace(/SITE_NAME/g, siteName);
  writeFileSync(filePath, content);
}

console.log(`\nSite created at apps/${siteName}/`);
console.log(`\nNext steps:`);
console.log(`  1. cd apps/${siteName}`);
console.log(`  2. Edit data/site.config.json with your content`);
console.log(`  3. pnpm install (from monorepo root)`);
console.log(`  4. pnpm dev --filter=@dds/${siteName}`);
