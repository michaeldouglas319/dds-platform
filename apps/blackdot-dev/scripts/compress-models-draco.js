#!/usr/bin/env node

/**
 * Compress GLB/GLTF models with Draco compression
 * 
 * Usage:
 *   node scripts/compress-models-draco.js [input-file] [output-file]
 *   node scripts/compress-models-draco.js --all  (compress all GLB files)
 *   node scripts/compress-models-draco.js --dir public/assets/models  (compress all in directory)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MODELS_DIR = path.join(__dirname, '../public/assets/models');
const DRACO_OPTIONS = {
  method: 'draco',
  draco: {
    compressionLevel: 7, // 0-10, higher = better compression but slower
    quantizePositionBits: 14, // 1-30, higher = better quality
    quantizeNormalBits: 10,
    quantizeColorBits: 8,
    quantizeTexcoordBits: 12,
    quantizeGenericBits: 12,
    unifiedQuantization: false,
  },
};

function compressGLB(inputPath, outputPath) {
  try {
    console.log(`\n📦 Compressing: ${path.basename(inputPath)}`);
    
    // Check if gltf-pipeline is available
    try {
      execSync('npx gltf-pipeline --version', { stdio: 'ignore' });
    } catch {
      console.error('❌ gltf-pipeline not found. Installing...');
      execSync('pnpm add -D gltf-pipeline', { stdio: 'inherit' });
    }

    // Use gltf-pipeline to compress
    const command = `npx gltf-pipeline -i "${inputPath}" -o "${outputPath}" -d --draco.compressionLevel=${DRACO_OPTIONS.draco.compressionLevel} --draco.quantizePositionBits=${DRACO_OPTIONS.draco.quantizePositionBits} --draco.quantizeNormalBits=${DRACO_OPTIONS.draco.quantizeNormalBits} --draco.quantizeColorBits=${DRACO_OPTIONS.draco.quantizeColorBits} --draco.quantizeTexcoordBits=${DRACO_OPTIONS.draco.quantizeTexcoordBits}`;
    
    execSync(command, { stdio: 'inherit' });

    // Compare file sizes
    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    const originalSize = (inputStats.size / 1024).toFixed(2);
    const compressedSize = (outputStats.size / 1024).toFixed(2);
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    console.log(`✅ Compressed: ${originalSize} KB → ${compressedSize} KB (${reduction}% reduction)`);
    return true;
  } catch (error) {
    console.error(`❌ Error compressing ${inputPath}:`, error.message);
    return false;
  }
}

function findAllGLBFiles(dir) {
  const files = [];
  
  function walkDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.glb')) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Draco GLB Compression Tool

Usage:
  node scripts/compress-models-draco.js [input] [output]
  node scripts/compress-models-draco.js --all
  node scripts/compress-models-draco.js --dir [directory]

Examples:
  node scripts/compress-models-draco.js input.glb output.glb
  node scripts/compress-models-draco.js --all
  node scripts/compress-models-draco.js --dir public/assets/models

Options:
  --all              Compress all GLB files in ${MODELS_DIR}
  --dir <path>       Compress all GLB files in specified directory
  --help, -h         Show this help message
    `);
    process.exit(0);
  }

  if (args[0] === '--all') {
    console.log(`🔍 Finding all GLB files in ${MODELS_DIR}...`);
    const files = findAllGLBFiles(MODELS_DIR);
    
    if (files.length === 0) {
      console.log('❌ No GLB files found.');
      process.exit(1);
    }
    
    console.log(`📋 Found ${files.length} GLB file(s):`);
    files.forEach(f => console.log(`   - ${path.relative(MODELS_DIR, f)}`));
    
    let successCount = 0;
    for (const file of files) {
      const dir = path.dirname(file);
      const name = path.basename(file, '.glb');
      const outputPath = path.join(dir, `${name}_draco.glb`);
      
      if (compressGLB(file, outputPath)) {
        successCount++;
      }
    }
    
    console.log(`\n✨ Completed: ${successCount}/${files.length} files compressed`);
    
  } else if (args[0] === '--dir') {
    const dir = args[1] || MODELS_DIR;
    console.log(`🔍 Finding all GLB files in ${dir}...`);
    const files = findAllGLBFiles(path.resolve(dir));
    
    if (files.length === 0) {
      console.log('❌ No GLB files found.');
      process.exit(1);
    }
    
    console.log(`📋 Found ${files.length} GLB file(s)`);
    
    let successCount = 0;
    for (const file of files) {
      const dirPath = path.dirname(file);
      const name = path.basename(file, '.glb');
      const outputPath = path.join(dirPath, `${name}_draco.glb`);
      
      if (compressGLB(file, outputPath)) {
        successCount++;
      }
    }
    
    console.log(`\n✨ Completed: ${successCount}/${files.length} files compressed`);
    
  } else if (args.length >= 2) {
    // Single file compression
    const inputPath = path.resolve(args[0]);
    const outputPath = path.resolve(args[1]);
    
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Input file not found: ${inputPath}`);
      process.exit(1);
    }
    
    compressGLB(inputPath, outputPath);
    
  } else {
    console.error('❌ Invalid arguments. Use --help for usage information.');
    process.exit(1);
  }
}

main();


