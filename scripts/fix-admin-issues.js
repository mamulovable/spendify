// This script helps diagnose and fix common issues with the admin dashboard

import fs from 'fs';

// Create a diagnostic file
const diagnosticContent = `# Admin Dashboard Diagnostic Guide

## Common Issues and Solutions

### 1. Missing Database Tables

If you see errors like "relation does not exist" or pages that don't load data, you need to create the missing database tables.

**Solution:** Run the \`setup-admin-system.sql\` script in the Supabase SQL Editor.

### 2. Authentication Issues

If you can't log in to the admin dashboard, there might be issues with the authentication system.

**Solution:** Visit \`/admin/auth-test\` to diagnose and fix authentication issues.

### 3. Missing User ID Column

If you see errors related to the \`user_id\` column in the \`admin_users\` table, you need to add this column.

**Solution:** Run the following SQL:

\`\`\`sql
-- Add user_id column to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Link admin user to auth user
UPDATE admin_users
SET user_id = (SELECT id FROM auth.users WHERE email = admin_users.email)
WHERE email = 'admin@spendify.com';
\`\`\`

### 4. Permission Issues

If you can log in but can't access certain pages, there might be issues with permissions.

**Solution:** Check the permissions in the \`admin_roles\` table:

\`\`\`sql
-- Update super_admin role with all permissions
UPDATE admin_roles
SET permissions = '{
  "read": true,
  "write": true,
  "delete": true,
  "manage_users": true,
  "manage_admins": true,
  "system_settings": true,
  "view_dashboard": true,
  "manage_security": true,
  "view_analytics": true,
  "manage_support": true,
  "manage_documents": true,
  "manage_ai": true,
  "manage_settings": true,
  "manage_finance": true,
  "manage_subscriptions": true
}'
WHERE name = 'super_admin';
\`\`\`

### 5. Missing Sample Data

If pages load but don't show any data, you might need to add sample data.

**Solution:** Run the sample data section of the \`setup-admin-system.sql\` script.

## How to Use This Guide

1. Identify which issue you're experiencing
2. Run the corresponding SQL solution in the Supabase SQL Editor
3. Refresh the admin dashboard page

If you continue to have issues, check the browser console for specific error messages.
`;

// Write the diagnostic file
fs.writeFileSync('admin-dashboard-diagnostic.md', diagnosticContent);

console.log('Created admin-dashboard-diagnostic.md');
console.log('');
console.log('To fix common issues with the admin dashboard:');
console.log('1. Run the setup-admin-system.sql script in the Supabase SQL Editor');
console.log('2. Visit /admin/auth-test to diagnose and fix authentication issues');
console.log('3. Check admin-dashboard-diagnostic.md for more solutions');