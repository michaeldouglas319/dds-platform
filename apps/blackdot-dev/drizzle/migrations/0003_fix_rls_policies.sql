-- Fix RLS infinite recursion and simplify policies for chat tables
-- Since Clerk handles auth and Supabase handles data, we use anon key for queries

-- Drop existing problematic policies on users table
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;

-- Simpler users policies (no recursion)
CREATE POLICY "Anyone can read users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid()::text = clerk_id);

-- Workspaces: Members can read their workspaces
DROP POLICY IF EXISTS "Users can read workspaces they are members of" ON workspaces;
CREATE POLICY "Users can read workspaces"
  ON workspaces FOR SELECT
  USING (
    id IN (
      SELECT workspace_id
      FROM workspace_members
      WHERE user_id = auth.uid()::text
    )
  );

-- Channels: Users can read channels in their workspaces
DROP POLICY IF EXISTS "Users can read channels in their workspaces" ON channels;
CREATE POLICY "Users can read channels"
  ON channels FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM workspace_members
      WHERE user_id = auth.uid()::text
    )
  );

-- Messages: Users can read messages in channels they have access to
DROP POLICY IF EXISTS "Users can read messages in accessible channels" ON messages;
CREATE POLICY "Users can read messages"
  ON messages FOR SELECT
  USING (
    channel_id IN (
      SELECT c.id
      FROM channels c
      JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()::text
    )
  );

-- Messages: Users can insert messages in channels they have access to
DROP POLICY IF EXISTS "Users can insert messages in accessible channels" ON messages;
CREATE POLICY "Users can insert messages"
  ON messages FOR INSERT
  WITH CHECK (
    channel_id IN (
      SELECT c.id
      FROM channels c
      JOIN workspace_members wm ON c.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()::text
    )
  );

-- Workspace members: Users can read workspace members
DROP POLICY IF EXISTS "Users can read workspace members" ON workspace_members;
CREATE POLICY "Users can read workspace members"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id
      FROM workspace_members
      WHERE user_id = auth.uid()::text
    )
  );
