import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { Appointment } from '@stores/Appointment/types';
import {
  MonthTotal,
  appointmentPrice,
  formatCurrency,
  formatDayLabel,
  formatTimeRange,
} from './dashboardData';
import { DashboardStyles } from './styles';

type IconName = React.ComponentProps<typeof FontAwesome>['name'];

// --- Indicador ---

interface KpiCardProps {
  icon: IconName;
  label: string;
  value: string;
  hint?: string;
  styles: DashboardStyles;
}

export function KpiCard({ icon, label, value, hint, styles }: KpiCardProps) {
  const colors = useColors();
  return (
    <View
      style={styles.kpiCard}
      accessible
      accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.kpiHeader}>
        <FontAwesome name={icon} size={16} color={colors.textSecondary} />
        <Text style={styles.kpiLabel}>{label}</Text>
      </View>
      <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {hint ? <Text style={styles.kpiHint}>{hint}</Text> : null}
    </View>
  );
}

// --- Cliente (avatar + nome) ---

function ClientAvatar({
  appointment,
  styles,
}: {
  appointment: Appointment;
  styles: DashboardStyles;
}) {
  const user = appointment.Client?.User;
  if (user?.avatar_uri) {
    return (
      <Image source={{ uri: user.avatar_uri }} style={styles.clientAvatar} />
    );
  }
  return (
    <View style={[styles.clientAvatar, styles.clientAvatarFallback]}>
      <Text style={styles.clientInitial}>
        {(user?.name || '?').charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

function AppointmentMeta({
  appointment,
  styles,
}: {
  appointment: Appointment;
  styles: DashboardStyles;
}) {
  const colors = useColors();
  const address = appointment.Address;
  const place = address
    ? [address.neighborhood, address.city].filter(Boolean).join(', ')
    : null;
  return (
    <View style={styles.metaList}>
      <View style={styles.metaRow}>
        <FontAwesome name="clock-o" size={14} color={colors.textSecondary} />
        <Text style={styles.metaText}>
          {formatDayLabel(appointment.start_time)} ·{' '}
          {formatTimeRange(appointment.start_time, appointment.end_time)}
        </Text>
      </View>
      {place ? (
        <View style={styles.metaRow}>
          <FontAwesome
            name="map-marker"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={styles.metaText} numberOfLines={1}>
            {place}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// --- Pedido pendente ---

interface RequestCardProps {
  appointment: Appointment;
  onAccept: () => Promise<void>;
  onDecline: () => Promise<void>;
  styles: DashboardStyles;
}

export function RequestCard({
  appointment,
  onAccept,
  onDecline,
  styles,
}: RequestCardProps) {
  const colors = useColors();
  const [busy, setBusy] = useState<'accept' | 'decline' | null>(null);
  const price = appointmentPrice(appointment);
  const clientName = appointment.Client?.User?.name ?? 'Cliente';
  const service = appointment.Service?.title ?? 'Serviço';

  const run = async (
    kind: 'accept' | 'decline',
    action: () => Promise<void>,
  ) => {
    setBusy(kind);
    try {
      await action();
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <ClientAvatar appointment={appointment} styles={styles} />
        <View style={styles.cardTexts}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {service}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {clientName}
          </Text>
        </View>
        {price != null ? (
          <Text style={styles.price}>{formatCurrency(price)}</Text>
        ) : null}
      </View>
      <AppointmentMeta appointment={appointment} styles={styles} />
      <View style={styles.cardActions}>
        <Pressable
          onPress={() => run('decline', onDecline)}
          disabled={!!busy}
          style={({ pressed }) => [
            styles.secondaryButton,
            styles.cardActionButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Recusar ${service} de ${clientName}`}>
          {busy === 'decline' ? (
            <ActivityIndicator size="small" color={colors.primaryBlack} />
          ) : (
            <Text style={styles.secondaryButtonText}>Recusar</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => run('accept', onAccept)}
          disabled={!!busy}
          style={({ pressed }) => [
            styles.primaryButton,
            styles.cardActionButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Aceitar ${service} de ${clientName}`}>
          {busy === 'accept' ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Text style={styles.primaryButtonText}>Aceitar</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

// --- Proximo atendimento ---

interface UpcomingCardProps {
  appointment: Appointment;
  onPress: () => void;
  styles: DashboardStyles;
}

export function UpcomingCard({
  appointment,
  onPress,
  styles,
}: UpcomingCardProps) {
  const colors = useColors();
  const date = new Date(appointment.start_time);
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
    .format(date)
    .replace('.', '');
  const service = appointment.Service?.title ?? 'Serviço';
  const clientName = appointment.Client?.User?.name ?? 'Cliente';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        styles.card,
        styles.upcomingCard,
        (pressed || hovered) && styles.cardActive,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${service} com ${clientName}, ${formatDayLabel(appointment.start_time)} às ${formatTimeRange(appointment.start_time)}. Abrir agenda`}>
      <View style={styles.dateBadge}>
        <Text style={styles.dateBadgeDay}>{date.getDate()}</Text>
        <Text style={styles.dateBadgeMonth}>{month}</Text>
      </View>
      <View style={styles.cardTexts}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {service}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {clientName}
        </Text>
        <AppointmentMeta appointment={appointment} styles={styles} />
      </View>
      <FontAwesome name="angle-right" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

// --- Atalho ---

interface ActionItemProps {
  icon: IconName;
  title: string;
  description: string;
  onPress: () => void;
  styles: DashboardStyles;
}

export function ActionItem({
  icon,
  title,
  description,
  onPress,
  styles,
}: ActionItemProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        styles.actionItem,
        (pressed || hovered) && styles.cardActive,
      ]}
      accessibilityRole="button"
      accessibilityHint={description}>
      <View style={styles.actionIcon}>
        <FontAwesome name={icon} size={18} color="#000000" />
      </View>
      <View style={styles.cardTexts}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <FontAwesome name="angle-right" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

// --- Grafico de ganhos ---

export function EarningsChart({
  months,
  hidden,
  styles,
}: {
  months: MonthTotal[];
  hidden: boolean;
  styles: DashboardStyles;
}) {
  // Web: o mouse sobre a barra mostra o valor. App: tocar seleciona a barra.
  // Sem interacao, fica em destaque o mes atual.
  const [selected, setSelected] = useState(months.length - 1);
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? selected;
  const activeMonth = months[active];
  const max = Math.max(...months.map((m) => m.total), 1);
  const value = (total: number) => (hidden ? 'R$ ••••' : formatCurrency(total));

  return (
    <View>
      <View style={styles.chartSummary} accessibilityLiveRegion="polite">
        <Text style={styles.chartSummaryLabel}>{activeMonth?.fullLabel}</Text>
        <Text style={styles.chartSummaryValue}>
          {activeMonth ? value(activeMonth.total) : ''}
        </Text>
      </View>
      <View style={styles.chart} accessibilityRole="radiogroup">
        {months.map((m, index) => {
          const isActive = index === active;
          const height = Math.max((m.total / max) * 100, m.total ? 6 : 2);
          return (
            <Pressable
              key={m.key}
              style={styles.chartColumn}
              onPress={() => setSelected(index)}
              onHoverIn={() => setHovered(index)}
              onHoverOut={() => setHovered(null)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${m.fullLabel}: ${hidden ? 'valor oculto' : formatCurrency(m.total)}`}>
              <View style={styles.chartTrack}>
                {isActive ? (
                  <View
                    style={[styles.chartTooltip, { bottom: `${height}%` }]}
                    pointerEvents="none">
                    <View style={styles.chartTooltipBubble}>
                      <Text style={styles.chartTooltipText} numberOfLines={1}>
                        {hidden ? '••••' : formatCompact(m.total)}
                      </Text>
                    </View>
                  </View>
                ) : null}
                <View
                  style={[
                    styles.chartBar,
                    isActive && styles.chartBarCurrent,
                    { height: `${height}%` },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.chartLabel,
                  isActive && styles.chartLabelCurrent,
                ]}>
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Valor curto para o balao sobre a barra: "R$ 1,2 mil". */
function formatCompact(value: number) {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`;
  }
  return `R$ ${Math.round(value).toLocaleString('pt-BR')}`;
}
