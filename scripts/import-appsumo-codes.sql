-- Create a temporary table to hold the codes
CREATE TEMP TABLE temp_appsumo_codes (
  code TEXT
);

-- Insert all 3000 codes into the temporary table
-- Replace this with your actual codes
INSERT INTO temp_appsumo_codes (code) VALUES
('AS-LBL10KERHR5SSG8'),
('AS-UL4DSY5NJ6K1LL5'),
('AS-5Z01ZHSY43DTJ5R'),
('AS-IAZWQ0NJPUOCD3W'),
('AS-8FC46KUUFMSPVEA'),
('AS-M5XUNNHG1PWP4VV'),
('AS-YX404MBRFN22KU3'),
('AS-QW75Z75H9WQJJSG'),
('AS-XNNP76ONPAAFZKH'),
('AS-UDICXAEZ5TFOMR0');
-- Add all remaining codes here...

-- Insert the codes into the appsumo_codes table
INSERT INTO public.appsumo_codes (code, plan_type, is_active)
SELECT 
  code,
  'lifetime', -- Default plan type
  true        -- Active by default
FROM temp_appsumo_codes
ON CONFLICT (code) DO NOTHING;

-- Drop the temporary table
DROP TABLE temp_appsumo_codes;

-- Verify the import
SELECT COUNT(*) FROM public.appsumo_codes;