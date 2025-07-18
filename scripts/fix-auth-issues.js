// This script helps fix authentication issues by creating a test page
// that will help diagnose and fix admin authentication problems

import fs from 'fs';

// Create a test auth page
const authTestPage = `import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AuthTestPage() {
  const [email, setEmail] = useState('admin@spendify.com');
  const [password, setPassword] = useState('changeme');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [authUser, setAuthUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState('test');

  // Check current auth status
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setAuthUser(data.user);
        
        // Check if user is admin
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', data.user.id)
          .single();
          
        if (adminData) {
          setAdminUser(adminData);
        }
      }
    }
    
    checkAuth();
  }, []);

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Try to sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setAuthUser(data.user);
      showMessage('Successfully logged in to Supabase Auth', 'success');
      
      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
        
      if (adminError) {
        showMessage('User exists in Auth but not linked to admin_users table', 'warning');
      } else {
        setAdminUser(adminData);
        showMessage('Successfully verified admin user', 'success');
      }
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
      
      setAuthUser(data.user);
      showMessage('User created in Supabase Auth. Check email for confirmation.', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLinkAdmin = async () => {
    if (!authUser) {
      showMessage('You must be logged in first', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if admin user exists with this email
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingAdmin) {
        // Update existing admin user
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ user_id: authUser.id })
          .eq('id', existingAdmin.id);
          
        if (updateError) throw updateError;
        
        showMessage('Linked existing admin user to auth account', 'success');
        
        // Refresh admin user data
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', existingAdmin.id)
          .single();
          
        setAdminUser(adminData);
      } else {
        showMessage('No matching admin user found with this email', 'error');
      }
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setAdminUser(null);
    showMessage('Logged out successfully', 'info');
  };
  
  const handleFixAdmin = async () => {
    setLoading(true);
    
    try {
      // Get super_admin role ID
      const { data: roleData, error: roleError } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('name', 'super_admin')
        .single();
        
      if (roleError) throw roleError;
      
      // Create admin user if it doesn't exist
      const { data: adminData, error: adminError } = await supabase
        .rpc('create_admin_user', {
          user_email: email,
          user_full_name: 'System Administrator',
          user_password: password,
          user_role_id: roleData.id,
          user_created_by: null
        });
        
      if (adminError) throw adminError;
      
      showMessage('Admin user created successfully', 'success');
      
      // If we're logged in, link the admin user
      if (authUser) {
        await handleLinkAdmin();
      } else {
        showMessage('Now try logging in with these credentials', 'info');
      }
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Authentication Test</h1>
      
      {message && (
        <Alert 
          variant={messageType === 'error' ? 'destructive' : messageType === 'success' ? 'default' : 'outline'} 
          className="mb-6"
        >
          {messageType === 'error' && <AlertTriangle className="h-4 w-4" />}
          {messageType === 'success' && <CheckCircle className="h-4 w-4" />}
          <AlertTitle>
            {messageType === 'error' ? 'Error' : 
             messageType === 'success' ? 'Success' : 
             messageType === 'warning' ? 'Warning' : 'Information'}
          </AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
              <CardDescription>Current authentication state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Supabase Auth</h3>
                {authUser ? (
                  <div className="bg-muted p-3 rounded-md mt-2">
                    <p><strong>ID:</strong> {authUser.id}</p>
                    <p><strong>Email:</strong> {authUser.email}</p>
                    <p><strong>Created:</strong> {new Date(authUser.created_at).toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Not logged in</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium">Admin User</h3>
                {adminUser ? (
                  <div className="bg-muted p-3 rounded-md mt-2">
                    <p><strong>ID:</strong> {adminUser.id}</p>
                    <p><strong>Email:</strong> {adminUser.email}</p>
                    <p><strong>Name:</strong> {adminUser.full_name}</p>
                    <p><strong>Role ID:</strong> {adminUser.role_id}</p>
                    <p><strong>Active:</strong> {adminUser.is_active ? 'Yes' : 'No'}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No admin user linked</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {authUser ? (
                <Button onClick={handleLogout}>Log Out</Button>
              ) : (
                <p className="text-sm text-muted-foreground">Use the form to log in</p>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="test">Test Login</TabsTrigger>
              <TabsTrigger value="signup">Create User</TabsTrigger>
              <TabsTrigger value="fix">Fix Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="test">
              <Card>
                <CardHeader>
                  <CardTitle>Test Login</CardTitle>
                  <CardDescription>Test authentication with existing credentials</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        'Test Login'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create Auth User</CardTitle>
                  <CardDescription>Create a new user in Supabase Auth</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create User'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="fix">
              <Card>
                <CardHeader>
                  <CardTitle>Fix Admin User</CardTitle>
                  <CardDescription>Fix admin user issues</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fix-email">Email</Label>
                    <Input
                      id="fix-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fix-password">Password</Label>
                    <Input
                      id="fix-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button onClick={handleFixAdmin} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Fixing...
                        </>
                      ) : (
                        'Create/Fix Admin User'
                      )}
                    </Button>
                    
                    {authUser && (
                      <Button variant="outline" onClick={handleLinkAdmin} disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Linking...
                          </>
                        ) : (
                          'Link Current User to Admin'
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
`;

// Write the file
fs.writeFileSync('src/pages/AuthTestPage.tsx', authTestPage);

// Create a route for the test page
const routeCode = `
// Add this to your routes file
{
  path: '/auth-test',
  element: <AuthTestPage />,
},
`;

console.log('Created AuthTestPage.tsx');
console.log('');
console.log('To use this page:');
console.log('1. Add the following route to your routes file:');
console.log(routeCode);
console.log('2. Navigate to /auth-test in your browser');
console.log('3. Use the page to diagnose and fix authentication issues');
console.log('');
console.log('Default credentials:');
console.log('Email: admin@spendify.com');
console.log('Password: changeme');