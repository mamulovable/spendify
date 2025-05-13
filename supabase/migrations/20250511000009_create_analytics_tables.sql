-- Migration: Create Analytics Tables
-- Description: Tables for storing analytics data shown in the admin dashboard

-- Daily metrics aggregation
CREATE TABLE IF NOT EXISTS public.analytics_daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    documents_processed INTEGER DEFAULT 0,
    average_processing_time DECIMAL(10,2) DEFAULT 0,
    trial_conversions INTEGER DEFAULT 0,
    trial_conversion_rate DECIMAL(5,2) DEFAULT 0,
    plan_upgrades INTEGER DEFAULT 0,
    plan_downgrades INTEGER DEFAULT 0,
    cancellations INTEGER DEFAULT 0,
    churn_rate DECIMAL(5,2) DEFAULT 0,
    retention_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(date)
);

-- User cohort retention data
CREATE TABLE IF NOT EXISTS public.analytics_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_date DATE NOT NULL,
    cohort_size INTEGER NOT NULL,
    retention_30d INTEGER DEFAULT 0,
    retention_60d INTEGER DEFAULT 0,
    retention_90d INTEGER DEFAULT 0,
    retention_180d INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    average_revenue DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(cohort_date)
);

-- Revenue breakdown by plan
CREATE TABLE IF NOT EXISTS public.analytics_plan_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    plan_id UUID NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    subscriber_count INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    trial_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(date, plan_id)
);

-- Document processing metrics
CREATE TABLE IF NOT EXISTS public.analytics_document_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    count INTEGER DEFAULT 0,
    average_size_kb INTEGER DEFAULT 0,
    average_processing_time_ms INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(date, document_type)
);

-- Add RLS policies to all analytics tables
ALTER TABLE public.analytics_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_plan_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_document_metrics ENABLE ROW LEVEL SECURITY;

-- Only admins with dashboard permission can view analytics
CREATE POLICY analytics_daily_metrics_admin_policy ON public.analytics_daily_metrics
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'view_dashboard'
    ));

CREATE POLICY analytics_cohorts_admin_policy ON public.analytics_cohorts
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'view_dashboard'
    ));

CREATE POLICY analytics_plan_revenue_admin_policy ON public.analytics_plan_revenue
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'view_dashboard'
    ));

CREATE POLICY analytics_document_metrics_admin_policy ON public.analytics_document_metrics
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'view_dashboard'
    ));

-- Triggers to update updated_at timestamp
CREATE TRIGGER update_analytics_daily_metrics_timestamp
BEFORE UPDATE ON public.analytics_daily_metrics
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_analytics_cohorts_timestamp
BEFORE UPDATE ON public.analytics_cohorts
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_analytics_plan_revenue_timestamp
BEFORE UPDATE ON public.analytics_plan_revenue
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_analytics_document_metrics_timestamp
BEFORE UPDATE ON public.analytics_document_metrics
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insert some sample data for demo purposes
INSERT INTO public.analytics_daily_metrics (
    date, new_users, active_users, total_revenue, documents_processed, trial_conversions, trial_conversion_rate
)
VALUES 
('2025-05-01', 45, 320, 2450.00, 210, 12, 26.67),
('2025-05-02', 38, 305, 2320.00, 195, 10, 26.32),
('2025-05-03', 42, 315, 2380.00, 208, 11, 26.19),
('2025-05-04', 51, 342, 2570.00, 225, 15, 29.41),
('2025-05-05', 47, 350, 2620.00, 232, 14, 29.79),
('2025-05-06', 55, 362, 2740.00, 255, 16, 29.09),
('2025-05-07', 49, 370, 2800.00, 248, 15, 30.61),
('2025-05-08', 58, 385, 2950.00, 262, 18, 31.03),
('2025-05-09', 62, 398, 3100.00, 275, 20, 32.26),
('2025-05-10', 54, 405, 3200.00, 268, 17, 31.48);

-- Comments
COMMENT ON TABLE public.analytics_daily_metrics IS 'Daily aggregated analytics metrics for the admin dashboard';
COMMENT ON TABLE public.analytics_cohorts IS 'User cohort retention data for cohort analysis';
COMMENT ON TABLE public.analytics_plan_revenue IS 'Revenue breakdown by subscription plan';
COMMENT ON TABLE public.analytics_document_metrics IS 'Document processing metrics by document type';
