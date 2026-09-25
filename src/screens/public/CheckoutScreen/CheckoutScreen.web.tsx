import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { stripePromise } from '@lib/stripe/stripe';
import { confirmPayment, paymentIntentIdFromSecret } from '@api/payments';
import { getApiErrorMessage } from '@api/errors';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import CheckoutView from './CheckoutView';
import { useCheckout } from './useCheckout';
import { createStyles } from './styles';

/** Web: formulario do Stripe na propria pagina. */
function WebPaymentForm({ amountLabel }: { amountLabel: string }) {
  const colors = useColors();
  const { isCompact } = useBreakpoint();
  const styles = createStyles(colors, isCompact);
  const navigation = useNavigation<any>();
  const stripe = useStripe();
  const elements = useElements();
  const [isReady, setIsReady] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setIsPaying(true);
    setMessage(null);
    try {
      // Cartao sem autenticacao extra conclui aqui mesmo; os demais metodos
      // redirecionam e voltam para /payment-status.
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-status`,
        },
        redirect: 'if_required',
      });
      if (error) {
        setMessage(
          error.type === 'card_error' || error.type === 'validation_error'
            ? error.message || 'Confira os dados do cartão.'
            : 'O pagamento não foi concluído. Tente de novo.',
        );
        return;
      }
      if (!paymentIntent) return;
      const paymentIntentId =
        paymentIntent.id ??
        paymentIntentIdFromSecret(paymentIntent.client_secret ?? '');
      const { appointment } = await confirmPayment(paymentIntentId);
      navigation.replace('PaymentStatus', {
        appointmentId: appointment.id,
        paymentIntentId,
      });
    } catch (err) {
      setMessage(
        getApiErrorMessage(err, 'Não foi possível confirmar o agendamento.'),
      );
    } finally {
      setIsPaying(false);
    }
  };

  const disabled = !stripe || !elements || !isReady || isPaying;

  return (
    <View style={styles.form}>
      <PaymentElement
        id="payment-element"
        onReady={() => setIsReady(true)}
        options={{ layout: 'tabs' }}
      />
      {message ? (
        <Text style={styles.formMessage} accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
      <Pressable
        onPress={handlePay}
        disabled={disabled}
        style={({ pressed }) => [
          styles.payButton,
          disabled && styles.payButtonDisabled,
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled, busy: isPaying }}>
        {isPaying ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <FontAwesome name="lock" size={18} color="#000000" />
        )}
        <Text style={styles.payButtonText}>
          {isPaying ? 'Processando…' : `Pagar ${amountLabel}`}
        </Text>
      </Pressable>
    </View>
  );
}

function CheckoutScreen() {
  const checkout = useCheckout();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);

  // Mesmas cores e fonte do site dentro do formulario do Stripe.
  const options = useMemo(
    () => ({
      clientSecret: checkout.clientSecret ?? '',
      fonts: [
        {
          cssSrc:
            'https://fonts.googleapis.com/css2?family=Afacad:wght@400;600;700&display=swap',
        },
      ],
      appearance: {
        theme:
          theme === ThemeMode.DARK ? ('night' as const) : ('stripe' as const),
        variables: {
          colorPrimary: colors.primaryOrange,
          colorText: colors.primaryBlack,
          colorBackground: colors.cardBackground,
          colorDanger: colors.errorText,
          fontFamily: 'Afacad, system-ui, sans-serif',
          fontSizeBase: '17px',
          borderRadius: '10px',
        },
      },
    }),
    [checkout.clientSecret, colors, theme],
  );

  return (
    <CheckoutView
      checkout={checkout}
      renderPayment={(amountLabel) =>
        checkout.clientSecret ? (
          <Elements
            key={checkout.clientSecret + theme}
            options={options}
            stripe={stripePromise}>
            <WebPaymentForm amountLabel={amountLabel} />
          </Elements>
        ) : null
      }
    />
  );
}

export default CheckoutScreen;
