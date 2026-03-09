-- Add metric_type and dri_id (DRI owner) to key_results
ALTER TABLE key_results
  ADD COLUMN IF NOT EXISTS metric_type TEXT,
  ADD COLUMN IF NOT EXISTS dri_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_key_results_dri_id ON key_results(dri_id);
