import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { useUserStore } from '@stores/User';
import { useColors } from '@theme/ThemeProvider';
import CustomTextInput from '@components/ui/CustomTextInput';
import CpfInput, { maskCpf } from '@components/ui/CpfInput/CpfInput';
import Chip, { ChipGroup } from '@components/ui/Chip';
import ActionButton from '@components/ui/ActionButton';
import InlineAlert from '@components/ui/InlineAlert';
import { isValidCPF } from '@utils/validators';
import ProfilePage, { ProfileCard } from '../../components/ProfilePage';
import { createStyles } from './styles';

const MAX_DESCRIPTION = 1500;
const MIN_DESCRIPTION = 30;
/** 0 = sem limite de distancia. */
const RADIUS_PRESETS = [5, 10, 20, 50, 0];

const BENEFITS: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  text: string;
}[] = [
  { icon: 'bell-o', text: 'Receba pedidos de clientes da sua região' },
  { icon: 'calendar', text: 'Organize sua agenda e seus horários' },
  { icon: 'credit-card', text: 'Receba pelo app, com pagamento garantido' },
];

const maskCnpj = (text: string) =>
  text
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');

/** Cadastro como colaborador (profissional) a partir da conta de cliente. */
const TornarParceiroForm: React.FC = () => {
  const colors = useColors();
  const styles = createStyles(colors);
  const navigation = useNavigation<any>();
  const { user, becomeProfessional } = useUserStore();
  const accountCpf = user?.cpf ?? '';

  const [cpf, setCpf] = useState(accountCpf);
  const [cnpj, setCnpj] = useState('');
  const [description, setDescription] = useState('');
  const [radius, setRadius] = useState(10);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const openPanel = () =>
    navigation.navigate('ProfessionalTabs', { screen: 'ProfessionalHomeTab' });

  if (user?.professional_id || done) {
    return (
      <ProfilePage title="Colaborador">
        <ProfileCard>
          <View style={styles.doneIcon}>
            <FontAwesome name="check" size={28} color={colors.successText} />
          </View>
          <Text style={styles.doneTitle}>
            {done ? 'Cadastro concluído!' : 'Você já é colaborador'}
          </Text>
          <Text style={styles.doneText}>
            No painel você cadastra seus serviços, define os horários e responde
            aos pedidos dos clientes.
          </Text>
          <ActionButton
            label="Abrir painel do colaborador"
            icon="briefcase"
            onPress={openPanel}
            style={styles.center}
          />
        </ProfileCard>
      </ProfilePage>
    );
  }

  const validate = () => {
    const next: Record<string, string> = {};
    const cpfDigits = cpf.replace(/\D/g, '');
    const cnpjDigits = cnpj.replace(/\D/g, '');
    if (!cpfDigits && !cnpjDigits) next.cpf = 'Informe o CPF ou o CNPJ.';
    if (cpfDigits && !isValidCPF(cpfDigits)) next.cpf = 'CPF inválido.';
    if (cnpjDigits && cnpjDigits.length !== 14) next.cnpj = 'CNPJ incompleto.';
    if (description.trim().length < MIN_DESCRIPTION) {
      next.description = `Escreva pelo menos ${MIN_DESCRIPTION} caracteres sobre você.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setServerError(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await becomeProfessional({
        cpf: cpf.replace(/\D/g, ''),
        cnpj: cnpj ? cnpj.replace(/\D/g, '') : undefined,
        description: description.trim(),
        service_radius_km: radius,
      });
      setDone(true);
    } catch (error: any) {
      setServerError(
        error?.message ||
          'Não foi possível concluir o cadastro. Tente de novo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfilePage
      title="Seja um colaborador"
      subtitle="Ofereça seus serviços no DelBicos usando a mesma conta.">
      <View style={styles.benefits}>
        {BENEFITS.map((b) => (
          <View key={b.text} style={styles.benefit}>
            <View style={styles.benefitIcon}>
              <FontAwesome name={b.icon} size={16} color="#000000" />
            </View>
            <Text style={styles.benefitText}>{b.text}</Text>
          </View>
        ))}
      </View>

      <ProfileCard title="Documento">
        {accountCpf ? (
          <View style={styles.readonly}>
            <Text style={styles.readonlyLabel}>CPF da sua conta</Text>
            <Text style={styles.readonlyValue}>{maskCpf(accountCpf)}</Text>
          </View>
        ) : (
          <CpfInput
            label="CPF"
            value={cpf}
            onChangeText={setCpf}
            error={errors.cpf}
          />
        )}
        <CustomTextInput
          label="CNPJ (opcional)"
          placeholder="00.000.000/0000-00"
          value={cnpj}
          onChangeText={(t) => setCnpj(maskCnpj(t))}
          keyboardType="numeric"
          error={errors.cnpj}
        />
        <Text style={styles.hint}>
          Informe se você atende como empresa (MEI, por exemplo).
        </Text>
      </ProfileCard>

      <ProfileCard title="Sobre você">
        <Text style={styles.label}>Apresentação</Text>
        <TextInput
          style={[
            styles.textarea,
            !!errors.description && styles.textareaError,
          ]}
          placeholder="Ex.: Sou eletricista há 10 anos, faço instalações e reparos residenciais..."
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={(t) => setDescription(t.slice(0, MAX_DESCRIPTION))}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Apresentação"
        />
        <View style={styles.textareaFooter}>
          <Text style={[styles.hint, !!errors.description && styles.error]}>
            {errors.description ?? 'Aparece no seu perfil público.'}
          </Text>
          <Text style={styles.hint}>
            {description.length}/{MAX_DESCRIPTION}
          </Text>
        </View>
      </ProfileCard>

      <ProfileCard title="Até onde você atende?">
        <ChipGroup accessibilityLabel="Distância máxima de atendimento">
          {RADIUS_PRESETS.map((km) => (
            <Chip
              key={km}
              label={km === 0 ? 'Sem limite' : `${km} km`}
              selected={radius === km}
              onPress={() => setRadius(km)}
            />
          ))}
        </ChipGroup>
        <Text style={[styles.hint, styles.hintBelow]}>
          Distância a partir do seu endereço principal. Dá para mudar depois no
          painel.
        </Text>
      </ProfileCard>

      {serverError ? <InlineAlert>{serverError}</InlineAlert> : null}
      <ActionButton
        label="Quero ser colaborador"
        icon="briefcase"
        onPress={submit}
        loading={isSubmitting}
      />
    </ProfilePage>
  );
};

export default TornarParceiroForm;
