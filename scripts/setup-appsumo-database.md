# AppSumo Database Setup Guide

This guide helps you set up the AppSumo database tables and test data in Supabase.

## Step 1: Create Database Tables

Run the following SQL script in your Supabase SQL Editor:

```sql
-- File: supabase/20250717000000_create_appsumo_tables.sql
-- This creates the appsumo_codes and appsumo_redemptions tables
```

Copy and paste the contents of `supabase/20250717000000_create_appsumo_tables.sql` into the Supabase SQL Editor and execute it.

## Step 2: Import Test Data

Run the following SQL script to add test codes for development:

```sql
-- File: scripts/import-test-appsumo-codes.sql
-- This adds test codes for all plan types
```

Copy and paste the contents of `scripts/import-test-appsumo-codes.sql` into the Supabase SQL Editor and execute it.

## Step 3: Verify Setup

After running both scripts, you should see:

1. Two new tables in your Supabase database:
   - `appsumo_codes`
   - `appsumo_redemptions`

2. Test codes available for each plan type:
   - **Basic LTD**: AS-LBL10KERHR5SSG8, AS-UL4DSY5NJ6K1LL5, AS-5Z01ZHSY43DTJ5R
   - **Premium LTD**: AS-M5XUNNHG1PWP4VV, AS-YX404MBRFN22KU3, AS-QW75Z75H9WQJJSG  
   - **Ultimate LTD**: AS-GXEJMW3AIYEI31A, AS-ILGD8Y8AKYQVGUE, AS-YSCJM7UB2RJURLV

## Step 4: Test Code Redemption

You can now test the AppSumo code redemption with proper database integration:

1. Visit `/redeem` in your application
2. Register or sign in
3. Select a plan (e.g., Premium LTD)
4. Use a matching test code (e.g., AS-YX404MBRFN22KU3 for Premium LTD)
5. The code should be validated against the database and redeemed successfully

## Troubleshooting

If you encounter issues:

1. **Tables don't exist**: Make sure you ran the table creation script first
2. **No test codes**: Make sure you ran the test data import script
3. **Permission errors**: Check that RLS policies are properly configured
4. **Code validation fails**: Verify the code exists in the database and matches the selected plan type

## Production Setup

For production, you'll need to:

1. Generate real AppSumo codes (not test codes)
2. Set up proper code distribution system
3. Configure monitoring and analytics
4. Set up admin tools for code management