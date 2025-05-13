-- Migration: Create System Updates Table
-- Description: Stores system update history and scheduled updates

CREATE TABLE IF NOT EXISTS public.system_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    update_type VARCHAR(50) NOT NULL, -- major, minor, patch, security, etc.
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, scheduled, in_progress, completed, failed, rolled_back
    version_from VARCHAR(50),
    version_to VARCHAR(50) NOT NULL,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    executed_by UUID REFERENCES auth.users(id),
    changelog TEXT,
    rollback_plan TEXT,
    error_log TEXT,
    requires_downtime BOOLEAN DEFAULT false,
    estimated_downtime_minutes INTEGER,
    metadata JSONB DEFAULT '{}'
);

-- Add RLS policies for system_updates
ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;

-- Only authenticated users with admin permissions can manage system updates
CREATE POLICY system_updates_admin_policy ON public.system_updates
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_system' OR permission = 'view_system'
    ));

-- Trigger to update the updated_at field
CREATE TRIGGER update_system_updates_timestamp
BEFORE UPDATE ON public.system_updates
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insert sample system updates
INSERT INTO public.system_updates (
    title,
    description,
    update_type,
    status,
    version_from,
    version_to,
    scheduled_at,
    started_at,
    completed_at,
    changelog,
    requires_downtime
) VALUES 
(
    'Initial Production Deployment',
    'First production deployment of Spendify Guru',
    'major',
    'completed',
    null,
    '1.0.0',
    '2025-01-15 02:00:00'::timestamptz,
    '2025-01-15 02:00:00'::timestamptz,
    '2025-01-15 02:45:00'::timestamptz,
    'Complete system deployment including all core features',
    true
),
(
    'Analytics Dashboard Update',
    'Added comprehensive analytics dashboard for user insights',
    'minor',
    'completed',
    '1.0.0',
    '1.1.0',
    '2025-02-20 03:00:00'::timestamptz,
    '2025-02-20 03:00:00'::timestamptz,
    '2025-02-20 03:30:00'::timestamptz,
    'Added advanced analytics features with visualizations',
    false
),
(
    'Security Patch - Authentication',
    'Security enhancements for the authentication system',
    'security',
    'scheduled',
    '1.1.0',
    '1.1.1',
    (NOW() + INTERVAL '2 days')::timestamptz,
    null,
    null,
    'Improved authentication security and session management',
    true
);

-- Comments on table and columns
COMMENT ON TABLE public.system_updates IS 'Stores system update history and scheduled updates';
COMMENT ON COLUMN public.system_updates.id IS 'Unique identifier for the system update';
COMMENT ON COLUMN public.system_updates.title IS 'Title of the system update';
COMMENT ON COLUMN public.system_updates.description IS 'Detailed description of the update';
COMMENT ON COLUMN public.system_updates.update_type IS 'Type or category of the update';
COMMENT ON COLUMN public.system_updates.status IS 'Current status of the update';
COMMENT ON COLUMN public.system_updates.version_from IS 'Starting version before the update';
COMMENT ON COLUMN public.system_updates.version_to IS 'Target version after the update';
COMMENT ON COLUMN public.system_updates.scheduled_at IS 'When the update is scheduled to occur';
COMMENT ON COLUMN public.system_updates.started_at IS 'When the update began execution';
COMMENT ON COLUMN public.system_updates.completed_at IS 'When the update was completed';
COMMENT ON COLUMN public.system_updates.changelog IS 'Detailed changelog for the update';
COMMENT ON COLUMN public.system_updates.rollback_plan IS 'Plan for rollback if the update fails';
COMMENT ON COLUMN public.system_updates.error_log IS 'Log of any errors encountered during the update';
COMMENT ON COLUMN public.system_updates.requires_downtime IS 'Whether the update requires system downtime';
COMMENT ON COLUMN public.system_updates.estimated_downtime_minutes IS 'Estimated downtime duration in minutes';
