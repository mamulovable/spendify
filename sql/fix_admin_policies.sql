-- Drop all existing policies
DROP POLICY IF EXISTS "Admin access" ON admin_users;
DROP POLICY IF EXISTS "Admin access" ON admin_roles;
DROP POLICY IF EXISTS "Admin access" ON admin_permissions;
DROP POLICY IF EXISTS "Admin access" ON role_permissions;
DROP POLICY IF EXISTS "Admin access" ON admin_metrics;
DROP POLICY IF EXISTS "Admin access" ON admin_activity_logs;

-- Disable RLS on all admin tables
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs DISABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON admin_users TO authenticated;
GRANT ALL ON admin_roles TO authenticated;
GRANT ALL ON admin_permissions TO authenticated;
GRANT ALL ON role_permissions TO authenticated;
GRANT ALL ON admin_metrics TO authenticated;
GRANT ALL ON admin_activity_logs TO authenticated;
