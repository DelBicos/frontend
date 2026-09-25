import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      flexDirection: 'column',
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      marginBottom: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryBlack,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
        web: {
          boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
        } as any,
      }),
    },

    // --- TOPO (Imagem e Preço) ---
    imageContainer: {
      width: '100%',
      height: 160,
      justifyContent: 'flex-end',
      padding: 12,
    },

    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.2)',
    },

    tagsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    priceTag: {
      backgroundColor: colors.primaryBlue,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
    },

    priceText: {
      color: colors.primaryWhite,
      fontSize: 14,
      fontFamily: 'Afacad-Bold',
    },

    distanceTag: {
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
    },

    distanceText: {
      color: colors.primaryWhite,
      fontSize: 12,
      fontFamily: 'Afacad-SemiBold',
    },

    // --- BASE (Detalhes) ---
    detailsContainer: {
      padding: 16,
      paddingBottom: 20,
    },

    header: {
      marginBottom: 12,
    },

    professionalName: {
      fontSize: 18,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryOrange,
      marginBottom: 2,
    },

    serviceName: {
      fontSize: 15,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
    },

    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
    },

    ratingText: {
      fontSize: 14,
      fontFamily: 'Afacad-Bold',
      color: colors.primaryBlack,
      marginLeft: 4,
    },

    ratingCount: {
      fontSize: 13,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      marginLeft: 4,
    },

    // Horários
    timesContainer: {
      marginVertical: 12,
    },

    timesTitle: {
      fontSize: 13,
      fontFamily: 'Afacad-SemiBold',
      color: colors.textSecondary,
      marginBottom: 8,
    },

    timesRow: {
      flexDirection: 'row',
      gap: 8,
    },

    timeSlot: {
      minWidth: 64,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 6,
      paddingVertical: 6,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },

    timeSlotActive: {
      backgroundColor: colors.primaryBlue,
      borderColor: colors.primaryBlue,
    },

    timeText: {
      fontSize: 13,
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
    },

    timeTextActive: {
      color: colors.primaryWhite,
      fontFamily: 'Afacad-Bold',
    },

    // Serviços (Resumo)
    servicesContainer: {
      marginBottom: 12,
    },

    servicesText: {
      fontSize: 13,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
    },

    // Rodapé (Local e Botão)
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },

    locationText: {
      fontSize: 13,
      fontFamily: 'Afacad-Regular',
      color: colors.textTertiary,
      flex: 1,
      marginRight: 8,
    },

    profileButton: {
      backgroundColor: colors.primaryOrange,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },

    profileButtonText: {
      color: '#FFFFFF',
      fontFamily: 'Afacad-Bold',
      fontSize: 14,
    },
  });
