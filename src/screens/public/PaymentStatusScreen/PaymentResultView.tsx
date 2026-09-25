import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@theme/ThemeProvider';
import { InvoiceData } from '@stores/Appointment';
import InvoiceTemplate from '@components/features/InvoiceTemplate';
import { generatePDF } from '@lib/helpers/fileGenerator';
import { downloadFile } from '@lib/helpers/shareHelperSimple';
import { formatCurrency } from '@lib/appointments';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import PageContainer from '@components/layout/PageContainer';
import BookingSteps from '@components/features/BookingSteps';
import { createStyles } from './styles';

export type PaymentResultStatus =
  'loading' | 'success' | 'processing' | 'error';

interface PaymentResultViewProps {
  status: PaymentResultStatus;
  /** Mensagem de erro (status "error"). */
  message?: string | null;
  invoice?: InvoiceData | null;
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value: string;
}) {
  const colors = useColors();
  const { isCompact } = useBreakpoint();
  const styles = createStyles(colors, isCompact);
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <FontAwesome name={icon} size={16} color={colors.textSecondary} />
      </View>
      <View style={styles.detailTexts}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

/** Etapa 4 do agendamento: resultado do pagamento e proximos passos. */
function PaymentResultView({
  status,
  message,
  invoice,
}: PaymentResultViewProps) {
  const colors = useColors();
  const { isCompact } = useBreakpoint();
  const styles = createStyles(colors, isCompact);
  const navigation = useNavigation<any>();
  const [receiptState, setReceiptState] = useState<
    'idle' | 'busy' | 'saved' | 'failed'
  >('idle');

  // Limpa o historico do fluxo: "voltar" nao retorna ao pagamento.
  const goToSchedules = () =>
    navigation.reset({
      index: 1,
      routes: [{ name: 'Home' }, { name: 'MySchedules' }],
    });
  const goHome = () =>
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  const handleReceipt = async () => {
    if (!invoice) return;
    setReceiptState('busy');
    try {
      const html = InvoiceTemplate(invoice);
      if (Platform.OS === 'web') {
        generatePDF(html);
      } else {
        const uri = await generatePDF(html);
        await downloadFile(uri, `recibo-${invoice.invoiceNumber}.pdf`);
      }
      setReceiptState(Platform.OS === 'web' ? 'idle' : 'saved');
    } catch {
      setReceiptState('failed');
    }
  };

  if (status === 'loading') {
    return (
      <PageContainer>
        <BookingSteps current={4} showBack={false} />
        <View style={styles.card} accessibilityLiveRegion="polite">
          <ActivityIndicator size="large" color={colors.primaryBlack} />
          <Text style={styles.title}>Confirmando seu pagamento…</Text>
          <Text style={styles.text}>Isso leva só alguns segundos.</Text>
        </View>
      </PageContainer>
    );
  }

  if (status === 'error' || status === 'processing') {
    const isProcessing = status === 'processing';
    return (
      <PageContainer>
        <BookingSteps current={4} showBack={false} />
        <View style={styles.card} accessibilityLiveRegion="polite">
          <View
            style={[
              styles.icon,
              isProcessing ? styles.iconWarning : styles.iconError,
            ]}>
            <FontAwesome
              name={isProcessing ? 'hourglass-half' : 'times'}
              size={32}
              color={isProcessing ? colors.warningText : colors.errorText}
            />
          </View>
          <Text
            style={styles.title}
            accessibilityRole="header"
            {...({ 'aria-level': 1 } as object)}>
            {isProcessing
              ? 'Pagamento em processamento'
              : 'Não foi possível concluir o pagamento'}
          </Text>
          <Text style={styles.text}>
            {isProcessing
              ? 'Assim que o pagamento for aprovado, o pedido aparece em Meus agendamentos.'
              : message || 'Ocorreu um erro ao processar o pagamento.'}
          </Text>
          <View style={styles.actions}>
            <Pressable
              onPress={goToSchedules}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button">
              <Text style={styles.primaryButtonText}>
                Ver meus agendamentos
              </Text>
            </Pressable>
            <Pressable
              onPress={goHome}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button">
              <Text style={styles.secondaryButtonText}>Voltar ao início</Text>
            </Pressable>
          </View>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BookingSteps current={4} showBack={false} />
      <View style={styles.card}>
        <View style={[styles.icon, styles.iconSuccess]}>
          <FontAwesome name="check" size={32} color={colors.successText} />
        </View>
        <Text
          style={styles.title}
          accessibilityRole="header"
          {...({ 'aria-level': 1 } as object)}>
          Pedido enviado!
        </Text>
        <Text style={styles.text}>
          Pagamento aprovado. {invoice?.professionalName ?? 'O profissional'}{' '}
          precisa aceitar o pedido e você vai ser avisado. Se for recusado, o
          valor é estornado automaticamente.
        </Text>

        {invoice ? (
          <View style={styles.details}>
            <Detail icon="wrench" label="Serviço" value={invoice.serviceName} />
            <Detail
              icon="user"
              label="Profissional"
              value={invoice.professionalName}
            />
            <Detail
              icon="calendar"
              label="Quando"
              value={`${invoice.serviceDate}, ${invoice.serviceTime}`}
            />
            {invoice.customerAddress ? (
              <Detail
                icon="map-marker"
                label="Onde"
                value={invoice.customerAddress}
              />
            ) : null}
            <Detail
              icon="credit-card"
              label="Total pago"
              value={formatCurrency(Number(invoice.total))}
            />
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            onPress={goToSchedules}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Ver meus agendamentos</Text>
          </Pressable>
          {invoice ? (
            <Pressable
              onPress={handleReceipt}
              disabled={receiptState === 'busy'}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ busy: receiptState === 'busy' }}>
              {receiptState === 'busy' ? (
                <ActivityIndicator color={colors.primaryBlack} />
              ) : (
                <FontAwesome
                  name="file-text-o"
                  size={16}
                  color={colors.primaryBlack}
                />
              )}
              <Text style={styles.secondaryButtonText}>
                {Platform.OS === 'web' ? 'Imprimir recibo' : 'Salvar recibo'}
              </Text>
            </Pressable>
          ) : null}
        </View>
        {receiptState === 'saved' || receiptState === 'failed' ? (
          <Text
            style={[
              styles.feedback,
              receiptState === 'failed' && styles.feedbackError,
            ]}
            accessibilityLiveRegion="polite">
            {receiptState === 'saved'
              ? 'Recibo salvo.'
              : 'Não foi possível gerar o recibo. Tente de novo.'}
          </Text>
        ) : null}
        <Pressable
          onPress={goHome}
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
          accessibilityRole="link">
          <Text style={styles.linkText}>Voltar ao início</Text>
        </Pressable>
      </View>
    </PageContainer>
  );
}

export default PaymentResultView;
