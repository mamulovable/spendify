-- Create a test admin user
DO $$
DECLARE
    new_user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Get or create admin user in auth.users
    WITH new_admin AS (
        SELECT id
        FROM auth.users
        WHERE email = 'admin@spendify.com'
        LIMIT 1
    ), inserted_admin AS (
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
        SELECT
            '00000000-0000-0000-0000-000000000000',
            uuid_generate_v4(),
            'authenticated',
            'authenticated',
            'admin@spendify.com',
            crypt('admin123', gen_salt('bf')),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{}'::jsonb,
            now(),
            now(),
            '',
            '',
            '',
            ''
        WHERE NOT EXISTS (SELECT 1 FROM new_admin)
        RETURNING id
    )
    SELECT COALESCE(
        (SELECT id FROM new_admin),
        (SELECT id FROM inserted_admin)
    ) INTO new_user_id;

    -- Create super_admin role if not exists
    INSERT INTO admin_roles (name, description)
    VALUES ('super_admin', 'Super administrator with all permissions')
    ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO admin_role_id;

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
    VALUES (new_user_id, admin_role_id, true)
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

    -- Create initial admin metrics
    INSERT INTO admin_metrics (name, value, user_id)
    VALUES
        ('total_users', 1, new_user_id),
        ('active_subscriptions', 0, new_user_id),
        ('processed_documents', 0, new_user_id)
    ON CONFLICT (name) DO UPDATE SET
        value = EXCLUDED.value,
        user_id = EXCLUDED.user_id,
        updated_at = NOW();
END
$$;
