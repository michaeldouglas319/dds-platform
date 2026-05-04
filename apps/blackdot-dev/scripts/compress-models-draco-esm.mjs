#!/usr/bin/env node

/**
 * Compress GLTF models with Draco compression (ESM version)
 *
 * Usage:
 *   node scripts/compress-models-draco-esm.mjs --all  (compress all GLTF/GLB files)
 *   node scripts/compress-models-draco-esm.mjs --dir path/to/models
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.join(__dirname, '../public/assets/models');

/**
 * Find all GLTF/GLB model files in models directory
 * Handles both:
 * - GLTF: directories with scene.gltf + scene.bin
 * - GLB: standalone .glb files
 */
function findModels(dir) {
  const models = [];

  if (!fs.existsSync(dir)) {
    console.warn(`⚠ Directory not found: ${dir}`);
    return models;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    // Handle GLTF folders with scene.gltf
    if (entry.isDirectory()) {
      const gltfPath = path.join(dir, entry.name, 'scene.gltf');
      if (fs.existsSync(gltfPath)) {
        models.push({
          name: entry.name,
          type: 'gltf',
          modelPath: gltfPath,
          binPath: path.join(dir, entry.name, 'scene.bin'),
        });
      }
    }
    // Handle standalone GLB files
    else if (entry.isFile() && entry.name.endsWith('.glb')) {
      models.push({
        name: entry.name.replace('.glb', ''),
        type: 'glb',
        modelPath: path.join(dir, entry.name),
      });
    }
  }

  return models;
}

/**
 * Compress a single model using gltf-pipeline
 */
function compressModel(model) {
  try {
    console.log(`\n📦 Compressing: ${model.name} (${model.type.toUpperCase()})`);

    // Get original size
    let originalSize = 0;
    if (model.type === 'gltf') {
      const gltfStats = fs.statSync(model.modelPath);
      originalSize = gltfStats.size;
      if (model.binPath && fs.existsSync(model.binPath)) {
        const binStats = fs.statSync(model.binPath);
        originalSize += binStats.size;
      }
    } else {
      // GLB
      const glbStats = fs.statSync(model.modelPath);
      originalSize = glbStats.size;
    }
    const originalSizeMB = (originalSize / (1024 * 1024)).toFixed(2);

    // Run gltf-pipeline with draco compression
    const command = `npx gltf-pipeline -i "${model.modelPath}" -o "${model.modelPath}" -d`;
    execSync(command, { stdio: 'inherit' });

    // Get compressed size
    let compressedSize = 0;
    if (model.type === 'gltf') {
      const gltfStats = fs.statSync(model.modelPath);
      compressedSize = gltfStats.size;
      if (model.binPath && fs.existsSync(model.binPath)) {
        const binStats = fs.statSync(model.binPath);
        compressedSize += binStats.size;
      }
    } else {
      // GLB
      const glbStats = fs.statSync(model.modelPath);
      compressedSize = glbStats.size;
    }
    const compressedSizeMB = (compressedSize / (1024 * 1024)).toFixed(2);
    const reduction = (100 - (compressedSize / originalSize) * 100).toFixed(1);

    console.log(`✓ ${model.name}: ${originalSizeMB}MB → ${compressedSizeMB}MB (${reduction}% reduction)`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to compress ${model.name}:`, error.message);
    return false;
  }
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);
  const allModels = findModels(MODELS_DIR);

  if (allModels.length === 0) {
    console.log('ℹ No models found');
    return;
  }

  console.log(`🔍 Found ${allModels.length} model(s):`);
  allModels.forEach((m) => console.log(`   - ${m.name}`));
  console.log();

  let modelsToCompress = allModels;

  if (args.includes('--dir')) {
    const dirIdx = args.indexOf('--dir');
    if (dirIdx + 1 < args.length) {
      const customDir = args[dirIdx + 1];
      modelsToCompress = findModels(customDir);
    }
  }

  let successCount = 0;
  for (const model of modelsToCompress) {
    if (compressModel(model)) {
      successCount++;
    }
  }

  console.log(`\n✓ Compressed ${successCount}/${modelsToCompress.length} models`);
}

main();
