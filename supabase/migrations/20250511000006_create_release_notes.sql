-- Migration: Create Release Notes Table
-- Description: Stores application version history and release notes

CREATE TABLE IF NOT EXISTS public.release_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_date TIMESTAMPTZ NOT NULL,
    is_published BOOLEAN DEFAULT false,
    publish_date TIMESTAMPTZ,
    features TEXT[] DEFAULT '{}',
    bug_fixes TEXT[] DEFAULT '{}',
    improvements TEXT[] DEFAULT '{}',
    breaking_changes TEXT[] DEFAULT '{}',
    author UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(version)
);

-- Add RLS policies for release_notes
ALTER TABLE public.release_notes ENABLE ROW LEVEL SECURITY;

-- Only authenticated users with admin permissions can manage release notes
CREATE POLICY release_notes_admin_policy ON public.release_notes
    USING (auth.uid() IN (
        SELECT user_id FROM public.admin_permissions 
        WHERE permission = 'manage_system' OR permission = 'view_system'
    ));

-- All users can view published release notes
CREATE POLICY release_notes_read_policy ON public.release_notes
    FOR SELECT
    USING (is_published = true);

-- Trigger to update the updated_at field
CREATE TRIGGER update_release_notes_timestamp
BEFORE UPDATE ON public.release_notes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insert sample release notes
INSERT INTO public.release_notes (
    version,
    title,
    description,
    release_date,
    is_published,
    publish_date,
    features,
    bug_fixes,
    improvements
) VALUES 
(
    '1.0.0',
    'Initial Release',
    'First public release of Spendify Guru with core features for bank statement analysis.',
    '2025-01-15 09:00:00'::timestamptz,
    true,
    '2025-01-15 09:00:00'::timestamptz,
    ARRAY['Bank statement OCR processing', 'Transaction categorization', 'Basic reporting'],
    ARRAY[],
    ARRAY[]
),
(
    '1.1.0',
    'Enhanced Visualization',
    'Improved charts and visualization features.',
    '2025-02-20 10:00:00'::timestamptz,
    true,
    '2025-02-20 10:00:00'::timestamptz,
    ARRAY['Interactive spending charts', 'Year-over-year comparison'],
    ARRAY['Fixed date parsing issue with certain bank formats'],
    ARRAY['Improved transaction categorization accuracy', 'Enhanced PDF processing speed']
),
(
    '1.2.0',
    'AI Financial Advisor',
    'Introducing AI-powered financial advice based on spending patterns.',
    '2025-04-05 11:00:00'::timestamptz,
    true,
    '2025-04-05 11:00:00'::timestamptz,
    ARRAY['AI Financial Advisor', 'Custom advice based on spending patterns', 'Savings recommendations'],
    ARRAY['Fixed PDF processing timeout issue'],
    ARRAY['Improved data visualization loading time', 'Enhanced mobile responsiveness']
);

-- Comments on table and columns
COMMENT ON TABLE public.release_notes IS 'Stores application version history and release notes';
COMMENT ON COLUMN public.release_notes.id IS 'Unique identifier for the release note';
COMMENT ON COLUMN public.release_notes.version IS 'Version number of the release (semver format)';
COMMENT ON COLUMN public.release_notes.title IS 'Title of the release';
COMMENT ON COLUMN public.release_notes.description IS 'Overall description of the release';
COMMENT ON COLUMN public.release_notes.release_date IS 'When the release was deployed';
COMMENT ON COLUMN public.release_notes.is_published IS 'Whether the release note is visible to users';
COMMENT ON COLUMN public.release_notes.publish_date IS 'When the release note was published to users';
COMMENT ON COLUMN public.release_notes.features IS 'Array of new features in this release';
COMMENT ON COLUMN public.release_notes.bug_fixes IS 'Array of bug fixes in this release';
COMMENT ON COLUMN public.release_notes.improvements IS 'Array of improvements in this release';
COMMENT ON COLUMN public.release_notes.breaking_changes IS 'Array of breaking changes in this release';
COMMENT ON COLUMN public.release_notes.author IS 'Who created this release note';
