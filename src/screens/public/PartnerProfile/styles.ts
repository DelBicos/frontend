import { Platform, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 24,
      backgroundColor: colors.secondaryGray,
    },
    notFound: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 18,
      color: colors.primaryBlack,
    },

    ownerBanner: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 10,
      padding: 14,
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: colors.warningBackground,
    },
    ownerText: {
      flex: 1,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.primaryBlack,
    },
    ownerLink: {
      fontFamily: 'Afacad-Bold',
      fontSize: 15,
      color: colors.primaryBlack,
      textDecorationLine: 'underline',
    },

    // --- Capa ---
    cover: {
      height: isCompact ? 150 : 220,
      width: '100%',
    },
    coverImage: {
      borderRadius: isCompact ? 16 : 20,
      overflow: 'hidden',
    },
    coverOverlay: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 12,
      borderRadius: isCompact ? 16 : 20,
    },
    coverButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.45)',
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },

    // --- Identidade ---
    identity: {
      flexDirection: isCompact ? 'column' : 'row',
      alignItems: 'flex-start',
      gap: isCompact ? 10 : 20,
      marginTop: isCompact ? -44 : -56,
      // No celular, alinhado a margem padrao da pagina.
      paddingHorizontal: isCompact ? 0 : 24,
      marginBottom: 24,
    },
    avatar: {
      width: isCompact ? 88 : 112,
      height: isCompact ? 88 : 112,
      borderRadius: isCompact ? 44 : 56,
      borderWidth: 4,
      borderColor: colors.secondaryGray,
      backgroundColor: colors.cardBackground,
    },
    avatarFallback: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: {
      fontFamily: 'Afacad-Bold',
      fontSize: 40,
      color: colors.primaryBlack,
    },
    identityTexts: {
      flex: isCompact ? undefined : 1,
      gap: 6,
      // So a foto sobrepoe a capa; o texto comeca abaixo dela.
      paddingTop: isCompact ? 0 : 64,
    },
    name: {
      fontFamily: 'Afacad-Bold',
      fontSize: isCompact ? 28 : 34,
      lineHeight: isCompact ? 32 : 40,
      color: colors.primaryBlack,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 16,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metaStrong: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    metaText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.textSecondary,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 999,
      backgroundColor: colors.successBackground,
    },
    badgeText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
      color: colors.successText,
    },

    // --- Abas ---
    tabs: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      marginBottom: 20,
    },
    tab: {
      flex: isCompact ? 1 : undefined,
      minHeight: 48,
      paddingHorizontal: isCompact ? 4 : 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
      marginBottom: -1,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    tabSelected: {
      borderBottomColor: colors.primaryOrange,
    },
    tabHovered: {
      backgroundColor: colors.inputBackground,
    },
    tabText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: isCompact ? 14 : 16,
      color: colors.textSecondary,
    },
    tabTextSelected: {
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
    },
    content: {
      minHeight: 200,
    },

    secondaryButton: {
      minHeight: 44,
      paddingHorizontal: 22,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.primaryBlack,
    },
    secondaryButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
  });
