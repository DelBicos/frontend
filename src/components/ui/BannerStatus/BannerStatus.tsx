import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

type StatusType = 'Agendado' | 'Executado' | 'Cancelado' | 'Pendente';

interface StatusConfig {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  message: string;
}

interface BannerStatusProps {
  status: StatusType;
  onReminderPress?: () => void;
}

const BannerStatus: React.FC<BannerStatusProps> = ({
  status,
  onReminderPress,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const statusConfig = useMemo(
    (): Record<string, StatusConfig> => ({
      Agendado: {
        backgroundColor: colors.warningBackground,
        borderColor: colors.warningText,
        textColor: colors.warningText,
        message: 'Serviço Agendado',
      },
      Pendente: {
        backgroundColor: colors.warningBackground,
        borderColor: colors.primaryOrange,
        textColor: colors.primaryOrange,
        message: 'Aguardando Confirmação',
      },
      Executado: {
        backgroundColor: colors.successBackground,
        borderColor: colors.successText,
        textColor: colors.successText,
        message: 'Serviço Executado',
      },
      Cancelado: {
        backgroundColor: colors.errorBackground,
        borderColor: colors.errorText,
        textColor: colors.errorText,
        message: 'Serviço Cancelado',
      },
    }),
    [colors],
  );

  const currentStatus = statusConfig[status] || statusConfig['Agendado'];

  return (
    <View style={styles.statusContainer}>
      <View
        style={[
          styles.statusBanner,
          {
            backgroundColor: currentStatus.backgroundColor,
            borderColor: currentStatus.borderColor,
          },
        ]}>
        <Text style={[styles.statusText, { color: currentStatus.textColor }]}>
          {currentStatus.message}
        </Text>
      </View>

      {(status === 'Agendado' || status === 'Pendente') && (
        <TouchableOpacity
          style={styles.reminderButton}
          onPress={onReminderPress}
          activeOpacity={0.7}>
          <Text style={styles.reminderText}>Criar lembrete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default BannerStatus;
