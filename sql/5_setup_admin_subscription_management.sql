-- Create a view for subscription management
CREATE OR REPLACE VIEW admin_subscription_view AS
SELECT 
    s.id,
    s.user_id,
    u.email as user_email,
    sp.name as plan_name,
    sp.price as plan_price,
    sp.interval as billing_interval,
    s.status,
    s.trial_ends_at,
    s.current_period_end,
    s.cancel_at_period_end,
    s.created_at,
    s.updated_at
FROM public.subscriptions s
JOIN auth.users u ON u.id = s.user_id
JOIN public.subscription_plans sp ON sp.id = s.plan_id;

-- Function to update subscription status
CREATE OR REPLACE FUNCTION update_subscription_status(
    subscription_id UUID,
    new_status TEXT,
    admin_user_id UUID
)
RETURNS public.subscriptions AS $$
DECLARE
    updated_subscription public.subscriptions;
BEGIN
    -- Check if admin user has permission
    IF NOT EXISTS (
        SELECT 1 FROM admin_users au 
        JOIN role_permissions rp ON rp.role_id = au.role_id
        JOIN admin_permissions ap ON ap.id = rp.permission_id
        WHERE au.user_id = admin_user_id 
        AND ap.name = 'manage_subscriptions'
    ) THEN
        RAISE EXCEPTION 'User does not have permission to manage subscriptions';
    END IF;

    -- Update subscription
    UPDATE public.subscriptions
    SET 
        status = new_status,
        updated_at = NOW()
    WHERE id = subscription_id
    RETURNING * INTO updated_subscription;

    RETURN updated_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel subscription at period end
CREATE OR REPLACE FUNCTION cancel_subscription(
    subscription_id UUID,
    admin_user_id UUID
)
RETURNS public.subscriptions AS $$
DECLARE
    updated_subscription public.subscriptions;
BEGIN
    -- Check if admin user has permission
    IF NOT EXISTS (
        SELECT 1 FROM admin_users au 
        JOIN role_permissions rp ON rp.role_id = au.role_id
        JOIN admin_permissions ap ON ap.id = rp.permission_id
        WHERE au.user_id = admin_user_id 
        AND ap.name = 'manage_subscriptions'
    ) THEN
        RAISE EXCEPTION 'User does not have permission to manage subscriptions';
    END IF;

    -- Update subscription
    UPDATE public.subscriptions
    SET 
        cancel_at_period_end = true,
        updated_at = NOW()
    WHERE id = subscription_id
    RETURNING * INTO updated_subscription;

    RETURN updated_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the view and functions
GRANT SELECT ON admin_subscription_view TO authenticated;
GRANT EXECUTE ON FUNCTION update_subscription_status TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_subscription TO authenticated;
