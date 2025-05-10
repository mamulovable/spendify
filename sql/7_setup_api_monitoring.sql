-- Create API requests table to track API usage
CREATE TABLE IF NOT EXISTS api_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer,
  response_time_ms integer,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS api_requests_created_at_idx ON api_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS api_requests_user_id_idx ON api_requests(user_id);
CREATE INDEX IF NOT EXISTS api_requests_endpoint_idx ON api_requests(endpoint);

-- Create function to calculate current API load
CREATE OR REPLACE FUNCTION calculate_api_load()
RETURNS float
LANGUAGE plpgsql
AS $$
DECLARE
  total_requests integer;
  error_requests integer;
  avg_response_time float;
  max_requests_per_minute integer := 1000; -- Adjust based on your system capacity
  current_load float;
BEGIN
  -- Get metrics for the last minute
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status_code >= 500),
    AVG(response_time_ms)
  INTO
    total_requests,
    error_requests,
    avg_response_time
  FROM api_requests
  WHERE created_at >= NOW() - interval '1 minute';

  -- Calculate load based on:
  -- 1. Request volume (40% weight)
  -- 2. Error rate (30% weight)
  -- 3. Average response time (30% weight)
  -- Higher numbers indicate higher load

  current_load := (
    -- Request volume component (0-40)
    (LEAST(total_requests::float / max_requests_per_minute::float * 100, 100) * 0.4) +
    -- Error rate component (0-30)
    (COALESCE(error_requests::float / NULLIF(total_requests, 0) * 100, 0) * 0.3) +
    -- Response time component (0-30)
    (LEAST(avg_response_time / 1000 * 100, 100) * 0.3)
  );

  RETURN ROUND(current_load::numeric, 2);
END;
$$;

-- Create function to get historical API load
CREATE OR REPLACE FUNCTION get_api_load_history(
  p_interval interval DEFAULT interval '1 hour',
  p_points integer DEFAULT 12
)
RETURNS TABLE (
  timestamp timestamptz,
  load_percentage float,
  request_count integer,
  error_count integer,
  avg_response_time float
)
LANGUAGE plpgsql
AS $$
DECLARE
  interval_size interval;
BEGIN
  interval_size := p_interval / p_points;
  
  RETURN QUERY
  WITH time_series AS (
    SELECT generate_series(
      date_trunc('minute', NOW() - p_interval),
      date_trunc('minute', NOW()),
      interval_size
    ) AS ts
  )
  SELECT
    ts,
    ROUND(COALESCE(
      (COUNT(r.id)::float / GREATEST(EXTRACT(EPOCH FROM interval_size) / 60, 1) / 1000 * 100)::numeric +
      (COUNT(*) FILTER (WHERE r.status_code >= 500)::float / NULLIF(COUNT(*), 0) * 100)::numeric +
      (LEAST(AVG(r.response_time_ms) / 1000 * 100, 100))::numeric,
      0
    ), 2) as load_percentage,
    COUNT(r.id)::integer as request_count,
    COUNT(*) FILTER (WHERE r.status_code >= 500)::integer as error_count,
    ROUND(AVG(r.response_time_ms)::numeric, 2) as avg_response_time
  FROM time_series ts
  LEFT JOIN api_requests r ON r.created_at >= ts
    AND r.created_at < ts + interval_size
  GROUP BY ts
  ORDER BY ts DESC;
END;
$$;

-- Grant access to authenticated users
GRANT SELECT ON api_requests TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_api_load TO authenticated;
GRANT EXECUTE ON FUNCTION get_api_load_history TO authenticated;

-- Enable RLS
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY api_requests_policy ON api_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
    )
  );
