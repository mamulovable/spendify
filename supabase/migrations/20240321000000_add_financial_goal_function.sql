-- Create a function to add financial goals
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.add_financial_goal TO authenticated; 