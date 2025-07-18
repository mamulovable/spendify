-- User Management Schema

-- Create user activity logs table
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  activity_type TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user metrics table for caching aggregated metrics
CREATE TABLE user_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_date DATE NOT NULL,
  total_users INTEGER NOT NULL DEFAULT 0,
  new_users INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  churned_users INTEGER NOT NULL DEFAULT 0,
  free_plan_users INTEGER NOT NULL DEFAULT 0,
  ltd_solo_users INTEGER NOT NULL DEFAULT 0,
  ltd_pro_users INTEGER NOT NULL DEFAULT 0,
  statement_uploads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique constraint on date
CREATE UNIQUE INDEX user_metrics_date_idx ON user_metrics(metric_date);

-- Create user profile extensions for admin features
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES admin_users(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- Create indexes
CREATE INDEX user_activity_logs_user_id_idx ON user_activity_logs(user_id);
CREATE INDEX user_activity_logs_created_at_idx ON user_activity_logs(created_at);
CREATE INDEX user_activity_logs_activity_type_idx ON user_activity_logs(activity_type);

-- Enable RLS
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY user_activity_logs_admin_select ON user_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY user_metrics_admin_select ON user_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Create function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  user_id UUID,
  activity_type TEXT,
  details JSONB,
  ip_address TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO user_activity_logs (user_id, activity_type, details, ip_address, user_agent)
  VALUES (user_id, activity_type, details, ip_address, user_agent)
  RETURNING id INTO log_id;
  
  -- Update last active timestamp
  UPDATE public.profiles
  SET last_active_at = NOW()
  WHERE id = user_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to suspend user
CREATE OR REPLACE FUNCTION suspend_user(
  user_id UUID,
  reason TEXT,
  admin_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update profile
  UPDATE public.profiles
  SET 
    is_suspended = TRUE,
    suspension_reason = reason,
    suspended_at = NOW(),
    suspended_by = admin_id
  WHERE id = user_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'suspend_user',
    'user',
    user_id::TEXT,
    jsonb_build_object('reason', reason)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to unsuspend user
CREATE OR REPLACE FUNCTION unsuspend_user(
  user_id UUID,
  admin_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update profile
  UPDATE public.profiles
  SET 
    is_suspended = FALSE,
    suspension_reason = NULL,
    suspended_at = NULL,
    suspended_by = NULL
  WHERE id = user_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'unsuspend_user',
    'user',
    user_id::TEXT,
    '{}'::JSONB
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to delete user
CREATE OR REPLACE FUNCTION delete_user(
  user_id UUID,
  admin_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Log admin action before deletion
  PERFORM log_admin_action(
    admin_id,
    'delete_user',
    'user',
    user_id::TEXT,
    '{}'::JSONB
  );
  
  -- Delete user data (implement cascading deletion as needed)
  DELETE FROM user_activity_logs WHERE user_id = delete_user.user_id;
  DELETE FROM public.profiles WHERE id = delete_user.user_id;
  DELETE FROM auth.users WHERE id = delete_user.user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to upgrade user plan
CREATE OR REPLACE FUNCTION upgrade_user_plan(
  user_id UUID,
  new_plan TEXT,
  admin_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update user subscription
  UPDATE public.subscriptions
  SET 
    plan_type = new_plan,
    updated_at = NOW(),
    updated_by = admin_id
  WHERE user_id = upgrade_user_plan.user_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'upgrade_user_plan',
    'user',
    user_id::TEXT,
    jsonb_build_object('new_plan', new_plan)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate daily user metrics
CREATE OR REPLACE FUNCTION calculate_daily_user_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS BOOLEAN AS $$
DECLARE
  total_count INTEGER;
  new_count INTEGER;
  active_count INTEGER;
  churned_count INTEGER;
  free_count INTEGER;
  ltd_solo_count INTEGER;
  ltd_pro_count INTEGER;
  uploads_count INTEGER;
BEGIN
  -- Calculate total users
  SELECT COUNT(*) INTO total_count
  FROM auth.users
  WHERE created_at <= (target_date + INTERVAL '1 day');
  
  -- Calculate new users
  SELECT COUNT(*) INTO new_count
  FROM auth.users
  WHERE created_at::DATE = target_date;
  
  -- Calculate active users
  SELECT COUNT(DISTINCT user_id) INTO active_count
  FROM user_activity_logs
  WHERE created_at::DATE = target_date;
  
  -- Calculate churned users (simplified - users who haven't been active in 30 days)
  SELECT COUNT(*) INTO churned_count
  FROM public.profiles
  WHERE last_active_at < (target_date - INTERVAL '30 days')
  AND NOT is_suspended;
  
  -- Calculate users by plan
  SELECT COUNT(*) INTO free_count
  FROM public.subscriptions
  WHERE plan_type = 'free'
  AND created_at <= (target_date + INTERVAL '1 day');
  
  SELECT COUNT(*) INTO ltd_solo_count
  FROM public.subscriptions
  WHERE plan_type = 'ltd_solo'
  AND created_at <= (target_date + INTERVAL '1 day');
  
  SELECT COUNT(*) INTO ltd_pro_count
  FROM public.subscriptions
  WHERE plan_type = 'ltd_pro'
  AND created_at <= (target_date + INTERVAL '1 day');
  
  -- Calculate statement uploads
  SELECT COUNT(*) INTO uploads_count
  FROM public.document_uploads
  WHERE created_at::DATE = target_date
  AND document_type = 'bank_statement';
  
  -- Insert or update metrics
  INSERT INTO user_metrics (
    metric_date, 
    total_users, 
    new_users, 
    active_users, 
    churned_users,
    free_plan_users,
    ltd_solo_users,
    ltd_pro_users,
    statement_uploads
  )
  VALUES (
    target_date,
    total_count,
    new_count,
    active_count,
    churned_count,
    free_count,
    ltd_solo_count,
    ltd_pro_count,
    uploads_count
  )
  ON CONFLICT (metric_date) DO UPDATE
  SET 
    total_users = EXCLUDED.total_users,
    new_users = EXCLUDED.new_users,
    active_users = EXCLUDED.active_users,
    churned_users = EXCLUDED.churned_users,
    free_plan_users = EXCLUDED.free_plan_users,
    ltd_solo_users = EXCLUDED.ltd_solo_users,
    ltd_pro_users = EXCLUDED.ltd_pro_users,
    statement_uploads = EXCLUDED.statement_uploads,
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin views for user management
CREATE OR REPLACE VIEW admin_user_list AS
SELECT 
  u.id,
  u.email,
  p.full_name,
  s.plan_type,
  u.created_at as signup_date,
  p.last_active_at,
  p.is_suspended,
  p.suspension_reason,
  p.suspended_at,
  (SELECT COUNT(*) FROM user_activity_logs WHERE user_id = u.id) as activity_count,
  (SELECT COUNT(*) FROM public.document_uploads WHERE user_id = u.id) as uploads_count
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.subscriptions s ON u.id = s.user_id
ORDER BY u.created_at DESC;

-- Create view for user activity
CREATE OR REPLACE VIEW admin_user_activity AS
SELECT 
  l.id,
  l.user_id,
  p.full_name as user_name,
  l.activity_type,
  l.details,
  l.ip_address,
  l.user_agent,
  l.created_at
FROM user_activity_logs l
JOIN public.profiles p ON l.user_id = p.id
ORDER BY l.created_at DESC;