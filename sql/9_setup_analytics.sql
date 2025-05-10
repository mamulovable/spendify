-- Create tables for analytics data
CREATE TABLE IF NOT EXISTS analytics_events (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    event_data jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    session_start timestamptz NOT NULL,
    session_end timestamptz,
    pages_viewed int DEFAULT 0,
    features_used jsonb,
    device_info jsonb,
    created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_session_start_idx ON user_sessions(session_start);

-- Create analytics view for user growth
CREATE OR REPLACE VIEW analytics_user_growth AS
SELECT
    date_trunc('day', created_at)::date AS date,
    COUNT(*) AS new_users
FROM auth.users
GROUP BY date_trunc('day', created_at)::date
ORDER BY date;

-- Create analytics view for document processing
CREATE OR REPLACE VIEW analytics_document_processing AS
SELECT
    date_trunc('day', created_at)::date AS date,
    COUNT(*) AS documents_processed,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at)))::numeric(10,2) AS avg_processing_time_seconds
FROM documents
WHERE status = 'processed'
GROUP BY date_trunc('day', created_at)::date
ORDER BY date;

-- Create analytics view for revenue
CREATE OR REPLACE VIEW analytics_revenue AS
SELECT
    date_trunc('month', s.created_at)::date AS month,
    COUNT(DISTINCT s.user_id) AS paying_users,
    SUM(p.price) AS monthly_revenue
FROM subscriptions s
JOIN subscription_plans p ON s.plan_id = p.id
WHERE s.status = 'active'
GROUP BY date_trunc('month', s.created_at)::date
ORDER BY month;

-- Create analytics view for feature usage
CREATE OR REPLACE VIEW analytics_feature_usage AS
SELECT
    event_type,
    COUNT(*) AS usage_count,
    COUNT(DISTINCT user_id) AS unique_users
FROM analytics_events
WHERE event_type LIKE 'feature_%'
GROUP BY event_type
ORDER BY usage_count DESC;

-- Create analytics view for trial conversion
CREATE OR REPLACE VIEW analytics_trial_conversion AS
WITH trial_users AS (
    SELECT
        user_id,
        created_at AS trial_start,
        trial_ends_at
    FROM subscriptions
    WHERE trial_ends_at IS NOT NULL
),
conversions AS (
    SELECT
        t.user_id,
        t.trial_start,
        MIN(s.created_at) AS conversion_date
    FROM trial_users t
    JOIN subscriptions s ON t.user_id = s.user_id
    WHERE s.trial_ends_at IS NULL AND s.status = 'active'
    GROUP BY t.user_id, t.trial_start
)
SELECT
    date_trunc('week', t.trial_start)::date AS week,
    COUNT(DISTINCT t.user_id) AS trial_users,
    COUNT(DISTINCT c.user_id) AS converted_users,
    ROUND((COUNT(DISTINCT c.user_id)::numeric / NULLIF(COUNT(DISTINCT t.user_id), 0)) * 100, 2) AS conversion_rate
FROM trial_users t
LEFT JOIN conversions c ON t.user_id = c.user_id
GROUP BY date_trunc('week', t.trial_start)::date
ORDER BY week;

-- Create functions for analytics calculations
CREATE OR REPLACE FUNCTION calculate_retention(p_start_date date, p_end_date date)
RETURNS TABLE (
    cohort_date date,
    total_users bigint,
    week_1 numeric,
    week_2 numeric,
    week_3 numeric,
    week_4 numeric
) AS $$
BEGIN
    RETURN QUERY
    WITH new_users AS (
        SELECT
            u.id AS user_id,
            date_trunc('week', u.created_at)::date AS cohort_date
        FROM auth.users u
        WHERE u.created_at BETWEEN p_start_date AND p_end_date
    ),
    user_activity AS (
        SELECT
            e.user_id,
            date_trunc('week', e.created_at)::date AS activity_week
        FROM analytics_events e
        WHERE e.created_at BETWEEN p_start_date AND (p_end_date + interval '4 weeks')
        GROUP BY e.user_id, date_trunc('week', e.created_at)::date
    )
    SELECT
        nu.cohort_date,
        COUNT(DISTINCT nu.user_id) AS total_users,
        ROUND(100.0 * COUNT(DISTINCT CASE WHEN ua.activity_week = nu.cohort_date + interval '1 week' THEN ua.user_id END) / NULLIF(COUNT(DISTINCT nu.user_id), 0), 2) AS week_1,
        ROUND(100.0 * COUNT(DISTINCT CASE WHEN ua.activity_week = nu.cohort_date + interval '2 weeks' THEN ua.user_id END) / NULLIF(COUNT(DISTINCT nu.user_id), 0), 2) AS week_2,
        ROUND(100.0 * COUNT(DISTINCT CASE WHEN ua.activity_week = nu.cohort_date + interval '3 weeks' THEN ua.user_id END) / NULLIF(COUNT(DISTINCT nu.user_id), 0), 2) AS week_3,
        ROUND(100.0 * COUNT(DISTINCT CASE WHEN ua.activity_week = nu.cohort_date + interval '4 weeks' THEN ua.user_id END) / NULLIF(COUNT(DISTINCT nu.user_id), 0), 2) AS week_4
    FROM new_users nu
    LEFT JOIN user_activity ua ON nu.user_id = ua.user_id
    GROUP BY nu.cohort_date
    ORDER BY nu.cohort_date;
END;
$$ LANGUAGE plpgsql;

-- Grant access to analytics views and functions
GRANT SELECT ON analytics_user_growth TO authenticated;
GRANT SELECT ON analytics_document_processing TO authenticated;
GRANT SELECT ON analytics_revenue TO authenticated;
GRANT SELECT ON analytics_feature_usage TO authenticated;
GRANT SELECT ON analytics_trial_conversion TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_retention TO authenticated;

-- Create RLS policies for analytics data
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can access all analytics events" ON analytics_events
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid()
    ));

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can access all user sessions" ON user_sessions
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid()
    ));
