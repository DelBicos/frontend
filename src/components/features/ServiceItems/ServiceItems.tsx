import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';
import { formatBRLFromUnits } from '@lib/helpers/formatCurrency';

interface ServiceItemData {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  // `price` kept for backward compatibility (units), prefer `price_cents` (integer)
  price?: number;
  price_cents?: number;
  professional: string;
}

interface ServiceItemsProps {
  items: ServiceItemData[];
}

const ServiceItems: React.FC<ServiceItemsProps> = ({ items }) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const formatPrice = (price?: number, price_cents?: number) => {
    if (typeof price_cents === 'number')
      return formatBRLFromUnits(price_cents / 100);
    return formatBRLFromUnits(price ?? 0);
  };

  const formatDate = (dateString: string) => {
    return `(${dateString})`;
  };

  if (!items || items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Resumo do Pedido</Text>
      </View>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <View
            key={item.id}
            style={[styles.itemDetails, isLast && styles.lastItem]}>
            <View style={styles.row}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.itemTime}>
                Horário: {item.startTime} - {item.endTime}
              </Text>
              <Text style={styles.itemPrice}>
                {formatPrice(item.price, (item as any).price_cents)}
              </Text>
            </View>

            <Text style={styles.professionalText}>
              <Text style={styles.label}>Profissional: </Text>
              {item.professional}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default ServiceItems;
