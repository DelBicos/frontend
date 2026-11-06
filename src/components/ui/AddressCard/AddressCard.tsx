import React from 'react';
import { Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import type { Address } from '@stores/Address/types';
import { useColors } from '@theme/ThemeProvider';
import ActionButton from '@components/ui/ActionButton';
import { createStyles } from './styles';

interface AddressCardProps {
  addressData: Address;
  onDelete: (address: Address) => void;
  onSetPrimary: (id: number) => void;
  onEditPress: (address: Address) => void;
  busy?: boolean;
}

const formatCep = (cep?: string) => {
  const digits = (cep ?? '').replace(/\D/g, '');
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : cep;
};

/** Endereco salvo, com acoes. O principal nao pode ser excluido. */
const AddressCardComponent: React.FC<AddressCardProps> = ({
  addressData,
  onDelete,
  onSetPrimary,
  onEditPress,
  busy = false,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const isPrimary = !!addressData.isPrimary;

  return (
    <View style={[styles.card, isPrimary && styles.cardPrimary]}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <FontAwesome
            name="map-marker"
            size={18}
            color={colors.primaryBlack}
          />
        </View>
        <View style={styles.texts}>
          <Text style={styles.street}>
            {addressData.street}, {addressData.number}
          </Text>
          {addressData.complement ? (
            <Text style={styles.detail}>{addressData.complement}</Text>
          ) : null}
          <Text style={styles.detail}>
            {addressData.neighborhood} · {addressData.city}/{addressData.state}
          </Text>
          <Text style={styles.detail}>
            CEP {formatCep(addressData.postal_code)}
          </Text>
        </View>
        {isPrimary ? (
          <View style={styles.badge}>
            <FontAwesome name="star" size={11} color="#000000" />
            <Text style={styles.badgeText}>Principal</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        {!isPrimary ? (
          <ActionButton
            label="Tornar principal"
            icon="star-o"
            variant="secondary"
            size="sm"
            onPress={() => onSetPrimary(addressData.id)}
            disabled={busy}
          />
        ) : null}
        <ActionButton
          label="Editar"
          icon="pencil"
          variant="secondary"
          size="sm"
          onPress={() => onEditPress(addressData)}
          disabled={busy}
        />
        {!isPrimary ? (
          <ActionButton
            label="Excluir"
            variant="ghost"
            size="sm"
            onPress={() => onDelete(addressData)}
            disabled={busy}
            accessibilityLabel={`Excluir ${addressData.street}, ${addressData.number}`}
          />
        ) : null}
      </View>
      {isPrimary ? (
        <Text style={styles.note}>
          Usado como padrão nos agendamentos e na busca por profissionais.
        </Text>
      ) : null}
    </View>
  );
};

export const AddressCard = React.memo(AddressCardComponent);
AddressCard.displayName = 'AddressCard';
