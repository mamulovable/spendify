-- Drop and recreate admin_subscription_view with amount column
DROP VIEW IF EXISTS admin_subscription_view;

CREATE VIEW admin_subscription_view AS
SELECT 
    s.id,
    s.user_id,
    u.email as user_email,
    sp.name as plan_name,
    sp.price as plan_price,
    sp.price as amount,  -- Added this alias for compatibility
    sp.interval as billing_interval,
    s.status,
    s.trial_ends_at,
    s.current_period_end,
    s.cancel_at_period_end,
    s.created_at,
    s.updated_at,
    s.card_added,
    s.trial_type
FROM public.subscriptions s
JOIN auth.users u ON u.id = s.user_id
JOIN public.subscription_plans sp ON sp.id = s.plan_id;
