-- Drop existing table and function if they exist
DROP FUNCTION IF EXISTS public.add_financial_goal;
DROP TABLE IF EXISTS public.financial_goals;

-- Create the financial_goals table
CREATE TABLE public.financial_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    deadline DATE,
    type TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
    ON public.financial_goals
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
    ON public.financial_goals
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
    ON public.financial_goals
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
    ON public.financial_goals
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create the add_financial_goal function
CREATE OR REPLACE FUNCTION public.add_financial_goal(
    p_name TEXT,
    p_target_amount DECIMAL,
    p_current_amount DECIMAL,
    p_deadline DATE,
    p_type TEXT,
    p_category TEXT,
    p_user_id UUID
) RETURNS public.financial_goals AS $$
DECLARE
    v_goal public.financial_goals;
BEGIN
    INSERT INTO public.financial_goals (
        name,
        target_amount,
        current_amount,
        deadline,
        type,
        category,
        user_id
    ) VALUES (
        p_name,
        p_target_amount,
        p_current_amount,
        p_deadline,
        p_type,
        p_category,
        p_user_id
    ) RETURNING * INTO v_goal;
    
    RETURN v_goal;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON public.financial_goals TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_financial_goal TO authenticated; 