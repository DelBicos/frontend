import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import type { Address } from '@stores/Address/types';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

interface AddressCardProps {
  addressData: Address;
  onUpdate: (id: number, data: Partial<Address>) => void;
  onDelete: (id: number) => void;
  onSetPrimary: (id: number) => void;
  onEditPress?: (address: Address) => void;
}

const AddressCardComponent: React.FC<AddressCardProps> = ({
  addressData,
  onDelete,
  onSetPrimary,
  onEditPress,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const isPrimary = addressData.isPrimary;

  return (
    <View style={[styles.card, isPrimary && styles.cardPrimary]}>
      {/* --- Cabeçalho --- */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <View
            style={[styles.iconCircle, isPrimary && styles.iconCirclePrimary]}>
            <FontAwesome
              name={isPrimary ? 'star' : 'map-marker'}
              size={16}
              color={isPrimary ? colors.primaryWhite : colors.primaryOrange}
            />
          </View>
          <Text style={styles.cardTitle}>
            {isPrimary ? 'Endereço Principal' : 'Endereço Secundário'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onDelete(addressData.id)}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome name="trash-o" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* --- Corpo --- */}
      <View style={styles.body}>
        <Text style={styles.streetText} numberOfLines={1}>
          {addressData.street}, {addressData.number}
        </Text>

        {addressData.complement && (
          <Text style={styles.complementText}>{addressData.complement}</Text>
        )}

        <Text style={styles.detailText}>{addressData.neighborhood}</Text>

        <Text style={styles.detailText}>
          {addressData.city} - {addressData.state}
        </Text>

        <Text style={styles.zipText}>CEP: {addressData.postal_code}</Text>
      </View>

      {/* --- Rodapé --- */}
      <View style={styles.footer}>
        {!isPrimary && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onSetPrimary(addressData.id)}
            activeOpacity={0.7}>
            <FontAwesome name="star-o" size={14} color={colors.primaryBlue} />
            <Text style={styles.actionText}>Definir como Principal</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEditPress && onEditPress(addressData)}
          activeOpacity={0.7}>
          <MaterialIcons name="edit" size={16} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>
            Editar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const AddressCard = React.memo(AddressCardComponent);
AddressCard.displayName = 'AddressCard';
