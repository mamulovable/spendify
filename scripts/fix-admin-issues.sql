-- Complete Admin Dashboard Fix Script
-- Run this in Supabase SQL Editor to fix common issues

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Fix admin_users table structure
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2. Create missing core tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  plan_type TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  price INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT
);

CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  user_id UUID REFERENCES users(id),
  admin_id UUID REFERENCES admin_users(id),
  ip_address TEXT,
  user_agent TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES admin_users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  user_percentage INTEGER DEFAULT 100,
  allowed_plans TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_configuration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_by UUID REFERENCES admin_users(id),
  last_updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  target_audience TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES admin_users(id),
  last_updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT,
  assigned_to UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_response_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES support_tickets(id),
  message TEXT NOT NULL,
  is_from_user BOOLEAN DEFAULT TRUE,
  admin_id UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  feedback_type TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  original_query TEXT,
  ai_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_processing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processing_started_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS document_processing_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_id UUID REFERENCES document_processing_queue(id),
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  extracted_data JSONB,
  confidence_score FLOAT,
  processing_time INTEGER,
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revenue_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'USD',
  transaction_type TEXT NOT NULL,
  payment_method TEXT,
  status TEXT DEFAULT 'completed',
  is_refunded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appsumo_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  code TEXT UNIQUE NOT NULL,
  plan_type TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS module_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  configuration JSONB DEFAULT '{}',
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Link admin user to auth user if not already linked
UPDATE admin_users 
SET user_id = (SELECT id FROM auth.users WHERE email = admin_users.email)
WHERE user_id IS NULL AND email = 'admin@spendify.com';

-- 4. Update admin role permissions
UPDATE admin_roles 
SET permissions = jsonb_build_object(
  'read', true,
  'write', true,
  'delete', true,
  'manage_users', true,
  'manage_admins', true,
  'system_settings', true,
  'view_dashboard', true,
  'manage_security', true,
  'view_analytics', true,
  'manage_support', true,
  'manage_documents', true,
  'manage_ai', true,
  'manage_settings', true,
  'manage_finance', true,
  'manage_subscriptions', true
)
WHERE name = 'super_admin';

-- 5. Create sample data for testing
-- Sample users
INSERT INTO users (email, created_at) 
SELECT 
  'user' || generate_series || '@example.com',
  NOW() - (generate_series || ' days')::INTERVAL
FROM generate_series(1, 50)
ON CONFLICT (email) DO NOTHING;

-- Sample subscriptions
INSERT INTO subscriptions (user_id, plan_type, status, price, created_at)
SELECT 
  u.id,
  CASE 
    WHEN random() < 0.3 THEN 'free'
    WHEN random() < 0.7 THEN 'basic'
    ELSE 'premium'
  END,
  CASE WHEN random() < 0.9 THEN 'active' ELSE 'canceled' END,
  CASE 
    WHEN random() < 0.3 THEN 0
    WHEN random() < 0.7 THEN 999
    ELSE 1999
  END,
  NOW() - (floor(random() * 30) || ' days')::INTERVAL
FROM users u
LIMIT 40
ON CONFLICT DO NOTHING;

-- Sample security alerts
INSERT INTO security_alerts (alert_type, severity, message, details, created_at)
VALUES 
  ('failed_login_attempt', 'medium', 'Multiple failed login attempts', '{"attempts": 5, "ip": "192.168.1.1"}', NOW() - INTERVAL '2 days'),
  ('suspicious_login_location', 'high', 'Login from unusual location', '{"country": "Unknown", "city": "Unknown"}', NOW() - INTERVAL '1 day'),
  ('permission_violation', 'critical', 'Unauthorized access attempt', '{"resource": "/admin", "method": "GET"}', NOW() - INTERVAL '3 hours'),
  ('brute_force_attempt', 'high', 'Brute force attack detected', '{"attempts": 20, "duration": "10 minutes"}', NOW() - INTERVAL '6 hours'),
  ('api_abuse', 'medium', 'API rate limit exceeded', '{"endpoint": "/api/data", "requests": 150}', NOW() - INTERVAL '12 hours')
ON CONFLICT DO NOTHING;

-- Sample feature flags
INSERT INTO feature_flags (name, description, enabled, user_percentage, allowed_plans)
VALUES 
  ('advanced_analytics', 'Advanced analytics dashboard', true, 100, ARRAY['premium']),
  ('ai_advisor', 'AI financial advisor', true, 50, ARRAY['basic', 'premium']),
  ('dark_mode', 'Dark mode interface', true, 100, ARRAY['free', 'basic', 'premium']),
  ('export_data', 'Data export functionality', true, 100, ARRAY['basic', 'premium']),
  ('beta_features', 'Beta features access', false, 10, ARRAY['premium'])
ON CONFLICT (name) DO NOTHING;

-- Sample app configuration
INSERT INTO app_configuration (key, value, description)
VALUES 
  ('site_name', '"Spendify"', 'Application name'),
  ('maintenance_mode', 'false', 'Maintenance mode toggle'),
  ('max_file_size', '10485760', 'Maximum file upload size in bytes'),
  ('support_email', '"support@spendify.com"', 'Support contact email'),
  ('analytics_enabled', 'true', 'Enable analytics tracking')
ON CONFLICT (key) DO NOTHING;

-- Sample announcements
INSERT INTO app_announcements (title, content, start_date, end_date, target_audience)
VALUES 
  ('Welcome to Spendify!', 'Thank you for joining our financial management platform.', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', ARRAY['all']),
  ('New Feature: AI Advisor', 'Try our new AI-powered financial advisor feature.', NOW(), NOW() + INTERVAL '14 days', ARRAY['basic', 'premium']),
  ('Scheduled Maintenance', 'We will perform maintenance on Sunday from 2-4 AM UTC.', NOW() + INTERVAL '2 days', NOW() + INTERVAL '3 days', ARRAY['all'])
ON CONFLICT DO NOTHING;

-- Sample support tickets
INSERT INTO support_tickets (user_id, subject, status, priority, category, created_at)
SELECT 
  u.id,
  CASE floor(random() * 5)
    WHEN 0 THEN 'Cannot upload bank statement'
    WHEN 1 THEN 'Billing question'
    WHEN 2 THEN 'Feature request'
    WHEN 3 THEN 'Account access issue'
    ELSE 'General inquiry'
  END,
  CASE 
    WHEN random() < 0.3 THEN 'open'
    WHEN random() < 0.6 THEN 'in_progress'
    ELSE 'resolved'
  END,
  CASE 
    WHEN random() < 0.2 THEN 'high'
    WHEN random() < 0.7 THEN 'medium'
    ELSE 'low'
  END,
  CASE floor(random() * 4)
    WHEN 0 THEN 'technical'
    WHEN 1 THEN 'billing'
    WHEN 2 THEN 'account'
    ELSE 'general'
  END,
  NOW() - (floor(random() * 14) || ' days')::INTERVAL
FROM users u
LIMIT 20
ON CONFLICT DO NOTHING;

-- Sample AI feedback
INSERT INTO ai_feedback (user_id, feedback_type, rating, comment, original_query, ai_response, created_at)
SELECT 
  u.id,
  CASE floor(random() * 3)
    WHEN 0 THEN 'accuracy'
    WHEN 1 THEN 'helpfulness'
    ELSE 'relevance'
  END,
  floor(random() * 5) + 1,
  CASE 
    WHEN random() < 0.7 THEN 'The advice was helpful and accurate.'
    ELSE NULL
  END,
  'How can I save more money?',
  'Based on your spending patterns, consider reducing dining out expenses.',
  NOW() - (floor(random() * 30) || ' days')::INTERVAL
FROM users u
LIMIT 30
ON CONFLICT DO NOTHING;

-- Sample document processing
INSERT INTO document_processing_queue (user_id, file_name, file_type, file_size, status, created_at)
SELECT 
  u.id,
  'bank_statement_' || floor(random() * 1000) || '.pdf',
  'pdf',
  floor(random() * 5000000) + 100000,
  CASE 
    WHEN random() < 0.2 THEN 'pending'
    WHEN random() < 0.4 THEN 'processing'
    WHEN random() < 0.8 THEN 'completed'
    ELSE 'failed'
  END,
  NOW() - (floor(random() * 7) || ' days')::INTERVAL
FROM users u
LIMIT 25
ON CONFLICT DO NOTHING;

-- Sample revenue transactions
INSERT INTO revenue_transactions (user_id, subscription_id, amount, transaction_type, created_at)
SELECT 
  s.user_id,
  s.id,
  s.price,
  'subscription',
  s.created_at
FROM subscriptions s
WHERE s.status = 'active' AND s.price > 0
ON CONFLICT DO NOTHING;

-- 6. Enable RLS and create policies
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create basic policies (allow all for admin users)
CREATE POLICY security_alerts_admin_access ON security_alerts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_active = true
  )
);

CREATE POLICY audit_logs_admin_access ON audit_logs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_active = true
  )
);

CREATE POLICY feature_flags_admin_access ON feature_flags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_active = true
  )
);

CREATE POLICY app_configuration_admin_access ON app_configuration FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_active = true
  )
);

CREATE POLICY support_tickets_admin_access ON support_tickets FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_active = true
  )
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Admin dashboard setup completed successfully!';
  RAISE NOTICE 'You can now access all admin dashboard features.';
END $$;