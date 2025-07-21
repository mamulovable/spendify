-- Verification script for AppSumo database setup
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- Check if tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('appsumo_codes', 'appsumo_redemptions')
ORDER BY tablename;

-- Check table structures (PostgreSQL information schema)
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'appsumo_codes'
ORDER BY 
    ordinal_position;

SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'appsumo_redemptions'
ORDER BY 
    ordinal_position;

-- Check if test codes are loaded
SELECT 
    plan_type,
    COUNT(*) as code_count,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM public.appsumo_codes 
GROUP BY plan_type
ORDER BY plan_type;

-- Show sample codes for each plan type
SELECT 
    plan_type,
    code,
    is_active,
    created_at
FROM public.appsumo_codes 
WHERE plan_type IN ('basic_ltd', 'premium_ltd', 'ultimate_ltd')
ORDER BY plan_type, code
LIMIT 15;

-- Check redemptions table (should be empty initially)
SELECT 
    COUNT(*) as total_redemptions,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT plan_type) as plan_types_redeemed
FROM public.appsumo_redemptions;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('appsumo_codes', 'appsumo_redemptions')
ORDER BY tablename, policyname;