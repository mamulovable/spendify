-- Import test AppSumo codes for development and testing
-- This script adds a few test codes to the appsumo_codes table

-- Insert test codes with different plan types
INSERT INTO public.appsumo_codes (code, plan_type, created_at, is_active) VALUES
-- Basic LTD codes
('AS-LBL10KERHR5SSG8', 'basic_ltd', NOW(), TRUE),
('AS-UL4DSY5NJ6K1LL5', 'basic_ltd', NOW(), TRUE),
('AS-5Z01ZHSY43DTJ5R', 'basic_ltd', NOW(), TRUE),
('AS-IAZWQ0NJPUOCD3W', 'basic_ltd', NOW(), TRUE),
('AS-8FC46KUUFMSPVEA', 'basic_ltd', NOW(), TRUE),

-- Premium LTD codes
('AS-M5XUNNHG1PWP4VV', 'premium_ltd', NOW(), TRUE),
('AS-YX404MBRFN22KU3', 'premium_ltd', NOW(), TRUE),
('AS-QW75Z75H9WQJJSG', 'premium_ltd', NOW(), TRUE),
('AS-XNNP76ONPAAFZKH', 'premium_ltd', NOW(), TRUE),
('AS-UDICXAEZ5TFOMR0', 'premium_ltd', NOW(), TRUE),

-- Ultimate LTD codes
('AS-GXEJMW3AIYEI31A', 'ultimate_ltd', NOW(), TRUE),
('AS-ILGD8Y8AKYQVGUE', 'ultimate_ltd', NOW(), TRUE),
('AS-YSCJM7UB2RJURLV', 'ultimate_ltd', NOW(), TRUE),
('AS-RKS17GOOA0DTQQJ', 'ultimate_ltd', NOW(), TRUE),
('AS-6O2OKMCSW09G5I7', 'ultimate_ltd', NOW(), TRUE)

ON CONFLICT (code) DO NOTHING;

-- Verify the codes were inserted
SELECT 
    plan_type,
    COUNT(*) as code_count
FROM public.appsumo_codes 
WHERE code LIKE 'AS-%'
GROUP BY plan_type
ORDER BY plan_type;