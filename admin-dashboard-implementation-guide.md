# Admin Dashboard Implementation Guide

## Current Status
✅ Admin authentication is working
❌ Data loading issues on various pages
❌ Some pages show no data or errors

## Step-by-Step Fix Guide

### Step 1: Run the Complete Database Setup

Copy and paste the following SQL script into your Supabase SQL Editor and run it:

```sql
-- Complete Admin Dashboard Database Setup
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create security_alerts table
CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  user_id UUID,
  admin_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  user_percentage INTEGER DEFAULT 100,
  allowed_plans TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create app_config table
CREATE TABLE IF NOT EXISTS app_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create app_announcements table
CREATE TABLE IF NOT EXISTS app_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  target_audience TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT DEFAULT 'general',
  assigned_to UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  last_response_at TIMESTAMPTZ
);

-- Create ticket_messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id),
  message TEXT NOT NULL,
  is_from_user BOOLEAN NOT NULL DEFAULT TRUE,
  admin_id UUID REFERENCES admin_users(id),
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ai_feedback table
CREATE TABLE IF NOT EXISTS ai_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  feedback_type TEXT NOT NULL DEFAULT 'general',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  original_query TEXT,
  ai_response TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create document_processing_queue table
CREATE TABLE IF NOT EXISTS document_processing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ
);

-- Create document_processing_results table
CREATE TABLE IF NOT EXISTS document_processing_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_id UUID NOT NULL REFERENCES document_processing_queue(id),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  extracted_data JSONB,
  confidence_score FLOAT,
  processing_time INTEGER,
  model_version TEXT DEFAULT 'v1.0.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create revenue_transactions table
CREATE TABLE IF NOT EXISTS revenue_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  subscription_id UUID,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription', 'one_time', 'refund')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  plan_type TEXT,
  is_refunded BOOLEAN NOT NULL DEFAULT FALSE,
  refund_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'basic', 'premium', 'business')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create appsumo_redemptions table
CREATE TABLE IF NOT EXISTS appsumo_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'refunded')),
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_metrics table
CREATE TABLE IF NOT EXISTS user_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_date DATE NOT NULL UNIQUE,
  total_users INTEGER NOT NULL DEFAULT 0,
  new_users INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  churned_users INTEGER NOT NULL DEFAULT 0,
  paid_users INTEGER NOT NULL DEFAULT 0,
  free_users INTEGER NOT NULL DEFAULT 0,
  trial_users INTEGER NOT NULL DEFAULT 0
);

-- Create module_configurations table
CREATE TABLE IF NOT EXISTS module_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_name TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  configuration JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create admin_activity_logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ai_model_versions table
CREATE TABLE IF NOT EXISTS ai_model_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create training_data table
CREATE TABLE IF NOT EXISTS training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_type TEXT NOT NULL,
  source_type TEXT NOT NULL,
  content JSONB NOT NULL,
  labels JSONB DEFAULT '{}',
  quality_score FLOAT,
  is_validated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appsumo_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_data ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for admin access
CREATE POLICY admin_access_audit_logs ON audit_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_security_alerts ON security_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_feature_flags ON feature_flags FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_app_config ON app_config FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_app_announcements ON app_announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_support_tickets ON support_tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_ticket_messages ON ticket_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_ai_feedback ON ai_feedback FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_document_processing_queue ON document_processing_queue FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_document_processing_results ON document_processing_results FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_revenue_transactions ON revenue_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_subscriptions ON subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_appsumo_redemptions ON appsumo_redemptions FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_user_activity_logs ON user_activity_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_user_metrics ON user_metrics FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_module_configurations ON module_configurations FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_admin_activity_logs ON admin_activity_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_ai_model_versions ON ai_model_versions FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

CREATE POLICY admin_access_training_data ON training_data FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Insert sample data for testing
-- Sample users (if users table doesn't exist, create it)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert sample users
INSERT INTO users (email, display_name) VALUES
('user1@example.com', 'John Doe'),
('user2@example.com', 'Jane Smith'),
('user3@example.com', 'Bob Johnson'),
('user4@example.com', 'Alice Brown'),
('user5@example.com', 'Charlie Wilson')
ON CONFLICT (email) DO NOTHING;

-- Insert sample security alerts
INSERT INTO security_alerts (alert_type, severity, message, details, ip_address, created_at) VALUES
('failed_login_attempt', 'medium', 'Multiple failed login attempts detected', '{"attempts": 5, "user_agent": "Mozilla/5.0"}', '192.168.1.100', NOW() - INTERVAL '2 hours'),
('suspicious_login_location', 'high', 'Login from unusual location', '{"country": "Unknown", "expected": "United States"}', '203.0.113.1', NOW() - INTERVAL '1 day'),
('permission_violation', 'critical', 'Unauthorized access attempt to admin area', '{"resource": "/admin/users", "method": "POST"}', '198.51.100.1', NOW() - INTERVAL '3 hours'),
('brute_force_attempt', 'high', 'Brute force attack detected', '{"attempts": 15, "timeframe": "5 minutes"}', '198.51.100.2', NOW() - INTERVAL '6 hours'),
('api_abuse', 'medium', 'API rate limit exceeded', '{"endpoint": "/api/data", "requests": 200}', '198.51.100.3', NOW() - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;

-- Insert sample feature flags
INSERT INTO feature_flags (name, description, enabled, user_percentage, allowed_plans) VALUES
('advanced_analytics', 'Enable advanced analytics features', true, 100, ARRAY['premium', 'business']),
('ai_advisor', 'AI-powered financial advisor', true, 75, ARRAY['basic', 'premium', 'business']),
('dark_mode', 'Enable dark mode UI', true, 100, ARRAY['free', 'basic', 'premium', 'business']),
('export_data', 'Allow data export functionality', true, 100, ARRAY['basic', 'premium', 'business']),
('beta_features', 'Access to beta features', false, 10, ARRAY['premium', 'business'])
ON CONFLICT (name) DO NOTHING;

-- Insert sample app config
INSERT INTO app_config (key, value, description) VALUES
('site_settings', '{"site_name": "Spendify", "maintenance_mode": false, "max_file_size": 10485760}', 'General site settings'),
('email_settings', '{"smtp_host": "smtp.example.com", "smtp_port": 587, "from_email": "noreply@spendify.com"}', 'Email configuration'),
('api_settings', '{"rate_limit": 100, "timeout": 30, "version": "v1"}', 'API configuration'),
('security_settings', '{"session_timeout": 3600, "password_min_length": 8, "require_2fa": false}', 'Security configuration'),
('payment_settings', '{"currency": "USD", "tax_rate": 0.08, "trial_days": 14}', 'Payment and billing settings')
ON CONFLICT (key) DO NOTHING;

-- Insert sample announcements
INSERT INTO app_announcements (title, content, start_date, end_date, target_audience, is_active) VALUES
('New Feature: AI Advisor', 'We''ve launched our new AI Financial Advisor feature! Get personalized financial advice based on your spending patterns.', NOW() - INTERVAL '5 days', NOW() + INTERVAL '10 days', ARRAY['all'], true),
('Scheduled Maintenance', 'We will be performing scheduled maintenance on our servers this weekend. Expect brief service interruptions.', NOW() + INTERVAL '2 days', NOW() + INTERVAL '3 days', ARRAY['all'], true),
('Premium Plan Discount', 'Get 20% off our Premium plan for a limited time! Upgrade now and save.', NOW(), NOW() + INTERVAL '14 days', ARRAY['free', 'basic'], true),
('New Export Feature', 'You can now export your financial data in multiple formats including CSV and PDF.', NOW() - INTERVAL '10 days', NOW() + INTERVAL '5 days', ARRAY['basic', 'premium', 'business'], true)
ON CONFLICT DO NOTHING;

-- Insert sample subscriptions
INSERT INTO subscriptions (user_id, plan_type, status, current_period_start, current_period_end, price) 
SELECT 
  id,
  CASE WHEN random() < 0.3 THEN 'free' WHEN random() < 0.6 THEN 'basic' WHEN random() < 0.9 THEN 'premium' ELSE 'business' END,
  CASE WHEN random() < 0.9 THEN 'active' ELSE 'canceled' END,
  NOW() - INTERVAL '15 days',
  NOW() + INTERVAL '15 days',
  CASE 
    WHEN random() < 0.3 THEN 0 
    WHEN random() < 0.6 THEN 999 
    WHEN random() < 0.9 THEN 1999 
    ELSE 4999 
  END
FROM users
ON CONFLICT DO NOTHING;

-- Insert sample revenue transactions
INSERT INTO revenue_transactions (user_id, amount, currency, payment_method, transaction_type, status, plan_type)
SELECT 
  s.user_id,
  s.price / 100.0,
  'USD',
  CASE WHEN random() < 0.7 THEN 'card' ELSE 'paypal' END,
  'subscription',
  'completed',
  s.plan_type
FROM subscriptions s
WHERE s.status = 'active' AND s.price > 0
ON CONFLICT DO NOTHING;

-- Insert sample support tickets
INSERT INTO support_tickets (user_id, subject, status, priority, category)
SELECT 
  id,
  CASE floor(random() * 5)
    WHEN 0 THEN 'Cannot upload bank statement'
    WHEN 1 THEN 'Subscription billing issue'
    WHEN 2 THEN 'Feature request: Dark mode'
    WHEN 3 THEN 'Account access problem'
    ELSE 'General question about features'
  END,
  CASE WHEN random() < 0.3 THEN 'open' WHEN random() < 0.6 THEN 'in_progress' ELSE 'closed' END,
  CASE WHEN random() < 0.2 THEN 'high' WHEN random() < 0.7 THEN 'medium' ELSE 'low' END,
  CASE floor(random() * 4)
    WHEN 0 THEN 'technical'
    WHEN 1 THEN 'billing'
    WHEN 2 THEN 'account'
    ELSE 'feature'
  END
FROM users
LIMIT 10
ON CONFLICT DO NOTHING;

-- Insert sample ticket messages
INSERT INTO ticket_messages (ticket_id, message, is_from_user)
SELECT 
  id,
  'I need help with this issue. Can you please assist me?',
  true
FROM support_tickets
ON CONFLICT DO NOTHING;

-- Insert sample AI feedback
INSERT INTO ai_feedback (user_id, feedback_type, rating, comment, original_query, ai_response)
SELECT 
  id,
  CASE floor(random() * 3)
    WHEN 0 THEN 'accuracy'
    WHEN 1 THEN 'relevance'
    ELSE 'helpfulness'
  END,
  floor(random() * 5) + 1,
  CASE WHEN random() < 0.7 THEN 
    CASE floor(random() * 3)
      WHEN 0 THEN 'The advice was helpful but could be more specific.'
      WHEN 1 THEN 'Great financial insights, thank you!'
      ELSE 'I was expecting more detailed analysis.'
    END
  ELSE NULL END,
  'How can I save more money each month?',
  'Based on your spending patterns, you could save approximately $250 per month by reducing restaurant expenses and subscription services.'
FROM users
LIMIT 15
ON CONFLICT DO NOTHING;

-- Insert sample document processing queue
INSERT INTO document_processing_queue (user_id, file_name, file_type, file_size, status, priority)
SELECT 
  id,
  'bank_statement_' || floor(random() * 1000) || '.pdf',
  'pdf',
  floor(random() * 5000000 + 100000),
  CASE 
    WHEN random() < 0.2 THEN 'pending' 
    WHEN random() < 0.4 THEN 'processing' 
    WHEN random() < 0.8 THEN 'completed' 
    ELSE 'failed' 
  END,
  CASE WHEN random() < 0.2 THEN 'high' ELSE 'normal' END
FROM users
LIMIT 20
ON CONFLICT DO NOTHING;

-- Insert sample user metrics
INSERT INTO user_metrics (metric_date, total_users, new_users, active_users, churned_users, paid_users, free_users, trial_users)
SELECT 
  CURRENT_DATE - (i || ' days')::INTERVAL,
  100 + i * 2,
  floor(random() * 10) + 1,
  80 + floor(random() * 20),
  floor(random() * 3),
  30 + floor(random() * 10),
  70 + floor(random() * 20),
  floor(random() * 5)
FROM generate_series(0, 30) AS i
ON CONFLICT (metric_date) DO NOTHING;

-- Insert sample module configurations
INSERT INTO module_configurations (module_name, is_enabled, configuration) VALUES
('ai_advisor', true, '{"model_version": "v2.1", "confidence_threshold": 0.8, "max_suggestions": 5}'),
('document_processing', true, '{"max_file_size": 10485760, "supported_formats": ["pdf", "jpg", "png"], "ocr_enabled": true}'),
('analytics', true, '{"retention_days": 365, "enable_real_time": true, "cache_duration": 3600}'),
('notifications', true, '{"email_enabled": true, "push_enabled": false, "sms_enabled": false}'),
('security', true, '{"session_timeout": 3600, "max_login_attempts": 5, "lockout_duration": 900}')
ON CONFLICT (module_name) DO NOTHING;

-- Output success message
DO $$
BEGIN
  RAISE NOTICE 'Admin dashboard database setup completed successfully with sample data!';
  RAISE NOTICE 'You can now access all admin dashboard features.';
END $$;
```

### Step 2: Verify the Setup

After running the SQL script, check if the tables were created successfully:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'audit_logs', 'security_alerts', 'feature_flags', 'app_config', 
  'app_announcements', 'support_tickets', 'ticket_messages', 
  'ai_feedback', 'document_processing_queue', 'document_processing_results',
  'revenue_transactions', 'subscriptions', 'appsumo_redemptions',
  'user_activity_logs', 'user_metrics', 'module_configurations'
)
ORDER BY table_name;
```

### Step 3: Test Each Admin Page

Visit each admin page and check if data loads correctly:

1. **Dashboard** (`/admin`) - Should show overview metrics
2. **Users** (`/admin/users`) - Should show user list
3. **Analytics** (`/admin/analytics`) - Should show charts and metrics
4. **Revenue** (`/admin/revenue`) - Should show revenue data
5. **Subscriptions** (`/admin/subscriptions`) - Should show subscription data
6. **Support Tickets** (`/admin/support/tickets`) - Should show tickets
7. **Security Alerts** (`/admin/security/alerts`) - Should show security alerts
8. **Feature Flags** (`/admin/settings/features`) - Should show feature flags
9. **App Config** (`/admin/settings/config`) - Should show configuration
10. **Announcements** (`/admin/settings/announcements`) - Should show announcements

### Step 4: Common Issues and Solutions

#### Issue: "Permission denied for table"
**Solution:** The RLS policies might be too restrictive. Run this to temporarily disable RLS:
```sql
-- Temporarily disable RLS for testing (NOT recommended for production)
ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;
```

#### Issue: "Column does not exist"
**Solution:** Check if the table structure matches what the code expects. You might need to add missing columns.

#### Issue: "Function does not exist"
**Solution:** Some pages might use database functions that don't exist. Check the console errors for specific function names.

### Step 5: Enable Logging for Debugging

Add this to your browser console to see detailed API calls:
```javascript
// Enable detailed logging
localStorage.setItem('debug', 'supabase:*');
```

### Step 6: Check Browser Console

When a page fails to load:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages
4. Note any "404", "500", or database errors

## Next Steps

1. Run the complete SQL script above
2. Test each admin page
3. Report any specific errors you encounter
4. We can then create targeted fixes for remaining issues

The script above should resolve most data loading issues by creating all necessary tables with sample data.
```

Now let me also create a quick diagnostic script to help identify specific issues:

<function_calls>
<invoke name="fsWrite">
<parameter name="path">scripts/diagnose-admin-issues.sqln Dashboard Diagnostic Script
-- Run this in Supabase SQL Editor to diagnose issues

-- Check if admin user is properly set up
SELECT 
  'Admin User Check' as check_type,
  CASE 
    WHEN COUNT(*) = 0 THEN 'FAIL: No admin users found'
    WHEN COUNT(*) > 0 AND COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) = 0 THEN 'FAIL: Admin users not linked to auth'
    WHEN COUNT(*) > 0 AND COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) > 0 THEN 'PASS: Admin users properly configured'
    ELSE 'UNKNOWN'
  END as status,
  COUNT(*) as total_admin_users,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as linked_admin_users
FROM admin_users;

-- Check if required tables exist
SELECT 
  'Required Tables Check' as check_type,
  string_agg(
    CASE 
      WHEN table_name IS NOT NULL THEN table_name || ' ✓'
      ELSE 'MISSING'
    END, 
    ', '
  ) as status
FROM (
  SELECT unnest(ARRAY[
    'audit_logs', 'security_alerts', 'feature_flags', 'app_config',
    'app_announcements', 'support_tickets', 'ai_feedback', 
    'document_processing_queue', 'revenue_transactions', 'subscriptions'
  ]) as required_table
) req
LEFT JOIN information_schema.tables t ON t.table_name = req.required_table AND t.table_schema = 'public';

-- Check sample data availability
SELECT 
  'Sample Data Check' as check_type,
  json_build_object(
    'security_alerts', (SELECT COUNT(*) FROM security_alerts),
    'feature_flags', (SELECT COUNT(*) FROM feature_flags),
    'app_config', (SELECT COUNT(*) FROM app_config),
    'support_tickets', (SELECT COUNT(*) FROM support_tickets),
    'subscriptions', (SELECT COUNT(*) FROM subscriptions)
  ) as data_counts;

-- Check RLS policies
SELECT 
  'RLS Policies Check' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  COUNT(*) as policy_count
FROM pg_policies p
RIGHT JOIN pg_tables t ON p.tablename = t.tablename AND p.schemaname = t.schemaname
WHERE t.schemaname = 'public' 
AND t.tablename IN ('audit_logs', 'security_alerts', 'feature_flags', 'app_config')
GROUP BY schemaname, tablename, rowsecurity
ORDER BY tablename;

-- Check admin permissions
SELECT 
  'Admin Permissions Check' as check_type,
  ar.name as role_name,
  ar.permissions,
  COUNT(au.id) as users_with_role
FROM admin_roles ar
LEFT JOIN admin_users au ON au.role_id = ar.id
GROUP BY ar.id, ar.name, ar.permissions
ORDER BY ar.name;

-- Check for common issues
SELECT 
  'Common Issues Check' as check_type,
  json_build_object(
    'admin_users_without_user_id', (
      SELECT COUNT(*) FROM admin_users WHERE user_id IS NULL
    ),
    'inactive_admin_users', (
      SELECT COUNT(*) FROM admin_users WHERE is_active = false
    ),
    'auth_users_without_admin', (
      SELECT COUNT(*) 
      FROM auth.users au 
      LEFT JOIN admin_users adu ON adu.user_id = au.id 
      WHERE adu.id IS NULL AND au.email LIKE '%admin%'
    )
  ) as issue_counts;

-- Final recommendations
SELECT 
  'Recommendations' as check_type,
  CASE 
    WHEN (SELECT COUNT(*) FROM admin_users WHERE user_id IS NULL) > 0 THEN 
      'Run: UPDATE admin_users SET user_id = (SELECT id FROM auth.users WHERE email = admin_users.email);'
    WHEN (SELECT COUNT(*) FROM security_alerts) = 0 THEN 
      'Run the sample data insertion script to populate tables with test data'
    WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') = 0 THEN
      'Create users table: CREATE TABLE users (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), email TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());'
    ELSE 
      'Admin dashboard should be working correctly'
  END as recommendation;