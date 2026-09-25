import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useServicesStore, ServiceItem } from '@stores/Services/Services';
import { useUserStore } from '@stores/User';
import { SubCategory } from '@stores/SubCategory/types';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { formatBRL } from '@lib/helpers/formatCurrency';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import { loadAllSubCategories } from '@lib/hooks/useServiceSearch';
import PageContainer, { PageHeader } from '@components/layout/PageContainer';
import SectionHeader from '@components/ui/SectionHeader';
import { formatAvailabilitySummary } from '@components/features/ListServices/ServiceCard';
import ServiceForm from './ServiceForm';
import ServiceAreaCard from './ServiceAreaCard';

const formatDuration = (minutes?: number) => {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h${m ? ` ${m}min` : ''}` : `${m} min`;
};

const priceText = (item: ServiceItem) => {
  const cents =
    item.price_cents ??
    (item.price != null ? Math.round(Number(item.price) * 100) : null);
  return cents ? formatBRL({ price_cents: cents }) : null;
};

/**
 * "Meus servicos": lista, cria e edita os servicos do colaborador (o
 * formulario abre por cima da lista) e define a area de atendimento.
 */
const ServicesList: React.FC = () => {
  const colors = useColors();
  const { isCompact } = useBreakpoint();
  const styles = useMemo(
    () => createStyles(colors, isCompact),
    [colors, isCompact],
  );
  const user = useUserStore((s) => s.user);
  const { myServices, fetchMyServices, updateService } = useServicesStore();

  const [loaded, setLoaded] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [toggling, setToggling] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isProfessional = !!user?.professional_id;
  useFocusEffect(
    useCallback(() => {
      if (!isProfessional) return;
      fetchMyServices().then(() => setLoaded(true));
    }, [isProfessional, fetchMyServices]),
  );

  useEffect(() => {
    loadAllSubCategories()
      .then(setSubCategories)
      .catch(() => undefined);
  }, []);

  const subCategoryName = (id?: number) =>
    subCategories.find((s) => s.id === id)?.title;

  const openForm = (item: ServiceItem | null) => {
    setEditing(item);
    setFormOpen(true);
  };

  const toggleActive = async (item: ServiceItem, active: boolean) => {
    setError(null);
    setToggling(item.id);
    try {
      await updateService(item.id, { active });
    } catch {
      setError('Não foi possível alterar o serviço. Tente novamente.');
    } finally {
      setToggling(null);
    }
  };

  const sorted = [...myServices].sort(
    (a, b) => Number(b.active !== false) - Number(a.active !== false),
  );
  const activeCount = myServices.filter((s) => s.active !== false).length;

  const newButton = (
    <Pressable
      onPress={() => openForm(null)}
      style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      accessibilityRole="button">
      <FontAwesome name="plus" size={14} color="#000000" />
      <Text style={styles.primaryButtonText}>Novo serviço</Text>
    </Pressable>
  );

  if (!user?.professional_id) {
    return (
      <PageContainer maxWidth={560}>
        <PageHeader
          title="Meus serviços"
          subtitle="Entre com uma conta de colaborador para cadastrar e gerenciar seus serviços."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={960}>
      <PageHeader
        title="Meus serviços"
        subtitle="O que você oferece, por quanto, em quais horários e até onde você atende.">
        {newButton}
      </PageHeader>

      <View style={styles.section}>
        <ServiceAreaCard professionalId={user.professional_id} />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Serviços"
          subtitle={
            myServices.length
              ? `${activeCount} de ${myServices.length} visíveis para os clientes`
              : undefined
          }
        />

        {error ? (
          <View style={styles.errorBox} accessibilityLiveRegion="assertive">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!loaded ? (
          <ActivityIndicator
            color={colors.primaryOrange}
            style={styles.loader}
          />
        ) : sorted.length === 0 ? (
          <View style={styles.empty}>
            <FontAwesome name="wrench" size={28} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhum serviço cadastrado</Text>
            <Text style={styles.emptyText}>
              Cadastre seu primeiro serviço com preço e horários para começar a
              receber pedidos.
            </Text>
            {newButton}
          </View>
        ) : (
          <View style={styles.list}>
            {sorted.map((item) => {
              const active = item.active !== false;
              const details = [
                subCategoryName(item.subcategory_id),
                formatDuration(item.duration),
              ].filter(Boolean);
              const hours = formatAvailabilitySummary(item.availabilities, 3);
              const price = priceText(item);
              return (
                <View
                  key={item.id}
                  style={[styles.card, !active && styles.cardInactive]}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardTexts}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      {details.length ? (
                        <Text style={styles.cardSubtitle}>
                          {details.join(' · ')}
                        </Text>
                      ) : null}
                    </View>
                    {price ? <Text style={styles.price}>{price}</Text> : null}
                  </View>

                  <View style={styles.meta}>
                    <FontAwesome
                      name="clock-o"
                      size={14}
                      color={hours ? colors.textSecondary : colors.warningText}
                    />
                    <Text
                      style={[styles.metaText, !hours && styles.metaWarning]}>
                      {hours ?? 'Sem horários: clientes não conseguem agendar'}
                    </Text>
                  </View>

                  <View style={styles.cardActions}>
                    <View style={styles.switchRow}>
                      {toggling === item.id ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.primaryOrange}
                        />
                      ) : (
                        <Switch
                          value={active}
                          onValueChange={(v) => toggleActive(item, v)}
                          trackColor={{
                            false: colors.borderColor,
                            true: colors.primaryOrange,
                          }}
                          thumbColor="#FFFFFF"
                          accessibilityLabel={`${item.title} visível para clientes`}
                        />
                      )}
                      <Text style={styles.switchLabel}>
                        {active ? 'Ativo' : 'Pausado'}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => openForm(item)}
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && styles.pressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar ${item.title}`}>
                      <FontAwesome
                        name="pencil"
                        size={14}
                        color={colors.primaryBlack}
                      />
                      <Text style={styles.secondaryButtonText}>Editar</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <Modal
        visible={formOpen}
        animationType={Platform.OS === 'web' ? 'fade' : 'slide'}
        transparent={Platform.OS === 'web'}
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
        onRequestClose={() => setFormOpen(false)}>
        {Platform.OS === 'web' ? (
          <View style={styles.overlay}>
            <View style={styles.dialog}>
              <ServiceForm
                initial={editing}
                onClose={() => setFormOpen(false)}
              />
            </View>
          </View>
        ) : (
          <ServiceForm initial={editing} onClose={() => setFormOpen(false)} />
        )}
      </Modal>
    </PageContainer>
  );
};

const createStyles = (colors: ColorsType, isCompact: boolean) =>
  StyleSheet.create({
    section: {
      marginBottom: isCompact ? 28 : 36,
    },
    loader: {
      paddingVertical: 32,
    },
    list: {
      gap: 12,
    },
    card: {
      gap: 12,
      padding: isCompact ? 16 : 20,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    cardInactive: {
      opacity: 0.7,
      borderStyle: 'dashed',
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    cardTexts: {
      flex: 1,
      gap: 2,
    },
    cardTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 19,
      color: colors.primaryBlack,
    },
    cardSubtitle: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    price: {
      fontFamily: 'Afacad-Bold',
      fontSize: 19,
      color: colors.primaryBlack,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    metaText: {
      flex: 1,
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    metaWarning: {
      fontFamily: 'Afacad-SemiBold',
      color: colors.warningText,
    },
    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 44,
    },
    switchLabel: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    primaryButton: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      alignItems: 'center',
      gap: 8,
      minHeight: 48,
      paddingHorizontal: 22,
      borderRadius: 999,
      backgroundColor: colors.primaryOrange,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    primaryButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 17,
      // Texto escuro sobre laranja (contraste AA).
      color: '#000000',
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minHeight: 44,
      paddingHorizontal: 18,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.primaryBlack,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    secondaryButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    pressed: {
      opacity: 0.75,
    },
    empty: {
      alignItems: 'center',
      gap: 10,
      padding: 28,
      borderRadius: 16,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderColor,
    },
    emptyTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
    },
    emptyText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      textAlign: 'center',
      color: colors.textSecondary,
      marginBottom: 6,
    },
    errorBox: {
      padding: 14,
      borderRadius: 12,
      marginBottom: 12,
      backgroundColor: colors.errorBackground,
    },
    errorText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.errorText,
    },

    // --- Formulario no web (dialogo centralizado) ---
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isCompact ? 0 : 24,
    },
    dialog: {
      width: '100%',
      maxWidth: 720,
      height: isCompact ? '100%' : '90%',
      borderRadius: isCompact ? 0 : 20,
      overflow: 'hidden',
      backgroundColor: colors.secondaryGray,
    },
  });

export default ServicesList;
