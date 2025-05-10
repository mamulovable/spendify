-- Get or update admin user in auth.users
DO $$
DECLARE
    existing_user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Create super_admin role if not exists
    INSERT INTO admin_roles (name, description)
    VALUES ('super_admin', 'Super administrator with all permissions')
    ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        updated_at = NOW()
    RETURNING id INTO admin_role_id;

    -- Check if user exists
    SELECT id INTO existing_user_id
    FROM auth.users
    WHERE email = 'admin@spendify.com';

    IF existing_user_id IS NULL THEN
        -- Create new user if doesn't exist
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
            is_super_admin,
            created_at,
            updated_at
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            '6ea4abc8-c58f-4457-8483-5e2f9b9941f6'::uuid,
            'authenticated',
            'authenticated',
            'admin@spendify.com',
            crypt('admin123', gen_salt('bf')),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{}'::jsonb,
            true,
            now(),
            now()
        );
        
        -- Add user to admin_users
        INSERT INTO admin_users (user_id, role_id)
        VALUES ('6ea4abc8-c58f-4457-8483-5e2f9b9941f6'::uuid, admin_role_id);
    ELSE
        -- Update existing user
        UPDATE auth.users
        SET 
            encrypted_password = crypt('admin123', gen_salt('bf')),
            email_confirmed_at = now(),
            last_sign_in_at = now(),
            is_super_admin = true,
            updated_at = now()
        WHERE id = existing_user_id;

        -- Update admin_users
        INSERT INTO admin_users (user_id, role_id)
        VALUES (existing_user_id, admin_role_id)
        ON CONFLICT (user_id) DO UPDATE SET
            role_id = EXCLUDED.role_id,
            updated_at = NOW();
    END IF;
END
$$;
