-- Migration: Create Subscription Tables
-- Description: Tables for subscription plans and user subscriptions

-- Subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    interval VARCHAR(20) NOT NULL DEFAULT 'month', -- month, year, etc.
    interval_count INTEGER DEFAULT 1,
    trial_days INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(name)
);

-- Create subscriptions table if it doesn't exist yet
-- Note: Your memories indicate you already have this table with trial_ends_at
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.subscription_plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, canceled, past_due, etc.
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    trial_type VARCHAR(50),
    card_added BOOLEAN DEFAULT false,
    payment_method_id VARCHAR(255),
    customer_id VARCHAR(255),
    subscription_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

-- Subscription transactions
CREATE TABLE IF NOT EXISTS public.subscription_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL, -- succeeded, failed, pending
    payment_method VARCHAR(50), -- card, paypal, etc.
    payment_id VARCHAR(255), -- payment provider ID
    invoice_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

-- Add RLS policies
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_transactions ENABLE ROW LEVEL SECURITY;

-- Public can view active plans
CREATE POLICY subscription_plans_public_policy ON public.subscription_plans
    FOR SELECT
    USING (is_active = true);

-- Users can view their own subscriptions
CREATE POLICY subscriptions_user_policy ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can view their own transactions
CREATE POLICY subscription_transactions_user_policy ON public.subscription_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admin access policies
CREATE POLICY subscription_plans_admin_policy ON public.subscription_plans
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_subscriptions' OR permission = 'view_subscriptions'
    ));

CREATE POLICY subscriptions_admin_policy ON public.subscriptions
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_subscriptions' OR permission = 'view_subscriptions'
    ));

CREATE POLICY subscription_transactions_admin_policy ON public.subscription_transactions
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_subscriptions' OR permission = 'view_subscriptions'
    ));

-- Triggers for updated_at
CREATE TRIGGER update_subscription_plans_timestamp
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_subscriptions_timestamp
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insert sample subscription plans
INSERT INTO public.subscription_plans (
    name, 
    description, 
    amount, 
    currency,
    interval,
    trial_days,
    features,
    is_active
) VALUES 
(
    'Basic',
    'Perfect for occasional statement analysis',
    9.99,
    'USD',
    'month',
    7,
    '["5 documents per month", "Basic analytics", "30-day history", "Email support"]',
    true
),
(
    'Professional',
    'Everything you need for regular financial tracking',
    19.99,
    'USD',
    'month',
    7,
    '["Unlimited documents", "Advanced analytics", "90-day history", "Priority support", "Budget tracking"]',
    true
),
(
    'Enterprise',
    'Complete solution for businesses and financial professionals',
    49.99,
    'USD',
    'month',
    14,
    '["Unlimited documents", "Advanced analytics", "Unlimited history", "Priority support", "Team access", "API access", "Custom categories", "AI financial advisor"]',
    true
);

-- Comments
COMMENT ON TABLE public.subscription_plans IS 'Available subscription plans';
COMMENT ON COLUMN public.subscription_plans.interval IS 'Billing interval (month, year, etc.)';
COMMENT ON COLUMN public.subscription_plans.interval_count IS 'Number of intervals between billings';
COMMENT ON COLUMN public.subscription_plans.features IS 'JSON array of plan features';

COMMENT ON TABLE public.subscriptions IS 'User subscriptions';
COMMENT ON COLUMN public.subscriptions.trial_ends_at IS 'When free trial ends';
COMMENT ON COLUMN public.subscriptions.trial_type IS 'Type of trial';
COMMENT ON COLUMN public.subscriptions.current_period_end IS 'When current billing period ends';
COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS 'Whether subscription will cancel at end of period';

COMMENT ON TABLE public.subscription_transactions IS 'Subscription payment transactions';
COMMENT ON COLUMN public.subscription_transactions.payment_id IS 'Payment provider transaction ID';
COMMENT ON COLUMN public.subscription_transactions.status IS 'Payment status';
