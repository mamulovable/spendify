-- Audit Logging Schema

-- Create audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX audit_logs_admin_id_idx ON audit_logs(admin_id);
CREATE INDEX audit_logs_entity_type_idx ON audit_logs(entity_type);
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at);
CREATE INDEX audit_logs_action_idx ON audit_logs(action);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs
CREATE POLICY audit_logs_select ON audit_logs
  FOR SELECT USING (TRUE);

CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  admin_id UUID,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, ip_address, user_agent)
  VALUES (admin_id, action, entity_type, entity_id, details, ip_address, user_agent)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to automatically log changes to important tables
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  admin_id UUID;
  action_type TEXT;
  entity_id TEXT;
  change_details JSONB;
BEGIN
  -- Get current admin ID from session
  admin_id := auth.uid();
  
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'create';
    entity_id := NEW.id::TEXT;
    change_details := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'update';
    entity_id := NEW.id::TEXT;
    change_details := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW),
      'changed_fields', (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW) -> key <> to_jsonb(OLD) -> key
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'delete';
    entity_id := OLD.id::TEXT;
    change_details := to_jsonb(OLD);
  END IF;
  
  -- Log the action
  PERFORM log_admin_action(
    admin_id,
    action_type,
    TG_TABLE_NAME,
    entity_id,
    change_details
  );
  
  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to important tables
CREATE TRIGGER audit_admin_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON admin_users
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();

CREATE TRIGGER audit_admin_roles_trigger
AFTER INSERT OR UPDATE OR DELETE ON admin_roles
FOR EACH ROW EXECUTE PROCEDURE audit_trigger_function();

-- Create view for recent admin activity
CREATE OR REPLACE VIEW recent_admin_activity AS
SELECT 
  al.id,
  al.created_at,
  au.full_name as admin_name,
  al.action,
  al.entity_type,
  al.entity_id,
  al.details
FROM audit_logs al
JOIN admin_users au ON al.admin_id = au.id
ORDER BY al.created_at DESC
LIMIT 100;

-- Create function to purge old audit logs (retention policy)
CREATE OR REPLACE FUNCTION purge_old_audit_logs(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - (retention_days * INTERVAL '1 day')
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;