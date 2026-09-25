import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';
import { Address, useAddressStore } from '@stores/Address';
import { useForm } from 'react-hook-form';
import { AddressForm } from '@components/features/AddressForm/AddressForm';
import { FontAwesome } from '@expo/vector-icons';

type AddressSelectionModalProps = {
  visible: boolean;
  onClose: () => void;
  onAddressSelect: (address: Address) => void;
  userId: number;
};

type ViewMode = 'list' | 'create';

const formatAddress = (address: Address) => {
  const comp = address.complement ? ` - ${address.complement}` : '';
  return `${address.street}, ${address.number}${comp}`;
};

function AddressSelectionModal({
  visible,
  onClose,
  onAddressSelect,
  userId,
}: AddressSelectionModalProps) {
  const {
    addresses,
    isLoading: loading,
    error,
    fetchAddressesByUserId,
    addAddress,
  } = useAddressStore();

  const colors = useColors();
  const styles = createStyles(colors);
  const { width: viewportWidth, height: viewportHeight } =
    useWindowDimensions();
  const isCompactLayout = viewportWidth <= 520 || viewportHeight <= 640;
  const modalVerticalMargin = isCompactLayout ? 32 : 48;
  const modalMaxHeight = Math.max(280, viewportHeight - modalVerticalMargin);
  const listMaxHeight = Math.max(
    isCompactLayout ? 96 : 104,
    Math.min(
      isCompactLayout ? 240 : 320,
      viewportHeight - (isCompactLayout ? 264 : 300),
    ),
  );
  const estimatedListHeight =
    addresses.length > 0
      ? addresses.length * (isCompactLayout ? 124 : 108)
      : isCompactLayout
        ? 100
        : 112;
  const addressListHeight = Math.min(estimatedListHeight, listMaxHeight);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    },
  });

  useEffect(() => {
    if (visible) {
      fetchAddressesByUserId(userId);
      setViewMode('list');
      reset();
      setSelectedAddress(null);
    }
  }, [visible, userId, fetchAddressesByUserId, reset]);

  const handleConfirmSelection = () => {
    if (selectedAddress) {
      onAddressSelect(selectedAddress);
      onClose();
    } else {
      Alert.alert('Atenção', 'Selecione um endereço para continuar.');
    }
  };

  const handleSaveNewAddress = async (formData: any) => {
    setIsSaving(true);
    try {
      const cleanCep = formData.cep ? formData.cep.replace(/\D/g, '') : '';
      const payload = {
        user_id: userId,
        lat: 0,
        lng: 0,
        street: formData.street,
        number: String(formData.number),
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        postal_code: cleanCep,
        country_iso: 'BR',
        active: true,
      };

      await addAddress(payload);
      await fetchAddressesByUserId(userId);

      setViewMode('list');
      reset();
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Falha ao salvar endereço.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderAddressItem = ({ item }: { item: Address }) => {
    const isSelected = selectedAddress?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.addressItem, isSelected && styles.selectedAddressItem]}
        onPress={() => setSelectedAddress(item)}
        activeOpacity={0.7}>
        <View style={styles.radioContainer}>
          <View
            style={[
              styles.radioOuter,
              isSelected && styles.radioOuterSelected,
            ]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>

        <View style={styles.addressInfo}>
          <Text
            style={styles.addressText}
            numberOfLines={2}
            ellipsizeMode="tail">
            {formatAddress(item)}
          </Text>
          <Text
            style={styles.addressSubtext}
            numberOfLines={2}
            ellipsizeMode="tail">
            {item.neighborhood} - {item.city}/{item.state}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}>
          <View
            style={[
              styles.modalContent,
              isCompactLayout && styles.modalContentCompact,
              { maxHeight: modalMaxHeight },
            ]}>
            {viewMode === 'list' ? (
              <>
                {/* Header */}
                <View style={styles.headerRow}>
                  <Text style={styles.modalTitle}>Selecione o Endereço</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}>
                    <FontAwesome
                      name="close"
                      size={24}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {loading ? (
                  <View style={styles.centerState}>
                    <ActivityIndicator
                      size="large"
                      color={colors.primaryOrange}
                    />
                    <Text style={styles.stateText}>
                      Carregando endereços...
                    </Text>
                  </View>
                ) : error ? (
                  <View style={styles.centerState}>
                    <Text style={styles.stateText}>{error}</Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.listContainer,
                      { height: addressListHeight },
                    ]}>
                    <FlatList
                      data={addresses}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={renderAddressItem}
                      style={styles.addressList}
                      contentContainerStyle={styles.listContent}
                      showsVerticalScrollIndicator={true}
                      ListEmptyComponent={
                        <View style={styles.centerState}>
                          <Text style={styles.stateText}>
                            Nenhum endereço cadastrado.
                          </Text>
                        </View>
                      }
                    />
                  </View>
                )}

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.newAddressButton}
                    onPress={() => setViewMode('create')}
                    activeOpacity={0.7}>
                    <FontAwesome
                      name="plus"
                      size={14}
                      color={colors.primaryOrange}
                    />
                    <Text style={styles.newAddressButtonText}>
                      Adicionar novo endereço
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      !selectedAddress && !loading && styles.disabledButton,
                    ]}
                    onPress={handleConfirmSelection}
                    disabled={!selectedAddress || loading}
                    activeOpacity={0.8}>
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              /* --- MODO CRIAÇÃO --- */
              <>
                <View style={styles.headerRow}>
                  <TouchableOpacity
                    onPress={() => setViewMode('list')}
                    style={styles.closeButton}>
                    <FontAwesome
                      name="arrow-left"
                      size={20}
                      color={colors.primaryOrange}
                    />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Novo Endereço</Text>
                  <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                  style={styles.formScrollView}
                  showsVerticalScrollIndicator={false}>
                  <AddressForm
                    control={control}
                    errors={errors}
                    setValue={setValue}
                  />
                </ScrollView>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    isSaving && styles.disabledButton,
                  ]}
                  onPress={handleSubmit(handleSaveNewAddress)}
                  disabled={isSaving}>
                  {isSaving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      Salvar Endereço
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default AddressSelectionModal;
