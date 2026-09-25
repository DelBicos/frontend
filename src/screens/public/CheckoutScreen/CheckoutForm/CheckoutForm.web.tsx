import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const colors = useColors();
  const styles = createStyles(colors);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const returnUrl = `${window.location.origin}/payment-status`;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'Erro nos dados de pagamento.');
      } else {
        setMessage('Ocorreu um erro inesperado. Tente novamente.');
      }
      setIsLoading(false);
    } else {
      setMessage('Processando pagamento...');
    }
  };

  return (
    <View style={styles.container}>
      {/* Container para o Elemento Web do Stripe */}
      <View style={styles.paymentElementContainer}>
        <PaymentElement id="payment-element" />
      </View>

      {message && <Text style={styles.errorMessageText}>{message}</Text>}

      <TouchableOpacity
        style={[
          styles.checkoutButton,
          (isLoading || !stripe || !elements) && styles.checkoutButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isLoading || !stripe || !elements}
        activeOpacity={0.8}>
        {isLoading ? (
          <ActivityIndicator color={colors.primaryWhite} />
        ) : (
          <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CheckoutForm;
