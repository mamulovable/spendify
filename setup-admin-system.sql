-- Setup Admin System
-- This script sets up the admin system tables and initial admin user

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS admin_sessions CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS admin_roles CASCADE;

-- Create admin roles table
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role_id UUID NOT NULL REFERENCES admin_roles(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);

-- Add foreign key reference after table creation to avoid circular dependency
ALTER TABLE admin_users 
  ADD CONSTRAINT admin_users_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES admin_users(id);

-- Create admin sessions table
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admin_users(id),
  token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password_text TEXT) RETURNS TEXT AS $$
BEGIN
  -- Using pgcrypto's crypt function with blowfish algorithm
  RETURN crypt(password_text, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(user_email TEXT, user_password TEXT) RETURNS TABLE (
  id UUID,
  email TEXT,
  role_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email, au.role_id
  FROM admin_users au
  WHERE au.email = user_email
  AND au.password_hash = crypt(user_password, au.password_hash)
  AND au.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email TEXT,
  user_full_name TEXT,
  user_password TEXT,
  user_role_id UUID,
  user_created_by UUID
) RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO admin_users (email, full_name, password_hash, role_id, created_by)
  VALUES (user_email, user_full_name, hash_password(user_password), user_role_id, user_created_by)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_roles_timestamp
BEFORE UPDATE ON admin_roles
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_admin_users_timestamp
BEFORE UPDATE ON admin_users
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Create default admin roles
INSERT INTO admin_roles (name, description, permissions) VALUES
('viewer', 'Read-only access to dashboard', '{"read": true, "write": false, "delete": false, "view_dashboard": true}'),
('moderator', 'Can manage users and content', '{"read": true, "write": true, "delete": false, "manage_users": true, "view_dashboard": true}'),
('admin', 'Full access except system settings', '{"read": true, "write": true, "delete": true, "manage_users": true, "manage_admins": false, "view_dashboard": true, "manage_security": true, "view_analytics": true, "manage_support": true, "manage_documents": true, "manage_ai": true, "manage_settings": true, "manage_finance": true, "manage_subscriptions": true}'),
('super_admin', 'Complete system access', '{"read": true, "write": true, "delete": true, "manage_users": true, "manage_admins": true, "system_settings": true, "view_dashboard": true, "manage_security": true, "view_analytics": true, "manage_support": true, "manage_documents": true, "manage_ai": true, "manage_settings": true, "manage_finance": true, "manage_subscriptions": true}');

-- Create initial super admin user (password: changeme)
SELECT create_admin_user(
  'admin@spendify.com',
  'System Administrator',
  'changeme',
  (SELECT id FROM admin_roles WHERE name = 'super_admin'),
  NULL
);

-- Enable Row Level Security
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create basic policies (these can be refined later)
CREATE POLICY admin_roles_select ON admin_roles FOR SELECT USING (TRUE);
CREATE POLICY admin_users_select ON admin_users FOR SELECT USING (TRUE);
CREATE POLICY admin_sessions_select ON admin_sessions FOR SELECT USING (TRUE);

-- Output success message
DO $$
BEGIN
  RAISE NOTICE 'Admin system setup complete. Default login: admin@spendify.com / changeme';
END $$;