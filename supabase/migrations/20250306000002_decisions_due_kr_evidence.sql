-- Decision log: due date, KR impacted, evidence link
ALTER TABLE decisions
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS kr_impacted_id UUID REFERENCES key_results(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS evidence_link TEXT;

CREATE INDEX IF NOT EXISTS idx_decisions_due_date ON decisions(due_date);
