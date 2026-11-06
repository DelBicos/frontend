// src/lib/stripe/stripe.ts — Native stub
// On mobile, Stripe is initialized via StripeProvider from @stripe/stripe-react-native.
// This file exists so imports of '@lib/stripe/stripe' don't break on native.
export { STRIPE_PUBLISHABLE_KEY } from '@config/varEnvs';
export const stripePromise: null = null;
