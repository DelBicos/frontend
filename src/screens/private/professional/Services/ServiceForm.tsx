import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  Image,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import CustomTextInput from '@components/ui/CustomTextInput';
import CustomSelect from '@components/ui/CustomSelect';
import { useServicesStore, ServiceItem } from '@stores/Services/Services';
import { useSubCategoryStore } from '@stores/SubCategory';
import { useCategoryStore } from '@stores/Category';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { useColors } from '@theme/ThemeProvider';
import AvailabilityManager from '@components/features/ServiceAvailability/AvailabilityManager';

type Props = {
  initial?: ServiceItem | null;
  onClose: () => void;
};

const DURATION_OPTIONS = [
  { label: '15 min', value: '15' },
  { label: '30 min', value: '30' },
  { label: '45 min', value: '45' },
  { label: '1h', value: '60' },
  { label: '1h 30min', value: '90' },
  { label: '2h', value: '120' },
  { label: '3h', value: '180' },
];

// Formata string para máscara de moeda (R$): "1234" → "R$ 12,34"
function maskCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const cents = parseInt(digits, 10);
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// Remove máscara e retorna string numérica "12.34"
function unmaskCurrency(masked: string): string {
  const digits = masked.replace(/\D/g, '');
  if (!digits) return '';
  return (parseInt(digits, 10) / 100).toFixed(2);
}

const ServiceForm: React.FC<Props> = ({ initial, onClose }) => {
  const { createService, updateService, reloadServices, reloadMyServices } =
    useServicesStore();
  const {
    subCategories,
    fetchAllSubCategories,
    fetchSubCategoriesByCategoryId,
  } = useSubCategoryStore();
  const { categories, fetchCategories } = useCategoryStore();
  const colors = useColors();
  const styles = createStyles(colors);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);
  // Erros mostrados no proprio formulario (Alert nao aparece no web).
  const [formError, setFormError] = useState<string | null>(null);
  const saveBtnAnim = useRef(new Animated.Value(1)).current;

  // Anima o botão Salvar ao entrar/sair do estado desabilitado
  useEffect(() => {
    Animated.timing(saveBtnAnim, {
      toValue: submitting || uploading ? 0.55 : 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [submitting, uploading, saveBtnAnim]);

  useEffect(() => {
    fetchCategories();
    fetchAllSubCategories();
  }, [fetchCategories, fetchAllSubCategories]);

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: initial?.title || '',
      description: initial?.description || '',
      price: initial?.price_cents
        ? maskCurrency(String(initial.price_cents))
        : '',
      duration: initial?.duration ? String(initial.duration) : '',
      category_id: initial?.category_id ? String(initial.category_id) : '',
      subcategory_id: initial?.subcategory_id
        ? String(initial.subcategory_id)
        : '',
      banner_uri: initial?.banner_uri || '',
      active: initial?.active !== undefined ? initial.active : true,
      availabilities: initial?.availabilities || [],
    },
  });

  const bannerUri = watch('banner_uri');

  const categoryOptions = categories.map((c) => ({
    label: c.title,
    value: String(c.id),
  }));

  const subCategoryOptions = subCategories
    .filter((s) => {
      const catId = watch('category_id');
      if (!catId) return true;
      return s.category_id === Number(catId);
    })
    .map((s) => ({ label: s.title, value: String(s.id) }));

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setFormError('Permita acesso à galeria para adicionar uma foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setUploading(true);
      try {
        // 1. Solicitar presigned URL ao backend
        const ext = (asset.uri.split('.').pop() || 'jpg').toLowerCase();
        const { data } = await backendHttpClient.post('/api/uploads', {
          filename: `service-banner.${ext}`,
          contentType: asset.mimeType || `image/${ext}`,
        });
        // backend may return presignedUrl or uploadUrl — use whichever is present
        const presignedUrl: string = data.presignedUrl || data.uploadUrl;
        const fileUrl: string = data.fileUrl || data.url;

        // 2. Fazer upload direto para o S3
        const blob = await fetch(asset.uri).then((r) => r.blob());
        await fetch(presignedUrl, {
          method: 'PUT',
          body: blob,
          headers: { 'Content-Type': asset.mimeType || `image/${ext}` },
        });

        // 3. Salvar URL pública no formulário
        setValue('banner_uri', fileUrl);
      } catch (e) {
        console.error('[ServiceForm] upload banner', e);
        setFormError('Não foi possível enviar a foto. Tente novamente.');
      } finally {
        setUploading(false);
      }
    }
  }, [setValue]);

  // Desabilita o botão imediatamente no toque, antes de react-hook-form validar
  const handleSave = useCallback(async () => {
    if (submittingRef.current || submitting) return;
    setFormError(null);
    setSubmitting(true);
    submittingRef.current = true;
    // handleSubmit só chama onSubmit se a validação passar;
    // se falhar, onSubmit não roda e finally não reseta — resetamos aqui
    await handleSubmit(onSubmit)();
    if (submittingRef.current) {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, [submitting, handleSubmit]);

  const onSubmit = async (data: any) => {
    if (subcategoryError) {
      setSubmitting(false);
      submittingRef.current = false;
      setFormError(subcategoryError);
      return;
    }

    const payload: any = {
      title: data.title,
      description: data.description,
      // Contrato: enviar price como float; backend calcula price_cents
      price: data.price ? Number(unmaskCurrency(data.price)) : undefined,
      duration: data.duration ? Number(data.duration) : undefined,
      category_id: data.category_id ? Number(data.category_id) : undefined,
      subcategory_id: data.subcategory_id
        ? Number(data.subcategory_id)
        : undefined,
      banner_uri: data.banner_uri || undefined,
      active: data.active,
      availabilities: Array.isArray(data.availabilities)
        ? data.availabilities.map((a: any) => ({
            day: Number(a.day),
            start: String(a.start),
            end: String(a.end),
          }))
        : undefined,
    };

    try {
      let result;
      if (initial?.id) {
        result = await updateService(initial.id, payload);
      } else {
        result = await createService(payload);
      }

      // Refresh public list of services to reflect changes immediately
      try {
        if (typeof reloadMyServices === 'function') {
          await reloadMyServices();
        } else {
          await reloadServices();
        }
      } catch (e) {
        console.warn('[ServiceForm] reload services failed', e);
      }

      // success: close modal
      onClose();
    } catch (error: any) {
      console.error('[ServiceForm] save error', error);
      const status = error?.response?.status;
      const data = error?.response?.data;
      const message =
        data?.error ||
        data?.message ||
        data?.msg ||
        error?.message ||
        'Erro ao salvar serviço.';
      if (status === 401) {
        try {
          const signOut =
            require('@stores/User').useUserStore.getState().signOut;
          if (typeof signOut === 'function') signOut();
        } catch (e) {
          console.error('Failed to sign out after 401', e);
        }
      }
      setFormError(message);
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  // Validação UX: subcategoria pertence à categoria selecionada
  useEffect(() => {
    const catId = watch('category_id');
    const subId = watch('subcategory_id');
    if (!subId) {
      setSubcategoryError(null);
      return;
    }
    const found = subCategories.find((s) => String(s.id) === String(subId));
    if (!found) {
      setSubcategoryError('Subcategoria inválida');
      return;
    }
    if (catId && String(found.category_id) !== String(catId)) {
      setSubcategoryError(
        'A subcategoria não pertence à categoria selecionada',
      );
    } else {
      setSubcategoryError(null);
    }
  }, [watch('category_id'), watch('subcategory_id'), subCategories]);

  const section = (title: string, hint?: string) => (
    <View style={styles.sectionHeader}>
      <Text
        style={styles.sectionTitle}
        accessibilityRole="header"
        {...({ 'aria-level': 2 } as object)}>
        {title}
      </Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}>
        <Text
          style={styles.header}
          accessibilityRole="header"
          {...({ 'aria-level': 1 } as object)}>
          {initial ? 'Editar serviço' : 'Novo serviço'}
        </Text>
        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Fechar sem salvar">
          <FontAwesome name="close" size={20} color={colors.primaryBlack} />
        </Pressable>
      </View>

      {/* Sobre o servico */}
      <View style={styles.card}>
        {section('Sobre o serviço', 'Como o serviço aparece para os clientes.')}
        <Controller
          control={control}
          name="title"
          rules={{ required: true }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <CustomTextInput
              label="Título *"
              value={value}
              onChangeText={onChange}
              placeholder="Ex.: Instalação de chuveiro"
              error={error ? 'Campo obrigatório' : undefined}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          rules={{ required: true }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <CustomTextInput
              label="Descrição *"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              placeholder="O que está incluso, materiais, experiência..."
              error={error ? 'Campo obrigatório' : undefined}
            />
          )}
        />
        <Controller
          control={control}
          name="category_id"
          rules={{ required: true }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <CustomSelect
              label="Categoria *"
              value={value}
              options={categoryOptions}
              onChange={(v) => {
                onChange(v);
                // limpar subcategoria ao trocar categoria
                setValue('subcategory_id', '');
              }}
              placeholder="Selecione a categoria"
              error={error}
            />
          )}
        />
        <Controller
          control={control}
          name="subcategory_id"
          rules={{ required: true }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <CustomSelect
              label="Tipo de serviço *"
              value={value}
              options={subCategoryOptions}
              onChange={onChange}
              placeholder="Selecione o tipo de serviço"
              error={error ? 'Campo obrigatório' : subcategoryError}
            />
          )}
        />
      </View>

      {/* Preco e duracao */}
      <View style={styles.card}>
        {section('Preço e duração')}
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Controller
              control={control}
              name="price"
              rules={{ required: true }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <CustomTextInput
                  label="Preço *"
                  value={value}
                  onChangeText={(text) => onChange(maskCurrency(text))}
                  keyboardType="numeric"
                  placeholder="R$ 0,00"
                  error={error ? 'Campo obrigatório' : undefined}
                />
              )}
            />
          </View>
          <View style={styles.rowItem}>
            <Controller
              control={control}
              name="duration"
              rules={{ required: true }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <CustomSelect
                  label="Duração *"
                  value={value}
                  options={DURATION_OPTIONS}
                  onChange={onChange}
                  placeholder="Selecione"
                  error={error}
                />
              )}
            />
          </View>
        </View>
      </View>

      {/* Horarios */}
      <View style={styles.card}>
        {section(
          'Horários de atendimento',
          'Escolha os dias e o intervalo em que você aceita pedidos. Sem horários, o serviço não pode ser agendado.',
        )}
        <AvailabilityManager
          control={control}
          setValue={setValue}
          watch={watch}
        />
      </View>

      {/* Foto */}
      <View style={styles.card}>
        {section('Foto', 'Opcional. Uma foto do seu trabalho passa confiança.')}
        {uploading ? (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator color={colors.primaryOrange} />
            <Text style={styles.imagePlaceholderText}>Enviando foto…</Text>
          </View>
        ) : bannerUri ? (
          <Pressable
            onPress={pickImage}
            accessibilityRole="button"
            accessibilityLabel="Trocar foto do serviço">
            <Image source={{ uri: bannerUri }} style={styles.bannerPreview} />
            <Text style={styles.changePhotoText}>Trocar foto</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.imagePlaceholder}
            onPress={pickImage}
            accessibilityRole="button">
            <FontAwesome name="camera" size={22} color={colors.textSecondary} />
            <Text style={styles.imagePlaceholderText}>Adicionar foto</Text>
          </Pressable>
        )}
      </View>

      {/* Visibilidade */}
      <View style={styles.card}>
        <Controller
          control={control}
          name="active"
          render={({ field: { onChange, value } }) => (
            <View style={styles.toggleRow}>
              <View style={styles.toggleTexts}>
                <Text style={styles.sectionTitle}>Visível para clientes</Text>
                <Text style={styles.sectionHint}>
                  Desative para pausar o serviço sem perder os dados.
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{
                  false: colors.borderColor,
                  true: colors.primaryOrange,
                }}
                thumbColor="#fff"
                accessibilityLabel="Serviço visível para clientes"
              />
            </View>
          )}
        />
      </View>

      {formError ? (
        <View style={styles.errorBox} accessibilityLiveRegion="assertive">
          <Text style={styles.errorText}>{formError}</Text>
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onClose}
          accessibilityRole="button">
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <Animated.View
          style={[styles.saveBtnWrapper, { opacity: saveBtnAnim }]}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={uploading || submitting}
            activeOpacity={0.85}
            accessibilityRole="button">
            {submitting ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.saveText}>
                {initial ? 'Salvar alterações' : 'Cadastrar serviço'}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.secondaryGray },
    content: { padding: 20, paddingBottom: 40, gap: 16 },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    header: {
      flex: 1,
      fontFamily: 'Afacad-Bold',
      fontSize: 26,
      color: colors.primaryBlack,
    },
    closeBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardBackground,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    card: {
      padding: 18,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    sectionHeader: {
      marginBottom: 8,
      gap: 2,
    },
    sectionTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
    sectionHint: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    rowItem: {
      flexGrow: 1,
      flexBasis: 200,
    },
    imagePlaceholder: {
      height: 140,
      gap: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderColor,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    imagePlaceholderText: {
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryBlack,
      fontSize: 15,
    },
    bannerPreview: {
      width: '100%',
      height: 180,
      borderRadius: 12,
      resizeMode: 'cover',
    },
    changePhotoText: {
      textAlign: 'center',
      color: colors.primaryBlack,
      fontFamily: 'Afacad-SemiBold',
      textDecorationLine: 'underline',
      marginTop: 8,
      fontSize: 15,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
    },
    toggleTexts: {
      flex: 1,
      gap: 2,
    },
    errorBox: {
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.errorBackground,
    },
    errorText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.errorText,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelBtn: {
      flex: 1,
      minHeight: 48,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.primaryBlack,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    saveBtnWrapper: {
      flex: 1,
    },
    saveBtn: {
      minHeight: 48,
      borderRadius: 999,
      backgroundColor: colors.primaryOrange,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Texto escuro sobre laranja (contraste AA).
    saveText: { fontFamily: 'Afacad-Bold', fontSize: 16, color: '#000000' },
  });

export default ServiceForm;
