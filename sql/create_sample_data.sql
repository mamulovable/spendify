-- Insert sample subscription plans if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Basic') THEN
        INSERT INTO public.subscription_plans (name, price, interval)
        VALUES ('Basic', 5.99, 'month');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Pro') THEN
        INSERT INTO public.subscription_plans (name, price, interval)
        VALUES ('Pro', 9.99, 'month');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Enterprise') THEN
        INSERT INTO public.subscription_plans (name, price, interval)
        VALUES ('Enterprise', 19.99, 'month');
    END IF;
END
$$;

-- Get some user IDs
DO $$
DECLARE
    basic_plan_id uuid;
    pro_plan_id uuid;
    enterprise_plan_id uuid;
    user_ids uuid[];
    user_id uuid;
    i int;
BEGIN
    -- Get plan IDs
    SELECT id INTO basic_plan_id FROM subscription_plans WHERE name = 'Basic' LIMIT 1;
    SELECT id INTO pro_plan_id FROM subscription_plans WHERE name = 'Pro' LIMIT 1;
    SELECT id INTO enterprise_plan_id FROM subscription_plans WHERE name = 'Enterprise' LIMIT 1;
    
    -- Get some user IDs (first 3)
    SELECT array_agg(id) INTO user_ids FROM auth.users LIMIT 3;
    
    -- Create sample subscriptions for each user
    FOR i IN 1..array_length(user_ids, 1) LOOP
        -- Skip if already has a subscription
        IF NOT EXISTS (SELECT 1 FROM subscriptions WHERE user_id = user_ids[i]) THEN
            INSERT INTO subscriptions (
                user_id, 
                plan_id, 
                status, 
                current_period_end, 
                trial_ends_at, 
                card_added
            )
            VALUES (
                user_ids[i],
                CASE 
                    WHEN i = 1 THEN basic_plan_id
                    WHEN i = 2 THEN pro_plan_id
                    ELSE enterprise_plan_id
                END,
                'active',
                NOW() + INTERVAL '30 days',
                NULL,
                true
            );
        END IF;
    END LOOP;
    
    -- Create sample document data
    FOR i IN 1..array_length(user_ids, 1) LOOP
        FOR j IN 1..i*2 LOOP  -- Each user gets a different number of documents
            INSERT INTO documents (
                user_id,
                file_name,
                file_type,
                file_size,
                status
            )
            VALUES (
                user_ids[i],
                'bank_statement_' || j || '.pdf',
                'application/pdf',
                (random() * 1000000)::integer,
                'processed'
            );
        END LOOP;
    END LOOP;
END $$;

-- Fix the ambiguous endpoint column in calculate_api_load function
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
    WITH endpoint_counts AS (
        SELECT
            api.endpoint,
            COUNT(*) AS count
        FROM api_requests api
        WHERE api.created_at > NOW() - interval_val
        GROUP BY api.endpoint
        ORDER BY count DESC
        LIMIT 5
    ),
    metrics AS (
        SELECT
            COUNT(*) AS total,
            COALESCE(AVG(api.response_time_ms), 0) AS avg_time,
            (SUM(CASE WHEN api.status >= 200 AND api.status < 300 THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) * 100) AS success_percent,
            json_agg(
                json_build_object(
                    'endpoint', ec.endpoint,
                    'count', ec.count
                )
            ) AS endpoints
        FROM endpoint_counts ec
        CROSS JOIN api_requests api
        WHERE api.created_at > NOW() - interval_val
    )
    SELECT
        COALESCE(total, 0) AS total_requests,
        COALESCE(avg_time, 0) AS avg_response_time,
        COALESCE(success_percent, 0) AS success_rate,
        COALESCE(endpoints, '[]'::json) AS top_endpoints
    FROM metrics;
END;
$$ LANGUAGE plpgsql;
