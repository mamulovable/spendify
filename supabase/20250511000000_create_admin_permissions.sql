-- Migration: Create Admin Permissions Table
-- Description: Stores admin permissions for managing user access to admin features

CREATE TABLE IF NOT EXISTS public.admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    permission VARCHAR(50) NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT now(),
    granted_by UUID REFERENCES auth.users(id),
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    resource VARCHAR(255),
    UNIQUE(user_id, permission, resource)
);

-- Add RLS policies for admin_permissions
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Only authenticated users with admin permissions can view admin_permissions
CREATE POLICY admin_permissions_admin_policy ON public.admin_permissions
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_permissions' OR permission = 'view_permissions'
    ));

-- Create a function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, required_permission TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_permissions
        WHERE user_id = user_uuid
        AND permission = required_permission
        AND is_active = true
        AND (revoked_at IS NULL)
    );
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX admin_permissions_user_id_idx ON public.admin_permissions(user_id);
CREATE INDEX admin_permissions_permission_idx ON public.admin_permissions(permission);

-- Insert some initial admin permissions for development
-- IMPORTANT: Update with real user IDs before deploying
INSERT INTO public.admin_permissions (user_id, permission, resource)
VALUES 
-- User 1 (Super Admin)
('00000000-0000-0000-0000-000000000001', 'manage_users', NULL),
('00000000-0000-0000-0000-000000000001', 'view_dashboard', NULL),
('00000000-0000-0000-0000-000000000001', 'manage_permissions', NULL),
('00000000-0000-0000-0000-000000000001', 'manage_communication', NULL),
('00000000-0000-0000-0000-000000000001', 'manage_backups', NULL),
('00000000-0000-0000-0000-000000000001', 'manage_data', NULL),
('00000000-0000-0000-0000-000000000001', 'manage_system', NULL),

-- User 2 (Marketing Admin)
('00000000-0000-0000-0000-000000000002', 'view_dashboard', NULL),
('00000000-0000-0000-0000-000000000002', 'manage_communication', NULL),
('00000000-0000-0000-0000-000000000002', 'view_users', NULL);

-- Comments
COMMENT ON TABLE public.admin_permissions IS 'Stores admin permissions for managing user access to admin features';
COMMENT ON COLUMN public.admin_permissions.id IS 'Unique identifier for the permission record';
COMMENT ON COLUMN public.admin_permissions.user_id IS 'Reference to the user this permission applies to';
COMMENT ON COLUMN public.admin_permissions.permission IS 'The specific permission granted';
COMMENT ON COLUMN public.admin_permissions.granted_at IS 'When the permission was granted';
COMMENT ON COLUMN public.admin_permissions.granted_by IS 'Who granted the permission';
COMMENT ON COLUMN public.admin_permissions.revoked_at IS 'When the permission was revoked, if applicable';
COMMENT ON COLUMN public.admin_permissions.revoked_by IS 'Who revoked the permission, if applicable';
COMMENT ON COLUMN public.admin_permissions.is_active IS 'Whether the permission is currently active';
COMMENT ON COLUMN public.admin_permissions.resource IS 'Optional specific resource this permission applies to';
