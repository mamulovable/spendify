# Admin Authentication Issue Solution

## The Problem

The admin login is failing because there's a disconnect between the Supabase Auth system and the admin_users table. Looking at the login code in `src/pages/admin/Login.tsx`, we can see that the authentication flow works like this:

1. First, it authenticates the user with Supabase Auth using `supabase.auth.signInWithPassword`
2. Then, it checks if the authenticated user has admin privileges by querying the `admin_users` table with `user_id` equal to the authenticated user's ID
3. If no matching admin user is found, it throws an error

The issue is that when we created the admin user in the `admin_users` table, we didn't link it to a user in Supabase Auth, or the `user_id` field in the `admin_users` table is not set correctly.

## The Solution

I've created a special test page at `src/pages/AuthTestPage.tsx` that will help diagnose and fix the issue. Here's how to use it:

### Step 1: Add the route to your routes file

Add this route to your `src/routes/index.tsx` file:

```jsx
import AuthTestPage from '@/pages/AuthTestPage';

// Add this to your routes array
{
  path: '/auth-test',
  element: <AuthTestPage />,
},
```

### Step 2: Access the test page

Navigate to `/auth-test` in your browser.

### Step 3: Fix the authentication issue

The test page provides three tabs:

1. **Test Login**: Test if you can log in with the admin credentials
2. **Create User**: Create a new user in Supabase Auth
3. **Fix Admin**: Fix the admin user by creating or linking it

#### Option 1: Create a new Supabase Auth user and link it

1. Go to the "Create User" tab
2. Enter the admin email (`admin@spendify.com`) and password (`changeme`)
3. Click "Create User"
4. After the user is created, go to the "Fix Admin" tab
5. Click "Link Current User to Admin"

#### Option 2: Fix the admin user directly

1. Go to the "Fix Admin" tab
2. Make sure the email is set to `admin@spendify.com` and password to `changeme`
3. Click "Create/Fix Admin User"

### Step 4: Test the login

After fixing the issue, you should be able to:

1. Go to the "Test Login" tab
2. Enter the admin credentials
3. Click "Test Login"
4. See both "Supabase Auth" and "Admin User" sections populated with data

### Step 5: Try the actual admin login

Now you should be able to go to `/admin/login` and log in with:
- Email: admin@spendify.com
- Password: changeme

## Technical Details

### The Root Cause

The issue is that the admin authentication system uses a two-table approach:

1. **Supabase Auth**: Handles the actual authentication (passwords, sessions, etc.)
2. **admin_users**: Stores admin-specific information and permissions

When we created the admin user in the `admin_users` table, we didn't create a corresponding user in Supabase Auth, or we didn't link them properly.

### The Fix

The fix involves:

1. Creating a user in Supabase Auth with the same email as the admin user
2. Updating the `admin_users` table to set the `user_id` field to the Supabase Auth user's ID

### Database Schema

The admin_users table should have a `user_id` column that references the `id` column in the `auth.users` table. This is what links the two systems together.

## Preventing Future Issues

To prevent this issue in the future:

1. Always create the Supabase Auth user first
2. Then create the admin user with the correct `user_id`
3. Use a transaction to ensure both operations succeed or fail together

## Additional Notes

If you continue to have issues, you may need to check:

1. If the `admin_users` table has a `user_id` column
2. If the RLS policies are configured correctly
3. If there are any permission issues with the Supabase Auth system