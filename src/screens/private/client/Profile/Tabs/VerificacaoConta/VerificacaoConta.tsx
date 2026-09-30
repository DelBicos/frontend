import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import InlineAlert from '@components/ui/InlineAlert';
import VerifiedBadge from '@components/ui/VerifiedBadge';
import { useColors } from '@theme/ThemeProvider';
import { useUserStore } from '@stores/User';
import {
  getVerificationStatus,
  type VerificationStatus,
} from '@api/verification';
import { getApiErrorMessage } from '@api/errors';
import ProfilePage, { ProfileCard } from '../../components/ProfilePage';
import IdentityCard from './IdentityCard';
import MfaCard from './MfaCard';
import { createStyles } from './styles';

/** Passo do resumo: feito ou pendente. */
function Step({
  done,
  title,
  text,
}: {
  done: boolean;
  title: string;
  text: string;
}) {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.stepRow}>
      <MaterialIcons
        name={done ? 'check-circle' : 'radio-button-unchecked'}
        size={24}
        color={done ? colors.successText : colors.textSecondary}
      />
      <View style={styles.stepTexts}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepText}>{text}</Text>
      </View>
    </View>
  );
}

/** Verificacao de conta: e-mail, duas etapas e (profissionais) identidade. */
const VerificacaoConta: React.FC = () => {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchCurrentUser = useUserStore((s) => s.fetchCurrentUser);

  const load = useCallback(async () => {
    try {
      setStatus(await getVerificationStatus());
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar.'));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changed = useCallback(() => {
    load();
    fetchCurrentUser();
  }, [load, fetchCurrentUser]);

  return (
    <ProfilePage
      title="Verificação de conta"
      subtitle="Deixe sua conta mais segura e mostre que você é quem diz ser.">
      {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
      {!status && !error ? <ActivityIndicator /> : null}

      {status ? (
        <>
          <ProfileCard title="Resumo">
            <Step
              done={status.email_verified}
              title="E-mail confirmado"
              text="Você confirmou o e-mail ao criar a conta."
            />
            <Step
              done={status.mfa_enabled}
              title="Verificação em duas etapas"
              text={status.mfa_enabled ? 'Ativa.' : 'Ainda não ativada.'}
            />
            {status.is_professional ? (
              <Step
                done={status.verified}
                title="Identidade verificada"
                text={
                  status.verified
                    ? 'Aprovada. Seu perfil exibe o selo.'
                    : 'Envie seus documentos para receber o selo.'
                }
              />
            ) : null}
            {status.verified ? <VerifiedBadge showLabel size={20} /> : null}
          </ProfileCard>

          <MfaCard enabled={status.mfa_enabled} onChanged={changed} />
          {status.is_professional ? (
            <IdentityCard status={status} onChanged={changed} />
          ) : null}
        </>
      ) : null}
    </ProfilePage>
  );
};

export default VerificacaoConta;
