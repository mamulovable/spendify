-- Create API requests table
CREATE TABLE IF NOT EXISTS api_requests (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint text NOT NULL,
    method text NOT NULL,
    status integer,
    response_time_ms integer,
    created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS api_requests_user_id_idx ON api_requests(user_id);
CREATE INDEX IF NOT EXISTS api_requests_created_at_idx ON api_requests(created_at);
CREATE INDEX IF NOT EXISTS api_requests_endpoint_idx ON api_requests(endpoint);

-- Create function to calculate API load
CREATE OR REPLACE FUNCTION calculate_api_load(
    time_period text DEFAULT '24 hours'
)
RETURNS TABLE (
    total_requests bigint,
    avg_response_time numeric,
    success_rate numeric,
    top_endpoints json
) AS $$
DECLARE
    interval_val interval;
BEGIN
    -- Convert time_period to interval
    CASE time_period
        WHEN '1 hour' THEN interval_val := '1 hour'::interval;
        WHEN '6 hours' THEN interval_val := '6 hours'::interval;
        WHEN '12 hours' THEN interval_val := '12 hours'::interval;
        WHEN '24 hours' THEN interval_val := '24 hours'::interval;
        WHEN '7 days' THEN interval_val := '7 days'::interval;
        WHEN '30 days' THEN interval_val := '30 days'::interval;
        ELSE interval_val := '24 hours'::interval;
    END CASE;

    RETURN QUERY
    WITH metrics AS (
        SELECT
            COUNT(*) AS total,
            COALESCE(AVG(response_time_ms), 0) AS avg_time,
            (SUM(CASE WHEN status >= 200 AND status < 300 THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) * 100) AS success_percent,
            json_agg(
                json_build_object(
                    'endpoint', endpoint,
                    'count', count
                )
            ) AS endpoints
        FROM (
            SELECT
                endpoint,
                COUNT(*) AS count
            FROM api_requests
            WHERE created_at > NOW() - interval_val
            GROUP BY endpoint
            ORDER BY count DESC
            LIMIT 5
        ) top_endpoints,
        api_requests
        WHERE created_at > NOW() - interval_val
    )
    SELECT
        COALESCE(total, 0) AS total_requests,
        COALESCE(avg_time, 0) AS avg_response_time,
        COALESCE(success_percent, 0) AS success_rate,
        COALESCE(endpoints, '[]'::json) AS top_endpoints
    FROM metrics;
END;
$$ LANGUAGE plpgsql;

-- Sample API requests (optional, for testing)
INSERT INTO api_requests (user_id, endpoint, method, status, response_time_ms)
SELECT 
    (SELECT id FROM auth.users LIMIT 1),
    endpoint,
    method,
    status,
    response_time
FROM (
    VALUES
        ('/api/statements', 'GET', 200, 45),
        ('/api/statements', 'POST', 201, 120),
        ('/api/statements/analyze', 'POST', 200, 350),
        ('/api/statements/download', 'GET', 200, 75),
        ('/api/user/profile', 'GET', 200, 30),
        ('/api/subscriptions', 'GET', 200, 40),
        ('/api/admin/metrics', 'GET', 200, 55),
        ('/api/categories', 'GET', 200, 25),
        ('/api/transactions', 'GET', 200, 65),
        ('/api/transactions/search', 'POST', 200, 85)
) AS sample_data(endpoint, method, status, response_time)
ON CONFLICT DO NOTHING;
