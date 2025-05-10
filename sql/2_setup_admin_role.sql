DO $$
DECLARE
    admin_role_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'admin@spendify.com';

    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found. Please run 1_create_auth_user.sql first.';
    END IF;

    -- Create super_admin role if not exists
    INSERT INTO admin_roles (name, description)
    VALUES ('super_admin', 'Super administrator with all permissions')
    ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO admin_role_id;

    -- Add admin user to admin_users table
    INSERT INTO admin_users (user_id, role_id)
    VALUES (admin_user_id, admin_role_id)
    ON CONFLICT (user_id) DO UPDATE SET
        role_id = EXCLUDED.role_id,
        updated_at = NOW();

    -- Create admin permissions
    INSERT INTO admin_permissions (name, description, resource, action)
    VALUES 
        ('view_dashboard', 'View admin dashboard', 'dashboard', 'view'),
        ('manage_users', 'Manage user accounts', 'users', 'manage'),
        ('manage_subscriptions', 'Manage subscriptions', 'subscriptions', 'manage'),
        ('manage_content', 'Manage content', 'content', 'manage'),
        ('view_metrics', 'View system metrics', 'metrics', 'view')
    ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        resource = EXCLUDED.resource,
        action = EXCLUDED.action,
        updated_at = NOW();

    -- Create or update admin user entry
    INSERT INTO admin_users (user_id, role_id, is_active)
    VALUES (admin_user_id, admin_role_id, true)
    ON CONFLICT (user_id) DO UPDATE SET
        role_id = EXCLUDED.role_id,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();

    -- Assign all permissions to super_admin role
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT 
        admin_role_id,
        id
    FROM admin_permissions
    ON CONFLICT (role_id, permission_id) DO UPDATE SET
        updated_at = NOW();

    -- Create or update initial admin metrics
    INSERT INTO admin_metrics (name, value, user_id)
    VALUES
        ('dashboard_metrics', 
         jsonb_build_object(
            'total_users', 1,
            'active_subscriptions', 0,
            'documents_processed', 0,
            'monthly_revenue', 0,
            'user_growth', 0,
            'processing_success', 0
         ),
         admin_user_id)
    ON CONFLICT (name) DO UPDATE SET
        value = EXCLUDED.value,
        user_id = EXCLUDED.user_id,
        updated_at = NOW();
END
$$;
