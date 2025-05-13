-- Migration: Create Data Cleanup Tables
-- Description: Stores data cleanup policies and logs

CREATE TABLE IF NOT EXISTS public.data_cleanup_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50) NOT NULL, -- users, documents, transactions, etc.
    criteria JSONB NOT NULL, -- e.g., {age: {"operator": ">", "value": 90, "unit": "days"}}
    action VARCHAR(50) NOT NULL, -- delete, anonymize, archive
    status VARCHAR(50) DEFAULT 'active', -- active, paused, completed
    frequency VARCHAR(50), -- daily, weekly, monthly, once (null for manual)
    next_run TIMESTAMPTZ,
    last_run TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS public.data_cleanup_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES public.data_cleanup_policies(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL, -- success, error, in_progress
    affected_records INTEGER DEFAULT 0,
    error_message TEXT,
    summary TEXT,
    created_by UUID REFERENCES auth.users(id),
    is_manual BOOLEAN DEFAULT false, -- whether this was a scheduled run or manually triggered
    metadata JSONB DEFAULT '{}'
);

-- Add RLS policies for data cleanup
ALTER TABLE public.data_cleanup_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_cleanup_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users with admin data management permissions can access data cleanup
CREATE POLICY data_cleanup_policies_admin_policy ON public.data_cleanup_policies
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_data' OR permission = 'view_data'
    ));

CREATE POLICY data_cleanup_logs_admin_policy ON public.data_cleanup_logs
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_data' OR permission = 'view_data'
    ));

-- Trigger to update the updated_at field
CREATE TRIGGER update_data_cleanup_policies_timestamp
BEFORE UPDATE ON public.data_cleanup_policies
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insert some default cleanup policies
INSERT INTO public.data_cleanup_policies (
    name, 
    description, 
    entity_type, 
    criteria, 
    action, 
    frequency, 
    next_run
) VALUES 
(
    'Inactive Users Anonymization',
    'Anonymize users who have been inactive for more than 2 years',
    'users',
    '{"last_login": {"operator": "<", "value": "now() - interval ''2 years''", "type": "date"}}',
    'anonymize',
    'monthly',
    (NOW() + INTERVAL '1 month')::date::timestamptz + INTERVAL '2 hour'
),
(
    'Old Documents Cleanup',
    'Delete temporary documents older than 30 days',
    'documents',
    '{"created_at": {"operator": "<", "value": "now() - interval ''30 days''", "type": "date"}, "status": {"operator": "=", "value": "temporary", "type": "string"}}',
    'delete',
    'weekly',
    (NOW() + INTERVAL '1 week')::date::timestamptz + INTERVAL '1 hour'
);

-- Comments on table and columns
COMMENT ON TABLE public.data_cleanup_policies IS 'Stores data cleanup policies for automated data management';
COMMENT ON COLUMN public.data_cleanup_policies.id IS 'Unique identifier for the policy';
COMMENT ON COLUMN public.data_cleanup_policies.name IS 'Name of the cleanup policy';
COMMENT ON COLUMN public.data_cleanup_policies.entity_type IS 'Type of entity this policy applies to';
COMMENT ON COLUMN public.data_cleanup_policies.criteria IS 'JSON criteria for selecting records to clean up';
COMMENT ON COLUMN public.data_cleanup_policies.action IS 'Action to take on matching records';
COMMENT ON COLUMN public.data_cleanup_policies.status IS 'Current status of the cleanup policy';
COMMENT ON COLUMN public.data_cleanup_policies.frequency IS 'How often the policy should run';
COMMENT ON COLUMN public.data_cleanup_policies.next_run IS 'When the next run is scheduled';
COMMENT ON COLUMN public.data_cleanup_policies.last_run IS 'When the policy was last executed';

COMMENT ON TABLE public.data_cleanup_logs IS 'Logs of data cleanup operations';
COMMENT ON COLUMN public.data_cleanup_logs.id IS 'Unique identifier for the log entry';
COMMENT ON COLUMN public.data_cleanup_logs.policy_id IS 'Reference to the policy that was executed';
COMMENT ON COLUMN public.data_cleanup_logs.start_time IS 'When the cleanup operation started';
COMMENT ON COLUMN public.data_cleanup_logs.end_time IS 'When the cleanup operation completed';
COMMENT ON COLUMN public.data_cleanup_logs.status IS 'Status of the cleanup operation';
COMMENT ON COLUMN public.data_cleanup_logs.affected_records IS 'Number of records affected by the cleanup';
COMMENT ON COLUMN public.data_cleanup_logs.error_message IS 'Error message if the operation failed';
COMMENT ON COLUMN public.data_cleanup_logs.summary IS 'Summary of what was done';
COMMENT ON COLUMN public.data_cleanup_logs.is_manual IS 'Whether this was triggered manually or by schedule';
