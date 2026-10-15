import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { TicketCategory } from '@stores/Ticket/types';
import { CategoryPicker } from '../CategoryPicker';
import { createStyles } from './styles';

export interface TicketFormValues {
  title: string;
  description: string;
  category: TicketCategory | null;
}

interface TicketFormProps {
  initialValues?: Partial<TicketFormValues>;
  availableCategories?: TicketCategory[];
  contextBanner?: string | null;
  isSubmitting: boolean;
  externalError?: string | null;
  onSubmit: (values: {
    title: string;
    description: string;
    category: TicketCategory;
  }) => void;
  onCancel: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
}

export const TicketForm: React.FC<TicketFormProps> = ({
  initialValues,
  availableCategories,
  contextBanner,
  isSubmitting,
  externalError,
  onSubmit,
  onCancel,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(
    initialValues?.description ?? '',
  );
  const [category, setCategory] = useState<TicketCategory | null>(
    initialValues?.category ?? null,
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const isSubmitDisabled = useMemo(() => {
    return (
      isSubmitting ||
      title.trim().length < 5 ||
      description.trim().length < 10 ||
      !category
    );
  }, [isSubmitting, title, description, category]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 5) {
      nextErrors.title = 'O título deve ter no mínimo 5 caracteres.';
    } else if (trimmedTitle.length > 100) {
      nextErrors.title = 'O título deve ter no máximo 100 caracteres.';
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 10) {
      nextErrors.description = 'A descrição deve ter no mínimo 10 caracteres.';
    } else if (trimmedDescription.length > 2000) {
      nextErrors.description =
        'A descrição deve ter no máximo 2000 caracteres.';
    }

    if (!category) {
      nextErrors.category = 'Selecione uma categoria.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !category) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {contextBanner ? (
          <View style={styles.contextBanner}>
            <Text style={styles.contextBannerText}>{contextBanner}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Título</Text>
        <TextInput
          testID="ticket-title-input"
          style={[styles.input, errors.title ? styles.inputError : null]}
          value={title}
          onChangeText={setTitle}
          placeholder="Resuma o problema em poucas palavras"
          placeholderTextColor={colors.placeholder}
          maxLength={100}
          editable={!isSubmitting}
        />
        <Text style={styles.counter}>{title.length}/100</Text>
        {errors.title ? (
          <Text style={styles.errorText}>{errors.title}</Text>
        ) : null}

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          testID="ticket-description-input"
          style={[
            styles.input,
            styles.textarea,
            errors.description ? styles.inputError : null,
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Descreva o que aconteceu com o máximo de detalhes"
          placeholderTextColor={colors.placeholder}
          multiline
          maxLength={2000}
          editable={!isSubmitting}
        />
        <Text style={styles.counter}>{description.length}/2000</Text>
        {errors.description ? (
          <Text style={styles.errorText}>{errors.description}</Text>
        ) : null}

        <Text style={styles.label}>Categoria</Text>
        <CategoryPicker
          value={category}
          onChange={setCategory}
          availableCategories={availableCategories}
          error={errors.category}
        />

        {externalError ? (
          <Text style={[styles.errorText, styles.externalError]}>
            {externalError}
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          testID="ticket-cancel-button"
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isSubmitting}
          activeOpacity={0.85}>
          <Text style={styles.cancelButtonLabel}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="ticket-submit-button"
          style={[
            styles.submitButton,
            isSubmitDisabled && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          activeOpacity={0.85}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.primaryWhite} />
          ) : (
            <Text style={styles.submitButtonLabel}>Enviar chamado</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
