import React, { useState } from 'react';
import { Text, View } from 'react-native';
import ActionButton from '@components/ui/ActionButton';
import CodeEntry from '@components/ui/CodeEntry';
import InlineAlert from '@components/ui/InlineAlert';
import PasswordInput from '@components/ui/PasswordInput';
import { useColors } from '@theme/ThemeProvider';
import {
  confirmEnableMfa,
  disableMfa,
  requestEnableMfa,
} from '@api/verification';
import { getApiErrorMessage } from '@api/errors';
import { ProfileCard } from '../../components/ProfilePage';
import { createStyles } from './styles';

const CODE_LENGTH = 6;

interface Props {
  enabled: boolean;
  onChanged: () => void;
}

type Step = 'idle' | 'code' | 'password';

/** Ativa ou desativa a verificacao em duas etapas por codigo no e-mail. */
function MfaCard({ enabled, onChanged }: Props) {
  const colors = useColors();
  const styles = createStyles(colors);
  const [step, setStep] = useState<Step>('idle');
  const [hint, setHint] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>, fallback: string) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(getApiErrorMessage(err, fallback));
    } finally {
      setBusy(false);
    }
  };

  const start = () =>
    run(async () => {
      setHint(await requestEnableMfa());
      setCode('');
      setStep('code');
    }, 'Não foi possível enviar o código.');

  const confirm = () => {
    if (code.length !== CODE_LENGTH) {
      setError(`Digite os ${CODE_LENGTH} números do código.`);
      return;
    }
    return run(async () => {
      await confirmEnableMfa(code);
      setStep('idle');
      onChanged();
    }, 'Código incorreto ou expirado.');
  };

  const disable = () =>
    run(async () => {
      await disableMfa(password);
      setPassword('');
      setStep('idle');
      onChanged();
    }, 'Não foi possível desativar.');

  const cancel = () => {
    setStep('idle');
    setError(null);
    setPassword('');
  };

  return (
    <ProfileCard title="Verificação em duas etapas">
      <Text style={styles.body}>
        {enabled
          ? 'Ativa. Ao entrar, pedimos também um código enviado ao seu e-mail.'
          : 'Ao entrar, além da senha, pedimos um código enviado ao seu e-mail. Protege sua conta se alguém descobrir sua senha.'}
      </Text>

      {step === 'code' ? (
        <View style={styles.mfaBox}>
          <Text style={styles.stepText}>
            Enviamos um código para {hint}. Digite abaixo.
          </Text>
          <CodeEntry value={code} onChange={setCode} length={CODE_LENGTH} />
          {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
          <ActionButton
            label="Ativar"
            icon="shield"
            onPress={confirm}
            loading={busy}
          />
          <ActionButton label="Cancelar" variant="ghost" onPress={cancel} />
        </View>
      ) : null}

      {step === 'password' ? (
        <View style={styles.mfaBox}>
          <Text style={styles.stepText}>
            Confirme sua senha para desativar.
          </Text>
          <PasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            accessibilityLabel="Senha"
          />
          {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
          <ActionButton
            label="Desativar"
            variant="danger"
            onPress={disable}
            loading={busy}
            disabled={!password}
          />
          <ActionButton label="Cancelar" variant="ghost" onPress={cancel} />
        </View>
      ) : null}

      {step === 'idle' ? (
        <>
          {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
          {enabled ? (
            <ActionButton
              label="Desativar"
              variant="secondary"
              onPress={() => {
                setError(null);
                setStep('password');
              }}
            />
          ) : (
            <ActionButton
              label="Ativar por e-mail"
              icon="shield"
              onPress={start}
              loading={busy}
            />
          )}
        </>
      ) : null}
    </ProfileCard>
  );
}

export default MfaCard;
