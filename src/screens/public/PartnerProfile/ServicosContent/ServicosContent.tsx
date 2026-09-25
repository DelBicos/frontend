import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { Service } from '@stores/Professional/types';
import { formatBRL } from '@lib/helpers/formatCurrency';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';

type ServicosContentProps = {
  servicos: Service[];
  professionalId: number;
  professionalName: string;
  /** O proprio profissional vendo o perfil: sem botao de agendar. */
  isOwner?: boolean;
};

const formatDuration = (minutes?: number) => {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h${m ? ` ${m}min` : ''}` : `${m} min`;
};

export function ServicosContent({
  servicos,
  professionalId,
  professionalName,
  isOwner = false,
}: ServicosContentProps) {
  const colors = useColors();
  const { isCompact } = useBreakpoint();
  const styles = createStyles(colors, isCompact);
  const navigation = useNavigation<any>();

  const active = servicos.filter((s) => s.active);

  // Escolhe a data e mostra so os horarios deste profissional.
  const schedule = (servico: Service) =>
    navigation.navigate('SubCategoryScreen', {
      categoryId: -1,
      categoryTitle: servico.title,
      serviceId: servico.subcategory_id,
      singleSubCategory: { id: servico.subcategory_id, title: servico.title },
      professionalId,
      professionalName,
    });

  if (active.length === 0) {
    return (
      <View style={styles.empty}>
        <FontAwesome name="wrench" size={28} color={colors.textSecondary} />
        <Text style={styles.emptyText}>
          Nenhum serviço disponível no momento.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {active.map((item) => {
        const duration = formatDuration(item.duration);
        return (
          <View
            key={item.id}
            style={[styles.cell, { width: isCompact ? '100%' : '50%' }]}>
            <View style={styles.card}>
              {item.banner_uri ? (
                <Image
                  source={{ uri: item.banner_uri }}
                  style={styles.image}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : null}
              <View style={styles.body}>
                <Text
                  style={styles.title}
                  accessibilityRole="header"
                  {...({ 'aria-level': 3 } as object)}>
                  {item.title}
                </Text>
                {item.description ? (
                  <Text style={styles.description} numberOfLines={3}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.footer}>
                  <View>
                    <Text style={styles.price}>
                      {formatBRL({
                        price: item.price,
                        price_cents: item.price_cents,
                      })}
                    </Text>
                    {duration ? (
                      <Text style={styles.duration}>
                        <FontAwesome
                          name="clock-o"
                          size={13}
                          color={colors.textSecondary}
                        />{' '}
                        {duration}
                      </Text>
                    ) : null}
                  </View>
                  {!isOwner ? (
                    <Pressable
                      onPress={() => schedule(item)}
                      style={({ pressed }) => [
                        styles.button,
                        pressed && { opacity: 0.8 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Agendar ${item.title} com ${professionalName}`}>
                      <Text style={styles.buttonText}>Agendar</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const GAP = 16;

const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -GAP / 2,
      rowGap: GAP,
    },
    cell: {
      paddingHorizontal: GAP / 2,
    },
    card: {
      flexGrow: 1,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    image: {
      width: '100%',
      height: isCompact ? 150 : 170,
    },
    body: {
      flexGrow: 1,
      gap: 8,
      padding: 16,
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: 19,
      color: colors.primaryBlack,
    },
    description: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      lineHeight: 21,
      color: colors.textSecondary,
    },
    footer: {
      marginTop: 'auto',
      paddingTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    price: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
    },
    duration: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    button: {
      minHeight: 44,
      paddingHorizontal: 22,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    buttonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      // Texto escuro sobre laranja (contraste AA).
      color: '#000000',
    },
    empty: {
      alignItems: 'center',
      gap: 10,
      padding: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderColor,
    },
    emptyText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.textSecondary,
    },
  });
