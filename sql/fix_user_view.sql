-- First drop the existing view
DROP VIEW IF EXISTS public.admin_user_view;

-- Recreate with all the necessary fields
CREATE VIEW public.admin_user_view AS
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.is_suspended,
  (NOT u.is_suspended) as is_active,
  COALESCE(s.status, 'none') as subscription_status,
  COALESCE(sp.name, 'Free') as plan_name,  -- Changed from 'none' to 'Free' for better UX
  s.trial_ends_at,
  s.current_period_end,
  s.cancel_at_period_end,
  COALESCE(s.card_added, false) as card_added,
  u.last_sign_in_at,  -- Added last sign in time
  COALESCE((SELECT COUNT(*) FROM documents WHERE user_id = u.id), 0) as document_count  -- Count documents
FROM 
  auth.users u
LEFT JOIN 
  public.subscriptions s ON u.id = s.user_id
LEFT JOIN 
  public.subscription_plans sp ON s.plan_id = sp.id;

-- Fix the calculate_api_load function ambiguity
DROP FUNCTION IF EXISTS calculate_api_load();
