import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@theme/ThemeProvider';
import { formatBRLFromUnits } from '@lib/helpers/formatCurrency';
import { initials, slotDate } from '@lib/booking';
import { createStyles } from './styles';

export interface ProfessionalResult {
  id: number;
  name: string;
  serviceName: string;
  serviceId: number;
  rating: number;
  ratingsCount: number;
  priceFrom: number;
  availableTimes: string[];
  offeredServices: string[];
  distance: number;
  location: string;
  imageUrl: string;
}

interface ProfessionalResultCardProps {
  professional: ProfessionalResult;
  selectedDate: string;
  /** Horarios ja filtrados pela antecedencia minima. */
  times: string[];
  /** A distancia so faz sentido quando o endereco do cliente e conhecido. */
  showDistance: boolean;
}

/** Quantos horarios aparecem antes de "Ver mais". */
const VISIBLE_TIMES = 8;

/**
 * Profissional com horario livre no dia escolhido. O cliente escolhe o
 * horario e confirma no botao (um toque acidental nao leva ao pagamento).
 */
const ProfessionalResultCard: React.FC<ProfessionalResultCardProps> = ({
  professional,
  selectedDate,
  times,
  showDistance,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const navigation = useNavigation<any>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showAllTimes, setShowAllTimes] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const visibleTimes = showAllTimes ? times : times.slice(0, VISIBLE_TIMES);
  const hiddenCount = times.length - visibleTimes.length;
  const hasRating = professional.ratingsCount > 0;
  const location =
    professional.location && !professional.location.includes('undefined')
      ? professional.location
      : null;

  const handleBook = () => {
    if (!selectedTime) return;
    navigation.navigate('Checkout', {
      professionalId: professional.id,
      priceFrom: professional.priceFrom,
      selectedTime: slotDate(selectedDate, selectedTime).toISOString(),
      imageUrl: professional.imageUrl,
      professionalName: professional.name,
      serviceId: professional.serviceId,
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        {professional.imageUrl && !imageFailed ? (
          <Image
            source={{ uri: professional.imageUrl }}
            style={styles.avatar}
            onError={() => setImageFailed(true)}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitials}>
              {initials(professional.name)}
            </Text>
          </View>
        )}
        <View style={styles.identity}>
          <Text
            style={styles.name}
            numberOfLines={2}
            accessibilityRole="header"
            {...({ 'aria-level': 2 } as object)}>
            {professional.name}
          </Text>
          <Text style={styles.service} numberOfLines={2}>
            {professional.serviceName}
          </Text>
          <View style={styles.metaRow}>
            {hasRating ? (
              <View
                style={styles.meta}
                accessibilityLabel={`Nota ${professional.rating.toFixed(1)} de 5, ${professional.ratingsCount} avaliações`}>
                <FontAwesome name="star" size={14} color="#B45309" />
                <Text style={styles.metaStrong}>
                  {professional.rating.toFixed(1)}
                </Text>
                <Text style={styles.metaText}>
                  ({professional.ratingsCount})
                </Text>
              </View>
            ) : (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>Novo no DelBicos</Text>
              </View>
            )}
            {showDistance ? (
              <View style={styles.meta}>
                <FontAwesome
                  name="map-marker"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.metaText}>
                  {professional.distance.toLocaleString('pt-BR', {
                    maximumFractionDigits: 1,
                  })}{' '}
                  km
                </Text>
              </View>
            ) : null}
          </View>
          {location ? (
            <Text style={styles.metaText} numberOfLines={1}>
              {location}
            </Text>
          ) : null}
        </View>
        <View style={styles.priceBox}>
          <Text style={styles.price}>
            {formatBRLFromUnits(professional.priceFrom)}
          </Text>
        </View>
      </View>

      <Text style={styles.timesTitle}>Horários livres</Text>
      <View
        style={styles.times}
        accessibilityRole="radiogroup"
        accessibilityLabel={`Horários de ${professional.name}`}>
        {visibleTimes.map((time) => {
          const isSelected = selectedTime === time;
          return (
            <Pressable
              key={time}
              onPress={() => setSelectedTime(time)}
              style={({ pressed, hovered }: any) => [
                styles.time,
                hovered && !isSelected && styles.timeHover,
                isSelected && styles.timeSelected,
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}>
              <Text style={[styles.timeText, isSelected && styles.timeTextOn]}>
                {time}
              </Text>
            </Pressable>
          );
        })}
        {hiddenCount > 0 ? (
          <Pressable
            onPress={() => setShowAllTimes(true)}
            style={({ pressed }) => [
              styles.moreTimes,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button">
            <Text style={styles.moreTimesText}>+{hiddenCount} horários</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() =>
            navigation.navigate('PartnerProfile', { id: professional.id })
          }
          style={({ pressed }) => [
            styles.profileLink,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityRole="link">
          <Text style={styles.profileLinkText}>Ver perfil</Text>
        </Pressable>
        <Pressable
          onPress={handleBook}
          disabled={!selectedTime}
          style={({ pressed, hovered }: any) => [
            styles.book,
            hovered && selectedTime && styles.bookHover,
            !selectedTime && styles.bookDisabled,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !selectedTime }}
          accessibilityHint={
            selectedTime ? undefined : 'Escolha um horário primeiro'
          }>
          <Text style={[styles.bookText, !selectedTime && styles.bookTextOff]}>
            {selectedTime ? `Agendar às ${selectedTime}` : 'Escolha um horário'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ProfessionalResultCard;
