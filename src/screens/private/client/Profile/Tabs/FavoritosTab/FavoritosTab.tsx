import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFavoriteStore } from '@stores/Favorite';
import { FavoriteProfessional } from '@stores/Favorite/types';
import { useColors } from '@theme/ThemeProvider';
import Avatar from '@components/ui/Avatar';
import ActionButton from '@components/ui/ActionButton';
import EmptyState from '@components/ui/EmptyState';
import ProfilePage from '../../components/ProfilePage';
import { createStyles } from './styles';

/** Profissionais favoritos, com atalho para o perfil e desfazer remocao. */
const FavoritosTab: React.FC = () => {
  const colors = useColors();
  const styles = createStyles(colors);
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const columns = width >= 1100 ? 2 : 1;
  const { favorites, loading, removeFavorite, addFavorite, syncWithServer } =
    useFavoriteStore();
  const [removed, setRemoved] = useState<FavoriteProfessional | null>(null);

  useEffect(() => {
    syncWithServer();
  }, [syncWithServer]);

  const remove = async (fav: FavoriteProfessional) => {
    setRemoved(fav);
    await removeFavorite(fav.professionalId);
  };

  const undo = async () => {
    if (!removed) return;
    const fav = removed;
    setRemoved(null);
    await addFavorite(fav);
  };

  let body: React.ReactNode;
  if (loading && favorites.length === 0) {
    body = (
      <ActivityIndicator
        size="large"
        color={colors.primaryBlack}
        style={styles.loading}
      />
    );
  } else if (favorites.length === 0) {
    body = (
      <EmptyState
        icon="heart-o"
        title="Nenhum favorito ainda"
        text="Toque no coração no perfil de um profissional para encontrá-lo rápido aqui.">
        <ActionButton
          label="Explorar serviços"
          variant="secondary"
          onPress={() => navigation.navigate('Category')}
        />
      </EmptyState>
    );
  } else {
    body = (
      <View style={styles.grid}>
        {favorites.map((fav) => (
          <View
            key={fav.professionalId}
            style={[styles.gridItem, { width: `${100 / columns}%` }]}>
            <View style={styles.card}>
              <Pressable
                onPress={() =>
                  navigation.navigate('PartnerProfile', {
                    id: fav.professionalId,
                  })
                }
                style={({ pressed }) => [
                  styles.main,
                  pressed && { opacity: 0.8 },
                ]}
                accessibilityRole="link"
                accessibilityLabel={`Ver perfil de ${fav.professionalName}`}>
                <Avatar
                  uri={fav.professionalAvatar}
                  name={fav.professionalName}
                  size={56}
                />
                <View style={styles.texts}>
                  <Text style={styles.name} numberOfLines={1}>
                    {fav.professionalName}
                  </Text>
                  {fav.category ? (
                    <Text style={styles.meta} numberOfLines={1}>
                      {fav.category}
                    </Text>
                  ) : null}
                  {fav.serviceTitle ? (
                    <Text style={styles.meta} numberOfLines={1}>
                      Último serviço: {fav.serviceTitle}
                    </Text>
                  ) : null}
                </View>
                <FontAwesome
                  name="angle-right"
                  size={22}
                  color={colors.textSecondary}
                />
              </Pressable>
              <Pressable
                onPress={() => remove(fav)}
                style={({ pressed, hovered }: any) => [
                  styles.heart,
                  (pressed || hovered) && styles.heartPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Remover ${fav.professionalName} dos favoritos`}>
                <FontAwesome name="heart" size={20} color={colors.errorText} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <ProfilePage
      title="Favoritos"
      subtitle="Profissionais que você salvou para contratar de novo.">
      {removed ? (
        <View style={styles.undo} accessibilityLiveRegion="polite">
          <Text style={styles.undoText}>
            {removed.professionalName} saiu dos favoritos.
          </Text>
          <ActionButton
            label="Desfazer"
            variant="ghost"
            size="sm"
            onPress={undo}
          />
        </View>
      ) : null}
      {body}
    </ProfilePage>
  );
};

export default FavoritosTab;
