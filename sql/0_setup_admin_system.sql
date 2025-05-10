-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create base tables
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    price numeric NOT NULL,
    interval text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id uuid REFERENCES subscription_plans(id),
    status text NOT NULL DEFAULT 'active',
    trial_ends_at timestamptz,
    current_period_end timestamptz NOT NULL,
    cancel_at_period_end boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create admin roles and permissions tables
CREATE TABLE IF NOT EXISTS admin_roles (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_permissions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id uuid REFERENCES admin_roles(id) ON DELETE CASCADE,
    permission_id uuid REFERENCES admin_permissions(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS admin_users (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id uuid REFERENCES admin_roles(id),
    email text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

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

-- Create indexes
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_plan_id_idx ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS admin_users_user_id_idx ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS admin_users_role_id_idx ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS admin_activity_logs_admin_user_id_idx ON admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_activity_logs_resource_idx ON admin_activity_logs(resource);
CREATE INDEX IF NOT EXISTS admin_activity_logs_created_at_idx ON admin_activity_logs(created_at DESC);

-- Create views
CREATE OR REPLACE VIEW admin_subscription_view AS
SELECT 
    s.id,
    s.user_id,
    u.email as user_email,
    sp.name as plan_name,
    sp.price as plan_price,
    sp.interval as billing_interval,
    s.status,
    s.trial_ends_at,
    s.current_period_end,
    s.cancel_at_period_end,
    s.created_at,
    s.updated_at
FROM public.subscriptions s
JOIN auth.users u ON u.id = s.user_id
JOIN public.subscription_plans sp ON sp.id = s.plan_id;

CREATE OR REPLACE VIEW admin_activity_log_view AS
SELECT 
    al.*,
    au.email as admin_email,
    au.role_id,
    ar.name as role_name
FROM admin_activity_logs al
JOIN admin_users au ON al.admin_user_id = au.id
JOIN admin_roles ar ON au.role_id = ar.id;

-- Add suspended column to users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;

-- Create functions
CREATE OR REPLACE FUNCTION suspend_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if caller is an admin
    IF NOT EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Update user status
    UPDATE auth.users
    SET is_suspended = true,
        raw_app_meta_data = raw_app_meta_data || 
            jsonb_build_object(
                'suspended_at', CURRENT_TIMESTAMP,
                'suspended_by', auth.uid()
            )
    WHERE id = target_user_id;

    -- Invalidate all sessions
    DELETE FROM auth.sessions
    WHERE user_id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION activate_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if caller is an admin
    IF NOT EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Update user status
    UPDATE auth.users
    SET is_suspended = false,
        raw_app_meta_data = raw_app_meta_data || 
            jsonb_build_object(
                'activated_at', CURRENT_TIMESTAMP,
                'activated_by', auth.uid()
            )
    WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_subscription_status(
    subscription_id UUID,
    new_status TEXT,
    admin_user_id UUID
)
RETURNS public.subscriptions AS $$
DECLARE
    updated_subscription public.subscriptions;
BEGIN
    -- Check if admin user has permission
    IF NOT EXISTS (
        SELECT 1 FROM admin_users au 
        JOIN role_permissions rp ON rp.role_id = au.role_id
        JOIN admin_permissions ap ON ap.id = rp.permission_id
        WHERE au.user_id = admin_user_id 
        AND ap.name = 'manage_subscriptions'
    ) THEN
        RAISE EXCEPTION 'User does not have permission to manage subscriptions';
    END IF;

    -- Update subscription
    UPDATE public.subscriptions
    SET 
        status = new_status,
        updated_at = NOW()
    WHERE id = subscription_id
    RETURNING * INTO updated_subscription;

    RETURN updated_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default roles and permissions
INSERT INTO admin_roles (name, description)
VALUES 
    ('super_admin', 'Full system access'),
    ('admin', 'General administrative access')
ON CONFLICT (name) DO NOTHING;

INSERT INTO admin_permissions (name, description)
VALUES 
    ('manage_users', 'Can manage users'),
    ('manage_subscriptions', 'Can manage subscriptions'),
    ('view_metrics', 'Can view system metrics')
ON CONFLICT (name) DO NOTHING;

-- Grant permissions to super_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Grant permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'admin'
  AND p.name IN ('view_metrics', 'manage_users')
ON CONFLICT DO NOTHING;

-- Disable RLS on admin tables
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs DISABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
