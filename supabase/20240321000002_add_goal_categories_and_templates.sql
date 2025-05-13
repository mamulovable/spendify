-- Create goal categories table
CREATE TABLE public.goal_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create goal templates table
CREATE TABLE public.goal_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    target_amount_range_min DECIMAL(12,2),
    target_amount_range_max DECIMAL(12,2),
    suggested_deadline_months INTEGER,
    category_id UUID REFERENCES public.goal_categories(id),
    type TEXT NOT NULL,
    tips TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add new columns to financial_goals table
ALTER TABLE public.financial_goals
ADD COLUMN IF NOT EXISTS progress_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS status TEXT,
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.goal_categories(id),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS milestone_amounts DECIMAL(12,2)[],
ADD COLUMN IF NOT EXISTS milestone_dates DATE[],
ADD COLUMN IF NOT EXISTS last_updated_by UUID REFERENCES auth.users(id);

-- Create goal milestones table
CREATE TABLE public.goal_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID REFERENCES public.financial_goals(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    target_date DATE,
    achieved_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create goal progress history table
CREATE TABLE public.goal_progress_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID REFERENCES public.financial_goals(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id)
);

-- Create function to update goal progress
CREATE OR REPLACE FUNCTION public.update_goal_progress(
    p_goal_id UUID,
    p_amount DECIMAL,
    p_notes TEXT DEFAULT NULL
) RETURNS public.financial_goals AS $$
DECLARE
    v_goal public.financial_goals;
BEGIN
    -- Update the goal's current amount and calculated fields
    UPDATE public.financial_goals
    SET 
        current_amount = p_amount,
        progress_percentage = CASE 
            WHEN target_amount = 0 THEN 0
            ELSE (p_amount / target_amount) * 100
        END,
        status = CASE 
            WHEN p_amount >= target_amount THEN 'completed'
            WHEN deadline < CURRENT_DATE THEN 'overdue'
            WHEN deadline <= CURRENT_DATE + INTERVAL '30 days' THEN 'urgent'
            ELSE 'in_progress'
        END,
        last_updated_by = auth.uid(),
        updated_at = NOW()
    WHERE id = p_goal_id
    RETURNING * INTO v_goal;

    -- Record progress in history
    INSERT INTO public.goal_progress_history (
        goal_id,
        amount,
        notes,
        recorded_by
    ) VALUES (
        p_goal_id,
        p_amount,
        p_notes,
        auth.uid()
    );

    RETURN v_goal;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get goal suggestions
CREATE OR REPLACE FUNCTION public.get_goal_suggestions(
    p_user_id UUID,
    p_income DECIMAL DEFAULT NULL,
    p_expenses DECIMAL DEFAULT NULL
) RETURNS TABLE (
    template_id UUID,
    name TEXT,
    description TEXT,
    suggested_amount DECIMAL,
    suggested_deadline DATE,
    category_id UUID,
    type TEXT,
    tips TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gt.id as template_id,
        gt.name,
        gt.description,
        CASE 
            WHEN p_income IS NOT NULL THEN 
                LEAST(
                    GREATEST(
                        gt.target_amount_range_min,
                        p_income * 0.2  -- 20% of income as minimum
                    ),
                    gt.target_amount_range_max
                )
            ELSE gt.target_amount_range_min
        END as suggested_amount,
        CURRENT_DATE + (gt.suggested_deadline_months || ' months')::INTERVAL as suggested_deadline,
        gt.category_id,
        gt.type,
        gt.tips
    FROM public.goal_templates gt
    WHERE NOT EXISTS (
        SELECT 1 FROM public.financial_goals fg
        WHERE fg.user_id = p_user_id
        AND fg.type = gt.type
        AND fg.status != 'completed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update progress_percentage and status
CREATE OR REPLACE FUNCTION public.update_goal_calculated_fields()
RETURNS TRIGGER AS $$
BEGIN
    NEW.progress_percentage := CASE 
        WHEN NEW.target_amount = 0 THEN 0
        ELSE (NEW.current_amount / NEW.target_amount) * 100
    END;
    
    NEW.status := CASE 
        WHEN NEW.current_amount >= NEW.target_amount THEN 'completed'
        WHEN NEW.deadline < CURRENT_DATE THEN 'overdue'
        WHEN NEW.deadline <= CURRENT_DATE + INTERVAL '30 days' THEN 'urgent'
        ELSE 'in_progress'
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_goal_calculated_fields
    BEFORE INSERT OR UPDATE ON public.financial_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_goal_calculated_fields();

-- Insert some default categories
INSERT INTO public.goal_categories (name, icon, description, color) VALUES
('Emergency Fund', 'shield', 'Build a safety net for unexpected expenses', '#FF6B6B'),
('Retirement', 'pension', 'Long-term savings for retirement', '#4ECDC4'),
('Education', 'graduation-cap', 'Save for education or skill development', '#45B7D1'),
('Home', 'home', 'Save for a house or home improvements', '#96CEB4'),
('Vehicle', 'car', 'Save for a car or vehicle maintenance', '#FFEEAD'),
('Travel', 'plane', 'Save for travel and vacations', '#D4A5A5'),
('Business', 'briefcase', 'Save for business ventures', '#9B59B6'),
('Health', 'heartbeat', 'Save for healthcare expenses', '#3498DB');

-- Insert some default templates
INSERT INTO public.goal_templates (name, description, target_amount_range_min, target_amount_range_max, suggested_deadline_months, category_id, type, tips) VALUES
('Emergency Fund', 'Build 3-6 months of expenses as emergency fund', 5000, 50000, 24, (SELECT id FROM public.goal_categories WHERE name = 'Emergency Fund'), 'emergency', ARRAY['Start with a small monthly contribution', 'Keep this money easily accessible', 'Review and adjust based on life changes']),
('Retirement Fund', 'Start building your retirement nest egg', 10000, 1000000, 360, (SELECT id FROM public.goal_categories WHERE name = 'Retirement'), 'retirement', ARRAY['Consider tax-advantaged accounts', 'Diversify your investments', 'Increase contributions with salary increases']),
('Home Down Payment', 'Save for a house down payment', 20000, 200000, 60, (SELECT id FROM public.goal_categories WHERE name = 'Home'), 'home', ARRAY['Research property prices in your area', 'Consider additional costs like closing fees', 'Look into first-time homebuyer programs']);

-- Grant permissions
GRANT ALL ON public.goal_categories TO authenticated;
GRANT ALL ON public.goal_templates TO authenticated;
GRANT ALL ON public.goal_milestones TO authenticated;
GRANT ALL ON public.goal_progress_history TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_goal_progress TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_goal_suggestions TO authenticated; 