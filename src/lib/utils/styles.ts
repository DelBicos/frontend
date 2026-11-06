import { Platform, StyleSheet } from 'react-native';

import type { ColorsType } from '@theme/types';
export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    // Container principal
    container: {
      flex: 1,
      backgroundColor: '#f8fafc',
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 20,
    },

    // Botão de localização
    button: {
      gap: 10,
      flexDirection: 'row',
      backgroundColor: colors.primaryBlue,
      paddingHorizontal: 12,
      paddingTop: 4,
      paddingBottom: 7,
      borderRadius: 60,
      marginVertical: 5,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: colors.primaryWhite,
      fontSize: 32,
      fontFamily: 'Afacad-Regular',
      textAlign: 'center',
    },

    buttonLogin: {
      gap: 10,
      flexDirection: 'row',
      backgroundColor: colors.primaryWhite,
      paddingHorizontal: 12,
      paddingTop: 4,
      paddingBottom: 7,
      borderRadius: 60,
      marginVertical: 50,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },

    buttonLoginText: {
      color: '#000000',
      fontSize: 32,
      fontFamily: 'Afacad-Regular',
      textAlign: 'center',
    },

    // Mapa
    mapContainer: {
      height: 300,
      width: '100%',
      marginBottom: 16,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },

    // Loading
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      backgroundColor: '#eff6ff',
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#3b82f6',
      marginBottom: 16,
    },
    loadingText: {
      marginLeft: 8,
      color: '#2563eb',
      fontSize: 14,
      fontWeight: '500',
    },

    // Erro
    errorContainer: {
      padding: 12,
      backgroundColor: '#fef2f2',
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#ef4444',
      marginBottom: 16,
    },
    errorText: {
      color: '#dc2626',
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 8,
    },
    retryButton: {
      backgroundColor: '#ef4444',
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: 'center',
    },
    retryButtonText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },

    // Info Box
    infoBox: {
      width: '100%',
      marginBottom: 16,
      backgroundColor: colors.primaryWhite,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontWeight: '700',
      fontSize: 18,
      marginBottom: 12,
      color: '#1e293b',
    },
    infoGrid: {
      gap: 8,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: '#f8fafc',
      borderRadius: 8,
    },
    infoLabelContainer: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 14,
      color: '#64748b',
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      color: '#1e293b',
      fontWeight: '600',
      fontFamily: Platform.select({
        ios: 'monospaced',
        android: 'monospace',
        web: 'monospace',
      }),
      textAlign: 'right',
    },

    // Address Box
    addressBox: {
      width: '100%',
      backgroundColor: colors.primaryWhite,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
      marginBottom: 16,
    },
    formattedAddressContainer: {
      marginBottom: 16,
    },
    formattedAddressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    formattedAddressIcon: {
      fontSize: 18,
      marginRight: 8,
    },
    formattedAddressLabel: {
      fontSize: 14,
      color: '#64748b',
      fontWeight: '600',
    },
    formattedAddress: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1e293b',
      backgroundColor: '#f8fafc',
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#3b82f6',
      lineHeight: 24,
    },
    componentsContainer: {
      marginBottom: 16,
    },
    componentsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    componentsTitle: {
      fontSize: 14,
      color: '#64748b',
      fontWeight: '600',
    },
    componentsCount: {
      fontSize: 12,
      color: '#9ca3af',
      fontWeight: '500',
    },
    componentsGrid: {
      gap: 6,
    },
    componentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: '#f8fafc',
      borderRadius: 8,
    },
    componentIcon: {
      marginRight: 8,
      fontSize: 16,
    },
    componentLabel: {
      fontSize: 13,
      color: '#64748b',
      fontWeight: '500',
      marginRight: 8,
      minWidth: 50,
    },
    componentValue: {
      fontSize: 13,
      color: '#1e293b',
      fontWeight: '600',
      flex: 1,
    },
    originalContainer: {
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      marginTop: 12,
    },
    originalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    originalLabel: {
      fontSize: 12,
      color: '#94a3b8',
      fontWeight: '500',
    },
    originalSource: {
      fontSize: 10,
      color: '#cbd5e1',
    },
    originalAddress: {
      fontSize: 12,
      color: '#64748b',
      fontStyle: 'italic',
      backgroundColor: '#f1f5f9',
      padding: 8,
      borderRadius: 6,
    },
    copyButton: {
      backgroundColor: '#10b981',
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 12,
    },
    copyButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 14,
    },

    // Welcome Card
    welcomeCard: {
      width: '100%',
      backgroundColor: '#dbeafe',
      padding: 24,
      borderRadius: 16,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#bfdbfe',
    },
    welcomeIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    welcomeTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1e40af',
      marginBottom: 8,
      textAlign: 'center',
    },
    welcomeText: {
      fontSize: 16,
      color: '#1e40af',
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 16,
    },
    welcomeHighlight: {
      fontWeight: '600',
      color: '#1d4ed8',
    },
    welcomeFeatures: {
      width: '100%',
      gap: 8,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      padding: 12,
      borderRadius: 8,
    },
    featureIcon: {
      fontSize: 18,
      marginRight: 12,
    },
    featureText: {
      fontSize: 14,
      color: '#1e40af',
      fontWeight: '500',
      flex: 1,
    },

    // Footer
    footer: {
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      backgroundColor: colors.primaryWhite,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      marginTop: 16,
    },
    footerText: {
      fontSize: 12,
      color: '#9ca3af',
      textAlign: 'center',
      lineHeight: 16,
    },
  });
