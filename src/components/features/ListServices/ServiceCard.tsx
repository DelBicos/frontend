import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ServiceItem } from '@stores/Services/Services';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';
import { useNavigation } from '@react-navigation/native';
import { useCategoryStore } from '@stores/Category';
import { isServiceAvailableNow } from '@lib/helpers/availability';

const formatPrice = (cents?: number) => {
  if (cents == null) return '—';
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const ServiceCard: React.FC<{ service: ServiceItem }> = ({ service }) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const navigation = useNavigation();
  const { categories } = useCategoryStore();

  const category = categories.find((c) => c.id === service.category_id);

  const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const availabilityText = service.availabilities
    ? service.availabilities
        .slice(0, 3)
        .map((a) => `${DAY_LABELS[a.day] || a.day} ${a.start}–${a.end}`)
        .join(' • ') + (service.availabilities.length > 3 ? ' …' : '')
    : undefined;

  const handleSchedule = () => {
    // @ts-ignore
    navigation.navigate('SubCategoryScreen', {
      categoryId: service.category_id || 0,
      categoryTitle: category ? category.title : 'Serviços',
      // Passa subcategory_id para pre-selecionar a subcategoria correta na tela de agendamento
      serviceId: service.subcategory_id || 0,
    });
  };

  const availableNow = isServiceAvailableNow(service);

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title}>{service.title}</Text>
        {availableNow ? (
          <Text style={styles.availableNow}>Disponível agora</Text>
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
        <Text style={styles.price}>{formatPrice(service.price_cents)}</Text>
      </View>
      <TouchableOpacity style={styles.actionButton} onPress={handleSchedule}>
        <Text style={styles.actionText}>Agendar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ServiceCard;
