import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

import { logger } from '@lib/logger';
const MapErrorFallback = () => {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorContent}>
        <FontAwesome
          name="map-o"
          size={48}
          color={colors.errorText}
          style={{ marginBottom: 12 }}
        />
        <Text style={styles.errorTitle}>Mapa Indisponível</Text>
        <Text style={styles.errorText}>
          Não foi possível carregar a visualização do mapa.
        </Text>
        <Text style={styles.errorSubtext}>
          A localização continua funcionando em segundo plano.
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      minHeight: 200,
      width: '100%',
    },
    errorContent: {
      alignItems: 'center',
      padding: 24,
    },
    errorTitle: {
      fontSize: 16,
      fontFamily: 'Afacad-Bold',
      color: colors.errorText,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 14,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
      textAlign: 'center',
      marginBottom: 4,
    },
    errorSubtext: {
      fontSize: 12,
      fontFamily: 'Afacad-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('[MapErrorBoundary] Erro capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <MapErrorFallback />;
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
