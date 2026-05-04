#!/bin/bash

# Migration script to move assets from lib/public to root public folder
# This ensures Next.js can serve the static files correctly

set -e

echo "🚀 Migrating assets from lib/public to public/..."

# Create directories if they don't exist
mkdir -p public/assets
mkdir -p public/images

# Move assets folder
if [ -d "lib/public/assets" ]; then
  echo "📦 Moving assets/..."
  cp -r lib/public/assets/* public/assets/ 2>/dev/null || true
  echo "✅ Assets moved"
else
  echo "⚠️  lib/public/assets not found"
fi

# Move images folder
if [ -d "lib/public/images" ]; then
  echo "🖼️  Moving images/..."
  cp -r lib/public/images/* public/images/ 2>/dev/null || true
  echo "✅ Images moved"
else
  echo "⚠️  lib/public/images not found"
fi

# Move service worker
if [ -f "lib/public/sw.js" ]; then
  echo "⚙️  Moving service worker..."
  cp lib/public/sw.js public/sw.js
  echo "✅ Service worker moved"
else
  echo "⚠️  lib/public/sw.js not found"
fi

# Fix file names with spaces
echo "🔧 Fixing file names with spaces..."
find public/assets -name "* *" -type f | while read file; do
  newname=$(echo "$file" | tr ' ' '-')
  mv "$file" "$newname" 2>/dev/null || true
done

echo ""
echo "✨ Migration complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify assets are accessible at /assets/ and /images/"
echo "2. Test your 3D models load correctly"
echo "3. Update any hardcoded paths if needed"
echo "4. Consider removing lib/public/ after verification"
echo ""
echo "⚠️  Note: This script COPIES files. Original files remain in lib/public/"
echo "    Delete lib/public/ manually after verifying everything works."




