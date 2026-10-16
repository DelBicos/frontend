import React, { useEffect, useRef, useState } from 'react';
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
import { ClientTrackingMapModal } from '@components/features/ClientTrackingMapModal/ClientTrackingMapModal';

interface AppointmentDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onCancel?: () => Promise<boolean>;
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
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const cancelInFlight = useRef(false);

  useEffect(() => {
    setConfirmingCancel(false);
    setCancelError('');
  }, [visible, appointment?.id]);

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

  const handleCancelAppointment = async () => {
    if (!onCancel || cancelInFlight.current) return;
    cancelInFlight.current = true;
    setCanceling(true);
    setCancelError('');
    try {
      if (await onCancel()) {
        setConfirmingCancel(false);
        onClose();
      } else {
        setCancelError(
          'Não foi possível cancelar o agendamento. Tente novamente.',
        );
      }
    } catch {
      setCancelError(
        'Não foi possível cancelar o agendamento. Tente novamente.',
      );
    } finally {
      cancelInFlight.current = false;
      setCanceling(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmado pelo prestador';
      case 'in_transit':
        return 'Profissional a caminho 🚘';
      case 'arrived':
        return 'Profissional no local 🎯';
      case 'in_progress':
        return 'Serviço em andamento ⚡';
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
      case 'in_transit':
      case 'arrived':
        return '#FF6B00';
      case 'in_progress':
        return '#10B981';
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
      onRequestClose={() => {
        if (!canceling) onClose();
      }}>
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

            {/* Banner de Código de Segurança para o Cliente */}
            {appointment.verification_code || appointment.status === 'arrived' ? (
              <View
                style={{
                  backgroundColor: '#FFF7ED',
                  borderColor: '#FF6B00',
                  borderWidth: 2,
                  borderRadius: 16,
                  padding: 16,
                  marginHorizontal: 16,
                  marginBottom: 16,
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 13, color: '#EA580C', fontWeight: '800', marginBottom: 4, letterSpacing: 1 }}>
                  CÓDIGO DE INÍCIO DO SERVIÇO 🔑
                </Text>
                <Text style={{ fontSize: 13, color: '#C2410C', textAlign: 'center', marginBottom: 12, lineHeight: 18 }}>
                  Passe este código de 4 dígitos ao profissional para ele iniciar o atendimento:
                </Text>
                <View style={{ backgroundColor: '#FF6B00', paddingHorizontal: 28, paddingVertical: 10, borderRadius: 14 }}>
                  <Text style={{ fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 8 }}>
                    {appointment.verification_code || '----'}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Botão de Rastreamento no Mapa em Tempo Real */}
            {appointment.status === 'in_transit' || appointment.status === 'arrived' ? (
              <TouchableOpacity
                style={{
                  backgroundColor: '#2563EB',
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 14,
                  marginHorizontal: 16,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onPress={() => setShowTrackingModal(true)}
                activeOpacity={0.8}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
                  Acompanhar Prestador no Mapa 🗺️
                </Text>
              </TouchableOpacity>
            ) : null}

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
                disabled={canceling}
                onPress={onClose}
                activeOpacity={0.8}>
                <Text style={styles.okButtonText}>Ok</Text>
              </TouchableOpacity>

              {onAccept && appointment.status === 'pending' ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.okButton,
                      { backgroundColor: colors.successText, marginBottom: 10 },
                    ]}
                    onPress={() => {
                      if (onAccept) onAccept();
                      onClose();
                    }}
                    activeOpacity={0.8}>
                    <Text style={styles.okButtonText}>Aceitar Serviço</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      if (onReject) onReject();
                      onClose();
                    }}
                    activeOpacity={0.8}>
                    <Text style={styles.cancelButtonText}>Recusar Serviço</Text>
                  </TouchableOpacity>
                </>
              ) : (
                onCancel &&
                !isProfessionalView &&
                appointment.status !== 'completed' &&
                appointment.status !== 'canceled' && (
                  <>
                    {confirmingCancel && (
                      <>
                        <Text style={styles.infoValue}>
                          Tem certeza que deseja cancelar este agendamento?
                        </Text>
                        <TouchableOpacity
                          disabled={canceling}
                          onPress={() => {
                            setConfirmingCancel(false);
                            setCancelError('');
                          }}
                          style={styles.okButton}>
                          <Text style={styles.okButtonText}>
                            Não, manter agendamento
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                    {!!cancelError && (
                      <Text
                        accessibilityRole="alert"
                        style={{ color: colors.errorText }}>
                        {cancelError}
                      </Text>
                    )}
                    <TouchableOpacity
                      style={styles.cancelButton}
                      disabled={canceling}
                      onPress={() => {
                        if (confirmingCancel) void handleCancelAppointment();
                        else setConfirmingCancel(true);
                      }}
                      activeOpacity={0.8}>
                      <Text style={styles.cancelButtonText}>
                        {canceling
                          ? 'Cancelando…'
                          : confirmingCancel
                            ? 'Sim, cancelar agendamento'
                            : 'Cancelar Agendamento'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )
              )}
            </View>
          </ScrollView>
        </View>
      </View>
      <ClientTrackingMapModal
        visible={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        appointment={appointment}
      />
    </Modal>
  );
}
