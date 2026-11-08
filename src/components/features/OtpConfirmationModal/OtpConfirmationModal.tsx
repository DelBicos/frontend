import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';

export interface OtpConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  otpMode: 'checkin' | 'checkout';
  otp: string[];
  otpError: string | null;
  otpLoading: boolean;
  inputRefs: React.RefObject<TextInput | null>[];
  onOtpChange: (text: string, index: number) => void;
  onOtpKeyPress: (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => void;
  onConfirm: () => void;
  onCallClient: () => void;
}

export const OtpConfirmationModal: React.FC<OtpConfirmationModalProps> = ({
  visible,
  onClose,
  otpMode,
  otp,
  otpError,
  otpLoading,
  inputRefs,
  onOtpChange,
  onOtpKeyPress,
  onConfirm,
  onCallClient,
}) => {
  const colors = useColors();
  const isOtpComplete = otp.every((digit) => digit.trim().length === 1);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.otpCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.borderColor,
            },
          ]}>
          <View style={styles.otpHeader}>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.primaryBlack}
              />
            </TouchableOpacity>
            <Text
              style={[styles.otpHeaderTitle, { color: colors.textSecondary }]}>
              {otpMode === 'checkout'
                ? 'CHECK-OUT DO SERVIÇO'
                : 'CHECK-IN DO SERVIÇO'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={[styles.otpTitle, { color: colors.primaryBlack }]}>
            {otpMode === 'checkout'
              ? 'Finalizar Atendimento'
              : 'Digite o código do cliente'}
          </Text>
          <Text style={[styles.otpSub, { color: colors.textSecondary }]}>
            {otpMode === 'checkout'
              ? 'Digite o código de confirmação no formato AB-12 para concluir o serviço.'
              : 'O cliente possui o código de confirmação no formato AB-12. Peça o código para iniciar o serviço.'}
          </Text>

          {/* 4 BOXES DE INPUT COM SEPARADOR */}
          <View style={styles.otpBoxesRow}>
            {otp.map((digit, idx) => (
              <React.Fragment key={idx}>
                {idx === 2 && (
                  <Text
                    style={[
                      styles.otpSeparator,
                      { color: colors.textSecondary },
                    ]}>
                    -
                  </Text>
                )}
                <TextInput
                  ref={(el) => {
                    if (inputRefs[idx]) {
                      (
                        inputRefs[
                          idx
                        ] as React.MutableRefObject<TextInput | null>
                      ).current = el;
                    }
                  }}
                  style={[
                    styles.otpInputBox,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: digit
                        ? colors.primaryOrange
                        : colors.borderColor,
                      color: colors.primaryBlack,
                    },
                    digit ? styles.otpInputBoxFilled : null,
                  ]}
                  value={digit}
                  onChangeText={(text) => onOtpChange(text, idx)}
                  onKeyPress={(e) => onOtpKeyPress(e, idx)}
                  keyboardType={idx < 2 ? 'default' : 'number-pad'}
                  autoCapitalize="characters"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={idx === 0}
                />
              </React.Fragment>
            ))}
          </View>

          {otpError ? (
            <Text style={[styles.otpErrorText, { color: colors.errorText }]}>
              {otpError}
            </Text>
          ) : null}

          <View style={styles.otpRequirements}>
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color={colors.primaryGreen}
            />
            <Text style={[styles.otpReqText, { color: colors.textSecondary }]}>
              Código de 4 caracteres no formato AB-12
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.otpConfirmBtn,
              {
                backgroundColor: colors.primaryOrange,
                opacity: isOtpComplete && !otpLoading ? 1 : 0.6,
              },
            ]}
            onPress={onConfirm}
            disabled={!isOtpComplete || otpLoading}
            activeOpacity={0.85}>
            {otpLoading ? (
              <ActivityIndicator color={colors.primaryWhite} size="small" />
            ) : (
              <Text
                style={[
                  styles.otpConfirmBtnText,
                  { color: colors.primaryWhite },
                ]}>
                {otpMode === 'checkout'
                  ? 'Confirmar e Finalizar Serviço'
                  : 'Confirmar e Iniciar Serviço'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.otpHelpLink} onPress={onCallClient}>
            <Text style={[styles.otpHelpText, { color: colors.primaryBlue }]}>
              Não consegue o código? Ligar para o cliente
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  otpCard: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    borderWidth: 1,
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  otpHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  otpTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  otpSub: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  otpSeparator: {
    fontSize: 24,
    fontWeight: '800',
    marginHorizontal: 4,
    alignSelf: 'center',
  },
  otpInputBox: {
    width: 56,
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  otpInputBoxFilled: {
    borderWidth: 2,
  },
  otpErrorText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  otpRequirements: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  otpReqText: {
    fontSize: 12,
    fontWeight: '500',
  },
  otpConfirmBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  otpConfirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  otpHelpLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  otpHelpText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
