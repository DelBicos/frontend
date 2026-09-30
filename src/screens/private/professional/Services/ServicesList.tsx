import React, { useEffect, useState } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useServicesStore, ServiceItem } from '@stores/Services/Services';
import { useColors } from '@theme/ThemeProvider';
import ServiceForm from './ServiceForm';
import { formatBRL } from '@lib/helpers/formatCurrency';

const ServicesList: React.FC = () => {
  const colors = useColors();
  const styles = createStyles(colors);
  const { myServices, fetchMyServices, deleteService } = useServicesStore();

  const [loaded, setLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);

  const route = useRoute<RouteProp<Record<string, any>, string>>();
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchMyServices().then(() => setLoaded(true));
  }, [fetchMyServices]);

  // Abre o modal de criação automaticamente apenas se vier o parâmetro
  // E o profissional ainda não tiver nenhum serviço cadastrado
  useEffect(() => {
    if (!loaded) return;
    if (route?.params?.openCreate && myServices.length === 0) {
      setEditing(null);
      setModalVisible(true);
    }
  }, [loaded, route?.params?.openCreate]);

  const openCreate = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = (item: ServiceItem) => {
    setEditing(item);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirmar', 'Remover serviço?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await deleteService(id);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <FontAwesome name="arrow-left" size={20} color={colors.primaryOrange} />
          </TouchableOpacity>
          <Text style={styles.title}>Meus Serviços</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Text style={styles.addBtnText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={myServices}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {(() => {
                const cents = item.price_cents ?? (item.price != null ? Math.round(Number(item.price) * 100) : null);
                if (!cents) return null;
                return (
                  <Text style={styles.itemMeta}>
                    {formatBRL({ price_cents: cents })}
                  </Text>
                );
              })()}
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <Text style={styles.link}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={[styles.link, { color: '#ef4444' }]}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <ServiceForm initial={editing} onClose={() => setModalVisible(false)} />
      </Modal>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.inputBackground },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    title: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
    addBtn: {
      backgroundColor: colors.primaryOrange,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addBtnText: { color: '#fff', fontFamily: 'Afacad-SemiBold' },
    itemRow: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemInfo: { flex: 1, paddingRight: 12 },
    itemTitle: {
      fontFamily: 'Afacad-Medium',
      fontSize: 16,
      color: colors.primaryBlack,
    },
    itemMeta: {
      fontFamily: 'Afacad-Regular',
      fontSize: 13,
      color: colors.textSecondary,
    },
    itemActions: { flexDirection: 'row', gap: 12 },
    link: {
      fontFamily: 'Afacad-SemiBold',
      color: colors.primaryOrange,
      marginLeft: 12,
    },
  });

export default ServicesList;
