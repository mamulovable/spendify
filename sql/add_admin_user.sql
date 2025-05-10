-- List all users for reference
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- Make the most recent user an admin (modify this email as needed)
-- Use this command to find an appropriate user:
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 10;

DO $$
DECLARE
    v_role_id uuid;
    v_user_id uuid;
    v_user_email text;
    v_admin_id uuid;
BEGIN
    -- Get the super_admin role id
    SELECT id INTO v_role_id FROM admin_roles WHERE name = 'super_admin';
    
    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Super admin role not found! Make sure you ran the setup script first.';
    END IF;
    
    -- Change this to your user email
    v_user_email := 'admin@spendify.com';
    
    -- Get the user ID based on email
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;
    
    -- If user exists, insert into admin_users
    IF v_user_id IS NOT NULL THEN
        INSERT INTO admin_users (user_id, role_id, email)
        VALUES (v_user_id, v_role_id, v_user_email)
        ON CONFLICT (email) DO UPDATE SET role_id = v_role_id
        RETURNING id INTO v_admin_id;
        
        RAISE NOTICE 'Added user % as super_admin with ID %', v_user_email, v_admin_id;
    ELSE
        RAISE EXCEPTION 'User with email % not found! Please update the script with your actual user email.', v_user_email;
    END IF;
END $$;

-- Verify the admin user was added
SELECT au.id, au.email, ar.name AS role_name 
FROM admin_users au 
JOIN admin_roles ar ON au.role_id = ar.id;

-- Instructions:
-- 1. Replace 'admin@example.com' with your actual user email
-- 2. Run this script
-- 3. Log out and log back in to the application
