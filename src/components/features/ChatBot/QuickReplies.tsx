import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { QuickReplyOption, SuggestedTime } from '@stores/ChatBot/types';

interface QuickRepliesProps {
  quickReplies?: QuickReplyOption[];
  suggestedTimes?: SuggestedTime[];
  onSelect: (value: string, label: string) => void;
  disabled?: boolean;
}

/**
 * Renderiza chips de resposta rápida e/ou horários sugeridos
 * (quando não há disponibilidade no horário pedido).
 */
export const QuickReplies: React.FC<QuickRepliesProps> = ({
  quickReplies,
  suggestedTimes,
  onSelect,
  disabled = false,
}) => {
  const colors = useColors();

  const hasReplies = quickReplies && quickReplies.length > 0;
  const hasTimes = suggestedTimes && suggestedTimes.length > 0;

  if (!hasReplies && !hasTimes) return null;

  return (
    <View style={styles.wrapper}>
      {hasTimes && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Horários disponíveis:
        </Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        {hasReplies &&
          quickReplies!.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.chip,
                {
                  borderColor: colors.primaryOrange,
                  backgroundColor: disabled
                    ? colors.inputBackground
                    : colors.cardBackground,
                },
              ]}
              onPress={() => onSelect(option.value, option.label)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={option.label}>
              <Text
                style={[
                  styles.chipText,
                  {
                    color: disabled ? colors.textTertiary : colors.primaryOrange,
                    fontFamily: 'Afacad-SemiBold',
                  },
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}

        {hasTimes &&
          suggestedTimes!.map((time) => (
            <TouchableOpacity
              key={time.value}
              style={[
                styles.chip,
                styles.timeChip,
                {
                  borderColor: colors.primaryBlue,
                  backgroundColor: disabled
                    ? colors.inputBackground
                    : colors.backgroundElevated,
                },
              ]}
              onPress={() => onSelect(time.value, time.label)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={`Agendar para ${time.label}`}>
              <Text
                style={[
                  styles.chipText,
                  {
                    color: disabled ? colors.textTertiary : colors.primaryBlue,
                    fontFamily: 'Afacad-SemiBold',
                  },
                ]}>
                {time.label}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: 6,
  },
  label: {
    fontSize: 12,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  scroll: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 14,
  },
});
