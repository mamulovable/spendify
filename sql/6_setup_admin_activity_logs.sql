-- Create admin activity logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource text NOT NULL,
  resource_id text,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS admin_activity_logs_admin_user_id_idx ON admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_activity_logs_resource_idx ON admin_activity_logs(resource);
CREATE INDEX IF NOT EXISTS admin_activity_logs_created_at_idx ON admin_activity_logs(created_at DESC);

-- Create view for activity logs with admin user details
CREATE OR REPLACE VIEW admin_activity_log_view AS
SELECT 
  al.*,
  au.email as admin_email,
  au.role_id,
  ar.name as role_name
FROM admin_activity_logs al
JOIN admin_users au ON al.admin_user_id = au.id
JOIN admin_roles ar ON au.role_id = ar.id;

-- Grant access to authenticated users
GRANT SELECT ON admin_activity_logs TO authenticated;
GRANT SELECT ON admin_activity_log_view TO authenticated;
GRANT INSERT ON admin_activity_logs TO authenticated;

-- Enable RLS
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY admin_activity_logs_policy ON admin_activity_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- Create function to get recent activity logs
CREATE OR REPLACE FUNCTION get_recent_activity_logs(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_resource text DEFAULT NULL,
  p_admin_user_id uuid DEFAULT NULL,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  admin_user_id uuid,
  action text,
  resource text,
  resource_id text,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz,
  admin_email text,
  role_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.admin_user_id,
    al.action,
    al.resource,
    al.resource_id,
    al.details,
    al.ip_address,
    al.user_agent,
    al.created_at,
    au.email as admin_email,
    ar.name as role_name
  FROM admin_activity_logs al
  JOIN admin_users au ON al.admin_user_id = au.id
  JOIN admin_roles ar ON au.role_id = ar.id
  WHERE
    (p_resource IS NULL OR al.resource = p_resource)
    AND (p_admin_user_id IS NULL OR al.admin_user_id = p_admin_user_id)
    AND (p_start_date IS NULL OR al.created_at >= p_start_date)
    AND (p_end_date IS NULL OR al.created_at <= p_end_date)
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
