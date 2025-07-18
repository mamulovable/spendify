-- Support and AI Feedback Schema

-- Create support tickets table
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES admin_users(id),
  source TEXT NOT NULL DEFAULT 'in_app',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create ticket messages table
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id),
  sender_type TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create AI feedback table
CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  model_version_id UUID REFERENCES ai_model_versions(id),
  feedback_type TEXT NOT NULL,
  input_data JSONB NOT NULL,
  expected_output JSONB,
  actual_output JSONB NOT NULL,
  user_comment TEXT,
  is_anonymized BOOLEAN NOT NULL DEFAULT TRUE,
  reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ,
  added_to_training BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create AI training examples table
CREATE TABLE ai_training_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES ai_feedback(id),
  input_data JSONB NOT NULL,
  expected_output JSONB NOT NULL,
  category TEXT NOT NULL,
  added_by UUID REFERENCES admin_users(id),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create AI feedback metrics table
CREATE TABLE ai_feedback_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_date DATE NOT NULL,
  total_feedback INTEGER NOT NULL DEFAULT 0,
  positive_feedback INTEGER NOT NULL DEFAULT 0,
  negative_feedback INTEGER NOT NULL DEFAULT 0,
  misclassifications INTEGER NOT NULL DEFAULT 0,
  reviewed_count INTEGER NOT NULL DEFAULT 0,
  added_to_training INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique constraint on date
CREATE UNIQUE INDEX ai_feedback_metrics_date_idx ON ai_feedback_metrics(metric_date);

-- Create indexes
CREATE INDEX support_tickets_user_id_idx ON support_tickets(user_id);
CREATE INDEX support_tickets_status_idx ON support_tickets(status);
CREATE INDEX support_tickets_assigned_to_idx ON support_tickets(assigned_to);
CREATE INDEX ticket_messages_ticket_id_idx ON ticket_messages(ticket_id);
CREATE INDEX ai_feedback_user_id_idx ON ai_feedback(user_id);
CREATE INDEX ai_feedback_feedback_type_idx ON ai_feedback(feedback_type);
CREATE INDEX ai_feedback_reviewed_idx ON ai_feedback(reviewed);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_training_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY support_tickets_admin_select ON support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY ticket_messages_admin_select ON ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY ai_feedback_admin_select ON ai_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY ai_training_examples_admin_select ON ai_training_examples
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY ai_feedback_metrics_admin_select ON ai_feedback_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Create function to create support ticket
CREATE OR REPLACE FUNCTION create_support_ticket(
  user_id UUID,
  subject TEXT,
  initial_message TEXT,
  priority TEXT DEFAULT 'medium',
  source TEXT DEFAULT 'in_app'
) RETURNS UUID AS $$
DECLARE
  ticket_id UUID;
BEGIN
  -- Create ticket
  INSERT INTO support_tickets (
    user_id,
    subject,
    priority,
    source
  )
  VALUES (
    user_id,
    subject,
    priority,
    source
  )
  RETURNING id INTO ticket_id;
  
  -- Add initial message
  INSERT INTO ticket_messages (
    ticket_id,
    sender_type,
    sender_id,
    content
  )
  VALUES (
    ticket_id,
    'user',
    user_id::TEXT,
    initial_message
  );
  
  RETURN ticket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add message to ticket
CREATE OR REPLACE FUNCTION add_ticket_message(
  ticket_id UUID,
  sender_type TEXT,
  sender_id TEXT,
  content TEXT,
  attachments JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  message_id UUID;
BEGIN
  -- Add message
  INSERT INTO ticket_messages (
    ticket_id,
    sender_type,
    sender_id,
    content,
    attachments
  )
  VALUES (
    ticket_id,
    sender_type,
    sender_id,
    content,
    attachments
  )
  RETURNING id INTO message_id;
  
  -- Update ticket timestamp
  UPDATE support_tickets
  SET updated_at = NOW()
  WHERE id = ticket_id;
  
  RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assign ticket
CREATE OR REPLACE FUNCTION assign_ticket(
  ticket_id UUID,
  admin_id UUID,
  assigning_admin_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update ticket
  UPDATE support_tickets
  SET 
    assigned_to = admin_id,
    updated_at = NOW()
  WHERE id = ticket_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    assigning_admin_id,
    'assign_ticket',
    'ticket',
    ticket_id::TEXT,
    jsonb_build_object('assigned_to', admin_id)
  );
  
  -- Add system message
  PERFORM add_ticket_message(
    ticket_id,
    'system',
    'system',
    'Ticket assigned to admin'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update ticket status
CREATE OR REPLACE FUNCTION update_ticket_status(
  ticket_id UUID,
  new_status TEXT,
  admin_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update ticket
  UPDATE support_tickets
  SET 
    status = new_status,
    updated_at = NOW(),
    resolved_at = CASE WHEN new_status = 'resolved' THEN NOW() ELSE resolved_at END
  WHERE id = ticket_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'update_ticket_status',
    'ticket',
    ticket_id::TEXT,
    jsonb_build_object('status', new_status)
  );
  
  -- Add system message
  PERFORM add_ticket_message(
    ticket_id,
    'system',
    'system',
    'Ticket status changed to ' || new_status
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to submit AI feedback
CREATE OR REPLACE FUNCTION submit_ai_feedback(
  user_id UUID,
  model_version_id UUID,
  feedback_type TEXT,
  input_data JSONB,
  actual_output JSONB,
  expected_output JSONB DEFAULT NULL,
  user_comment TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  feedback_id UUID;
BEGIN
  -- Insert feedback
  INSERT INTO ai_feedback (
    user_id,
    model_version_id,
    feedback_type,
    input_data,
    actual_output,
    expected_output,
    user_comment
  )
  VALUES (
    user_id,
    model_version_id,
    feedback_type,
    input_data,
    actual_output,
    expected_output,
    user_comment
  )
  RETURNING id INTO feedback_id;
  
  RETURN feedback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to review AI feedback
CREATE OR REPLACE FUNCTION review_ai_feedback(
  feedback_id UUID,
  admin_id UUID,
  add_to_training BOOLEAN DEFAULT FALSE
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update feedback
  UPDATE ai_feedback
  SET 
    reviewed = TRUE,
    reviewed_by = admin_id,
    reviewed_at = NOW(),
    added_to_training = add_to_training
  WHERE id = feedback_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'review_ai_feedback',
    'ai_feedback',
    feedback_id::TEXT,
    jsonb_build_object('add_to_training', add_to_training)
  );
  
  -- Add to training examples if requested
  IF add_to_training THEN
    INSERT INTO ai_training_examples (
      feedback_id,
      input_data,
      expected_output,
      category,
      added_by,
      is_verified
    )
    SELECT 
      id,
      input_data,
      COALESCE(expected_output, actual_output),
      feedback_type,
      admin_id,
      TRUE
    FROM ai_feedback
    WHERE id = feedback_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add training example
CREATE OR REPLACE FUNCTION add_ai_training_example(
  input_data JSONB,
  expected_output JSONB,
  category TEXT,
  admin_id UUID,
  feedback_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  example_id UUID;
BEGIN
  -- Insert training example
  INSERT INTO ai_training_examples (
    feedback_id,
    input_data,
    expected_output,
    category,
    added_by,
    is_verified
  )
  VALUES (
    feedback_id,
    input_data,
    expected_output,
    category,
    admin_id,
    TRUE
  )
  RETURNING id INTO example_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'add_training_example',
    'ai_training',
    example_id::TEXT,
    jsonb_build_object('category', category)
  );
  
  RETURN example_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate daily AI feedback metrics
CREATE OR REPLACE FUNCTION calculate_daily_ai_feedback_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS BOOLEAN AS $$
DECLARE
  total_count INTEGER;
  positive_count INTEGER;
  negative_count INTEGER;
  misclass_count INTEGER;
  reviewed_count INTEGER;
  training_count INTEGER;
BEGIN
  -- Calculate feedback counts
  SELECT COUNT(*) INTO total_count
  FROM ai_feedback
  WHERE created_at::DATE = target_date;
  
  SELECT COUNT(*) INTO positive_count
  FROM ai_feedback
  WHERE created_at::DATE = target_date
  AND feedback_type IN ('helpful', 'correct');
  
  SELECT COUNT(*) INTO negative_count
  FROM ai_feedback
  WHERE created_at::DATE = target_date
  AND feedback_type IN ('not_helpful', 'incorrect');
  
  SELECT COUNT(*) INTO misclass_count
  FROM ai_feedback
  WHERE created_at::DATE = target_date
  AND feedback_type = 'incorrect';
  
  SELECT COUNT(*) INTO reviewed_count
  FROM ai_feedback
  WHERE reviewed_at::DATE = target_date;
  
  SELECT COUNT(*) INTO training_count
  FROM ai_feedback
  WHERE reviewed_at::DATE = target_date
  AND added_to_training = TRUE;
  
  -- Insert or update metrics
  INSERT INTO ai_feedback_metrics (
    metric_date,
    total_feedback,
    positive_feedback,
    negative_feedback,
    misclassifications,
    reviewed_count,
    added_to_training
  )
  VALUES (
    target_date,
    total_count,
    positive_count,
    negative_count,
    misclass_count,
    reviewed_count,
    training_count
  )
  ON CONFLICT (metric_date) DO UPDATE
  SET 
    total_feedback = EXCLUDED.total_feedback,
    positive_feedback = EXCLUDED.positive_feedback,
    negative_feedback = EXCLUDED.negative_feedback,
    misclassifications = EXCLUDED.misclassifications,
    reviewed_count = EXCLUDED.reviewed_count,
    added_to_training = EXCLUDED.added_to_training,
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin views for support tickets
CREATE OR REPLACE VIEW admin_support_tickets AS
SELECT 
  t.id,
  t.subject,
  t.status,
  t.priority,
  p.full_name as user_name,
  a.full_name as assigned_to_name,
  t.source,
  t.created_at,
  t.updated_at,
  t.resolved_at,
  (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id) as message_count
FROM support_tickets t
JOIN public.profiles p ON t.user_id = p.id
LEFT JOIN admin_users a ON t.assigned_to = a.id
ORDER BY 
  CASE 
    WHEN t.status = 'open' THEN 0
    WHEN t.status = 'in_progress' THEN 1
    WHEN t.status = 'resolved' THEN 2
    ELSE 3
  END,
  CASE
    WHEN t.priority = 'urgent' THEN 0
    WHEN t.priority = 'high' THEN 1
    WHEN t.priority = 'medium' THEN 2
    WHEN t.priority = 'low' THEN 3
    ELSE 4
  END,
  t.updated_at DESC;

-- Create view for AI feedback
CREATE OR REPLACE VIEW admin_ai_feedback AS
SELECT 
  f.id,
  f.feedback_type,
  m.version_name as model_version,
  f.user_comment,
  f.reviewed,
  a.full_name as reviewed_by_name,
  f.reviewed_at,
  f.added_to_training,
  f.created_at
FROM ai_feedback f
JOIN ai_model_versions m ON f.model_version_id = m.id
LEFT JOIN admin_users a ON f.reviewed_by = a.id
ORDER BY f.created_at DESC;