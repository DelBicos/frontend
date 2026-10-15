import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import {
  TicketCategory,
  TICKET_CATEGORY_LABELS,
} from '@stores/Ticket/types';
import { createStyles } from './styles';

interface CategoryPickerProps {
  value: TicketCategory | null;
  onChange: (category: TicketCategory) => void;
  /** Filtra categorias não aplicáveis (ex.: PRESTADOR não faz sentido para prestador). */
  availableCategories?: TicketCategory[];
  error?: string | null;
}

const DEFAULT_CATEGORIES: TicketCategory[] = [
  'AGENDAMENTO',
  'PAGAMENTO',
  'SERVICO',
  'PRESTADOR',
  'CLIENTE',
  'SUGESTAO',
  'OUTROS',
];

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onChange,
  availableCategories = DEFAULT_CATEGORIES,
  error,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.chips}>
        {availableCategories.map((category) => {
          const isSelected = value === category;
          return (
            <TouchableOpacity
              key={category}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onChange(category)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}>
              <Text
                style={[
                  styles.chipLabel,
                  isSelected && styles.chipLabelSelected,
                ]}>
                {TICKET_CATEGORY_LABELS[category]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};