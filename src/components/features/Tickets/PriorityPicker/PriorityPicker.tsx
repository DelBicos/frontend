import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import {
  TicketPriority,
  TICKET_PRIORITIES,
  TICKET_PRIORITY_HINTS,
  TICKET_PRIORITY_LABELS,
} from '@stores/Ticket/types';
import { createStyles } from './styles';

interface PriorityPickerProps {
  value: TicketPriority | null;
  onChange: (priority: TicketPriority) => void;
  error?: string | null;
}

export const PriorityPicker: React.FC<PriorityPickerProps> = ({
  value,
  onChange,
  error,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.chips}>
        {TICKET_PRIORITIES.map((priority) => {
          const isSelected = value === priority;
          return (
            <TouchableOpacity
              key={priority}
              testID={`ticket-priority-${priority}`}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onChange(priority)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Prioridade ${TICKET_PRIORITY_LABELS[priority]}`}
              accessibilityState={{ selected: isSelected }}>
              <Text
                style={[
                  styles.chipLabel,
                  isSelected && styles.chipLabelSelected,
                ]}>
                {TICKET_PRIORITY_LABELS[priority]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {value ? (
        <Text style={styles.hint}>{TICKET_PRIORITY_HINTS[value]}</Text>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};
