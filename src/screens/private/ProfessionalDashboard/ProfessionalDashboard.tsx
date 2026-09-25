import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useColors } from '@theme/ThemeProvider';
import { useUserStore } from '@stores/User';
import { useDashboardStore } from '@stores/Dashboard';
import { useAppointmentStore } from '@stores/Appointment';
import { AppointmentStatus } from '@stores/Appointment/types';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import { confirmAction } from '@lib/utils/confirmAction';
import PageContainer from '@components/layout/PageContainer';
import SectionHeader from '@components/ui/SectionHeader';
import {
  currentMonthEarnings,
  firstName,
  formatCurrency,
  lastMonthsEarnings,
  splitAppointments,
} from './dashboardData';
import {
  ActionItem,
  EarningsChart,
  KpiCard,
  RequestCard,
  UpcomingCard,
} from './components';
import { ClientProfileSubRoutes } from '@screens/types';
import { createStyles } from './styles';

const UPCOMING_LIMIT = 3;
const HIDDEN_VALUE = 'R$ ••••';

/**
 * Painel do colaborador: pedidos para responder, proximos atendimentos,
 * indicadores reais de ganhos e atalhos para gerenciar servicos e perfil.
 */
const ProfessionalDashboard: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { isCompact, isExpanded } = useBreakpoint();
  const styles = useMemo(
    () => createStyles(colors, isCompact, isExpanded),
    [colors, isCompact, isExpanded],
  );

  const user = useUserStore((s) => s.user);
  const isProfessional = !!user?.professional_id;
  const { kpis, earnings, error, fetchKpis, fetchEarnings } =
    useDashboardStore();
  const {
    appointments,
    loading: loadingAppointments,
    fetchAppointments,
    updateAppointmentStatus,
  } = useAppointmentStore();

  const [showValues, setShowValues] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // Recarrega ao voltar para a aba (ex.: depois de responder na Agenda).
  useFocusEffect(
    useCallback(() => {
      if (!isProfessional) return;
      fetchKpis();
      fetchEarnings();
      fetchAppointments('professional');
    }, [isProfessional, fetchKpis, fetchEarnings, fetchAppointments]),
  );

  const { pending, upcoming, todayCount } = useMemo(
    () => splitAppointments(appointments),
    [appointments],
  );
  const months = useMemo(() => lastMonthsEarnings(earnings), [earnings]);
  const monthTotal = currentMonthEarnings(earnings);

  const money = (value: number) =>
    showValues ? formatCurrency(value) : HIDDEN_VALUE;

  const respond = async (id: number, status: AppointmentStatus) => {
    setActionError(null);
    const ok = await updateAppointmentStatus(id, status);
    if (!ok) {
      setActionError(
        'Não foi possível responder ao pedido. Verifique sua conexão e tente novamente.',
      );
      return;
    }
    fetchKpis();
  };

  const decline = async (id: number) => {
    const confirmed = await confirmAction({
      title: 'Recusar pedido?',
      message:
        'O cliente será avisado e, se já tiver pago, o valor será estornado.',
      confirmLabel: 'Recusar',
      destructive: true,
    });
    if (confirmed) await respond(id, AppointmentStatus.CANCELED);
  };

  const goTo = (screen: string, params?: object) =>
    navigation.navigate(screen, params);

  const todayText =
    todayCount === 0
      ? 'Nenhum atendimento hoje'
      : todayCount === 1
        ? '1 atendimento hoje'
        : `${todayCount} atendimentos hoje`;

  const dateText = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  // --- Blocos ---

  const header = (
    <View style={styles.header}>
      <Image
        source={
          user?.avatar_uri
            ? { uri: user.avatar_uri }
            : require('@assets/logo.png')
        }
        style={styles.headerAvatar}
        accessibilityIgnoresInvertColors
      />
      <View style={styles.headerTexts}>
        <Text style={styles.eyebrow}>Painel do colaborador</Text>
        <Text
          style={styles.title}
          accessibilityRole="header"
          {...({ 'aria-level': 1 } as object)}>
          Olá{user?.name ? `, ${firstName(user.name)}` : ''}!
        </Text>
        <Text style={styles.subtitle}>
          {dateText.charAt(0).toUpperCase() + dateText.slice(1)} · {todayText}
        </Text>
      </View>
      {!isCompact && user?.professional_id ? (
        <Pressable
          onPress={() => goTo('PartnerProfile', { id: user.professional_id })}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="link"
          accessibilityHint="Veja seu perfil como os clientes veem">
          <Text style={styles.secondaryButtonText}>Ver perfil público</Text>
        </Pressable>
      ) : null}
    </View>
  );

  const kpiSection = (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.cardTexts}>
          <SectionHeader title="Resumo" />
        </View>
        <Pressable
          onPress={() => setShowValues((v) => !v)}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel={
            showValues ? 'Ocultar valores' : 'Mostrar valores'
          }>
          <FontAwesome
            name={showValues ? 'eye-slash' : 'eye'}
            size={18}
            color={colors.primaryBlack}
          />
          <Text style={styles.iconButtonText}>
            {showValues ? 'Ocultar valores' : 'Mostrar valores'}
          </Text>
        </Pressable>
      </View>
      {error && !kpis ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            Não foi possível carregar seus indicadores agora.
          </Text>
        </View>
      ) : null}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCell}>
          <KpiCard
            icon="line-chart"
            label="Ganhos no mês"
            value={money(monthTotal)}
            styles={styles}
          />
        </View>
        <View style={styles.kpiCell}>
          <KpiCard
            icon="money"
            label="Ganhos totais"
            value={kpis ? money(kpis.totalEarnings) : '—'}
            styles={styles}
          />
        </View>
        <View style={styles.kpiCell}>
          <KpiCard
            icon="check-circle-o"
            label="Serviços concluídos"
            value={kpis ? String(kpis.totalServices) : '—'}
            styles={styles}
          />
        </View>
        <View style={styles.kpiCell}>
          <KpiCard
            icon="star-o"
            label="Avaliação média"
            value={
              kpis?.avgRating != null ? `${kpis.avgRating.toFixed(1)} ★` : '—'
            }
            hint={kpis?.avgRating == null ? 'Sem avaliações ainda' : undefined}
            styles={styles}
          />
        </View>
      </View>
    </View>
  );

  const requestsSection = (
    <View style={styles.section}>
      <SectionHeader
        title="Pedidos para responder"
        subtitle={
          pending.length
            ? 'O cliente aguarda sua confirmação para o horário.'
            : undefined
        }
      />
      {actionError ? (
        <View style={styles.errorBox} accessibilityLiveRegion="assertive">
          <Text style={styles.errorText}>{actionError}</Text>
        </View>
      ) : null}
      {loadingAppointments && appointments.length === 0 ? (
        <ActivityIndicator color={colors.primaryOrange} style={styles.loader} />
      ) : pending.length === 0 ? (
        <View style={styles.emptyBox}>
          <FontAwesome name="inbox" size={22} color={colors.textSecondary} />
          <Text style={styles.emptyText}>
            Nenhum pedido pendente. Novos pedidos aparecem aqui.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {pending.map((a) => (
            <RequestCard
              key={a.id}
              appointment={a}
              onAccept={() => respond(a.id, AppointmentStatus.CONFIRMED)}
              onDecline={() => decline(a.id)}
              styles={styles}
            />
          ))}
        </View>
      )}
    </View>
  );

  const upcomingSection = (
    <View style={styles.section}>
      <SectionHeader
        title="Próximos atendimentos"
        action={{
          label: 'Ver agenda',
          onPress: () => goTo('ProfessionalSchedulesTab'),
        }}
      />
      {loadingAppointments && appointments.length === 0 ? (
        <ActivityIndicator color={colors.primaryOrange} style={styles.loader} />
      ) : upcoming.length === 0 ? (
        <View style={styles.emptyBox}>
          <FontAwesome
            name="calendar-o"
            size={22}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>
            Nenhum atendimento confirmado. Mantenha seus serviços e horários
            atualizados para receber pedidos.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {upcoming.slice(0, UPCOMING_LIMIT).map((a) => (
            <UpcomingCard
              key={a.id}
              appointment={a}
              onPress={() => goTo('ProfessionalSchedulesTab')}
              styles={styles}
            />
          ))}
        </View>
      )}
    </View>
  );

  const actionsSection = (
    <View style={styles.section}>
      <SectionHeader title="Gerenciar" />
      <View style={styles.list}>
        <ActionItem
          icon="wrench"
          title="Meus serviços"
          description="Preços, descrição e horários de cada serviço"
          onPress={() => goTo('ProfessionalServicesTab')}
          styles={styles}
        />
        <ActionItem
          icon="plus"
          title="Novo serviço"
          description="Ofereça um novo tipo de trabalho"
          onPress={() => goTo('ProfessionalServicesTab', { openCreate: true })}
          styles={styles}
        />
        <ActionItem
          icon="map-marker"
          title="Área de atendimento"
          description="Até onde você se desloca"
          onPress={() => goTo('ProfessionalArea')}
          styles={styles}
        />
        <ActionItem
          icon="comments-o"
          title="Conversas"
          description="Mensagens com seus clientes"
          onPress={() => goTo('ChatList')}
          styles={styles}
        />
        {isCompact && user?.professional_id ? (
          <ActionItem
            icon="user-o"
            title="Ver perfil público"
            description="Como os clientes veem você"
            onPress={() => goTo('PartnerProfile', { id: user.professional_id })}
            styles={styles}
          />
        ) : null}
        <ActionItem
          icon="question-circle-o"
          title="Central de Ajuda"
          description="Dúvidas sobre pedidos e pagamentos"
          onPress={() => goTo('Help')}
          styles={styles}
        />
      </View>
    </View>
  );

  const chartSection = (
    <View style={styles.section}>
      <SectionHeader
        title="Ganhos nos últimos 6 meses"
        subtitle="Serviços concluídos"
      />
      <View style={styles.chartCard}>
        <EarningsChart months={months} hidden={!showValues} styles={styles} />
      </View>
    </View>
  );

  // Sem login ou sem cadastro de colaborador nao ha painel para mostrar.
  if (!user || !user.professional_id) {
    return (
      <PageContainer maxWidth={560}>
        <View style={styles.gate}>
          <View style={styles.actionIcon}>
            <FontAwesome name="briefcase" size={18} color="#000000" />
          </View>
          <Text
            style={styles.title}
            accessibilityRole="header"
            {...({ 'aria-level': 1 } as object)}>
            Painel do colaborador
          </Text>
          <Text style={styles.gateText}>
            {user
              ? 'Cadastre-se como colaborador para oferecer seus serviços, receber pedidos e acompanhar seus ganhos.'
              : 'Entre na sua conta de colaborador para ver pedidos, agenda e ganhos.'}
          </Text>
          <Pressable
            onPress={() =>
              user
                ? goTo('ClientProfile', {
                    subroute: ClientProfileSubRoutes.TornarParceiro,
                  })
                : goTo('Login')
            }
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>
              {user ? 'Tornar-se colaborador' : 'Entrar'}
            </Text>
          </Pressable>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {header}
      {kpiSection}
      {isExpanded ? (
        <View style={styles.columns}>
          <View style={styles.mainColumn}>
            {requestsSection}
            {upcomingSection}
          </View>
          <View style={styles.sideColumn}>
            {actionsSection}
            {chartSection}
          </View>
        </View>
      ) : (
        <>
          {requestsSection}
          {upcomingSection}
          {actionsSection}
          {chartSection}
        </>
      )}
    </PageContainer>
  );
};

export default ProfessionalDashboard;
