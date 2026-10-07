import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAppointmentStore } from '@stores/Appointment';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

export function CancellationCodeForm({
  appointmentId,
  onComplete,
  onBack,
}: {
  appointmentId: number;
  onComplete: () => void;
  onBack: () => void;
}) {
  const colors = useColors();
  const styles = createStyles(colors);
  const {
    requestCancellationCode,
    confirmCancellationCode,
    abandonCancellationCode,
  } = useAppointmentStore();
  const [challenge, setChallenge] = useState<{
    challengeId: string;
    email: string;
    expiresAt: string;
  } | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  const perform = async (action: 'send' | 'confirm' | 'back') => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      if (action === 'send') {
        setChallenge(await requestCancellationCode(appointmentId));
        setCode('');
      } else if (action === 'confirm' && challenge) {
        await confirmCancellationCode(
          appointmentId,
          challenge.challengeId,
          code,
        );
        onComplete();
      } else if (action === 'back') {
        if (challenge)
          await abandonCancellationCode(appointmentId, challenge.challengeId);
        onBack();
      }
    } catch (failure: unknown) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Não foi possível concluir. Tente novamente.',
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  return (
    <View>
      <Text style={styles.infoValue}>
        {challenge
          ? `Código enviado para ${challenge.email}. Válido até ${new Date(challenge.expiresAt).toLocaleTimeString('pt-BR')}.`
          : 'Deseja cancelar? Enviaremos um código ao seu e-mail cadastrado. O agendamento permanece ativo até a validação.'}
      </Text>
      {challenge && (
        <>
          <TextInput
            accessibilityLabel="Código de confirmação do cancelamento"
            placeholder="Código de 6 dígitos"
            placeholderTextColor={colors.textSecondary}
            value={code}
            onChangeText={(value) =>
              setCode(value.replace(/\D/g, '').slice(0, 6))
            }
            keyboardType="number-pad"
            maxLength={6}
            editable={!busy}
            style={{
              color: colors.primaryBlack,
              borderColor: colors.textSecondary,
              borderWidth: 1,
              padding: 12,
              marginVertical: 12,
            }}
          />
          <TouchableOpacity
            accessibilityRole="button"
            disabled={busy || code.length !== 6}
            onPress={() => void perform('confirm')}
            style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>
              Validar código e cancelar
            </Text>
          </TouchableOpacity>
          <Text style={styles.infoValue}>
            Aguarde 60 segundos entre reenvios. Apenas o código mais recente
            funciona.
          </Text>
        </>
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: colors.errorText }}>
          {error}
        </Text>
      )}
      <TouchableOpacity
        accessibilityRole="button"
        disabled={busy}
        onPress={() => void perform('send')}
        style={styles.okButton}>
        <Text style={styles.okButtonText}>
          {busy
            ? 'Aguarde…'
            : challenge
              ? 'Reenviar código'
              : 'Enviar código de confirmação'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        disabled={busy}
        onPress={() => void perform('back')}
        style={styles.okButton}>
        <Text style={styles.okButtonText}>Voltar sem cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}
