import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface DeslocamentoActionBarProps {
  arrived: boolean;
  inProgress: boolean;
  completed: boolean;
  arrivedLoading: boolean;
  onArrived: () => void;
  onCheckin: () => void;
  onCheckout: () => void;
  onBack: () => void;
}

/** Ação principal do rodapé, conforme a etapa do atendimento em domicílio. */
export function DeslocamentoActionBar({
  arrived,
  inProgress,
  completed,
  arrivedLoading,
  onArrived,
  onCheckin,
  onCheckout,
  onBack,
}: DeslocamentoActionBarProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const action: {
    label: string;
    icon: IconName;
    color: string;
    onPress: () => void;
  } = completed
    ? {
        label: 'Voltar ao painel',
        icon: 'arrow-back-circle-outline',
        color: colors.primaryGreen,
        onPress: onBack,
      }
    : inProgress
      ? {
          label: 'Finalizar Atendimento (Check-out) 🏁',
          icon: 'checkmark-done-circle-outline',
          color: colors.primaryGreen,
          onPress: onCheckout,
        }
      : arrived
        ? {
            label: 'Digitar Código do Cliente 🔐',
            icon: 'key-outline',
            color: colors.primaryOrange,
            onPress: onCheckin,
          }
        : {
            label: 'Cheguei no Local 🎯',
            icon: 'checkmark-circle-outline',
            color: colors.primaryOrange,
            onPress: onArrived,
          };

  const loading = !arrived && arrivedLoading;

  return (
    <View style={styles.bar}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: action.color }]}
        onPress={action.onPress}
        disabled={loading}
        activeOpacity={0.85}>
        {loading ? (
          <ActivityIndicator color={colors.primaryWhite} size="small" />
        ) : (
          <>
            <Ionicons
              name={action.icon}
              size={22}
              color={colors.primaryWhite}
              style={styles.icon}
            />
            <Text style={styles.text}>{action.label}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    bar: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.backgroundElevated,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      paddingVertical: 14,
      shadowColor: colors.primaryOrange,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 3,
    },
    icon: { marginRight: 8 },
    text: {
      color: colors.primaryWhite,
      fontSize: 16,
      fontWeight: '700',
    },
  });
