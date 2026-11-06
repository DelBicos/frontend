import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { useAppointmentStore } from '@stores/Appointment';
import ActionButton from '@components/ui/ActionButton';
import InlineAlert from '@components/ui/InlineAlert';
import { createStyles } from './styles';

interface RateServiceModalProps {
  visible: boolean;
  appointmentId: number;
  professionalName: string;
  serviceTitle: string;
  existingRating?: number | null;
  existingReview?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const LABELS = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'];
const MAX_REVIEW = 500;

/** Nota de 1 a 5 e comentario opcional para um atendimento concluido. */
export function RateServiceModal({
  visible,
  appointmentId,
  professionalName,
  serviceTitle,
  existingRating,
  existingReview,
  onClose,
  onSuccess,
}: RateServiceModalProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const { reviewAppointment } = useAppointmentStore();
  const [rating, setRating] = useState(existingRating || 0);
  const [review, setReview] = useState(existingReview || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setRating(existingRating || 0);
    setReview(existingReview || '');
    setError(null);
    setDone(false);
  }, [visible, existingRating, existingReview]);

  const submit = async () => {
    if (!rating) {
      setError('Escolha de 1 a 5 estrelas.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const ok = await reviewAppointment(appointmentId, rating, review.trim());
      if (ok) {
        setDone(true);
        onSuccess?.();
      } else {
        setError('Não foi possível enviar a avaliação. Tente de novo.');
      }
    } catch {
      setError('Não foi possível enviar a avaliação. Tente de novo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text
              style={styles.title}
              accessibilityRole="header"
              {...({ 'aria-level': 2 } as object)}>
              {done
                ? 'Obrigado!'
                : existingRating
                  ? 'Editar avaliação'
                  : 'Avaliar atendimento'}
            </Text>
            <Pressable
              onPress={onClose}
              style={styles.close}
              accessibilityRole="button"
              accessibilityLabel="Fechar">
              <FontAwesome name="close" size={20} color={colors.primaryBlack} />
            </Pressable>
          </View>

          {done ? (
            <>
              <View style={styles.doneIcon}>
                <FontAwesome
                  name="check"
                  size={28}
                  color={colors.successText}
                />
              </View>
              <Text style={styles.subtitle}>
                Sua avaliação foi publicada no perfil de {professionalName}.
              </Text>
              <ActionButton label="Fechar" onPress={onClose} block />
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Como foi <Text style={styles.strong}>{serviceTitle}</Text> com{' '}
                <Text style={styles.strong}>{professionalName}</Text>?
              </Text>

              <View
                style={styles.stars}
                accessibilityRole="radiogroup"
                accessibilityLabel="Nota">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => setRating(n)}
                    style={({ pressed }) => [
                      styles.star,
                      pressed && { opacity: 0.7 },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: rating === n }}
                    accessibilityLabel={`${n} ${n === 1 ? 'estrela' : 'estrelas'}, ${LABELS[n]}`}>
                    <FontAwesome
                      name={rating >= n ? 'star' : 'star-o'}
                      size={34}
                      color={rating >= n ? '#B45309' : colors.textSecondary}
                    />
                  </Pressable>
                ))}
              </View>
              <Text style={styles.ratingLabel} accessibilityLiveRegion="polite">
                {rating ? LABELS[rating] : 'Toque nas estrelas'}
              </Text>

              <Text style={styles.label}>Comentário (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Conte o que achou do atendimento"
                placeholderTextColor={colors.textSecondary}
                multiline
                value={review}
                onChangeText={(t) => setReview(t.slice(0, MAX_REVIEW))}
                accessibilityLabel="Comentário"
                textAlignVertical="top"
              />
              <Text style={styles.counter}>
                {review.length}/{MAX_REVIEW}
              </Text>

              {error ? <InlineAlert>{error}</InlineAlert> : null}

              <View style={styles.actions}>
                <ActionButton
                  label="Cancelar"
                  variant="ghost"
                  onPress={onClose}
                />
                <ActionButton
                  label="Enviar avaliação"
                  onPress={submit}
                  loading={isSubmitting}
                />
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
