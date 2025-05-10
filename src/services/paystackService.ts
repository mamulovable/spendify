import { Plan, PlanDuration, calculatePrice } from '@/config/pricing';
import { config } from '@/config/env';

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref?: string;
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
  metadata: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
    [key: string]: any;
  };
}

interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
}

export const initializePayment = async (
  plan: Plan,
  duration: PlanDuration,
  email: string,
  metadata: Record<string, string>,
  onSuccess: (reference: string) => void,
  onCancel: () => void
): Promise<void> => {
  if (!config.paystackPublicKey) {
    throw new Error('Paystack public key is not configured');
  }

  // Check if Paystack is loaded
  if (typeof window.PaystackPop === 'undefined') {
    throw new Error('Paystack script not loaded. Please refresh the page and try again.');
  }

  // If this is a card verification for trial, set amount to ₦100 (10000 kobo)
  // Otherwise, calculate the total price for the selected plan and duration
  const isCardVerification = metadata.is_card_verification === 'true';
  const amountInKobo = isCardVerification ? 10000 : calculatePrice(plan, duration) * 100; // ₦100 = 10000 kobo

  const reference = 'TR' + Math.floor((Math.random() * 1000000000) + 1);

  const handler = window.PaystackPop.setup({
    key: config.paystackPublicKey,
    email,
    amount: amountInKobo,
    currency: 'NGN',
    ref: reference,
    metadata: {
      custom_fields: [
        {
          display_name: "Plan Name",
          variable_name: "plan_name",
          value: plan.name
        },
        {
          display_name: "Duration",
          variable_name: "duration",
          value: `${duration.months} months`
        },
        ...Object.entries(metadata).map(([key, value]) => ({
          display_name: key,
          variable_name: key.toLowerCase(),
          value
        }))
      ],
      plan_id: plan.id,
      duration_months: duration.months
    },
    callback: (response) => {
      console.log('Paystack callback received:', response);
      if (response.status === 'success') {
        onSuccess(response.reference);
      } else {
        console.error('Payment failed:', response.message);
        throw new Error(response.message || 'Payment failed');
      }
    },
    onClose: () => {
      console.log('Paystack modal closed');
      onCancel();
    }
  });

  handler.openIframe();
};

export const verifyPayment = async (reference: string): Promise<boolean> => {
  if (!config.paystackPublicKey) {
    throw new Error('Paystack public key is not configured');
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${config.paystackPublicKey}`,
      },
    });

    const data = await response.json();
    console.log('Payment verification response:', data);
    return data.status;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
}; 