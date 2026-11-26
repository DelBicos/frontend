import { loadStripe } from '@stripe/stripe-js';
import * as webStripe from '../stripe.web';

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({ id: 'stripe' })),
}));
jest.mock('@config/varEnvs', () => ({
  STRIPE_PUBLISHABLE_KEY: 'pk_test_exemplo',
}));

// requireActual: o resolvedor do ESLint escolheria o stripe.web.ts.
const nativeStripe =
  jest.requireActual<typeof import('../stripe')>('../stripe');

describe('stripe', () => {
  it('no app nativo nao carrega o Stripe.js e repassa a chave', () => {
    expect(nativeStripe.stripePromise).toBeNull();
    expect(nativeStripe.STRIPE_PUBLISHABLE_KEY).toBe('pk_test_exemplo');
  });

  it('no web carrega o Stripe.js uma vez com a chave publica', async () => {
    expect(loadStripe).toHaveBeenCalledTimes(1);
    expect(loadStripe).toHaveBeenCalledWith('pk_test_exemplo');
    await expect(webStripe.stripePromise).resolves.toEqual({ id: 'stripe' });
  });
});
