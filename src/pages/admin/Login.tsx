import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { Eye, EyeOff, Lock, Mail, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { setAdminUser, isAdmin } = useAdmin();

  // Redirect if already logged in
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      // Log the login attempt (in a real app, this would be server-side)
      setLoginAttempts(prev => prev + 1);
      
      // Check for too many failed attempts
      if (loginAttempts >= 5) {
        throw new Error('Too many failed login attempts. Please try again later.');
      }

      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if the user has admin privileges
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select(`
          *,
          role:admin_roles (
            *,
            permissions
          )
        `)
        .eq('user_id', user?.id)
        .single();

      if (adminError || !adminData) {
        throw new Error('Unauthorized access. You do not have admin privileges.');
      }

      if (!adminData.is_active) {
        throw new Error('Your admin account has been deactivated. Please contact the system administrator.');
      }

      // Update last login time
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminData.id);

      // Log successful login
      await supabase.from('admin_activity_logs').insert({
        admin_user_id: adminData.id,
        action: 'login',
        resource: 'auth',
        details: { ip_address: window.location.hostname, user_agent: navigator.userAgent },
      });

      setAdminUser({
        id: adminData.id,
        user_id: user?.id || '',
        email: user?.email || '',
        role_id: adminData.role_id,
        is_active: adminData.is_active,
        last_login: new Date().toISOString(),
        created_at: adminData.created_at,
        updated_at: adminData.updated_at,
        role: adminData.role
      });

      toast({
        title: 'Welcome back!',
        description: `Successfully logged in as ${adminData.role?.name || 'admin'}.`,
      });

      // Redirect to the page they were trying to access, or to the admin dashboard
      const from = location.state?.from?.pathname || '/admin';
      navigate(from);
    } catch (error: any) {
      // Log failed login attempt (in a real app, this would be server-side)
      console.error('Failed login attempt:', email);
      
      setErrorMessage(error.message || 'Failed to log in. Please check your credentials.');
      
      toast({
        title: 'Authentication Error',
        description: error.message || 'Failed to log in',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Spendify Admin</h1>
          <p className="text-muted-foreground mt-2">Secure admin dashboard access</p>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Sign in with your admin credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@spendify.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={toggleShowPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
            <p>This is a secure area. Unauthorized access attempts are logged and monitored.</p>
            <p>
              Forgot your password? Contact the system administrator.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Login;
