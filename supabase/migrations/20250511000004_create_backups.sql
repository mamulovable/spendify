-- Migration: Create Backups Table
-- Description: Stores backup records and schedules

CREATE TABLE IF NOT EXISTS public.backup_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50) NOT NULL, -- daily, weekly, monthly, etc.
    next_run TIMESTAMPTZ NOT NULL,
    last_run TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active', -- active, paused, error
    retention_days INTEGER DEFAULT 30,
    backup_type VARCHAR(50) NOT NULL, -- full, incremental, etc.
    tables_included TEXT[], -- specific tables to include, empty means all
    tables_excluded TEXT[], -- specific tables to exclude
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.backup_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES public.backup_schedules(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    file_size BIGINT,
    backup_type VARCHAR(50) NOT NULL, -- full, incremental, etc.
    storage_location TEXT NOT NULL, -- URL or path to backup storage
    status VARCHAR(50) NOT NULL, -- success, error, in_progress, restored
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_by UUID REFERENCES auth.users(id),
    restored_at TIMESTAMPTZ,
    restored_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'
);

-- Add RLS policies for backups
ALTER TABLE public.backup_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;

-- Only authenticated users with admin backup permissions can access backup tables
CREATE POLICY backup_schedules_admin_policy ON public.backup_schedules
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_backups' OR permission = 'view_backups'
    ));

CREATE POLICY backup_history_admin_policy ON public.backup_history
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_backups' OR permission = 'view_backups'
    ));

-- Trigger to update the updated_at field
CREATE TRIGGER update_backup_schedules_timestamp
BEFORE UPDATE ON public.backup_schedules
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insert default backup schedule
INSERT INTO public.backup_schedules (
    name, 
    description, 
    frequency, 
    next_run, 
    backup_type, 
    tables_included
) VALUES (
    'Daily Full Backup',
    'Daily backup of all database tables',
    'daily', 
    (NOW() + INTERVAL '1 day')::date::timestamptz + INTERVAL '3 hour', -- Tomorrow at 3am
    'full',
    NULL -- All tables
);

-- Comments on table and columns
COMMENT ON TABLE public.backup_schedules IS 'Stores scheduled backup configurations';
COMMENT ON COLUMN public.backup_schedules.id IS 'Unique identifier for the backup schedule';
COMMENT ON COLUMN public.backup_schedules.name IS 'Name of the backup schedule';
COMMENT ON COLUMN public.backup_schedules.frequency IS 'How often the backup should run';
COMMENT ON COLUMN public.backup_schedules.next_run IS 'When the next backup is scheduled to run';
COMMENT ON COLUMN public.backup_schedules.last_run IS 'When the backup was last executed';
COMMENT ON COLUMN public.backup_schedules.status IS 'Current status of the backup schedule';
COMMENT ON COLUMN public.backup_schedules.retention_days IS 'Number of days to keep backups before deletion';
COMMENT ON COLUMN public.backup_schedules.backup_type IS 'Type of backup to perform';
COMMENT ON COLUMN public.backup_schedules.tables_included IS 'List of tables to include in the backup';
COMMENT ON COLUMN public.backup_schedules.tables_excluded IS 'List of tables to exclude from the backup';

COMMENT ON TABLE public.backup_history IS 'Stores historical backup records';
COMMENT ON COLUMN public.backup_history.id IS 'Unique identifier for the backup record';
COMMENT ON COLUMN public.backup_history.schedule_id IS 'Reference to the backup schedule that created this backup';
COMMENT ON COLUMN public.backup_history.filename IS 'Name of the backup file';
COMMENT ON COLUMN public.backup_history.file_size IS 'Size of the backup file in bytes';
COMMENT ON COLUMN public.backup_history.backup_type IS 'Type of backup performed';
COMMENT ON COLUMN public.backup_history.storage_location IS 'Where the backup file is stored';
COMMENT ON COLUMN public.backup_history.status IS 'Status of the backup job';
COMMENT ON COLUMN public.backup_history.started_at IS 'When the backup job started';
COMMENT ON COLUMN public.backup_history.completed_at IS 'When the backup job finished';
COMMENT ON COLUMN public.backup_history.error_message IS 'Error message if the backup failed';
COMMENT ON COLUMN public.backup_history.restored_at IS 'When this backup was restored (if applicable)';
COMMENT ON COLUMN public.backup_history.restored_by IS 'Who restored this backup (if applicable)';
