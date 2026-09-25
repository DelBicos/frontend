import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { formatBRLFromCents } from '@lib/helpers/formatCurrency';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import {
  formatDuration,
  formatLongDate,
  formatTime,
  initials,
} from '@lib/booking';
import PageContainer, { PageHeader } from '@components/layout/PageContainer';
import BookingSteps from '@components/features/BookingSteps';
import AddressSelectionModal from '@components/features/AddressSelectionModal';
import { CheckoutState } from './useCheckout';
import { createStyles } from './styles';

interface CheckoutViewProps {
  checkout: CheckoutState;
  /** Formulario de pagamento da plataforma (Stripe web ou PaymentSheet). */
  renderPayment: (amountLabel: string) => React.ReactNode;
}

/** Etapa 3 do agendamento: revisar dados, escolher endereco e pagar. */
function CheckoutView({ checkout, renderPayment }: CheckoutViewProps) {
  const colors = useColors();
  const { isCompact, isExpanded } = useBreakpoint();
  const styles = createStyles(colors, isCompact);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const {
    user,
    status,
    professional,
    service,
    priceCents,
    selectedTime,
    imageUrl,
    address,
  } = checkout;

  if (!user) return null;

  if (status === 'loading') {
    return (
      <PageContainer>
        <BookingSteps current={3} />
        <ActivityIndicator
          size="large"
          color={colors.primaryBlack}
          style={styles.loading}
          accessibilityLabel="Carregando"
        />
      </PageContainer>
    );
  }

  if (status === 'not-found' || !professional || !service) {
    return (
      <PageContainer>
        <BookingSteps current={3} />
        <View style={styles.stateCard}>
          <FontAwesome
            name="exclamation-circle"
            size={40}
            color={colors.textSecondary}
          />
          <Text style={styles.stateTitle}>Serviço indisponível</Text>
          <Text style={styles.stateText}>
            Este serviço não está mais disponível. Volte e escolha outro horário
            ou profissional.
          </Text>
          <Pressable
            onPress={checkout.goBack}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Voltar</Text>
          </Pressable>
        </View>
      </PageContainer>
    );
  }

  const amountLabel = formatBRLFromCents(priceCents);
  const avatar = professional.User?.avatar_uri || imageUrl;
  const duration = formatDuration(service.duration);

  const summary = (
    <View style={styles.card}>
      <Text
        style={styles.cardTitle}
        accessibilityRole="header"
        {...({ 'aria-level': 2 } as object)}>
        Seu agendamento
      </Text>
      <View style={styles.proRow}>
        {avatar && !avatarFailed ? (
          <Image
            source={{ uri: avatar }}
            style={styles.avatar}
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitials}>
              {initials(professional.User?.name)}
            </Text>
          </View>
        )}
        <View style={styles.proTexts}>
          <Text style={styles.serviceTitle}>{service.title}</Text>
          <Text style={styles.proName}>com {professional.User?.name}</Text>
        </View>
      </View>
      <View style={styles.detailList}>
        <View style={styles.detailRow}>
          <FontAwesome name="calendar" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{formatLongDate(selectedTime)}</Text>
        </View>
        <View style={styles.detailRow}>
          <FontAwesome name="clock-o" size={17} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            {formatTime(selectedTime)}
            {duration ? ` · duração de ${duration}` : ''}
          </Text>
        </View>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{amountLabel}</Text>
      </View>
    </View>
  );

  const addressCard = (
    <View style={styles.card}>
      <Text
        style={styles.cardTitle}
        accessibilityRole="header"
        {...({ 'aria-level': 2 } as object)}>
        Local do atendimento
      </Text>
      {address ? (
        <View style={styles.addressRow}>
          <FontAwesome
            name="map-marker"
            size={20}
            color={colors.textSecondary}
          />
          <View style={styles.addressTexts}>
            <Text style={styles.addressMain}>
              {address.street}, {address.number}
              {address.complement ? ` - ${address.complement}` : ''}
            </Text>
            <Text style={styles.addressSub}>
              {address.neighborhood} · {address.city}/{address.state}
            </Text>
          </View>
          <Pressable
            onPress={checkout.openAddressModal}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Trocar endereço">
            <Text style={styles.secondaryButtonText}>Trocar</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.stateTextLeft}>
            Informe onde o serviço vai ser feito.
          </Text>
          <Pressable
            onPress={checkout.openAddressModal}
            style={({ pressed }) => [
              styles.primaryButton,
              styles.buttonLeft,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button">
            <FontAwesome name="plus" size={14} color="#000000" />
            <Text style={styles.primaryButtonText}>Escolher endereço</Text>
          </Pressable>
        </>
      )}
    </View>
  );

  let paymentBody: React.ReactNode;
  if (!address) {
    paymentBody = (
      <Text style={styles.stateTextLeft}>
        Escolha o local do atendimento para liberar o pagamento.
      </Text>
    );
  } else if (checkout.intentError) {
    paymentBody = (
      <View style={styles.errorBox} accessibilityLiveRegion="polite">
        <View style={styles.errorRow}>
          <FontAwesome
            name="exclamation-circle"
            size={18}
            color={colors.errorText}
          />
          <Text style={styles.errorText}>{checkout.intentError}</Text>
        </View>
        <View style={styles.errorActions}>
          <Pressable
            onPress={checkout.retry}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button">
            <Text style={styles.secondaryButtonText}>Tentar de novo</Text>
          </Pressable>
          <Pressable
            onPress={checkout.goBack}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button">
            <Text style={styles.secondaryButtonText}>
              Escolher outro horário
            </Text>
          </Pressable>
        </View>
      </View>
    );
  } else if (checkout.isCreatingIntent || !checkout.clientSecret) {
    paymentBody = (
      <View style={styles.preparing}>
        <ActivityIndicator color={colors.primaryBlack} />
        <Text style={styles.stateTextLeft}>Preparando o pagamento…</Text>
      </View>
    );
  } else {
    paymentBody = renderPayment(amountLabel);
  }

  const paymentCard = (
    <View style={styles.card}>
      <Text
        style={styles.cardTitle}
        accessibilityRole="header"
        {...({ 'aria-level': 2 } as object)}>
        Pagamento
      </Text>
      {paymentBody}
      <View style={styles.note}>
        <FontAwesome name="lock" size={14} color={colors.textSecondary} />
        <Text style={styles.noteText}>
          Pagamento seguro pela Stripe. O pedido vai para o profissional
          aceitar; se ele recusar, o valor é estornado automaticamente.
        </Text>
      </View>
    </View>
  );

  return (
    <PageContainer>
      <BookingSteps current={3} />
      <PageHeader
        title="Revise e pague"
        subtitle="Confira os dados do agendamento antes de pagar."
      />
      {isExpanded ? (
        <View style={styles.columns}>
          <View style={styles.mainColumn}>
            {summary}
            {addressCard}
          </View>
          <View style={styles.sideColumn}>{paymentCard}</View>
        </View>
      ) : (
        <View style={styles.stack}>
          {summary}
          {addressCard}
          {paymentCard}
        </View>
      )}

      <AddressSelectionModal
        visible={checkout.isAddressModalVisible}
        userId={user.id}
        onClose={checkout.closeAddressModal}
        onAddressSelect={checkout.chooseAddress}
      />
    </PageContainer>
  );
}

export default CheckoutView;
