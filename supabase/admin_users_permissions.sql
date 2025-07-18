-- Admin Users and Permissions Schema

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
  created_by UUID REFERENCES admin_users(id)
);

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

-- Create default admin roles
INSERT INTO admin_roles (name, description, permissions) VALUES
('viewer', 'Read-only access to dashboard', '{"read": true, "write": false, "delete": false}'),
('moderator', 'Can manage users and content', '{"read": true, "write": true, "delete": false, "manage_users": true}'),
('admin', 'Full access except system settings', '{"read": true, "write": true, "delete": true, "manage_users": true, "manage_admins": false}'),
('super_admin', 'Complete system access', '{"read": true, "write": true, "delete": true, "manage_users": true, "manage_admins": true, "system_settings": true}');

-- Create function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(email TEXT, password TEXT) RETURNS TABLE (
  id UUID,
  email TEXT,
  role_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email, au.role_id
  FROM admin_users au
  WHERE au.email = verify_password.email
  AND au.password_hash = crypt(password, au.password_hash)
  AND au.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  email TEXT,
  full_name TEXT,
  password TEXT,
  role_id UUID,
  created_by UUID
) RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO admin_users (email, full_name, password_hash, role_id, created_by)
  VALUES (email, full_name, hash_password(password), role_id, created_by)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_roles
CREATE POLICY admin_roles_select ON admin_roles
  FOR SELECT USING (TRUE);

CREATE POLICY admin_roles_insert ON admin_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN admin_roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.permissions->>'manage_admins' = 'true'
    )
  );

CREATE POLICY admin_roles_update ON admin_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN admin_roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.permissions->>'manage_admins' = 'true'
    )
  );

CREATE POLICY admin_roles_delete ON admin_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN admin_roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.permissions->>'manage_admins' = 'true'
    )
  );

-- Create policies for admin_users
CREATE POLICY admin_users_select ON admin_users
  FOR SELECT USING (TRUE);

CREATE POLICY admin_users_insert ON admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN admin_roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.permissions->>'manage_admins' = 'true'
    )
  );

CREATE POLICY admin_users_update ON admin_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN admin_roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.permissions->>'manage_admins' = 'true'
    )
  );

CREATE POLICY admin_users_delete ON admin_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN admin_roles ar ON au.role_id = ar.id
      WHERE au.id = auth.uid()
      AND ar.permissions->>'manage_admins' = 'true'
    )
  );

-- Create trigger to update updated_at timestamp
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

-- Create initial super admin user (password: changeme)
SELECT create_admin_user(
  'admin@spendify.com',
  'System Administrator',
  'changeme',
  (SELECT id FROM admin_roles WHERE name = 'super_admin'),
  NULL
);