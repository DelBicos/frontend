import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (
  colors: ColorsType,
  isDark: boolean = false,
  isHighContrast: boolean = false,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark
        ? colors.secondaryGray
        : isHighContrast
          ? colors.primaryWhite
          : '#DDE6F0', // Fundo principal
    },
    contentContainer: {
      paddingBottom: 40,
    },
    // --- Header Interno ---
    topHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    avatarContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: colors.borderColor,
    },
    avatar: {
      width: '100%',
      height: '100%',
    },
    togglePill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        },
        android: { elevation: 2 },
      }),
    },
    toggleIcon: {
      marginRight: 8,
    },
    toggleText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
      color: colors.primaryBlack,
    },
    notificationBtn: {
      position: 'relative',
      padding: 8,
    },
    notificationBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primaryOrange,
      borderWidth: 1,
      borderColor: colors.cardBackground,
    },
    // --- Banner Status ---
    statusBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: 'rgba(34, 197, 94, 0.1)', // Verde suave (mockado)
      borderWidth: 1,
      borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    statusBannerOffline: {
      backgroundColor: 'rgba(156, 163, 175, 0.1)',
      borderColor: 'rgba(156, 163, 175, 0.3)',
    },
    statusIcon: {
      marginRight: 10,
    },
    statusText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
      color: '#166534', // Verde escuro
    },
    statusTextOffline: {
      color: '#374151',
    },
    // --- Quick Actions ---
    quickActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      gap: 12,
    },
    quickActionBtn: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardBackground,
      paddingVertical: 18,
      paddingHorizontal: 12,
      borderRadius: 20,
      width: 108,
      minHeight: 110,
      // subtle card shadow
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.07,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
      }),
    },
    quickActionBtnSOS: {
      borderWidth: 0,
    },
    quickActionIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
      marginBottom: 10,
    },
    quickActionIconSOS: {
      backgroundColor: 'rgba(239,68,68,0.08)',
    },
    quickActionText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
      color: colors.primaryBlack,
      textAlign: 'center',
      includeFontPadding: false,
      flexShrink: 1,
    },
    quickActionTextSOS: {
      color: '#ef4444',
    },
    // --- Resumo (Card Escuro) ---
    summaryCard: {
      marginHorizontal: 20,
      marginTop: 20,
      backgroundColor: colors.primaryBlack,
      borderRadius: 24,
      padding: 24,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
        },
        android: { elevation: 6 },
      }),
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    summaryTitle: {
      fontFamily: 'Afacad-Medium',
      fontSize: 16,
      color: '#E5E7EB',
      marginLeft: 8,
    },
    summaryValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    summaryValuePrefix: {
      fontFamily: 'Afacad-Bold',
      fontSize: 24,
      color: '#FFF',
      marginRight: 6,
    },
    summaryValue: {
      fontFamily: 'Afacad-Bold',
      fontSize: 36,
      color: '#FFF',
    },
    summaryHidden: {
      fontFamily: 'Afacad-Bold',
      fontSize: 36,
      color: '#FFF',
      letterSpacing: 4,
    },
    summaryEyeBtn: {
      marginLeft: 16,
      padding: 8,
    },
    // --- Banner Promocional ---
    promoBanner: {
      marginHorizontal: 20,
      marginTop: 20,
      backgroundColor: colors.primaryOrange,
      borderRadius: 16,
      padding: 20,
      overflow: 'hidden',
    },
    promoTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: '#FFF',
      width: '70%',
      marginBottom: 8,
    },
    promoSubtitle: {
      fontFamily: 'Afacad-Medium',
      fontSize: 14,
      color: 'rgba(255,255,255,0.9)',
      width: '70%',
    },
    // --- Seção Horários ---
    scheduleSection: {
      marginHorizontal: 20,
      marginTop: 24,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    sectionTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
    },
    sectionLink: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
      color: colors.primaryOrange,
    },
    sectionSubtitle: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    scheduleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    scheduleIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.inputBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    scheduleCardContent: {
      flex: 1,
    },
    scheduleCardTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
      marginBottom: 4,
    },
    scheduleCardSubtitle: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    // --- Utils ---
    errorContainer: {
      marginHorizontal: 20,
      marginTop: 16,
      padding: 12,
      backgroundColor: colors.errorBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.errorText,
    },
    errorText: {
      color: colors.errorText,
      fontFamily: 'Afacad-Regular',
      textAlign: 'center',
    },
  });
