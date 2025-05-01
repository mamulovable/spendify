const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

if (!paystackPublicKey) {
  console.warn('Warning: Paystack public key is not configured in environment variables');
}

export const config = {
  paystackPublicKey,
}; 