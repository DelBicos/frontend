import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

const GAP = 16;

export const createStyles = (
  colors: ColorsType,
  isCompact: boolean,
  isExpanded: boolean,
) =>
  StyleSheet.create({
    // --- Cabecalho ---
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: isCompact ? 24 : 36,
    },
    headerAvatar: {
      width: isCompact ? 56 : 72,
      height: isCompact ? 56 : 72,
      borderRadius: isCompact ? 28 : 36,
      borderWidth: 2,
      borderColor: colors.primaryOrange,
      backgroundColor: colors.cardBackground,
    },
    headerTexts: {
      flex: 1,
      gap: 2,
    },
    eyebrow: {
      fontFamily: 'Afacad-Bold',
      fontSize: 13,
      letterSpacing: 1.1,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: isCompact ? 28 : 36,
      lineHeight: isCompact ? 34 : 42,
      color: colors.primaryBlack,
    },
    subtitle: {
      fontFamily: 'Afacad-Regular',
      fontSize: isCompact ? 16 : 18,
      color: colors.textSecondary,
    },

    section: {
      marginBottom: isCompact ? 28 : 36,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },

    // --- Layout em colunas (desktop) ---
    columns: {
      flexDirection: 'row',
      gap: 32,
      alignItems: 'flex-start',
    },
    mainColumn: {
      flex: 3,
    },
    sideColumn: {
      flex: 2,
    },

    // --- Indicadores ---
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -GAP / 2,
      rowGap: GAP,
    },
    kpiCell: {
      width: isCompact ? '50%' : '25%',
      paddingHorizontal: GAP / 2,
    },
    kpiCard: {
      flexGrow: 1,
      gap: 6,
      padding: isCompact ? 14 : 18,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    kpiHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    kpiLabel: {
      flex: 1,
      fontFamily: 'Afacad-SemiBold',
      fontSize: isCompact ? 14 : 15,
      color: colors.textSecondary,
    },
    kpiValue: {
      fontFamily: 'Afacad-Bold',
      fontSize: isCompact ? 22 : 28,
      color: colors.primaryBlack,
    },
    kpiHint: {
      fontFamily: 'Afacad-Regular',
      fontSize: 13,
      color: colors.textSecondary,
    },

    // --- Cards de agendamento ---
    list: {
      gap: 12,
    },
    card: {
      gap: 12,
      padding: isCompact ? 14 : 18,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    cardActive: {
      borderColor: colors.primaryOrange,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cardTexts: {
      flex: 1,
      gap: 2,
    },
    cardTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
    cardSubtitle: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.textSecondary,
    },
    price: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
    clientAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    clientAvatarFallback: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
    },
    clientInitial: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
    metaList: {
      gap: 4,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    metaText: {
      flex: 1,
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    cardActions: {
      flexDirection: 'row',
      gap: 12,
    },
    cardActionButton: {
      flex: 1,
    },
    upcomingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    dateBadge: {
      width: 56,
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
    },
    dateBadgeDay: {
      fontFamily: 'Afacad-Bold',
      fontSize: 22,
      lineHeight: 24,
      color: colors.primaryBlack,
    },
    dateBadgeMonth: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },

    // --- Botoes ---
    primaryButton: {
      minHeight: 44,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    primaryButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      // Texto escuro sobre laranja (contraste AA).
      color: '#000000',
    },
    secondaryButton: {
      minHeight: 44,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.primaryBlack,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    secondaryButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    pressed: {
      opacity: 0.75,
    },
    iconButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minHeight: 44,
      paddingHorizontal: 8,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    iconButtonText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.primaryBlack,
      // No celular so o icone (o rotulo continua para leitores de tela).
      display: isCompact ? 'none' : 'flex',
    },

    // --- Atalhos ---
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      minHeight: 64,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
    },
    actionTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    actionDescription: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },

    // --- Grafico ---
    chartCard: {
      padding: 18,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    chart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
    },
    chartColumn: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
    },
    chartTrack: {
      height: isExpanded ? 120 : 100,
      width: '100%',
      maxWidth: 36,
      justifyContent: 'flex-end',
    },
    chartBar: {
      width: '100%',
      borderRadius: 6,
      backgroundColor: colors.textTertiary,
    },
    chartBarCurrent: {
      backgroundColor: colors.primaryOrange,
    },
    chartLabel: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
      color: colors.textSecondary,
    },
    chartLabelCurrent: {
      color: colors.primaryBlack,
    },

    // --- Acesso sem cadastro de colaborador ---
    gate: {
      alignItems: 'flex-start',
      gap: 12,
      padding: isCompact ? 20 : 28,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    gateText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 17,
      lineHeight: 24,
      color: colors.textSecondary,
      marginBottom: 4,
    },

    // --- Estados ---
    loader: {
      paddingVertical: 24,
    },
    emptyBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 18,
      borderRadius: 16,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderColor,
    },
    emptyText: {
      flex: 1,
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    errorBox: {
      padding: 14,
      borderRadius: 12,
      marginBottom: 12,
      backgroundColor: colors.errorBackground,
    },
    errorText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.errorText,
    },
  });

export type DashboardStyles = ReturnType<typeof createStyles>;
