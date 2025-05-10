-- Add is_super_admin to auth.users if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'auth' 
                   AND table_name = 'users' 
                   AND column_name = 'is_super_admin') THEN
        ALTER TABLE auth.users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;

-- Drop all admin tables first
DROP TABLE IF EXISTS admin_metrics CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS admin_permissions CASCADE;
DROP TABLE IF EXISTS admin_roles CASCADE;

-- Create tables for admin functionality
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role_id UUID NOT NULL REFERENCES admin_roles(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT admin_users_user_id_key UNIQUE (user_id)
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES admin_roles(id),
    permission_id UUID NOT NULL REFERENCES admin_permissions(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT role_permissions_role_permission_key UNIQUE(role_id, permission_id)
);

CREATE TABLE admin_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tables for subscription functionality
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    interval VARCHAR(20) NOT NULL,
    features JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) NOT NULL,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_ends_at TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tables for document processing
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    processed_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id),
    analysis_type VARCHAR(50) NOT NULL,
    analysis_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tables for user preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
    notification_settings JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
    ui_preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create or update subscription plans
INSERT INTO subscription_plans (name, description, price, interval, features, is_active)
VALUES 
    ('Basic', 'Perfect for individuals', 9.99, 'month', 
    '{"max_documents": 10, "ai_analysis": false, "export_formats": ["pdf"], "support_level": "basic"}'::jsonb, 
    true),
    ('Pro', 'Great for small businesses', 19.99, 'month',
    '{"max_documents": 50, "ai_analysis": true, "export_formats": ["pdf", "csv", "excel"], "support_level": "priority"}'::jsonb,
    true),
    ('Enterprise', 'For large organizations', 49.99, 'month',
    '{"max_documents": -1, "ai_analysis": true, "export_formats": ["pdf", "csv", "excel", "api"], "support_level": "dedicated"}'::jsonb,
    true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    interval = EXCLUDED.interval,
    features = EXCLUDED.features,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read for all authenticated users" ON subscription_plans;
DROP POLICY IF EXISTS "Enable users to read their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Enable users to read their own documents" ON documents;
DROP POLICY IF EXISTS "Enable users to read their own document analysis" ON document_analysis;
DROP POLICY IF EXISTS "Enable users to manage their preferences" ON user_preferences;

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Enable read for all authenticated users"
ON subscription_plans FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable users to read their own subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable users to read their own documents"
ON documents FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable users to read their own document analysis"
ON document_analysis FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM documents
    WHERE documents.id = document_id
    AND documents.user_id = auth.uid()
));

CREATE POLICY "Enable users to manage their preferences"
ON user_preferences FOR ALL
TO authenticated
USING (auth.uid() = user_id);
