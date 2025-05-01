-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.add_financial_goal;

-- Create the updated function with all required parameters
CREATE OR REPLACE FUNCTION public.add_financial_goal(
    p_name TEXT,
    p_target_amount DECIMAL,
    p_current_amount DECIMAL DEFAULT 0,
    p_deadline DATE DEFAULT NULL,
    p_type TEXT DEFAULT 'savings',
    p_category_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
) RETURNS public.financial_goals AS $$
DECLARE
    v_goal public.financial_goals;
    v_user_id UUID;
BEGIN
    -- Get the user ID from auth.uid() if not provided
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID is required';
    END IF;
    
    -- Insert the new goal
    INSERT INTO public.financial_goals (
        name,
        target_amount,
        current_amount,
        deadline,
        type,
        category_id,
        notes,
        user_id,
        progress_percentage,
        status
    ) VALUES (
        p_name,
        p_target_amount,
        p_current_amount,
        p_deadline,
        p_type,
        p_category_id,
        p_notes,
        v_user_id,
        CASE 
            WHEN p_target_amount = 0 THEN 0
            ELSE (p_current_amount / p_target_amount) * 100
        END,
        CASE 
            WHEN p_current_amount >= p_target_amount THEN 'completed'
            WHEN p_deadline < CURRENT_DATE THEN 'overdue'
            WHEN p_deadline <= CURRENT_DATE + INTERVAL '30 days' THEN 'urgent'
            ELSE 'in_progress'
        END
    ) RETURNING * INTO v_goal;
    
    RETURN v_goal;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.add_financial_goal TO authenticated; 