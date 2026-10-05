import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AdminShell from '../components/AdminShell';
import Chip, { ChipGroup } from '@components/ui/Chip';
import InlineAlert from '@components/ui/InlineAlert';
import {
  Sheet,
  SheetButton,
} from '@components/features/AppointmentManage/Sheet';
import { useAdminStore } from '@stores/Admin';
import type { AdminVerification } from '@stores/Admin/types';
import type { IdentityStatus } from '@stores/Verification/types';
import { getApiErrorMessage } from '@api/errors';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

type Filter = Extract<IdentityStatus, 'pending' | 'approved' | 'rejected'>;

const FILTER_LABELS: Record<Filter, string> = {
  pending: 'Em análise',
  approved: 'Aprovadas',
  rejected: 'Recusadas',
};

const DOCUMENT_LABELS = { rg: 'RG', cnh: 'CNH' } as const;

/** Fila de verificacao de identidade dos profissionais. */
export default function AdminVerifications() {
  const colors = useColors();
  const { listVerifications } = useAdminStore();
  const styles = createStyles(colors);
  const [filter, setFilter] = useState<Filter>('pending');
  const [items, setItems] = useState<AdminVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminVerification | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listVerifications(filter));
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Não foi possível carregar os pedidos.'),
      );
    } finally {
      setLoading(false);
    }
  }, [filter, listVerifications]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell
      title="Verificações"
      subtitle="Confira documento e selfie e conceda o selo de verificado.">
      <ChipGroup accessibilityLabel="Filtrar pedidos" style={styles.filters}>
        {(Object.keys(FILTER_LABELS) as Filter[]).map((key) => (
          <Chip
            key={key}
            label={FILTER_LABELS[key]}
            selected={filter === key}
            onPress={() => setFilter(key)}
          />
        ))}
      </ChipGroup>

      {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primaryOrange}
          style={styles.loader}
        />
      ) : items.length === 0 ? (
        <Text style={styles.empty}>Nenhum pedido nesta lista.</Text>
      ) : (
        <View style={styles.list}>
          {items.map((v) => (
            <View key={v.id} style={styles.card}>
              <Text style={styles.cardTitle}>{v.professional.name}</Text>
              <Text style={styles.meta}>
                {v.professional.email} · CPF {v.professional.cpf}
              </Text>
              <Text style={styles.meta}>
                {DOCUMENT_LABELS[v.document_type]} · enviado em{' '}
                {new Date(v.submitted_at).toLocaleDateString('pt-BR')}
              </Text>
              {v.status === 'pending' ? (
                <View style={styles.actions}>
                  <SheetButton
                    label="Analisar"
                    onPress={() => setSelected(v)}
                  />
                </View>
              ) : (
                <Text style={styles.resolved}>
                  {v.status === 'approved' ? 'Aprovada' : 'Recusada'}
                  {v.reject_reason ? ` — ${v.reject_reason}` : ''}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {selected ? (
        <ReviewSheet
          item={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            void load();
          }}
        />
      ) : null}
    </AdminShell>
  );
}

function Photo({ label, url }: { label: string; url: string | null }) {
  const colors = useColors();
  const styles = createStyles(colors);
  if (!url) return null;
  return (
    <Pressable
      onPress={() => void Linking.openURL(url)}
      accessibilityRole="link"
      accessibilityLabel={`Abrir ${label} em tamanho grande`}
      style={styles.photoBox}>
      <Text style={styles.photoLabel}>{label}</Text>
      <Image source={{ uri: url }} style={styles.photo} resizeMode="contain" />
    </Pressable>
  );
}

function ReviewSheet({
  item,
  onClose,
  onDone,
}: {
  item: AdminVerification;
  onClose: () => void;
  onDone: () => void;
}) {
  const colors = useColors();
  const { reviewVerification } = useAdminStore();
  const styles = createStyles(colors);
  const [reason, setReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decide = async (decision: 'approve' | 'reject') => {
    if (decision === 'reject' && reason.trim().length < 5) {
      setError('Explique o motivo da recusa (mínimo 5 caracteres).');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await reviewVerification(item.id, decision, reason.trim());
      onDone();
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Não foi possível registrar a decisão.'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      visible
      title={`Verificar ${item.professional.name}`}
      onClose={onClose}
      footer={
        rejecting ? (
          <>
            <SheetButton
              label="Voltar"
              variant="secondary"
              onPress={() => setRejecting(false)}
            />
            <SheetButton
              label="Confirmar recusa"
              variant="danger"
              onPress={() => decide('reject')}
              loading={busy}
            />
          </>
        ) : (
          <>
            <SheetButton
              label="Recusar"
              variant="secondary"
              onPress={() => setRejecting(true)}
            />
            <SheetButton
              label="Aprovar"
              onPress={() => decide('approve')}
              loading={busy}
            />
          </>
        )
      }>
      <Text style={styles.meta}>
        Confira se o rosto da selfie é o do documento e se o nome e o CPF
        conferem com o cadastro ({item.professional.cpf}).
      </Text>
      <Photo label="Frente do documento" url={item.front_url} />
      <Photo label="Verso do documento" url={item.back_url} />
      <Photo label="Selfie com o documento" url={item.selfie_url} />
      {rejecting ? (
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="Motivo (o profissional verá)"
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={500}
          style={styles.input}
          accessibilityLabel="Motivo da recusa"
        />
      ) : null}
      {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
    </Sheet>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    filters: { marginBottom: 12 },
    loader: { marginTop: 32 },
    empty: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 24,
    },
    list: { gap: 12 },
    card: {
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
      gap: 4,
    },
    cardTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
    meta: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    actions: { marginTop: 12, flexDirection: 'row' },
    resolved: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 8,
    },
    photoBox: { marginTop: 12, gap: 6 },
    photoLabel: {
      fontFamily: 'Afacad-Bold',
      fontSize: 15,
      color: colors.primaryBlack,
    },
    photo: {
      width: '100%',
      height: 220,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },
    input: {
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.inputBackground,
      color: colors.primaryBlack,
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      marginTop: 12,
      minHeight: 80,
      textAlignVertical: 'top',
    },
  });
