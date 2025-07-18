-- Analytics and Revenue Tracking Schema

-- Create revenue transactions table
CREATE TABLE revenue_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  plan_type TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  is_refunded BOOLEAN NOT NULL DEFAULT FALSE,
  refund_date TIMESTAMPTZ,
  refund_reason TEXT,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create AppSumo redemption tracking table
CREATE TABLE appsumo_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  code TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  is_upgrade BOOLEAN NOT NULL DEFAULT FALSE,
  previous_plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create revenue metrics table for caching aggregated metrics
CREATE TABLE revenue_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_date DATE NOT NULL,
  daily_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  mrr DECIMAL(12, 2) NOT NULL DEFAULT 0,
  arr DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ltv_average DECIMAL(12, 2) NOT NULL DEFAULT 0,
  free_plan_conversions INTEGER NOT NULL DEFAULT 0,
  appsumo_redemptions INTEGER NOT NULL DEFAULT 0,
  refunds_count INTEGER NOT NULL DEFAULT 0,
  refunds_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique constraint on date
CREATE UNIQUE INDEX revenue_metrics_date_idx ON revenue_metrics(metric_date);

-- Create indexes
CREATE INDEX revenue_transactions_user_id_idx ON revenue_transactions(user_id);
CREATE INDEX revenue_transactions_transaction_date_idx ON revenue_transactions(transaction_date);
CREATE INDEX revenue_transactions_plan_type_idx ON revenue_transactions(plan_type);
CREATE INDEX appsumo_redemptions_user_id_idx ON appsumo_redemptions(user_id);
CREATE INDEX appsumo_redemptions_code_idx ON appsumo_redemptions(code);
CREATE INDEX appsumo_redemptions_redeemed_at_idx ON appsumo_redemptions(redeemed_at);

-- Enable RLS
ALTER TABLE revenue_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appsumo_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY revenue_transactions_admin_select ON revenue_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY appsumo_redemptions_admin_select ON appsumo_redemptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY revenue_metrics_admin_select ON revenue_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Create function to record revenue transaction
CREATE OR REPLACE FUNCTION record_revenue_transaction(
  user_id UUID,
  amount DECIMAL,
  plan_type TEXT,
  payment_method TEXT,
  payment_reference TEXT DEFAULT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  details JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  transaction_id UUID;
BEGIN
  INSERT INTO revenue_transactions (
    user_id,
    amount,
    plan_type,
    payment_method,
    payment_reference,
    is_recurring,
    details
  )
  VALUES (
    user_id,
    amount,
    plan_type,
    payment_method,
    payment_reference,
    is_recurring,
    details
  )
  RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to record AppSumo redemption
CREATE OR REPLACE FUNCTION record_appsumo_redemption(
  user_id UUID,
  code TEXT,
  plan_type TEXT,
  ip_address TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  is_upgrade BOOLEAN DEFAULT FALSE,
  previous_plan TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  redemption_id UUID;
BEGIN
  INSERT INTO appsumo_redemptions (
    user_id,
    code,
    plan_type,
    ip_address,
    user_agent,
    is_upgrade,
    previous_plan
  )
  VALUES (
    user_id,
    code,
    plan_type,
    ip_address,
    user_agent,
    is_upgrade,
    previous_plan
  )
  RETURNING id INTO redemption_id;
  
  -- Update user subscription
  UPDATE public.subscriptions
  SET 
    plan_type = plan_type,
    is_lifetime = TRUE,
    updated_at = NOW()
  WHERE user_id = record_appsumo_redemption.user_id;
  
  RETURN redemption_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process refund
CREATE OR REPLACE FUNCTION process_refund(
  transaction_id UUID,
  reason TEXT,
  admin_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update transaction
  UPDATE revenue_transactions
  SET 
    is_refunded = TRUE,
    refund_date = NOW(),
    refund_reason = reason,
    updated_at = NOW()
  WHERE id = transaction_id;
  
  -- Log admin action
  PERFORM log_admin_action(
    admin_id,
    'process_refund',
    'transaction',
    transaction_id::TEXT,
    jsonb_build_object('reason', reason)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate daily revenue metrics
CREATE OR REPLACE FUNCTION calculate_daily_revenue_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS BOOLEAN AS $$
DECLARE
  daily_rev DECIMAL(12, 2);
  monthly_rev DECIMAL(12, 2);
  annual_rev DECIMAL(12, 2);
  avg_ltv DECIMAL(12, 2);
  conversions INTEGER;
  redemptions INTEGER;
  refunds_cnt INTEGER;
  refunds_amt DECIMAL(12, 2);
BEGIN
  -- Calculate daily revenue
  SELECT COALESCE(SUM(amount), 0) INTO daily_rev
  FROM revenue_transactions
  WHERE transaction_date::DATE = target_date
  AND NOT is_refunded;
  
  -- Calculate MRR (all recurring revenue in the last 30 days)
  SELECT COALESCE(SUM(amount), 0) INTO monthly_rev
  FROM revenue_transactions
  WHERE is_recurring = TRUE
  AND transaction_date >= (target_date - INTERVAL '30 days')
  AND transaction_date <= target_date
  AND NOT is_refunded;
  
  -- Calculate ARR (MRR * 12)
  annual_rev := monthly_rev * 12;
  
  -- Calculate average LTV
  SELECT COALESCE(AVG(user_total), 0) INTO avg_ltv
  FROM (
    SELECT user_id, SUM(amount) as user_total
    FROM revenue_transactions
    WHERE NOT is_refunded
    GROUP BY user_id
  ) as user_totals;
  
  -- Calculate free plan conversions
  SELECT COUNT(*) INTO conversions
  FROM revenue_transactions rt
  JOIN public.subscriptions s ON rt.user_id = s.user_id
  WHERE rt.transaction_date::DATE = target_date
  AND s.previous_plan = 'free'
  AND NOT rt.is_refunded;
  
  -- Calculate AppSumo redemptions
  SELECT COUNT(*) INTO redemptions
  FROM appsumo_redemptions
  WHERE redeemed_at::DATE = target_date;
  
  -- Calculate refunds
  SELECT COUNT(*), COALESCE(SUM(amount), 0) INTO refunds_cnt, refunds_amt
  FROM revenue_transactions
  WHERE refund_date::DATE = target_date
  AND is_refunded;
  
  -- Insert or update metrics
  INSERT INTO revenue_metrics (
    metric_date,
    daily_revenue,
    mrr,
    arr,
    ltv_average,
    free_plan_conversions,
    appsumo_redemptions,
    refunds_count,
    refunds_amount
  )
  VALUES (
    target_date,
    daily_rev,
    monthly_rev,
    annual_rev,
    avg_ltv,
    conversions,
    redemptions,
    refunds_cnt,
    refunds_amt
  )
  ON CONFLICT (metric_date) DO UPDATE
  SET 
    daily_revenue = EXCLUDED.daily_revenue,
    mrr = EXCLUDED.mrr,
    arr = EXCLUDED.arr,
    ltv_average = EXCLUDED.ltv_average,
    free_plan_conversions = EXCLUDED.free_plan_conversions,
    appsumo_redemptions = EXCLUDED.appsumo_redemptions,
    refunds_count = EXCLUDED.refunds_count,
    refunds_amount = EXCLUDED.refunds_amount,
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin views for revenue analysis
CREATE OR REPLACE VIEW admin_revenue_summary AS
SELECT 
  SUM(CASE WHEN NOT is_refunded THEN amount ELSE 0 END) as total_revenue,
  SUM(CASE WHEN is_recurring AND NOT is_refunded THEN amount ELSE 0 END) as recurring_revenue,
  COUNT(DISTINCT user_id) as paying_customers,
  AVG(CASE WHEN NOT is_refunded THEN amount ELSE NULL END) as average_transaction,
  SUM(CASE WHEN is_refunded THEN amount ELSE 0 END) as total_refunded
FROM revenue_transactions;

-- Create view for revenue by plan
CREATE OR REPLACE VIEW admin_revenue_by_plan AS
SELECT 
  plan_type,
  SUM(CASE WHEN NOT is_refunded THEN amount ELSE 0 END) as total_revenue,
  COUNT(*) as transaction_count,
  COUNT(DISTINCT user_id) as customer_count
FROM revenue_transactions
GROUP BY plan_type
ORDER BY total_revenue DESC;

-- Create view for AppSumo redemption summary
CREATE OR REPLACE VIEW admin_appsumo_summary AS
SELECT 
  plan_type,
  COUNT(*) as redemption_count,
  COUNT(DISTINCT user_id) as user_count,
  SUM(CASE WHEN is_upgrade THEN 1 ELSE 0 END) as upgrade_count,
  DATE_TRUNC('day', redeemed_at) as redemption_date
FROM appsumo_redemptions
GROUP BY plan_type, DATE_TRUNC('day', redeemed_at)
ORDER BY redemption_date DESC;