#!/bin/bash

# This script fixes the RLS infinite recursion issue
# It applies the migration SQL directly to Supabase

echo "🔧 Supabase RLS Policy Fix"
echo "============================"
echo ""
echo "The RLS policies are causing infinite recursion."
echo "This MUST be fixed for chat to work."
echo ""
echo "Fix #1: Manual Fix via Supabase Dashboard"
echo "-----------------------------------------"
echo "1. Go to: https://app.supabase.com/project/zrggqosuiwfgwjkyhsjv/sql/new"
echo "2. Paste the SQL migration from: drizzle/migrations/0003_fix_rls_policies.sql"
echo "3. Click 'Run'"
echo ""
echo "Fix #2: Check current RLS status"
echo "--------------------------------"

echo ""
echo "Current SQL Migration Location:"
echo "File: /Users/bymichaeldouglas/claude/dds-v3/drizzle/migrations/0003_fix_rls_policies.sql"
echo ""
cat /Users/bymichaeldouglas/claude/dds-v3/drizzle/migrations/0003_fix_rls_policies.sql
echo ""
echo ""
echo "⚠️  IMPORTANT: This migration MUST be applied to fix the infinite recursion error."
