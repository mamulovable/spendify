-- First, create a test admin user using Supabase's auth function
DO $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Check if user already exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@spendify.com') THEN
        -- Create new user using Supabase's auth.users() function
        SELECT id INTO new_user_id FROM auth.users 
        WHERE email = 'admin@spendify.com';
        
        IF new_user_id IS NULL THEN
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                recovery_sent_at,
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
            VALUES (
                '00000000-0000-0000-0000-000000000000',
                uuid_generate_v4(),
                'authenticated',
                'authenticated',
                'admin@spendify.com',
                crypt('admin123', gen_salt('bf')),
                now(),
                now(),
                now(),
                '{"provider":"email","providers":["email"]}',
                '{}',
                now(),
                now(),
                '',
                '',
                '',
                ''
            )
            RETURNING id INTO new_user_id;
        END IF;
    END IF;
END $$;

-- Get the user id and create admin entries
DO $$
DECLARE
    admin_user_id uuid;
    admin_role_id uuid;
BEGIN
    -- Get the admin user id
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'admin@spendify.com';

    -- Create super_admin role if not exists
    INSERT INTO admin_roles (name, description)
    SELECT 'super_admin', 'Full system access with all permissions'
    WHERE NOT EXISTS (
        SELECT 1 FROM admin_roles WHERE name = 'super_admin'
    )
    RETURNING id INTO admin_role_id;

    -- If role already exists, get its ID
    IF admin_role_id IS NULL THEN
        SELECT id INTO admin_role_id
        FROM admin_roles
        WHERE name = 'super_admin';
    END IF;

    -- Insert admin permissions if they don't exist
    INSERT INTO admin_permissions (name, description, resource, action)
    VALUES 
        ('view_dashboard', 'View admin dashboard', 'dashboard', 'view'),
        ('manage_users', 'Manage user accounts', 'users', 'manage'),
        ('manage_subscriptions', 'Manage subscriptions', 'subscriptions', 'manage'),
        ('manage_content', 'Manage content', 'content', 'manage'),
        ('view_metrics', 'View system metrics', 'metrics', 'view')
    ON CONFLICT (name) DO NOTHING;

    -- Create admin user entry if it doesn't exist
    INSERT INTO admin_users (user_id, role_id)
    SELECT admin_user_id, admin_role_id
    WHERE NOT EXISTS (
        SELECT 1 
        FROM admin_users 
        WHERE user_id = admin_user_id
    );

    -- Assign all permissions to super_admin role
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT 
        admin_role_id,
        ap.id
    FROM 
        admin_permissions ap
    ON CONFLICT DO NOTHING;

    -- Insert some test metrics
    INSERT INTO admin_metrics (
        metric_name,
        metric_value,
        metric_type,
        start_date,
        end_date
    )
    VALUES
    (
        'system_overview',
        '{
            "total_users": 100,
            "active_subscriptions": 45,
            "documents_processed": 250,
            "monthly_revenue": 4500,
            "user_growth": 15,
            "processing_success": 98
        }'::jsonb,
        'dashboard',
        NOW() - INTERVAL '1 month',
        NOW()
    );
END $$;
