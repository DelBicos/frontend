import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';

type Imagem = {
  id: string;
  url: string;
  descricao?: string;
};

type GaleriaContentProps = {
  imagens: Imagem[];
};

const GAP = 8;

export function GaleriaContent({ imagens }: GaleriaContentProps) {
  const colors = useColors();
  const { isCompact } = useBreakpoint();
  const styles = createStyles(colors);
  const [gridWidth, setGridWidth] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  const columns = isCompact ? 3 : 4;
  // Tamanho em pixels a partir da largura medida da grade.
  const tile = gridWidth ? (gridWidth - GAP * (columns - 1)) / columns : 0;

  if (imagens.length === 0) {
    return (
      <View style={styles.empty}>
        <FontAwesome name="image" size={28} color={colors.textSecondary} />
        <Text style={styles.emptyText}>Nenhuma foto na galeria ainda.</Text>
      </View>
    );
  }

  return (
    <>
      <View
        style={styles.grid}
        onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}>
        {tile > 0 &&
          imagens.map((img, index) => (
            <Pressable
              key={img.id}
              onPress={() => setOpen(index)}
              style={({ hovered }: any) => [
                styles.tile,
                { width: tile, height: tile },
                hovered && styles.tileHovered,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Abrir foto ${index + 1} de ${imagens.length}${img.descricao ? `: ${img.descricao}` : ''}`}>
              <Image
                source={{ uri: img.url }}
                style={{ width: tile, height: tile }}
                resizeMode="cover"
              />
            </Pressable>
          ))}
      </View>

      <Viewer
        imagens={imagens}
        index={open}
        onChange={setOpen}
        onClose={() => setOpen(null)}
      />
    </>
  );
}

function Viewer({
  imagens,
  index,
  onChange,
  onClose,
}: {
  imagens: Imagem[];
  index: number | null;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const styles = createViewerStyles();
  const total = imagens.length;
  const prev = () => index !== null && onChange((index - 1 + total) % total);
  const next = () => index !== null && onChange((index + 1) % total);

  // Setas do teclado e Esc no web.
  useEffect(() => {
    if (Platform.OS !== 'web' || index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const current = index !== null ? imagens[index] : null;

  return (
    <Modal
      visible={index !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {current ? (
          <Image
            source={{ uri: current.url }}
            style={styles.image}
            resizeMode="contain"
            accessibilityLabel={current.descricao || `Foto ${index! + 1}`}
          />
        ) : null}

        <View style={styles.topBar}>
          <Text style={styles.counter}>
            {(index ?? 0) + 1} de {total}
          </Text>
          <Pressable
            onPress={onClose}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Fechar galeria">
            <FontAwesome name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {total > 1 ? (
          <>
            <Pressable
              onPress={prev}
              style={[styles.iconButton, styles.navLeft]}
              accessibilityRole="button"
              accessibilityLabel="Foto anterior">
              <FontAwesome name="chevron-left" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={next}
              style={[styles.iconButton, styles.navRight]}
              accessibilityRole="button"
              accessibilityLabel="Próxima foto">
              <FontAwesome name="chevron-right" size={20} color="#FFFFFF" />
            </Pressable>
          </>
        ) : null}

        {current?.descricao ? (
          <Text style={styles.caption}>{current.descricao}</Text>
        ) : null}
      </View>
    </Modal>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: GAP,
    },
    tile: {
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.inputBackground,
      ...Platform.select({ web: { cursor: 'zoom-in' } as any }),
    },
    tileHovered: {
      opacity: 0.85,
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

const createViewerStyles = () =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.92)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: '80%',
    },
    topBar: {
      position: 'absolute',
      top: 16,
      left: 16,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    counter: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 16,
      color: '#FFFFFF',
    },
    iconButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.16)',
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
    navLeft: {
      position: 'absolute',
      left: 16,
    },
    navRight: {
      position: 'absolute',
      right: 16,
    },
    caption: {
      position: 'absolute',
      bottom: 24,
      left: 24,
      right: 24,
      textAlign: 'center',
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      color: '#FFFFFF',
    },
  });
