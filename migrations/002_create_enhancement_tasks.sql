-- Enhancement Tasks: atomic improvements automatically discovered and executed
-- Each task is a 5-10 minute focused improvement against a rule

CREATE TABLE IF NOT EXISTS enhancement_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES product_registry(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  app_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  -- Task metadata
  rule_name TEXT NOT NULL,
  task_type TEXT NOT NULL, -- 'performance', 'ux', 'accessibility', 'seo', 'code_quality'
  title TEXT NOT NULL,
  description TEXT,

  -- Execution state
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'skipped'
  priority INTEGER DEFAULT 0, -- 0=low, 1=medium, 2=high

  -- Scoring
  score_before DECIMAL(3, 1),
  score_after DECIMAL(3, 1),
  rule_score DECIMAL(3, 1), -- 0-10 scale vs gold standard

  -- Execution tracking
  assigned_to TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,

  -- Output
  changes_json JSONB DEFAULT '{}', -- what changed
  logs TEXT, -- build/deploy logs
  error_message TEXT,

  CONSTRAINT status_valid CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  CONSTRAINT task_type_valid CHECK (task_type IN ('performance', 'ux', 'accessibility', 'seo', 'code_quality')),
  CONSTRAINT rule_name_not_empty CHECK (rule_name != ''),
  CONSTRAINT title_not_empty CHECK (title != '')
);

CREATE INDEX idx_enhancement_tasks_product_id ON enhancement_tasks(product_id);
CREATE INDEX idx_enhancement_tasks_status ON enhancement_tasks(status);
CREATE INDEX idx_enhancement_tasks_domain ON enhancement_tasks(domain);
CREATE INDEX idx_enhancement_tasks_created_at ON enhancement_tasks(created_at);
CREATE INDEX idx_enhancement_tasks_rule_score ON enhancement_tasks(rule_score);

-- RLS: All tasks visible and editable to authenticated users
ALTER TABLE enhancement_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enhancement_tasks_all" ON enhancement_tasks
  FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Auto-update updated_at on every change
CREATE OR REPLACE TRIGGER update_enhancement_tasks_updated_at
BEFORE UPDATE ON enhancement_tasks
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
