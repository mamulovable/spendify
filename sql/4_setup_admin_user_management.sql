-- Create a view for user management that includes subscription info
CREATE OR REPLACE VIEW public.admin_user_view AS
WITH subscription_info AS (
    SELECT 
        s.user_id,
        s.status,
        s.trial_ends_at,
        s.current_period_end,
        s.cancel_at_period_end,
        sp.name as plan_name
    FROM public.subscriptions s
    LEFT JOIN public.subscription_plans sp ON sp.id = s.plan
)
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    COALESCE(s.status, 'none') as subscription_status,
    s.plan_name as subscription_plan,
    s.trial_ends_at,
    s.current_period_end,
    s.cancel_at_period_end,
    (SELECT COUNT(*) FROM public.documents d WHERE d.user_id = u.id) as document_count,
    (SELECT COUNT(*) FROM public.documents d WHERE d.user_id = u.id AND d.status = 'processed') as processed_documents
FROM auth.users u
LEFT JOIN subscription_info s ON s.user_id = u.id;

-- Create function to get user details
CREATE OR REPLACE FUNCTION get_user_details(user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    subscription_status TEXT,
    subscription_plan TEXT,
    trial_ends_at TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    document_count BIGINT,
    processed_documents BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        av.id,
        av.email,
        av.created_at,
        av.last_sign_in_at,
        av.subscription_status,
        av.subscription_plan,
        av.trial_ends_at,
        av.current_period_end,
        av.document_count,
        av.processed_documents
    FROM admin_user_view av
    WHERE av.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the view and function
GRANT SELECT ON admin_user_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_details TO authenticated;
