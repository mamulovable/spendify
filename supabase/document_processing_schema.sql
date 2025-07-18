-- Document Processing Monitoring Schema

-- Create AI model versions table
CREATE TABLE ai_model_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_name TEXT NOT NULL UNIQUE,
  model_type TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  accuracy_score DECIMAL(5, 2),
  training_data_size INTEGER,
  deployed_at TIMESTAMPTZ,
  deployed_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create document processing queue table
CREATE TABLE document_processing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  document_id UUID REFERENCES public.document_uploads(id),
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 0,
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  processing_duration INTEGER, -- in seconds
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  model_version_id UUID REFERENCES ai_model_versions(id),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create document processing results table
CREATE TABLE document_processing_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.document_uploads(id),
  queue_item_id UUID REFERENCES document_processing_queue(id),
  model_version_id UUID REFERENCES ai_model_versions(id),
  bank_name TEXT,
  currency TEXT,
  transaction_count INTEGER,
  start_date DATE,
  end_date DATE,
  account_number TEXT,
  account_holder TEXT,
  total_deposits DECIMAL(12, 2),
  total_withdrawals DECIMAL(12, 2),
  extracted_data JSONB NOT NULL DEFAULT '{}',
  confidence_score DECIMAL(5, 2),
  processing_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create document processing metrics table
CREATE TABLE document_processing_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_date DATE NOT NULL,
  total_documents INTEGER NOT NULL DEFAULT 0,
  pending_documents INTEGER NOT NULL DEFAULT 0,
  processing_documents INTEGER NOT NULL DEFAULT 0,
  completed_documents INTEGER NOT NULL DEFAULT 0,
  failed_documents INTEGER NOT NULL DEFAULT 0,
  avg_processing_time INTEGER, -- in seconds
  success_rate DECIMAL(5, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique constraint on date
CREATE UNIQUE INDEX document_processing_metrics_date_idx ON document_processing_metrics(metric_date);

-- Create indexes
CREATE INDEX document_processing_queue_status_idx ON document_processing_queue(status);
CREATE INDEX document_processing_queue_user_id_idx ON document_processing_queue(user_id);
CREATE INDEX document_processing_queue_document_id_idx ON document_processing_queue(document_id);
CREATE INDEX document_processing_results_document_id_idx ON document_processing_results(document_id);

-- Enable RLS
ALTER TABLE ai_model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY ai_model_versions_admin_select ON ai_model_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY document_processing_queue_admin_select ON document_processing_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY document_processing_results_admin_select ON document_processing_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY document_processing_metrics_admin_select ON document_processing_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Create function to add document to processing queue
CREATE OR REPLACE FUNCTION queue_document_for_processing(
  document_id UUID,
  priority INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  queue_id UUID;
  doc_user_id UUID;
BEGIN
  -- Get user ID from document
  SELECT user_id INTO doc_user_id
  FROM public.document_uploads
  WHERE id = document_id;
  
  -- Insert into queue
  INSERT INTO document_processing_queue (
    user_id,
    document_id,
    priority,
    model_version_id
  )
  VALUES (
    doc_user_id,
    document_id,
    priority,
    (SELECT id FROM ai_model_versions WHERE is_active = TRUE LIMIT 1)
  )
  RETURNING id INTO queue_id;
  
  RETURN queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update document processing status
CREATE OR REPLACE FUNCTION update_document_processing_status(
  queue_id UUID,
  new_status TEXT,
  error_msg TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  start_time TIMESTAMPTZ;
  duration INTEGER;
BEGIN
  -- Get start time if needed
  IF new_status = 'processing' THEN
    UPDATE document_processing_queue
    SET 
      status = new_status,
      processing_started_at = NOW(),
      updated_at = NOW()
    WHERE id = queue_id;
  ELSIF new_status = 'completed' THEN
    -- Calculate duration
    SELECT processing_started_at INTO start_time
    FROM document_processing_queue
    WHERE id = queue_id;
    
    duration := EXTRACT(EPOCH FROM (NOW() - start_time))::INTEGER;
    
    UPDATE document_processing_queue
    SET 
      status = new_status,
      processing_completed_at = NOW(),
      processing_duration = duration,
      updated_at = NOW()
    WHERE id = queue_id;
  ELSIF new_status = 'failed' THEN
    UPDATE document_processing_queue
    SET 
      status = new_status,
      error_message = error_msg,
      retry_count = retry_count + 1,
      updated_at = NOW()
    WHERE id = queue_id;
  ELSE
    UPDATE document_processing_queue
    SET 
      status = new_status,
      updated_at = NOW()
    WHERE id = queue_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to store document processing results
CREATE OR REPLACE FUNCTION store_document_processing_results(
  document_id UUID,
  queue_id UUID,
  bank_name TEXT,
  currency TEXT,
  transaction_count INTEGER,
  start_date DATE,
  end_date DATE,
  account_number TEXT,
  account_holder TEXT,
  total_deposits DECIMAL,
  total_withdrawals DECIMAL,
  extracted_data JSONB,
  confidence_score DECIMAL DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  result_id UUID;
  model_id UUID;
BEGIN
  -- Get model version
  SELECT model_version_id INTO model_id
  FROM document_processing_queue
  WHERE id = queue_id;
  
  -- Store results
  INSERT INTO document_processing_results (
    document_id,
    queue_item_id,
    model_version_id,
    bank_name,
    currency,
    transaction_count,
    start_date,
    end_date,
    account_number,
    account_holder,
    total_deposits,
    total_withdrawals,
    extracted_data,
    confidence_score
  )
  VALUES (
    document_id,
    queue_id,
    model_id,
    bank_name,
    currency,
    transaction_count,
    start_date,
    end_date,
    account_number,
    account_holder,
    total_deposits,
    total_withdrawals,
    extracted_data,
    confidence_score
  )
  RETURNING id INTO result_id;
  
  -- Update queue status
  PERFORM update_document_processing_status(queue_id, 'completed');
  
  RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reprocess document
CREATE OR REPLACE FUNCTION reprocess_document(
  document_id UUID,
  admin_id UUID
) RETURNS UUID AS $$
DECLARE
  new_queue_id UUID;
BEGIN
  -- Create new queue entry
  SELECT queue_document_for_processing(document_id, 10) INTO new_queue_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'reprocess_document',
    'document',
    document_id::TEXT,
    jsonb_build_object('queue_id', new_queue_id)
  );
  
  RETURN new_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to manually tag document
CREATE OR REPLACE FUNCTION manually_tag_document(
  document_id UUID,
  metadata JSONB,
  admin_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update document metadata
  UPDATE public.document_uploads
  SET 
    metadata = manually_tag_document.metadata,
    is_manually_processed = TRUE,
    updated_at = NOW()
  WHERE id = document_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'manually_tag_document',
    'document',
    document_id::TEXT,
    metadata
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to deploy new AI model version
CREATE OR REPLACE FUNCTION deploy_ai_model_version(
  version_name TEXT,
  model_type TEXT,
  description TEXT,
  accuracy_score DECIMAL,
  training_data_size INTEGER,
  admin_id UUID
) RETURNS UUID AS $$
DECLARE
  model_id UUID;
BEGIN
  -- Deactivate current active model
  UPDATE ai_model_versions
  SET is_active = FALSE
  WHERE is_active = TRUE;
  
  -- Create new model version
  INSERT INTO ai_model_versions (
    version_name,
    model_type,
    description,
    is_active,
    accuracy_score,
    training_data_size,
    deployed_at,
    deployed_by
  )
  VALUES (
    version_name,
    model_type,
    description,
    TRUE,
    accuracy_score,
    training_data_size,
    NOW(),
    admin_id
  )
  RETURNING id INTO model_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'deploy_ai_model',
    'ai_model',
    model_id::TEXT,
    jsonb_build_object(
      'version_name', version_name,
      'model_type', model_type,
      'accuracy_score', accuracy_score
    )
  );
  
  RETURN model_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate daily document processing metrics
CREATE OR REPLACE FUNCTION calculate_daily_document_processing_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS BOOLEAN AS $$
DECLARE
  total_count INTEGER;
  pending_count INTEGER;
  processing_count INTEGER;
  completed_count INTEGER;
  failed_count INTEGER;
  avg_time INTEGER;
  success_rate DECIMAL(5, 2);
BEGIN
  -- Calculate document counts by status
  SELECT COUNT(*) INTO total_count
  FROM document_processing_queue
  WHERE created_at::DATE = target_date;
  
  SELECT COUNT(*) INTO pending_count
  FROM document_processing_queue
  WHERE status = 'pending'
  AND created_at::DATE = target_date;
  
  SELECT COUNT(*) INTO processing_count
  FROM document_processing_queue
  WHERE status = 'processing'
  AND created_at::DATE = target_date;
  
  SELECT COUNT(*) INTO completed_count
  FROM document_processing_queue
  WHERE status = 'completed'
  AND created_at::DATE = target_date;
  
  SELECT COUNT(*) INTO failed_count
  FROM document_processing_queue
  WHERE status = 'failed'
  AND created_at::DATE = target_date;
  
  -- Calculate average processing time
  SELECT AVG(processing_duration)::INTEGER INTO avg_time
  FROM document_processing_queue
  WHERE processing_completed_at::DATE = target_date
  AND status = 'completed';
  
  -- Calculate success rate
  IF total_count > 0 THEN
    success_rate := (completed_count::DECIMAL / total_count) * 100;
  ELSE
    success_rate := 0;
  END IF;
  
  -- Insert or update metrics
  INSERT INTO document_processing_metrics (
    metric_date,
    total_documents,
    pending_documents,
    processing_documents,
    completed_documents,
    failed_documents,
    avg_processing_time,
    success_rate
  )
  VALUES (
    target_date,
    total_count,
    pending_count,
    processing_count,
    completed_count,
    failed_count,
    avg_time,
    success_rate
  )
  ON CONFLICT (metric_date) DO UPDATE
  SET 
    total_documents = EXCLUDED.total_documents,
    pending_documents = EXCLUDED.pending_documents,
    processing_documents = EXCLUDED.processing_documents,
    completed_documents = EXCLUDED.completed_documents,
    failed_documents = EXCLUDED.failed_documents,
    avg_processing_time = EXCLUDED.avg_processing_time,
    success_rate = EXCLUDED.success_rate,
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin views for document processing
CREATE OR REPLACE VIEW admin_document_queue AS
SELECT 
  q.id as queue_id,
  d.id as document_id,
  p.full_name as user_name,
  d.file_name,
  d.file_size,
  d.mime_type,
  q.status,
  q.priority,
  q.processing_started_at,
  q.processing_completed_at,
  q.processing_duration,
  q.error_message,
  q.retry_count,
  m.version_name as model_version,
  q.created_at
FROM document_processing_queue q
JOIN public.document_uploads d ON q.document_id = d.id
JOIN public.profiles p ON q.user_id = p.id
LEFT JOIN ai_model_versions m ON q.model_version_id = m.id
ORDER BY q.priority DESC, q.created_at ASC;

-- Create view for document processing results
CREATE OR REPLACE VIEW admin_document_results AS
SELECT 
  r.id as result_id,
  d.id as document_id,
  p.full_name as user_name,
  r.bank_name,
  r.currency,
  r.transaction_count,
  r.start_date,
  r.end_date,
  r.account_number,
  r.confidence_score,
  m.version_name as model_version,
  q.processing_duration,
  r.created_at
FROM document_processing_results r
JOIN public.document_uploads d ON r.document_id = d.id
JOIN public.profiles p ON d.user_id = p.id
LEFT JOIN document_processing_queue q ON r.queue_item_id = q.id
LEFT JOIN ai_model_versions m ON r.model_version_id = m.id
ORDER BY r.created_at DESC;