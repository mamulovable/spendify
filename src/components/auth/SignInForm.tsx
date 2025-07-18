import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, LogIn } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

// Define the form schema with validation rules
const formSchema = z.object({
  email: z.string()
    .email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(1, { message: 'Password is required' }),
});

// Define the form values type from the schema
type FormValues = z.infer<typeof formSchema>;

interface SignInFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

export function SignInForm({ onSuccess, onRegisterClick }: SignInFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Initialize the form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Get auth context
  const { signIn } = useAuth();

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // Login the user with our auth context
      await signIn(data.email, data.password);

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      // Handle login errors
      setServerError(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account yet?{" "}
          <button 
            onClick={onRegisterClick} 
            className="text-primary hover:underline font-medium"
            type="button"
          >
            Register now
          </button>
        </p>
      </div>
    </div>
  );
}