// src/lib/stripe/stripe.ts
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '@config/varEnvs';

// Carrega o Stripe.js assincronamente e exporta a promise
// Isso garante que ele só seja carregado uma vez em todo o app
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
