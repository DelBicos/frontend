import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { Appointment } from '@stores/Appointment/types';
import { useUserStore } from '@stores/User';
import { createStyles } from './styles';

interface AppointmentDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onCancel?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}

export function AppointmentDetailsModal({
  visible,
  onClose,
  appointment,
  onCancel,
  onAccept,
  onReject,
}: AppointmentDetailsModalProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const user = useUserStore((state) => state.user);

  if (!appointment) return null;

  const isProfessionalView =
    user?.professional_id === appointment.professional_id;

  const headerAvatar = isProfessionalView
    ? appointment.Client?.User?.avatar_uri
    : appointment.Professional?.User?.avatar_uri;

  const headerName = isProfessionalView
    ? appointment.Client?.User?.name || 'Cliente'
    : appointment.Professional?.User?.name || 'Profissional';

  const formattedFullAddress = (() => {
    if (!appointment.Address) return 'Endereço não informado';
    const {
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      postal_code,
    } = appointment.Address;
    return `${street}, ${number}${complement ? ` (${complement})` : ''} - ${neighborhood}, ${city}/${state}${postal_code ? ` - CEP ${postal_code}` : ''}`;
  })();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmado pelo prestador';
      case 'completed':
        return 'Concluído';
      case 'canceled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warningText;
      case 'confirmed':
        return colors.successText;
      case 'completed':
        return colors.primaryBlue;
      case 'canceled':
        return colors.errorText;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.primaryWhite },
          ]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header com foto do participante */}
            <View style={styles.header}>
              <Image
                source={{
                  uri: headerAvatar || 'https://via.placeholder.com/80',
                }}
                style={styles.professionalImage}
              />
              <View style={styles.headerInfo}>
                <Text style={styles.professionalName}>
                  {headerName}
                  <Text style={styles.superscript}> *</Text>
                </Text>
                <Text style={styles.dateText}>
                  {appointment.Service?.Subcategory?.name || 'Serviço'}
                </Text>
              </View>
            </View>

            {/* Título da seção */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalhes do Agendamento</Text>
            </View>

            {/* Informações do agendamento */}
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID do Agendamento:</Text>
                <Text style={styles.infoValue}>#{appointment.id}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Serviço:</Text>
                <Text style={styles.infoValue}>
                  {appointment.Service?.title || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Categoria:</Text>
                <Text style={styles.infoValue}>
                  {appointment.Service?.Subcategory?.name || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Data:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(appointment.start_time)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Horário:</Text>
                <Text style={styles.infoValue}>
                  {formatTime(appointment.start_time)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cliente:</Text>
                <Text style={styles.infoValue}>
                  {appointment.Client?.User?.name || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Profissional:</Text>
                <Text style={styles.infoValue}>
                  {appointment.Professional?.User?.name || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Endereço Completo:</Text>
                <Text style={styles.infoValue}>{formattedFullAddress}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Forma de Pagamento:</Text>
                <Text style={styles.infoValue}>
                  {appointment.payment_method || 'Cartão de Crédito'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Valor:</Text>
                <Text style={styles.infoValue}>
                  {appointment.Service?.price
                    ? `R$ ${parseFloat(appointment.Service.price).toFixed(2).replace('.', ',')}`
                    : 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(appointment.status) },
                  ]}>
                  {getStatusText(appointment.status)}
                </Text>
              </View>
            </View>

            {/* Botões de ação */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.okButton}
                onPress={onClose}
                activeOpacity={0.8}>
                <Text style={styles.okButtonText}>Fechar</Text>
              </TouchableOpacity>

              {/* Aceitar/recusar ficam no card da Agenda. Cancelamento pelo
                  cliente ainda nao existe no backend, entao nao ha botao. */}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
