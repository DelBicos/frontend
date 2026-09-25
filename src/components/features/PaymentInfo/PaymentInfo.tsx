import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

interface PaymentInfoProps {
  total: number;
  discount?: number;
  couponCode?: string;
  paymentMethod: 'PIX' | 'Cartão de Crédito' | 'Dinheiro' | string;
  installments?: number;
}

const PaymentInfo: React.FC<PaymentInfoProps> = ({
  total,
  discount = 0,
  couponCode,
  paymentMethod,
  installments = 1,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const finalAmount = total - discount;

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo do Pagamento</Text>

      <View style={styles.paymentSummary}>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal:</Text>
          <Text style={styles.value}>{formatCurrency(total)}</Text>
        </View>

        {discount > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Desconto:</Text>
            <Text style={[styles.value, styles.discountText]}>
              -{formatCurrency(discount)}
              {couponCode ? ` (${couponCode})` : ''}
            </Text>
          </View>
        )}

        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{formatCurrency(finalAmount)}</Text>
        </View>
      </View>

      <View style={styles.methodContainer}>
        <Text style={styles.methodTitle}>Forma de Pagamento:</Text>
        <Text style={styles.methodValue}>
          {paymentMethod === 'Cartão de Crédito' && installments > 1
            ? `${paymentMethod} (${installments}x de ${formatCurrency(
                finalAmount / installments,
              )})`
            : paymentMethod}
        </Text>

        {paymentMethod === 'PIX' && (
          <Text style={styles.note}>Pagamento aprovado instantaneamente</Text>
        )}
      </View>
    </View>
  );
};

export default PaymentInfo;
