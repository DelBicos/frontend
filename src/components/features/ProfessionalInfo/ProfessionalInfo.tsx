import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

interface ProfessionalInfoProps {
  name: string;
  avatarUri?: string | null;
  serviceId?: number;
  requestedAt?: string | Date;
  onViewProfile?: () => void;
}

const ProfessionalInfo: React.FC<ProfessionalInfoProps> = ({
  name,
  avatarUri,
  serviceId,
  requestedAt,
  onViewProfile,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const formatDate = (date: string | Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const defaultAvatar = 'https://via.placeholder.com/100';

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: avatarUri || defaultAvatar }}
        style={styles.avatar}
        accessibilityLabel={`Foto de ${name}`}
      />

      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>

        {(serviceId || requestedAt) && (
          <Text style={styles.serviceDetails}>
            {serviceId && `Serviço Nº ${serviceId}`}
            {serviceId && requestedAt && ' | '}
            {requestedAt && `Solicitado em ${formatDate(requestedAt)}`}
          </Text>
        )}

        {onViewProfile && (
          <TouchableOpacity
            onPress={onViewProfile}
            style={styles.viewProfileButton}
            activeOpacity={0.7}>
            <Text style={styles.viewProfileText}>Ver perfil profissional</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ProfessionalInfo;
