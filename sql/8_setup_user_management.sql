-- Add suspended column to users table
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;

-- Create function to suspend a user
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

-- Create function to activate a user
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

-- Create function to delete a user and all their data
CREATE OR REPLACE FUNCTION delete_user(target_user_id UUID)
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

  -- Delete user's documents
  DELETE FROM public.documents
  WHERE user_id = target_user_id;

  -- Delete user's subscriptions
  DELETE FROM public.subscriptions
  WHERE user_id = target_user_id;

  -- Delete user's budget data
  DELETE FROM public.budgets
  WHERE user_id = target_user_id;

  -- Delete user's settings
  DELETE FROM public.user_settings
  WHERE user_id = target_user_id;

  -- Delete user's sessions
  DELETE FROM auth.sessions
  WHERE user_id = target_user_id;

  -- Finally, delete the user
  DELETE FROM auth.users
  WHERE id = target_user_id;
END;
$$;

-- Update admin user view to include suspension status
DROP VIEW IF EXISTS public.admin_user_view;
CREATE VIEW public.admin_user_view AS
WITH subscription_info AS (
    SELECT 
        s.user_id,
        s.status,
        s.trial_ends_at,
        s.current_period_end,
        s.cancel_at_period_end,
        sp.name as plan_name
    FROM public.subscriptions s
    LEFT JOIN public.subscription_plans sp ON sp.id = s.plan
)
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.is_suspended,
    COALESCE(s.status, 'none') as subscription_status,
    s.plan_name as subscription_plan,
    s.trial_ends_at,
    s.current_period_end,
    s.cancel_at_period_end,
    (SELECT COUNT(*) FROM public.documents d WHERE d.user_id = u.id) as document_count,
    (SELECT COUNT(*) FROM public.documents d WHERE d.user_id = u.id AND d.status = 'processed') as processed_documents
FROM auth.users u
LEFT JOIN subscription_info s ON s.user_id = u.id;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION suspend_user TO authenticated;
GRANT EXECUTE ON FUNCTION activate_user TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user TO authenticated;
