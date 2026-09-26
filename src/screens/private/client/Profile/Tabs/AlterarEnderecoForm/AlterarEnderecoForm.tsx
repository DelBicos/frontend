import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { FontAwesome } from '@expo/vector-icons';
import { AddressCard } from '@components/ui/AddressCard';
import ActionButton from '@components/ui/ActionButton';
import InlineAlert from '@components/ui/InlineAlert';
import EmptyState from '@components/ui/EmptyState';
import {
  AddressForm,
  AddressFormData,
} from '@components/features/AddressForm/AddressForm';
import { useColors } from '@theme/ThemeProvider';
import { Address, useAddressStore } from '@stores/Address';
import { useUserStore } from '@stores/User';
import { confirmAction } from '@lib/utils/confirmAction';
import ProfilePage from '../../components/ProfilePage';
import { createStyles } from './styles';

const EMPTY_FORM: AddressFormData = {
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
};

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: AddressFormData) => Promise<void>;
  initialData?: Address | null;
}

/** Formulario de endereco em janela (novo ou edicao). */
function AddressModal({
  visible,
  onClose,
  onSave,
  initialData,
}: AddressModalProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    mode: 'onTouched',
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (!visible) return;
    setError(null);
    reset(
      initialData
        ? {
            cep: initialData.postal_code || '',
            street: initialData.street || '',
            number: initialData.number || '',
            complement: initialData.complement || '',
            neighborhood: initialData.neighborhood || '',
            city: initialData.city || '',
            state: initialData.state || '',
          }
        : EMPTY_FORM,
    );
  }, [visible, initialData, reset]);

  const submit = handleSubmit(async (data) => {
    setError(null);
    try {
      await onSave(data);
    } catch (e: any) {
      setError(e?.message || 'Não foi possível salvar o endereço.');
    }
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text
              style={styles.modalTitle}
              accessibilityRole="header"
              {...({ 'aria-level': 2 } as object)}>
              {initialData ? 'Editar endereço' : 'Novo endereço'}
            </Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Fechar">
              <FontAwesome name="close" size={20} color={colors.primaryBlack} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <Text style={styles.modalHint}>
              Digite o CEP que preenchemos rua, bairro, cidade e estado.
            </Text>
            <View style={styles.formWrapper}>
              <AddressForm
                control={control}
                errors={errors}
                setValue={setValue}
              />
            </View>
            {error ? <InlineAlert>{error}</InlineAlert> : null}
            <View style={styles.modalActions}>
              <ActionButton
                label="Cancelar"
                variant="ghost"
                onPress={onClose}
              />
              <ActionButton
                label={initialData ? 'Salvar alterações' : 'Adicionar endereço'}
                onPress={submit}
                loading={isSubmitting}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Enderecos salvos: principal primeiro, adicionar, editar e excluir. */
export default function AlterarEnderecoForm() {
  const colors = useColors();
  const styles = createStyles(colors);
  const { width } = useWindowDimensions();
  const columns = width >= 1100 ? 2 : 1;
  const { user } = useUserStore();
  const {
    addresses,
    isLoading,
    error,
    fetchAddressesByUserId,
    updateAddress,
    deleteAddress,
    setPrimaryAddress,
    addAddress,
  } = useAddressStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (user?.id) fetchAddressesByUserId(user.id);
  }, [user?.id, fetchAddressesByUserId]);

  const sorted = useMemo(
    () =>
      [...addresses].sort(
        (a, b) => Number(!!b.isPrimary) - Number(!!a.isPrimary),
      ),
    [addresses],
  );

  const openCreate = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const save = async (data: AddressFormData) => {
    if (!user?.id) return;
    const fields = {
      street: data.street,
      number: String(data.number),
      complement: data.complement,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      postal_code: data.cep.replace(/\D/g, ''),
    };
    if (editing) {
      // Nao sobrescreve as coordenadas ja salvas.
      await updateAddress(editing.id, fields);
    } else {
      await addAddress({
        ...fields,
        user_id: user.id,
        lat: 0,
        lng: 0,
        country_iso: 'BR',
        active: true,
      });
    }
    setModalVisible(false);
    setFeedback({
      type: 'success',
      text: editing ? 'Endereço atualizado.' : 'Endereço adicionado.',
    });
  };

  const remove = async (address: Address) => {
    const ok = await confirmAction({
      title: 'Excluir endereço',
      message: `${address.street}, ${address.number} vai ser removido.`,
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (!ok) return;
    setBusyId(address.id);
    try {
      await deleteAddress(address.id);
      setFeedback({ type: 'success', text: 'Endereço excluído.' });
    } catch (e: any) {
      setFeedback({ type: 'error', text: e?.message });
    } finally {
      setBusyId(null);
    }
  };

  const makePrimary = async (id: number) => {
    setBusyId(id);
    try {
      await setPrimaryAddress(id);
      setFeedback({ type: 'success', text: 'Endereço principal alterado.' });
    } catch (e: any) {
      setFeedback({ type: 'error', text: e?.message });
    } finally {
      setBusyId(null);
    }
  };

  let body: React.ReactNode;
  if (isLoading && addresses.length === 0) {
    body = (
      <ActivityIndicator
        size="large"
        color={colors.primaryBlack}
        style={styles.loading}
      />
    );
  } else if (error && addresses.length === 0) {
    body = (
      <EmptyState
        icon="exclamation-circle"
        title="Algo deu errado"
        text={error}>
        <ActionButton
          label="Tentar de novo"
          variant="secondary"
          onPress={() => user?.id && fetchAddressesByUserId(user.id)}
        />
      </EmptyState>
    );
  } else if (addresses.length === 0) {
    body = (
      <EmptyState
        icon="map-marker"
        title="Nenhum endereço salvo"
        text="Adicione onde você costuma receber os serviços para agendar mais rápido.">
        <ActionButton
          label="Adicionar endereço"
          icon="plus"
          onPress={openCreate}
        />
      </EmptyState>
    );
  } else {
    body = (
      <View style={styles.grid}>
        {sorted.map((address) => (
          <View
            key={address.id}
            style={[styles.gridItem, { width: `${100 / columns}%` }]}>
            <AddressCard
              addressData={address}
              onDelete={remove}
              onSetPrimary={makePrimary}
              onEditPress={(a) => {
                setEditing(a);
                setModalVisible(true);
              }}
              busy={busyId === address.id}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <ProfilePage
      title="Endereços"
      subtitle="O principal é usado como padrão nos agendamentos."
      action={
        addresses.length > 0 ? (
          <ActionButton
            label="Novo endereço"
            icon="plus"
            onPress={openCreate}
            size="sm"
          />
        ) : null
      }>
      {feedback ? (
        <InlineAlert type={feedback.type}>{feedback.text}</InlineAlert>
      ) : null}
      {body}
      <AddressModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={save}
        initialData={editing}
      />
    </ProfilePage>
  );
}
