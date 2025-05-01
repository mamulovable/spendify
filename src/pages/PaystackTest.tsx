import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { initializePayment } from '@/services/paystackService';
import { PLANS, DURATIONS } from '@/config/pricing';
import Dashboard from '@/pages/Dashboard';

export default function PaystackTest() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTestPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Use the first plan and duration for testing
      const plan = PLANS[0];
      const duration = DURATIONS[0];
      
      initializePayment(
        plan,
        duration,
        'test@example.com',
        {
          test: 'true',
        },
        (reference) => {
          toast({
            title: "Payment Successful",
            description: `Reference: ${reference}`,
          });
          setIsProcessing(false);
        },
        () => {
          toast({
            title: "Payment Cancelled",
            description: "You can try again when you're ready.",
            variant: "destructive",
          });
          setIsProcessing(false);
        }
      );
    } catch (error) {
      console.error('Payment initialization failed:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <Dashboard>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Paystack Test</h1>
        
        <Card className="p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Test Payment Integration</h2>
          <p className="mb-6">
            This page allows you to test the Paystack payment integration without actually subscribing to a plan.
          </p>
          
          <Button 
            onClick={handleTestPayment} 
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processing..." : "Test Payment"}
          </Button>
          
          <div className="mt-6 text-sm text-muted-foreground">
            <p>This will open the Paystack payment modal with a test amount.</p>
            <p className="mt-2">Use these test card details:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Card Number: 4084 0840 8408 4081</li>
              <li>Expiry Date: Any future date</li>
              <li>CVV: Any 3 digits</li>
              <li>OTP: Any 6 digits</li>
            </ul>
          </div>
        </Card>
      </div>
    </Dashboard>
  );
} 