import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Elements, useStripe } from '@stripe/react-stripe-js';
// @ts-ignore - stripePromise is only used on web, so we ignore it on native
import { stripePromise } from '@lib/stripe/stripe';
import { createStyles } from './styles';
import { FontAwesome } from '@expo/vector-icons';
import { HTTP_DOMAIN } from '@config/varEnvs';
import { useUserStore } from '@stores/User';
import {
  useAppointmentStore,
  Appointment,
  InvoiceData,
} from '@stores/Appointment';
import InvoiceTemplate from '@components/features/InvoiceTemplate';
import { generatePDF } from '@lib/helpers/fileGenerator';
import { downloadFile } from '@lib/helpers/shareHelperSimple';
import { isAppointmentValidationError } from '@lib/helpers/paymentErrors';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore, ThemeMode } from '@stores/Theme';

type StatusType = 'loading' | 'success' | 'error';

function PaymentStatusLogic() {
  const navigation = useNavigation();
  const stripe = useStripe();
  const { user } = useUserStore();
  const { fetchInvoice, fetchAppointments } = useAppointmentStore();

  const [status, setStatus] = useState<StatusType>('loading');
  const [message, setMessage] = useState('Verificando seu pagamento...');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const colors = useColors();
  const { theme } = useThemeStore();
  const isDark = theme === ThemeMode.DARK;
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;
  const styles = createStyles(colors, isDark, isHighContrast);

  useEffect(() => {
    if (!stripe || !user) return;

    const verifyPayment = async () => {
      try {
        let clientSecret: string | null = null;
        let paymentIntentId: string | null = null;

        if (Platform.OS === 'web') {
          const urlParams = new URLSearchParams(window.location.search);
          clientSecret = urlParams.get('payment_intent_client_secret');
          paymentIntentId = urlParams.get('payment_intent');
        }

        if (!clientSecret || !paymentIntentId) {
          throw new Error('Informações de pagamento não encontradas.');
        }

        const { error, paymentIntent } =
          await stripe.retrievePaymentIntent(clientSecret);

        if (error) throw error;

        if (paymentIntent?.status === 'succeeded') {
          const { token } = useUserStore.getState();

          const confirmResponse = await fetch(
            `${HTTP_DOMAIN}/api/payments/confirm`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                paymentIntentId: paymentIntentId,
              }),
            },
          );

          const confirmData = await confirmResponse.json();

          if (!confirmResponse.ok) {
            const msg =
              confirmData.error ||
              confirmData.message ||
              'Falha ao confirmar agendamento no servidor.';

            // Falha na validação de posse/estado do agendamento: não retenta a
            // mesma chamada, recarrega o estado real e orienta a reiniciar o checkout.
            if (isAppointmentValidationError(msg)) {
              await fetchAppointments('client');
              throw new Error(
                `${msg} Reinicie o processo de agendamento para verificar a situação atual antes de tentar novamente.`,
              );
            }

            throw new Error(msg);
          }

          const newAppointment = confirmData.appointment as Appointment;
          const invoice = await fetchInvoice(newAppointment.id);

          if (invoice) {
            setInvoiceData(invoice);
          }

          setStatus('success');
          setMessage('Seu pagamento foi concluído e o serviço confirmado!');
        } else {
          throw new Error(
            `Pagamento não concluído. Status: ${paymentIntent?.status}`,
          );
        }
      } catch (err: any) {
        console.error('[PaymentStatus] Erro:', err.message);
        setStatus('error');
        setMessage(err.message || 'Ocorreu um erro ao processar o pagamento.');
      }
    };

    verifyPayment();
  }, [stripe, user, fetchInvoice]);

  const handlePrintOrDownload = useCallback(async () => {
    if (!invoiceData) {
      Alert.alert('Erro', 'Dados do recibo indisponíveis.');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const htmlContent = InvoiceTemplate(invoiceData);
      const fileName = `recibo-${invoiceData.invoiceNumber}.pdf`;

      if (Platform.OS === 'web') {
        generatePDF(htmlContent);
      } else {
        const uri = await generatePDF(htmlContent);
        await downloadFile(uri, fileName);
        Alert.alert('Sucesso', 'Recibo salvo com sucesso.');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao gerar o recibo.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [invoiceData]);

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={[styles.title, { marginTop: 24, fontSize: 20 }]}>
          {message}
        </Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={[styles.iconContainer, styles.iconError]}>
            <FontAwesome name="times" size={40} color={colors.errorText} />
          </View>
          <Text style={styles.title}>Pagamento Falhou</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={() => navigation.navigate('Feed' as never)}>
            <Text style={styles.buttonText}>Voltar para o Início</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.iconContainer, styles.iconSuccess]}>
          <FontAwesome name="check" size={40} color={colors.successText} />
        </View>

        <Text style={styles.title}>Pagamento Aprovado!</Text>
        <Text style={styles.message}>{message}</Text>

        {invoiceData && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.receiptButton,
              isGeneratingPDF && styles.buttonDisabled,
            ]}
            onPress={handlePrintOrDownload}
            disabled={isGeneratingPDF}>
            {isGeneratingPDF ? (
              <ActivityIndicator color={colors.primaryWhite} />
            ) : (
              <>
                <FontAwesome
                  name="file-text-o"
                  size={16}
                  color={colors.primaryWhite}
                />
                <Text style={styles.buttonText}>
                  {Platform.OS === 'web' ? 'Imprimir Recibo' : 'Salvar Recibo'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.homeButton]}
          // @ts-ignore
          onPress={() => navigation.navigate('MySchedules')}>
          <Text style={styles.buttonText}>Ir para Meus Agendamentos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PaymentStatusScreen() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentStatusLogic />
    </Elements>
  );
}

export default PaymentStatusScreen;
