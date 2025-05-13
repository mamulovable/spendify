-- Migration: Create User Segments Table
-- Description: Stores user segments for targeted actions and campaigns

CREATE TABLE IF NOT EXISTS public.user_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filter_criteria JSONB NOT NULL DEFAULT '{}',
    is_dynamic BOOLEAN DEFAULT true,
    member_count INTEGER DEFAULT 0,
    last_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(name)
);

-- Create a join table for static segments (when is_dynamic is false)
CREATE TABLE IF NOT EXISTS public.user_segment_members (
    segment_id UUID REFERENCES public.user_segments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT now(),
    added_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (segment_id, user_id)
);

-- Add RLS policies for user_segments
ALTER TABLE public.user_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_segment_members ENABLE ROW LEVEL SECURITY;

-- Only authenticated users with admin permissions can access user segments
CREATE POLICY user_segments_admin_policy ON public.user_segments
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_communication' OR permission = 'view_communication'
    ));

CREATE POLICY user_segment_members_admin_policy ON public.user_segment_members
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_communication' OR permission = 'view_communication'
    ));

-- Trigger to update the updated_at field
CREATE TRIGGER update_user_segments_timestamp
BEFORE UPDATE ON public.user_segments
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Function to calculate segment membership counts
CREATE OR REPLACE FUNCTION update_segment_member_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_segments
    SET member_count = (
        SELECT COUNT(*) FROM public.user_segment_members
        WHERE segment_id = NEW.segment_id
    ),
    last_updated_at = now()
    WHERE id = NEW.segment_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update the segment member count
CREATE TRIGGER update_segment_member_count_insert
AFTER INSERT ON public.user_segment_members
FOR EACH ROW
EXECUTE FUNCTION update_segment_member_count();

CREATE TRIGGER update_segment_member_count_delete
AFTER DELETE ON public.user_segment_members
FOR EACH ROW
EXECUTE FUNCTION update_segment_member_count();

-- Insert some default segments
INSERT INTO public.user_segments (name, description, filter_criteria, is_dynamic)
VALUES 
('New Users', 'Users who registered in the last 30 days', '{"registration_date": {"operator": "greater_than", "value": "now() - interval ''30 days''", "type": "date"}}', true),
('Active Users', 'Users who logged in at least once in the last 7 days', '{"last_login": {"operator": "greater_than", "value": "now() - interval ''7 days''", "type": "date"}}', true),
('Free Trial Users', 'Users currently on a free trial', '{"subscription_status": {"operator": "equals", "value": "trial", "type": "string"}}', true),
('Premium Users', 'Users with active premium subscriptions', '{"subscription_status": {"operator": "equals", "value": "active", "type": "string"}, "plan_type": {"operator": "equals", "value": "premium", "type": "string"}}', true);

-- Comments on table and columns
COMMENT ON TABLE public.user_segments IS 'Stores user segments for targeted actions and campaigns';
COMMENT ON COLUMN public.user_segments.id IS 'Unique identifier for the segment';
COMMENT ON COLUMN public.user_segments.name IS 'Segment name';
COMMENT ON COLUMN public.user_segments.description IS 'Segment description';
COMMENT ON COLUMN public.user_segments.filter_criteria IS 'JSON object describing the filtering criteria for dynamic segments';
COMMENT ON COLUMN public.user_segments.is_dynamic IS 'Whether the segment is dynamic (calculated on-the-fly) or static (stored membership)';
COMMENT ON COLUMN public.user_segments.member_count IS 'Current count of users in this segment';
COMMENT ON COLUMN public.user_segments.last_updated_at IS 'When the segment membership was last updated';

COMMENT ON TABLE public.user_segment_members IS 'Join table for storing users in static segments';
COMMENT ON COLUMN public.user_segment_members.segment_id IS 'Reference to the segment';
COMMENT ON COLUMN public.user_segment_members.user_id IS 'Reference to the user';
COMMENT ON COLUMN public.user_segment_members.added_at IS 'When the user was added to the segment';
COMMENT ON COLUMN public.user_segment_members.added_by IS 'Which admin added the user to the segment';
