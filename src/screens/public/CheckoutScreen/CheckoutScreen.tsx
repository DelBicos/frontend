import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@config/varEnvs';
import { confirmPayment, paymentIntentIdFromSecret } from '@api/payments';
import { getApiErrorMessage } from '@api/errors';
import { useColors } from '@theme/ThemeProvider';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import CheckoutView from './CheckoutView';
import { useCheckout } from './useCheckout';
import { createStyles } from './styles';

/** App: o pagamento abre na tela segura do Stripe (PaymentSheet). */
function NativePayment({
  clientSecret,
  amountLabel,
}: {
  clientSecret: string;
  amountLabel: string;
}) {
  const colors = useColors();
  const { isCompact } = useBreakpoint();
  const styles = createStyles(colors, isCompact);
  const navigation = useNavigation<any>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isReady, setIsReady] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsReady(false);
    initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'DelBicos',
      allowsDelayedPaymentMethods: false,
    }).then(({ error }) => {
      if (cancelled) return;
      if (error) {
        setMessage('Não foi possível abrir o pagamento. Tente de novo.');
      } else {
        setIsReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [clientSecret, initPaymentSheet]);

  const handlePay = async () => {
    setIsPaying(true);
    setMessage(null);
    try {
      const { error } = await presentPaymentSheet();
      if (error) {
        if (error.code !== 'Canceled') {
          setMessage(error.message || 'O pagamento não foi concluído.');
        }
        return;
      }
      // Pagamento aprovado: o servidor cria o agendamento (idempotente) ou
      // estorna e explica o motivo.
      const paymentIntentId = paymentIntentIdFromSecret(clientSecret);
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

  const disabled = !isReady || isPaying;

  return (
    <View style={styles.form}>
      <Text style={styles.formHint}>
        Ao tocar em pagar, abre a tela segura para informar o cartão.
      </Text>
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
        {isPaying || !isReady ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <FontAwesome name="lock" size={18} color="#000000" />
        )}
        <Text style={styles.payButtonText}>Pagar {amountLabel}</Text>
      </Pressable>
    </View>
  );
}

function CheckoutContent() {
  const checkout = useCheckout();
  return (
    <CheckoutView
      checkout={checkout}
      renderPayment={(amountLabel) =>
        checkout.clientSecret ? (
          <NativePayment
            clientSecret={checkout.clientSecret}
            amountLabel={amountLabel}
          />
        ) : null
      }
    />
  );
}

function CheckoutScreen() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <CheckoutContent />
    </StripeProvider>
  );
}

export default CheckoutScreen;
