-- Fix missing columns in subscriptions table
DO $$
BEGIN
  -- Add trial_type column
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'subscriptions' 
    AND column_name = 'trial_type'
  ) THEN
    ALTER TABLE public.subscriptions ADD COLUMN trial_type text;
  END IF;

  -- Add card_added column
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'subscriptions' 
    AND column_name = 'card_added'
  ) THEN
    ALTER TABLE public.subscriptions ADD COLUMN card_added boolean DEFAULT false;
  END IF;
END $$;

-- First drop the existing view if it exists
DROP VIEW IF EXISTS public.admin_user_view;

-- Create admin_user_view
CREATE VIEW public.admin_user_view AS
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.is_suspended,
  (NOT u.is_suspended) as is_active,
  COALESCE(s.status, 'none') as subscription_status,
  COALESCE(sp.name, 'none') as plan_name,
  s.trial_ends_at,
  s.current_period_end,
  s.cancel_at_period_end,
  COALESCE(s.card_added, false) as card_added
FROM 
  auth.users u
LEFT JOIN 
  public.subscriptions s ON u.id = s.user_id
LEFT JOIN 
  public.subscription_plans sp ON s.plan_id = sp.id;

-- Create get_recent_activity_logs function if it doesn't exist
CREATE OR REPLACE FUNCTION get_recent_activity_logs(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  admin_user_id uuid,
  admin_email text,
  role_name text,
  action text,
  resource text,
  resource_id text,
  details jsonb,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.admin_user_id,
    au.email as admin_email,
    ar.name as role_name,
    al.action,
    al.resource,
    al.resource_id,
    al.details,
    al.created_at
  FROM 
    admin_activity_logs al
  JOIN 
    admin_users au ON al.admin_user_id = au.id
  JOIN 
    admin_roles ar ON au.role_id = ar.id
  ORDER BY 
    al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
