-- Create a view for admin dashboard metrics
CREATE OR REPLACE VIEW admin_dashboard_metrics AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN last_sign_in_at >= NOW() - INTERVAL '30 days' THEN 1 END) as active_users,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users,
    (SELECT COUNT(*) FROM public.subscriptions) as active_subscriptions,
    (SELECT COUNT(*) FROM public.documents WHERE status = 'processed') as documents_processed,
    0 as monthly_revenue
FROM auth.users;

-- Insert initial metrics
INSERT INTO public.admin_metrics (name, value, user_id)
SELECT 
    'dashboard_metrics' as name,
    jsonb_build_object(
        'total_users', total_users,
        'active_subscriptions', active_subscriptions,
        'documents_processed', documents_processed,
        'monthly_revenue', monthly_revenue,
        'user_growth', new_users,
        'processing_success', COALESCE(
            ROUND(
                (SELECT COUNT(*)::float * 100 
                FROM public.documents 
                WHERE status = 'processed') / 
                NULLIF((SELECT COUNT(*)::float FROM public.documents), 0)
            ),
            0
        )
    ) as value,
    (SELECT id FROM auth.users WHERE email = 'admin@spendify.com')
FROM admin_dashboard_metrics
ON CONFLICT (name) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- Grant access to the view
GRANT SELECT ON admin_dashboard_metrics TO authenticated;
