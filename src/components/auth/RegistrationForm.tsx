import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus, CheckCircle } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/services/authService';

// Define the form schema with validation rules
const formSchema = z.object({
  fullName: z.string()
    .min(2, { message: 'Full name must be at least 2 characters' })
    .max(50, { message: 'Full name must be less than 50 characters' }),
  email: z.string()
    .email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),

});

// Define the form values type from the schema
type FormValues = z.infer<typeof formSchema>;

interface RegistrationFormProps {
  onSuccess?: () => void;
  onSignInClick?: () => void;
}

export function RegistrationForm({ onSuccess, onSignInClick }: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Initialize the form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    setRegistrationSuccess(false);

    try {
      // Register the user with our auth service
      await authService.registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        // Don't set isAppSumoUser flag until code is redeemed
      });

      // Set success state
      setRegistrationSuccess(true);
      
      // Call the success callback if provided
      if (onSuccess) {
        // Give the user a moment to see the success message
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error: any) {
      // Handle specific registration errors
      if (error.message?.includes('email already in use')) {
        setServerError('This email is already registered. Please sign in instead.');
      } else if (error.message?.includes('invalid code')) {
        setServerError('The AppSumo code you entered is invalid. Please check and try again.');
      } else {
        setServerError(error.message || 'An error occurred during registration. Please try again.');
      }
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
      
      {registrationSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Registration successful! Redirecting to plan selection...
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                Registering...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Register
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <button 
            onClick={onSignInClick} 
            className="text-primary hover:underline font-medium"
            type="button"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}