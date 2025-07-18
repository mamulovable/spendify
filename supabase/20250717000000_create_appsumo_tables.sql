-- Create AppSumo codes table
CREATE TABLE IF NOT EXISTS public.appsumo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'lifetime',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_appsumo_codes_code ON public.appsumo_codes(code);

-- Create AppSumo redemptions table
CREATE TABLE IF NOT EXISTS public.appsumo_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL REFERENCES public.appsumo_codes(code),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  redemption_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  plan_type TEXT NOT NULL DEFAULT 'lifetime',
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(code)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_appsumo_redemptions_user_id ON public.appsumo_redemptions(user_id);

-- Create function to import codes from file
CREATE OR REPLACE FUNCTION public.import_appsumo_codes(codes TEXT[])
RETURNS INTEGER AS $$
DECLARE
  inserted INTEGER := 0;
  code TEXT;
BEGIN
  FOREACH code IN ARRAY codes
  LOOP
    BEGIN
      INSERT INTO public.appsumo_codes (code, plan_type)
      VALUES (code, 'lifetime')
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

-- Create RLS policies for appsumo_codes table
ALTER TABLE public.appsumo_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can insert/update/delete codes
CREATE POLICY admin_all ON public.appsumo_codes 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Anyone can read codes for validation
CREATE POLICY read_all ON public.appsumo_codes 
  FOR SELECT USING (true);

-- Create RLS policies for appsumo_redemptions table
ALTER TABLE public.appsumo_redemptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own redemptions
CREATE POLICY user_select ON public.appsumo_redemptions 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only redeem codes for themselves
CREATE POLICY user_insert ON public.appsumo_redemptions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins can update/delete redemptions
CREATE POLICY admin_all ON public.appsumo_redemptions 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');