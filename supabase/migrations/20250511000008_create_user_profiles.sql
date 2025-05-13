-- Migration: Create User Profiles Table
-- Description: Extended user information beyond auth.users table

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    display_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    company VARCHAR(255),
    job_title VARCHAR(255),
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 1,
    onboarding_answers JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    last_login TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    referral_source VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own profiles
CREATE POLICY user_profiles_self_policy ON public.user_profiles
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY user_profiles_admin_policy ON public.user_profiles
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_users' OR permission = 'view_users'
    ));

-- Trigger to update the updated_at field
CREATE TRIGGER update_user_profiles_timestamp
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Comments
COMMENT ON TABLE public.user_profiles IS 'Extended user information beyond auth.users table';
COMMENT ON COLUMN public.user_profiles.id IS 'References the auth.users id';
COMMENT ON COLUMN public.user_profiles.onboarding_completed IS 'Whether the user has completed onboarding';
COMMENT ON COLUMN public.user_profiles.onboarding_step IS 'Current onboarding step';
COMMENT ON COLUMN public.user_profiles.onboarding_answers IS 'Answers collected during onboarding';
COMMENT ON COLUMN public.user_profiles.preferences IS 'User preferences and settings';
COMMENT ON COLUMN public.user_profiles.last_login IS 'When the user last logged in';
COMMENT ON COLUMN public.user_profiles.login_count IS 'How many times the user has logged in';
