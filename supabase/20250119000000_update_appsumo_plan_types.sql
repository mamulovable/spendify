-- Update AppSumo codes table to support specific LTD plan types
-- This migration adds constraints and updates for the enhanced plan-aware redemption system

-- Add check constraint for plan_type to ensure only valid LTD plan types are allowed
ALTER TABLE public.appsumo_codes 
DROP CONSTRAINT IF EXISTS appsumo_codes_plan_type_check;

ALTER TABLE public.appsumo_codes 
ADD CONSTRAINT appsumo_codes_plan_type_check 
CHECK (plan_type IN ('basic_ltd', 'premium_ltd', 'ultimate_ltd', 'lifetime'));

-- Update existing codes to have proper plan types (distribute evenly)
-- This is a one-time update for existing codes
DO $$
DECLARE
  total_codes INTEGER;
  codes_per_plan INTEGER;
  remainder INTEGER;
BEGIN
  -- Get total count of codes
  SELECT COUNT(*) INTO total_codes FROM public.appsumo_codes WHERE plan_type = 'lifetime';
  
  -- Calculate distribution
  codes_per_plan := total_codes / 3;
  remainder := total_codes % 3;
  
  -- Update codes to basic_ltd (first third)
  WITH codes_to_update AS (
    SELECT id FROM public.appsumo_codes 
    WHERE plan_type = 'lifetime' 
    ORDER BY created_at 
    LIMIT codes_per_plan
  )
  UPDATE public.appsumo_codes 
  SET plan_type = 'basic_ltd' 
  WHERE id IN (SELECT id FROM codes_to_update);
  
  -- Update codes to premium_ltd (second third)
  WITH codes_to_update AS (
    SELECT id FROM public.appsumo_codes 
    WHERE plan_type = 'lifetime' 
    ORDER BY created_at 
    LIMIT codes_per_plan OFFSET codes_per_plan
  )
  UPDATE public.appsumo_codes 
  SET plan_type = 'premium_ltd' 
  WHERE id IN (SELECT id FROM codes_to_update);
  
  -- Update remaining codes to ultimate_ltd (includes remainder)
  UPDATE public.appsumo_codes 
  SET plan_type = 'ultimate_ltd' 
  WHERE plan_type = 'lifetime';
  
END $$;

-- Update the redemptions table constraint as well
ALTER TABLE public.appsumo_redemptions 
DROP CONSTRAINT IF EXISTS appsumo_redemptions_plan_type_check;

ALTER TABLE public.appsumo_redemptions 
ADD CONSTRAINT appsumo_redemptions_plan_type_check 
CHECK (plan_type IN ('basic_ltd', 'premium_ltd', 'ultimate_ltd', 'lifetime'));

-- Create index on plan_type for faster plan-specific queries
CREATE INDEX IF NOT EXISTS idx_appsumo_codes_plan_type ON public.appsumo_codes(plan_type);
CREATE INDEX IF NOT EXISTS idx_appsumo_redemptions_plan_type ON public.appsumo_redemptions(plan_type);

-- Update the import function to support plan types
CREATE OR REPLACE FUNCTION public.import_appsumo_codes_with_plan(codes TEXT[], plan_type TEXT DEFAULT 'ultimate_ltd')
RETURNS INTEGER AS $$
DECLARE
  inserted INTEGER := 0;
  code TEXT;
BEGIN
  -- Validate plan_type
  IF plan_type NOT IN ('basic_ltd', 'premium_ltd', 'ultimate_ltd', 'lifetime') THEN
    RAISE EXCEPTION 'Invalid plan_type: %. Must be one of: basic_ltd, premium_ltd, ultimate_ltd, lifetime', plan_type;
  END IF;
  
  FOREACH code IN ARRAY codes
  LOOP
    BEGIN
      INSERT INTO public.appsumo_codes (code, plan_type)
      VALUES (code, plan_type)
      ON CONFLICT (code) DO NOTHING;
      
      inserted := inserted + 1;
    EXCEPTION WHEN OTHERS THEN
      -- Skip any errors and continue with the next code
      CONTINUE;
    END;
  END LOOP;
  
  RETURN inserted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to validate code and plan compatibility
CREATE OR REPLACE FUNCTION public.validate_appsumo_code_plan(code_input TEXT, plan_type_input TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  is_redeemed BOOLEAN,
  plan_matches BOOLEAN,
  expires_at TIMESTAMP WITH TIME ZONE,
  message TEXT
) AS $$
DECLARE
  code_record RECORD;
  redemption_record RECORD;
BEGIN
  -- Check if code exists and get its details
  SELECT * INTO code_record 
  FROM public.appsumo_codes 
  WHERE code = UPPER(code_input) AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, FALSE, FALSE, NULL::TIMESTAMP WITH TIME ZONE, 'Invalid AppSumo code'::TEXT;
    RETURN;
  END IF;
  
  -- Check if code has been redeemed
  SELECT * INTO redemption_record 
  FROM public.appsumo_redemptions 
  WHERE code = UPPER(code_input);
  
  IF FOUND THEN
    RETURN QUERY SELECT TRUE, TRUE, FALSE, code_record.expires_at, 'Code has already been redeemed'::TEXT;
    RETURN;
  END IF;
  
  -- Check if code has expired
  IF code_record.expires_at IS NOT NULL AND code_record.expires_at < NOW() THEN
    RETURN QUERY SELECT TRUE, FALSE, FALSE, code_record.expires_at, 'Code has expired'::TEXT;
    RETURN;
  END IF;
  
  -- Check plan compatibility
  IF code_record.plan_type != plan_type_input THEN
    RETURN QUERY SELECT 
      TRUE, 
      FALSE, 
      FALSE, 
      code_record.expires_at, 
      FORMAT('Code is for %s plan, but %s plan was selected', code_record.plan_type, plan_type_input)::TEXT;
    RETURN;
  END IF;
  
  -- Code is valid and compatible
  RETURN QUERY SELECT TRUE, FALSE, TRUE, code_record.expires_at, 'Code is valid and compatible'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION public.import_appsumo_codes_with_plan(TEXT[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_appsumo_code_plan(TEXT, TEXT) TO authenticated;