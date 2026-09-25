import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
  ActivityIndicator,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useDashboardStore } from '@stores/Dashboard';
import { useUserStore } from '@stores/User';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import { createStyles } from './styles';
import { useNavigation } from '@react-navigation/native';

const ProfessionalDashboard: React.FC = () => {
  const { kpis, loading, error, fetchKpis, fetchEarnings, fetchCategories } =
    useDashboardStore();
  const { user } = useUserStore();
  const navigation = useNavigation<any>();

  const colors = useColors();
  const { theme } = useThemeStore();
  const isDark = theme === ThemeMode.DARK;
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;
  const styles = createStyles(colors, isDark, isHighContrast);

  const QuickAction: React.FC<{
    title: string;
    onPress?: () => void;
    sos?: boolean;
    children?: React.ReactNode;
  }> = ({ title, onPress, sos, children }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const pressIn = () =>
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
    const pressOut = () =>
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    return (
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: false }}
        style={{ marginVertical: 0 }}>
        <Animated.View
          style={[
            styles.quickActionBtn,
            sos ? styles.quickActionBtnSOS : undefined,
            { transform: [{ scale }] },
          ]}>
          {children}
          <Text
            style={[
              styles.quickActionText,
              sos ? styles.quickActionTextSOS : undefined,
            ]}>
            {title}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  const [isAvailable, setIsAvailable] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  const loadAllData = useCallback(async () => {
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
      .toISOString()
      .slice(0, 10);
    try {
      await Promise.all([
        fetchKpis(),
        fetchEarnings(from, to),
        fetchCategories(from, to),
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados do Dashboard:', err);
    }
  }, [fetchKpis, fetchEarnings, fetchCategories]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
  };

  const toggleBalance = () => {
    setShowBalance(!showBalance);
  };

  const navigateToSchedules = () => {
    navigation.navigate('ProfessionalSchedulesTab');
  };

  // Mock value for now, or use kpis.totalEarnings if backend provides it
  const todayEarnings = kpis ? kpis.totalEarnings : 0;
  const formattedEarnings = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(todayEarnings);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      {/* 1. Header do Prestador */}
      <View style={styles.topHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ marginRight: 12, padding: 4 }}
            onPress={() => navigation.navigate('Home' as never)}
          >
            <FontAwesome name="arrow-left" size={20} color={colors.primaryOrange} />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user?.avatar_uri ||
                  'https://ui-avatars.com/api/?name=' + (user?.name || 'P'),
              }}
              style={styles.avatar}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.togglePill}
          onPress={toggleAvailability}
          activeOpacity={0.8}>
          <FontAwesome
            name={isAvailable ? 'check-circle' : 'ban'}
            size={16}
            color={isAvailable ? '#16a34a' : colors.textSecondary}
            style={styles.toggleIcon}
          />
          <Text style={styles.toggleText}>
            {isAvailable ? 'Disponível' : 'Indisponível'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.notificationBtn}>
          <FontAwesome name="bell-o" size={20} color={colors.primaryBlack} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* 2. Banner de Status */}
      <View
        style={[
          styles.statusBanner,
          !isAvailable && styles.statusBannerOffline,
        ]}>
        <FontAwesome
          name="lightbulb-o"
          size={20}
          color={isAvailable ? '#16a34a' : '#6b7280'}
          style={styles.statusIcon}
        />
        <Text
          style={[styles.statusText, !isAvailable && styles.statusTextOffline]}>
          {isAvailable
            ? 'Fique online para receber orçamentos'
            : 'Fique disponível para receber orçamentos'}
        </Text>
      </View>

      {/* 3. Ações Rápidas (scroll horizontal) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          { paddingHorizontal: 20 },
          styles.quickActionsRow,
        ]}>
        <QuickAction
          title="Área de Atendimento"
          onPress={() => navigation.navigate('ProfessionalArea' as never)}>
          <View style={styles.quickActionIcon}>
            <FontAwesome name="sliders" size={22} color={colors.primaryBlack} />
          </View>
        </QuickAction>

        <QuickAction
          title="Serviços"
          onPress={() =>
            navigation.navigate('ProfessionalServicesTab', { openCreate: true })
          }>
          <View style={styles.quickActionIcon}>
            <FontAwesome name="wrench" size={22} color={colors.primaryBlack} />
          </View>
        </QuickAction>

        <QuickAction
          title="Disponibilidade"
          onPress={() => navigation.navigate('ProfessionalAvailabilityTab')}>
          <View style={styles.quickActionIcon}>
            <FontAwesome
              name="calendar"
              size={22}
              color={colors.primaryBlack}
            />
          </View>
        </QuickAction>

        <QuickAction title="Suporte" sos>
          <View style={[styles.quickActionIcon, styles.quickActionIconSOS]}>
            <FontAwesome name="warning" size={22} color="#ef4444" />
          </View>
        </QuickAction>
      </ScrollView>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {typeof error === 'string'
              ? error
              : 'Ocorreu um erro ao carregar os dados.'}
          </Text>
        </View>
      ) : null}

      {/* 4. Resumo Financeiro */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <FontAwesome name="money" size={16} color="#9CA3AF" />
          <Text style={styles.summaryTitle}>Resumo de hoje</Text>
        </View>

        <View style={styles.summaryValueRow}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : showBalance ? (
            <Text style={styles.summaryValue}>{formattedEarnings}</Text>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.summaryValuePrefix}>R$</Text>
              <Text style={styles.summaryHidden}>••••</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={toggleBalance}
            style={styles.summaryEyeBtn}>
            <FontAwesome
              name={showBalance ? 'eye-slash' : 'eye'}
              size={20}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. Banner Promocional */}
      <View style={styles.promoBanner}>
        <Text style={styles.promoTitle}>Complete 5 serviços nesta semana!</Text>
        <Text style={styles.promoSubtitle}>
          Ganhe o selo de Super Parceiro e apareça no topo das buscas.
        </Text>
        {/* Aqui poderia entrar uma imagem de background do banner */}
      </View>

      {/* 6. Agenda e Horários */}
      <View style={styles.scheduleSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Sua Agenda</Text>
          <TouchableOpacity onPress={navigateToSchedules}>
            <Text style={styles.sectionLink}>Ver agenda</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>
          Você não tem serviços marcados para hoje
        </Text>

        <TouchableOpacity
          style={styles.scheduleCard}
          onPress={navigateToSchedules}
          activeOpacity={0.8}>
          <View style={styles.scheduleIconContainer}>
            <FontAwesome
              name="calendar-plus-o"
              size={20}
              color={colors.primaryBlack}
            />
          </View>
          <View style={styles.scheduleCardContent}>
            <Text style={styles.scheduleCardTitle}>Ver todos os horários</Text>
            <Text style={styles.scheduleCardSubtitle}>
              Acompanhe seus próximos compromissos
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfessionalDashboard;
