import React, { useMemo } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { formatBRLFromCents } from '@lib/helpers/formatCurrency';
import { ChatBotServiceOption } from '@stores/ChatBot/types';
import { createStyles } from './styles';

interface ServiceOptionsProps {
  options: ChatBotServiceOption[];
  onSelect: (value: string, label: string) => void;
  disabled?: boolean;
}

function ratingLabel(option: ChatBotServiceOption): string {
  if (!option.ratingsCount) return 'Novo neste serviço';
  return `${option.rating.toFixed(1)} (${option.ratingsCount} ${
    option.ratingsCount === 1 ? 'avaliação' : 'avaliações'
  })`;
}

export const ServiceOptions: React.FC<ServiceOptionsProps> = ({
  options,
  onSelect,
  disabled = false,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!options.length) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Profissionais para este serviço</Text>
      <Text style={styles.helper}>
        Compare as informações e escolha quem você prefere.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={Platform.OS === 'web'}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {options.map((option, index) => {
          const location =
            option.professionalCity && option.professionalState
              ? `${option.professionalCity}/${option.professionalState}`
              : null;

          return (
            <View
              key={`${option.id}-${option.professionalId}`}
              style={styles.card}>
              <View style={styles.professionalRow}>
                {option.professionalAvatarUri ? (
                  <Image
                    source={{ uri: option.professionalAvatarUri }}
                    style={styles.avatar}
                    accessibilityLabel={`Foto de ${option.professionalName}`}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <FontAwesome
                      name="user"
                      size={20}
                      color={colors.primaryOrange}
                    />
                  </View>
                )}

                <View style={styles.professionalInfo}>
                  <Text style={styles.professionalName} numberOfLines={1}>
                    {option.professionalName}
                  </Text>
                  <View style={styles.ratingRow}>
                    <FontAwesome
                      name="star"
                      size={13}
                      color={
                        option.ratingsCount ? '#F5A623' : colors.textTertiary
                      }
                    />
                    <Text style={styles.ratingText}>{ratingLabel(option)}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.serviceTitle}>{option.title}</Text>
              <Text style={styles.categoryText}>
                {[option.categoryName, option.subcategoryName]
                  .filter(Boolean)
                  .join(' › ')}
              </Text>

              {!!option.description && (
                <Text style={styles.description} numberOfLines={3}>
                  {option.description}
                </Text>
              )}

              <View style={styles.detailsRow}>
                <View style={styles.detail}>
                  <FontAwesome
                    name="money"
                    size={13}
                    color={colors.primaryGreen}
                  />
                  <Text style={styles.price}>
                    {formatBRLFromCents(option.price)}
                  </Text>
                </View>
                <View style={styles.detail}>
                  <FontAwesome
                    name="clock-o"
                    size={13}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.detailText}>{option.duration} min</Text>
                </View>
              </View>

              {!!location && (
                <View style={styles.detail}>
                  <FontAwesome
                    name="map-marker"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.detailText}>{location}</Text>
                </View>
              )}

              {!!option.professionalDescription && (
                <Text style={styles.professionalDescription} numberOfLines={2}>
                  {option.professionalDescription}
                </Text>
              )}

              <TouchableOpacity
                style={[
                  styles.selectButton,
                  disabled && styles.selectButtonDisabled,
                ]}
                onPress={() =>
                  onSelect(
                    String(index + 1),
                    `${option.title} com ${option.professionalName}`,
                  )
                }
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`Escolher ${option.professionalName} para ${option.title}`}>
                <Text style={styles.selectButtonText}>
                  Escolher este profissional
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
