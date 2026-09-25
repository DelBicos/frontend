import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

interface CheckoutFormProps {
  onPay: () => void;
  isLoading: boolean;
  message: string | null;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onPay,
  isLoading,
  message,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.paymentElementContainer}>
        <Text
          style={{
            color: colors.textSecondary,
            textAlign: 'center',
            fontFamily: 'Afacad-Regular',
            fontSize: 14,
            lineHeight: 20,
          }}>
          Ao finalizar, uma tela segura de pagamento será exibida.
        </Text>
      </View>

      {message && <Text style={styles.errorMessageText}>{message}</Text>}

      <TouchableOpacity
        style={[
          styles.checkoutButton,
          isLoading && styles.checkoutButtonDisabled,
        ]}
        onPress={onPay}
        disabled={isLoading}
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
