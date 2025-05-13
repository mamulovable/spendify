-- Migration: Create Email Templates Table
-- Description: Stores email templates for system communications

CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    last_sent_at TIMESTAMPTZ,
    send_count INTEGER DEFAULT 0,
    UNIQUE(name)
);

-- Add RLS policies for email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only authenticated users with admin permissions can access email templates
CREATE POLICY email_templates_admin_policy ON public.email_templates
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_communication' OR permission = 'view_communication'
    ));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update the updated_at field
CREATE TRIGGER update_email_templates_timestamp
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insert some default templates
INSERT INTO public.email_templates (name, subject, body, variables, category)
VALUES 
('Welcome Email', 'Welcome to Spendify Guru!', 'Hi {{userName}},\n\nWelcome to Spendify Guru! We''re excited to help you analyze your financial statements and gain valuable insights.\n\nGet started by uploading your first bank statement.\n\nBest regards,\nThe Spendify Guru Team', '{"userName": "User''s name"}', 'Onboarding'),
('Password Reset', 'Reset Your Password', 'Hi {{userName}},\n\nWe received a request to reset your password. Please click the link below to set a new password:\n\n{{resetLink}}\n\nIf you didn''t request this, please ignore this email.\n\nBest regards,\nThe Spendify Guru Team', '{"userName": "User''s name", "resetLink": "Password reset link"}', 'Account'),
('Subscription Confirmation', 'Your Subscription Is Active', 'Hi {{userName}},\n\nThank you for subscribing to Spendify Guru {{planName}}! Your subscription is now active and will renew on {{renewalDate}}.\n\nEnjoy all the premium features!\n\nBest regards,\nThe Spendify Guru Team', '{"userName": "User''s name", "planName": "Subscription plan name", "renewalDate": "Next renewal date"}', 'Billing');

-- Comments on table and columns
COMMENT ON TABLE public.email_templates IS 'Stores email templates for system communications';
COMMENT ON COLUMN public.email_templates.id IS 'Unique identifier for the template';
COMMENT ON COLUMN public.email_templates.name IS 'Template name for internal reference';
COMMENT ON COLUMN public.email_templates.subject IS 'Email subject line';
COMMENT ON COLUMN public.email_templates.body IS 'Email body content with variable placeholders';
COMMENT ON COLUMN public.email_templates.variables IS 'JSON object defining variables that can be used in the template';
COMMENT ON COLUMN public.email_templates.category IS 'Template category (onboarding, notification, billing, etc)';
COMMENT ON COLUMN public.email_templates.is_active IS 'Whether the template is active and can be used';
COMMENT ON COLUMN public.email_templates.last_sent_at IS 'When the template was last used to send an email';
COMMENT ON COLUMN public.email_templates.send_count IS 'Number of times this template has been used';
