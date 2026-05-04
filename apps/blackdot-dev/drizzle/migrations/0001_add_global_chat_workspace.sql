-- Add metadata column to workspaces table
ALTER TABLE "workspaces" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb;

-- Create index for fast global workspace lookup
CREATE INDEX "idx_workspaces_metadata_global" ON "workspaces" USING btree ((metadata->>'isGlobal'));

-- Create global DDS Chat workspace
-- Find the first admin user and use their ID as owner
INSERT INTO workspaces (id, name, description, owner_id, required_access_level, metadata, created_at, updated_at)
SELECT
  'ws_global_dds_chat',
  'DDS Chat',
  'Global workspace for direct messaging across DDS V3',
  (SELECT id FROM users WHERE access_level = 'admin' ORDER BY created_at LIMIT 1),
  'member_plus',
  '{"isGlobal": true, "system": true}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM workspaces WHERE id = 'ws_global_dds_chat'
);

-- Migrate existing direct message channels to global workspace
UPDATE channels
SET workspace_id = 'ws_global_dds_chat'
WHERE type = 'direct' AND workspace_id != 'ws_global_dds_chat';
