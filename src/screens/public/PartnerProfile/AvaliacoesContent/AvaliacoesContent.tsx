import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Review } from '@stores/Professional/types';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import Stars from '../components/Stars';

type AvaliacoesContentProps = {
  avaliacoes?: Review[];
};

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
      }).format(new Date(value))
    : '';

export function AvaliacoesContent({ avaliacoes = [] }: AvaliacoesContentProps) {
  const colors = useColors();
  const { isCompact } = useBreakpoint();
  const styles = createStyles(colors, isCompact);

  const rated = avaliacoes.filter((a) => a.rating);
  const average = rated.length
    ? rated.reduce((sum, a) => sum + (a.rating ?? 0), 0) / rated.length
    : 0;

  // Mais recentes primeiro.
  const sorted = useMemo(
    () =>
      [...rated].sort(
        (a, b) =>
          new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() -
          new Date(a.updatedAt ?? a.createdAt ?? 0).getTime(),
      ),
    [rated],
  );

  if (rated.length === 0) {
    return (
      <View style={styles.empty}>
        <FontAwesome name="star-o" size={32} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>Ainda sem avaliações</Text>
        <Text style={styles.emptyText}>
          As avaliações aparecem aqui depois que os clientes concluem um
          serviço.
        </Text>
      </View>
    );
  }

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: rated.filter((a) => Math.round(a.rating ?? 0) === star).length,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View
          style={styles.summaryScore}
          accessible
          accessibilityLabel={`Nota média ${average.toFixed(1).replace('.', ',')} de 5, com ${rated.length} avaliações`}>
          <Text style={styles.average}>
            {average.toFixed(1).replace('.', ',')}
          </Text>
          <Stars value={average} size={18} />
          <Text style={styles.count}>
            {rated.length} {rated.length === 1 ? 'avaliação' : 'avaliações'}
          </Text>
        </View>
        <View style={styles.bars}>
          {distribution.map(({ star, count }) => (
            <View
              key={star}
              style={styles.barRow}
              accessible
              accessibilityLabel={`${star} estrelas: ${count}`}>
              <Text style={styles.barLabel}>{star}</Text>
              <FontAwesome name="star" size={12} color="#F5A524" />
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(count / rated.length) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.barCount}>{count}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.list}>
        {sorted.map((item) => {
          const name = item.Client?.User?.name || 'Cliente';
          const avatar = item.Client?.User?.avatar_uri;
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarInitial}>
                      {name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.cardTexts}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.meta}>
                    {[
                      item.Service?.title,
                      formatDate(item.updatedAt ?? item.createdAt),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <View
                  accessible
                  accessibilityLabel={`Nota ${item.rating} de 5`}>
                  <Stars value={item.rating ?? 0} size={14} />
                </View>
              </View>
              {item.review ? (
                <Text style={styles.review}>{item.review}</Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    container: {
      gap: 20,
    },
    summary: {
      flexDirection: isCompact ? 'column' : 'row',
      alignItems: isCompact ? 'stretch' : 'center',
      gap: 20,
      padding: 20,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    summaryScore: {
      alignItems: 'center',
      gap: 4,
      minWidth: 140,
    },
    average: {
      fontFamily: 'Afacad-Bold',
      fontSize: 48,
      lineHeight: 52,
      color: colors.primaryBlack,
    },
    count: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    bars: {
      flex: isCompact ? undefined : 1,
      gap: 6,
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    barLabel: {
      width: 12,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
      color: colors.primaryBlack,
      textAlign: 'right',
    },
    barTrack: {
      flex: 1,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.inputBackground,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: '#F5A524',
    },
    barCount: {
      width: 24,
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    list: {
      gap: 12,
    },
    card: {
      gap: 10,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    avatarFallback: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
    },
    avatarInitial: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    cardTexts: {
      flex: 1,
    },
    name: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      color: colors.primaryBlack,
    },
    meta: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    review: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 23,
      color: colors.primaryBlack,
    },
    empty: {
      alignItems: 'center',
      gap: 8,
      padding: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderColor,
    },
    emptyTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 19,
      color: colors.primaryBlack,
    },
    emptyText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      textAlign: 'center',
      color: colors.textSecondary,
    },
  });
