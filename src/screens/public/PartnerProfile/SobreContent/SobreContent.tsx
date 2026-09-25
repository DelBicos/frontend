import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { Address } from '@stores/Professional/types';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { createStyles } from './styles';

export type SobreContentProps = {
  nome?: string;
  descricao?: string;
  endereco?: Address;
};

export function SobreContent({ nome, descricao, endereco }: SobreContentProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  const hasContent = nome || descricao || endereco;

  return (
    <View style={[styles.sobreContainer, styles.sobreContentContainer]}>
      {!hasContent && (
        <View style={styles.emptyContainer}>
          <FontAwesome
            name="info-circle"
            size={40}
            color={colors.textTertiary}
          />
          <Text style={styles.emptyText}>Nenhuma informação disponível</Text>
        </View>
      )}

      {/* Seção: Descrição / Bio */}
      {descricao && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons
              name="description"
              size={20}
              color={colors.primaryOrange}
            />
            <Text style={styles.sectionTitle}>Sobre o Profissional</Text>
          </View>
          <Text style={styles.descriptionText}>{descricao}</Text>
        </View>
      )}

      {/* Seção: Localização */}
      {endereco && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome
              name="map-marker"
              size={20}
              color={colors.primaryOrange}
            />
            <Text style={styles.sectionTitle}>Localização de Atendimento</Text>
          </View>

          <View style={styles.addressCard}>
            <Text style={styles.addressStreet}>
              {endereco.street}, {endereco.number}
              {endereco.complement ? ` - ${endereco.complement}` : ''}
            </Text>

            <Text style={styles.addressDetail}>{endereco.neighborhood}</Text>

            <View style={styles.addressRow}>
              <Text style={styles.addressCity}>
                {endereco.city} - {endereco.state}
              </Text>
              <Text style={styles.addressZip}>CEP: {endereco.zipcode}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
