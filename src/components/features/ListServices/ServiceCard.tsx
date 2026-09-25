import React from 'react';
import { View, Text, Pressable, StyleProp, ViewStyle } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ServiceItem } from '@stores/Services/Services';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';
import { useNavigation } from '@react-navigation/native';
import { useCategoryStore } from '@stores/Category';
import { isServiceAvailableNow } from '@lib/utils/availability';
import { formatBRLFromCents } from '@lib/helpers/formatCurrency';

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** Resumo legivel dos horarios: "Seg 08:00–12:00 • Ter …". */
export function formatAvailabilitySummary(
  availabilities: ServiceItem['availabilities'],
  max = 3,
): string | undefined {
  if (!availabilities || availabilities.length === 0) return undefined;
  const text = availabilities
    .slice(0, max)
    .map((a) => `${DAY_LABELS[a.day] ?? a.day} ${a.start}–${a.end}`)
    .join(' • ');
  return availabilities.length > max ? `${text} …` : text;
}

interface ServiceCardProps {
  service: ServiceItem;
  /** "row": linha horizontal (listas); "tile": card vertical (grades/carrosseis). */
  variant?: 'row' | 'tile';
  style?: StyleProp<ViewStyle>;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  variant = 'row',
  style,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const navigation = useNavigation();
  const { categories } = useCategoryStore();

  const category = categories.find((c) => c.id === service.category_id);
  const availabilityText = formatAvailabilitySummary(
    service.availabilities,
    variant === 'tile' ? 2 : 3,
  );
  const availableNow = isServiceAvailableNow(service);
  const price =
    service.price_cents != null ? formatBRLFromCents(service.price_cents) : '—';

  const handleSchedule = () => {
    // @ts-ignore
    navigation.navigate('SubCategoryScreen', {
      categoryId: service.category_id || 0,
      categoryTitle: category ? category.title : 'Serviços',
      // subcategory_id pre-seleciona a subcategoria na tela de agendamento
      serviceId: service.subcategory_id || 0,
    });
  };

  const scheduleButton = (
    <Pressable
      style={({ pressed, hovered }: any) => [
        styles.actionButton,
        (pressed || hovered) && styles.actionButtonActive,
      ]}
      onPress={handleSchedule}
      accessibilityRole="button"
      accessibilityLabel={`Agendar ${service.title}, ${price}`}>
      <Text style={styles.actionText}>Agendar</Text>
    </Pressable>
  );

  if (variant === 'tile') {
    return (
      <View style={[styles.tile, style]}>
        <View style={styles.tileHeader}>
          {category ? (
            <Text style={styles.categoryTag} numberOfLines={1}>
              {category.title}
            </Text>
          ) : (
            <View />
          )}
          {availableNow ? (
            <View style={styles.nowBadge}>
              <View style={styles.nowDot} />
              <Text style={styles.nowBadgeText}>Disponível agora</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.tileTitle} numberOfLines={2}>
          {service.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {service.description || ' '}
        </Text>

        <View style={styles.availabilityRow}>
          <FontAwesome name="clock-o" size={14} color={colors.textSecondary} />
          <Text style={styles.availability} numberOfLines={1}>
            {availabilityText ?? 'Sem horários cadastrados'}
          </Text>
        </View>

        <View style={styles.tileFooter}>
          <View>
            <Text style={styles.priceLabel}>A partir de</Text>
            <Text style={styles.price}>{price}</Text>
          </View>
          {scheduleButton}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, style]}>
      <View style={styles.info}>
        <Text style={styles.title}>{service.title}</Text>
        {availableNow ? (
          <View style={[styles.nowBadge, styles.nowBadgeInline]}>
            <View style={styles.nowDot} />
            <Text style={styles.nowBadgeText}>Disponível agora</Text>
          </View>
        ) : null}
        <Text style={styles.description} numberOfLines={2}>
          {service.description || ''}
        </Text>
        {availabilityText ? (
          <Text style={styles.availability} numberOfLines={1}>
            {availabilityText}
          </Text>
        ) : (
          <Text style={styles.noAvailability}>Sem disponibilidade</Text>
        )}
        <Text style={styles.price}>{price}</Text>
      </View>
      {scheduleButton}
    </View>
  );
};

export default ServiceCard;
