-- Drop policies
DROP POLICY IF EXISTS "Admin users can read roles" ON admin_roles;
DROP POLICY IF EXISTS "Admin users can read permissions" ON admin_permissions;
DROP POLICY IF EXISTS "Admin users can read role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Admin users can read metrics" ON admin_metrics;
DROP POLICY IF EXISTS "Admin users can access roles" ON admin_roles;
DROP POLICY IF EXISTS "Admin users can access permissions" ON admin_permissions;
DROP POLICY IF EXISTS "Admin users can access role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Admin users can access metrics" ON admin_metrics;
DROP POLICY IF EXISTS "api_requests_policy" ON api_requests;

-- Drop views
DROP VIEW IF EXISTS admin_subscription_view CASCADE;
DROP VIEW IF EXISTS admin_activity_log_view CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS suspend_user CASCADE;
DROP FUNCTION IF EXISTS activate_user CASCADE;
DROP FUNCTION IF EXISTS update_subscription_status CASCADE;

-- Drop tables
DROP TABLE IF EXISTS admin_activity_logs CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS admin_permissions CASCADE;
DROP TABLE IF EXISTS admin_roles CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS api_requests CASCADE;
DROP TABLE IF EXISTS admin_metrics CASCADE;
