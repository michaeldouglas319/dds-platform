-- Row Level Security (RLS) Policies for DDS V3
-- Enforces data access control at the database level based on Clerk user IDs
-- See: https://clerk.com/docs/guides/development/integrations/databases/supabase
-- See: https://supabase.com/docs/guides/auth/third-party/clerk

-- ============================================================================
-- HELPER FUNCTION: Get Clerk User ID from Auth Claims
-- ============================================================================

-- Create function to extract Clerk user ID from JWT claims
-- Note: Created in public schema since auth schema is protected by Supabase
CREATE OR REPLACE FUNCTION public.clerk_user_id() RETURNS text AS $$
  SELECT current_setting('request.jwt.claims', true)::jsonb->>'sub'
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- ENABLE RLS ON TABLES
-- ============================================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on workspaces table
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Enable RLS on workspace_members table
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Enable RLS on channels table
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (clerk_id = public.clerk_user_id());

-- Admins can view all user profiles
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = public.clerk_user_id()
    AND access_level = 'admin'
  )
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (clerk_id = public.clerk_user_id())
WITH CHECK (clerk_id = public.clerk_user_id());

-- Only admins can update user roles
CREATE POLICY "Only admins can update user roles"
ON users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = public.clerk_user_id()
    AND access_level = 'admin'
  )
);

-- ============================================================================
-- WORKSPACES TABLE POLICIES
-- ============================================================================

-- Users can view workspaces they own
CREATE POLICY "Users can view own workspaces"
ON workspaces FOR SELECT
USING (
  owner_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
);

-- Users can view workspaces they're members of
CREATE POLICY "Users can view workspaces they belong to"
ON workspaces FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = workspaces.id
    AND user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
  )
);

-- Users can view public/global workspaces
CREATE POLICY "Users can view public workspaces"
ON workspaces FOR SELECT
USING (
  (metadata->>'isGlobal')::boolean = true
);

-- Users can only create workspaces (insert)
CREATE POLICY "Authenticated users can create workspaces"
ON workspaces FOR INSERT
WITH CHECK (
  owner_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
);

-- Users can only update their own workspaces
CREATE POLICY "Users can update own workspaces"
ON workspaces FOR UPDATE
USING (
  owner_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
);

-- ============================================================================
-- WORKSPACE_MEMBERS TABLE POLICIES
-- ============================================================================

-- Users can view members in workspaces they belong to
CREATE POLICY "Users can view workspace members"
ON workspace_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
  )
);

-- Workspace owners/admins can manage members
CREATE POLICY "Workspace admins can manage members"
ON workspace_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM workspaces w
    WHERE w.id = workspace_members.workspace_id
    AND w.owner_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
  )
);

-- ============================================================================
-- CHANNELS TABLE POLICIES
-- ============================================================================

-- Users can view channels in their workspaces
CREATE POLICY "Users can view channels in their workspaces"
ON channels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = channels.workspace_id
    AND user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
  )
);

-- Users can create channels in workspaces they belong to
CREATE POLICY "Users can create channels"
ON channels FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = channels.workspace_id
    AND user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
  )
);

-- ============================================================================
-- MESSAGES TABLE POLICIES
-- ============================================================================

-- Users can view messages in channels they have access to
CREATE POLICY "Users can view messages in accessible channels"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_id = messages.channel_id
    AND user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
  )
);

-- Users can create messages in channels they belong to
CREATE POLICY "Users can create messages"
ON messages FOR INSERT
WITH CHECK (
  user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
  AND EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_id = messages.channel_id
    AND user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
  )
);

-- Users can only update/delete their own messages
CREATE POLICY "Users can update own messages"
ON messages FOR UPDATE
USING (user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id()));

-- ============================================================================
-- POSTS TABLE POLICIES
-- ============================================================================

-- Users can view published posts
CREATE POLICY "Users can view published posts"
ON posts FOR SELECT
USING (status = 'published');

-- Users can view their own draft posts
CREATE POLICY "Users can view own draft posts"
ON posts FOR SELECT
USING (
  status != 'published'
  AND author_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
ON posts FOR INSERT
WITH CHECK (
  author_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
);

-- Users can only update their own posts
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (author_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id()));

-- ============================================================================
-- CONVERSATIONS TABLE POLICIES
-- ============================================================================

-- Users can only view their own conversations
CREATE POLICY "Users can view own conversations"
ON conversations FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
);

-- Authenticated users can create conversations
CREATE POLICY "Authenticated users can create conversations"
ON conversations FOR INSERT
WITH CHECK (
  user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
ON conversations FOR UPDATE
USING (
  user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
);

-- ============================================================================
-- CONVERSATION_MESSAGES TABLE POLICIES
-- ============================================================================

-- Users can view messages from their conversations
CREATE POLICY "Users can view conversation messages"
ON conversation_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = conversation_messages.conversation_id
    AND conversations.user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
  )
);

-- Users can create messages in their conversations
CREATE POLICY "Users can create conversation messages"
ON conversation_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = conversation_messages.conversation_id
    AND conversations.user_id = (SELECT id FROM users WHERE clerk_id = public.clerk_user_id())
  )
);

-- ============================================================================
-- INDEXES FOR RLS PERFORMANCE
-- ============================================================================

-- Index for faster Clerk ID lookups
CREATE INDEX IF NOT EXISTS users_clerk_id_access_level_idx
ON users(clerk_id, access_level)
WHERE access_level = 'admin';

-- Index for workspace member lookups
CREATE INDEX IF NOT EXISTS workspace_members_user_id_workspace_id_idx
ON workspace_members(user_id, workspace_id);

-- Index for channel member lookups
CREATE INDEX IF NOT EXISTS channel_members_user_id_channel_id_idx
ON channel_members(user_id, channel_id);

-- Index for conversation lookups
CREATE INDEX IF NOT EXISTS conversations_user_id_idx
ON conversations(user_id);

-- Index for post author lookups
CREATE INDEX IF NOT EXISTS posts_author_id_status_idx
ON posts(author_id, status);
