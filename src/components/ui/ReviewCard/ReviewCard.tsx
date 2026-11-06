import React from 'react';
import { Text, View } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import Avatar from '@components/ui/Avatar';
import Stars from '@components/ui/Stars';
import ActionButton from '@components/ui/ActionButton';
import { createStyles } from './styles';

interface ReviewCardProps {
  rating: number;
  serviceTitle: string;
  /** Quem aparece no cartao (profissional avaliado ou cliente que avaliou). */
  personName: string;
  personAvatar?: string | null;
  date: string;
  review?: string | null;
  onEdit?: () => void;
}

const RATING_LABEL = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'];

/** Avaliacao de um atendimento: nota, comentario, pessoa e data. */
export const ReviewCard = React.memo(function ReviewCard({
  rating,
  serviceTitle,
  personName,
  personAvatar,
  date,
  review,
  onEdit,
}: ReviewCardProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar uri={personAvatar} name={personName} size={44} />
        <View style={styles.headerTexts}>
          <Text style={styles.name} numberOfLines={1}>
            {personName}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {serviceTitle} · {date}
          </Text>
        </View>
      </View>
      <View
        style={styles.ratingRow}
        accessibilityLabel={`Nota ${rating} de 5, ${RATING_LABEL[rating] ?? ''}`}>
        <Stars value={rating} size={16} color="#B45309" />
        <Text style={styles.ratingLabel}>{RATING_LABEL[rating] ?? ''}</Text>
      </View>
      {review && review.trim() ? (
        <Text style={styles.review}>“{review.trim()}”</Text>
      ) : (
        <Text style={styles.noReview}>Sem comentário.</Text>
      )}
      {onEdit ? (
        <ActionButton
          label="Editar avaliação"
          icon="pencil"
          variant="ghost"
          size="sm"
          onPress={onEdit}
        />
      ) : null}
    </View>
  );
});
