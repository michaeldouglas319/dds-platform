-- Product Registry: domains discovered from Vercel, rules extracted, improvement pipeline
-- Tracks all products and their improvement status

CREATE TABLE IF NOT EXISTS product_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  app_name TEXT NOT NULL,
  vercel_project_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  -- Product metadata
  name TEXT,
  description TEXT,
  rules_json JSONB DEFAULT '{}',
  summary TEXT,

  -- Flags
  has_rules BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  CONSTRAINT domain_not_empty CHECK (domain != ''),
  CONSTRAINT app_name_not_empty CHECK (app_name != '')
);

CREATE INDEX idx_product_registry_domain ON product_registry(domain);
CREATE INDEX idx_product_registry_app_name ON product_registry(app_name);
CREATE INDEX idx_product_registry_is_active ON product_registry(is_active);

-- RLS: All products visible and editable to authenticated users
ALTER TABLE product_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_registry_all" ON product_registry
  FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Auto-update updated_at on every change
CREATE OR REPLACE TRIGGER update_product_registry_updated_at
BEFORE UPDATE ON product_registry
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
