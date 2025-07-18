-- Schema for AI Training Data Management

-- Table for storing AI training examples
CREATE TABLE IF NOT EXISTS ai_training_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES ai_feedback(id) ON DELETE SET NULL,
  input_data JSONB NOT NULL,
  expected_output JSONB NOT NULL,
  category TEXT NOT NULL,
  added_by UUID NOT NULL REFERENCES auth.users(id),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for tracking model improvements
CREATE TABLE IF NOT EXISTS ai_model_improvements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_version UUID NOT NULL REFERENCES ai_model_versions(id),
  previous_version UUID NOT NULL REFERENCES ai_model_versions(id),
  training_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accuracy_before NUMERIC(5,2) NOT NULL,
  accuracy_after NUMERIC(5,2) NOT NULL,
  precision_before NUMERIC(5,2) NOT NULL,
  precision_after NUMERIC(5,2) NOT NULL,
  recall_before NUMERIC(5,2) NOT NULL,
  recall_after NUMERIC(5,2) NOT NULL,
  f1_before NUMERIC(5,2) NOT NULL,
  f1_after NUMERIC(5,2) NOT NULL,
  training_examples_count INTEGER NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function to verify a training example
CREATE OR REPLACE FUNCTION verify_ai_training_example(
  example_id UUID,
  admin_id UUID,
  is_verified BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ai_training_examples
  SET 
    is_verified = verify_ai_training_example.is_verified,
    verified_by = CASE WHEN verify_ai_training_example.is_verified THEN admin_id ELSE NULL END,
    verified_at = CASE WHEN verify_ai_training_example.is_verified THEN NOW() ELSE NULL END
  WHERE id = example_id;
  
  RETURN FOUND;
END;
$$;

-- View for admin access to training examples
CREATE OR REPLACE VIEW admin_ai_training_examples AS
SELECT 
  te.id,
  te.feedback_id,
  te.input_data,
  te.expected_output,
  te.category,
  te.is_verified,
  te.created_at,
  u.email as added_by,
  v.email as verified_by,
  te.verified_at
FROM ai_training_examples te
LEFT JOIN auth.users u ON te.added_by = u.id
LEFT JOIN auth.users v ON te.verified_by = v.id;

-- View for admin access to model improvements
CREATE OR REPLACE VIEW admin_ai_model_improvements AS
SELECT 
  mi.id,
  mi.training_date,
  current.version_name as model_version,
  previous.version_name as previous_version,
  mi.accuracy_before,
  mi.accuracy_after,
  mi.precision_before,
  mi.precision_after,
  mi.recall_before,
  mi.recall_after,
  mi.f1_before,
  mi.f1_after,
  mi.training_examples_count,
  mi.notes,
  u.email as created_by,
  mi.created_at
FROM ai_model_improvements mi
JOIN ai_model_versions current ON mi.model_version = current.id
JOIN ai_model_versions previous ON mi.previous_version = previous.id
JOIN auth.users u ON mi.created_by = u.id;

-- RLS Policies
ALTER TABLE ai_training_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_improvements ENABLE ROW LEVEL SECURITY;

-- Admin can read all training examples
CREATE POLICY admin_read_training_examples ON ai_training_examples
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'super_admin'))
  );

-- Admin can insert training examples
CREATE POLICY admin_insert_training_examples ON ai_training_examples
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'super_admin'))
  );

-- Admin can update training examples
CREATE POLICY admin_update_training_examples ON ai_training_examples
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'super_admin'))
  );

-- Admin can delete training examples
CREATE POLICY admin_delete_training_examples ON ai_training_examples
  FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'super_admin'))
  );

-- Admin can read all model improvements
CREATE POLICY admin_read_model_improvements ON ai_model_improvements
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'super_admin'))
  );

-- Admin can insert model improvements
CREATE POLICY admin_insert_model_improvements ON ai_model_improvements
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'super_admin'))
  );

-- Admin can update model improvements
CREATE POLICY admin_update_model_improvements ON ai_model_improvements
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'super_admin'))
  );

-- Admin can delete model improvements
CREATE POLICY admin_delete_model_improvements ON ai_model_improvements
  FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE role IN ('admin', 'super_admin'))
  );