-- Migration: Create Campaigns Table
-- Description: Stores communication campaigns for targeted user messaging

CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, scheduled, active, paused, completed, cancelled
    segment_id UUID REFERENCES public.user_segments(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}'
);

-- Add RLS policies for campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Only authenticated users with admin permissions can access campaigns
CREATE POLICY campaigns_admin_policy ON public.campaigns
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_communication' OR permission = 'view_communication'
    ));

-- Trigger to update the updated_at field
CREATE TRIGGER update_campaigns_timestamp
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Comments on table and columns
COMMENT ON TABLE public.campaigns IS 'Stores communication campaigns for targeted user messaging';
COMMENT ON COLUMN public.campaigns.id IS 'Unique identifier for the campaign';
COMMENT ON COLUMN public.campaigns.name IS 'Campaign name';
COMMENT ON COLUMN public.campaigns.description IS 'Campaign description';
COMMENT ON COLUMN public.campaigns.status IS 'Current status of the campaign';
COMMENT ON COLUMN public.campaigns.segment_id IS 'Reference to the user segment targeting this campaign';
COMMENT ON COLUMN public.campaigns.template_id IS 'Reference to the email template used in this campaign';
COMMENT ON COLUMN public.campaigns.scheduled_at IS 'When the campaign is scheduled to start';
COMMENT ON COLUMN public.campaigns.started_at IS 'When the campaign actually started';
COMMENT ON COLUMN public.campaigns.completed_at IS 'When the campaign was completed';
COMMENT ON COLUMN public.campaigns.total_recipients IS 'Total number of users targeted by this campaign';
COMMENT ON COLUMN public.campaigns.sent_count IS 'Number of emails sent in this campaign';
COMMENT ON COLUMN public.campaigns.open_count IS 'Number of emails opened in this campaign';
COMMENT ON COLUMN public.campaigns.click_count IS 'Number of email links clicked in this campaign';
COMMENT ON COLUMN public.campaigns.settings IS 'JSON object with campaign settings';
