import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  PanResponder,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import ActionButton from '@components/ui/ActionButton';
import InlineAlert from '@components/ui/InlineAlert';
import {
  MAX_ZOOM,
  MIN_ZOOM,
  Offset,
  Size,
  clampOffset,
  clampZoom,
  coverScale,
  sourceRect,
} from './cropMath';
import { createStyles } from './styles';
import type { ImageCropModalProps } from './types';

const MAX_VIEWPORT = 320;
/** Lado da imagem final, em px. */
const OUTPUT_SIZE = 512;
const ZOOM_STEP = 0.25;
const CENTER: Offset = { x: 0, y: 0 };

/**
 * Recorte quadrado com zoom e posição para a web, onde o seletor de arquivos
 * do navegador não oferece edição (`allowsEditing` só funciona no app nativo).
 */
export default function ImageCropModal({
  visible,
  imageUri,
  onCancel,
  onConfirm,
}: ImageCropModalProps) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const viewport = Math.max(160, Math.min(MAX_VIEWPORT, width - 80));
  const styles = createStyles(colors, viewport);

  const [size, setSize] = useState<Size | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState<Offset>(CENTER);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const sourceRef = useRef<HTMLImageElement | null>(null);
  const offsetRef = useRef<Offset>(CENTER);
  const dragStartRef = useRef<Offset>(CENTER);

  const applyOffset = (next: Offset) => {
    offsetRef.current = next;
    setOffset(next);
  };

  useEffect(() => {
    setSize(null);
    setZoom(MIN_ZOOM);
    setError(null);
    setExporting(false);
    offsetRef.current = CENTER;
    setOffset(CENTER);
    sourceRef.current = null;
    if (!visible || !imageUri) return;

    let active = true;
    const source = new window.Image();
    source.onload = () => {
      if (!active) return;
      sourceRef.current = source;
      setSize({ width: source.naturalWidth, height: source.naturalHeight });
    };
    source.onerror = () => {
      if (active) setError('Não foi possível abrir esta imagem.');
    };
    source.src = imageUri;
    return () => {
      active = false;
    };
  }, [visible, imageUri]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragStartRef.current = offsetRef.current;
        },
        onPanResponderMove: (_event, gesture) => {
          if (!size) return;
          const next = clampOffset(
            {
              x: dragStartRef.current.x + gesture.dx,
              y: dragStartRef.current.y + gesture.dy,
            },
            size,
            viewport,
            zoom,
          );
          offsetRef.current = next;
          setOffset(next);
        },
      }),
    [size, viewport, zoom],
  );

  const changeZoom = (value: number) => {
    if (!size) return;
    const next = clampZoom(value);
    setZoom(next);
    applyOffset(clampOffset(offsetRef.current, size, viewport, next));
  };

  const confirm = () => {
    const source = sourceRef.current;
    if (!source || !size) return;
    const rect = sourceRect(offsetRef.current, size, viewport, zoom);
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext('2d');
    if (!context) {
      setError('Não foi possível recortar a imagem neste navegador.');
      return;
    }
    // Fundo para imagens com transparência, que viraria preto no JPEG.
    context.fillStyle = colors.primaryWhite;
    context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    context.drawImage(
      source,
      rect.x,
      rect.y,
      rect.size,
      rect.size,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    );
    setExporting(true);
    canvas.toBlob(
      (blob) => {
        setExporting(false);
        if (!blob) {
          setError('Não foi possível recortar a imagem.');
          return;
        }
        onConfirm(URL.createObjectURL(blob));
      },
      'image/jpeg',
      0.9,
    );
  };

  const scale = size ? coverScale(size, viewport) * zoom : 1;
  const shownWidth = size ? size.width * scale : 0;
  const shownHeight = size ? size.height * scale : 0;

  return (
    <Modal
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
      transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title} accessibilityRole="header">
            Ajustar foto
          </Text>
          <Text style={styles.hint}>
            Arraste a foto para posicionar e use o zoom para aproximar.
          </Text>

          <View
            style={[
              styles.viewport,
              // Sem isto o navegador rola a página ou seleciona texto ao arrastar.
              {
                cursor: 'grab',
                touchAction: 'none',
                userSelect: 'none',
              } as object,
            ]}
            {...panResponder.panHandlers}>
            {size && imageUri ? (
              <Image
                source={{ uri: imageUri }}
                accessibilityLabel="Foto escolhida"
                style={[
                  styles.image,
                  {
                    width: shownWidth,
                    height: shownHeight,
                    left: (viewport - shownWidth) / 2 + offset.x,
                    top: (viewport - shownHeight) / 2 + offset.y,
                  },
                ]}
              />
            ) : error ? null : (
              <ActivityIndicator size="large" color={colors.primaryOrange} />
            )}
            <View
              pointerEvents="none"
              style={[
                styles.mask,
                { boxShadow: `0 0 0 ${viewport}px ${colors.overlay}` },
              ]}
            />
          </View>

          <View style={styles.zoomRow}>
            <Pressable
              style={styles.zoomButton}
              onPress={() => changeZoom(zoom - ZOOM_STEP)}
              disabled={!size || zoom <= MIN_ZOOM}
              accessibilityRole="button"
              accessibilityLabel="Diminuir zoom">
              <FontAwesome name="minus" size={14} color={colors.primaryBlack} />
            </Pressable>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              disabled={!size}
              onChange={(event) => changeZoom(Number(event.target.value))}
              aria-label="Zoom"
              style={{ flex: 1, accentColor: colors.primaryOrange }}
            />
            <Pressable
              style={styles.zoomButton}
              onPress={() => changeZoom(zoom + ZOOM_STEP)}
              disabled={!size || zoom >= MAX_ZOOM}
              accessibilityRole="button"
              accessibilityLabel="Aumentar zoom">
              <FontAwesome name="plus" size={14} color={colors.primaryBlack} />
            </Pressable>
          </View>

          {error ? <InlineAlert type="error">{error}</InlineAlert> : null}

          <View style={styles.actions}>
            <ActionButton
              label="Cancelar"
              variant="ghost"
              size="sm"
              onPress={onCancel}
              disabled={exporting}
            />
            <ActionButton
              label="Usar foto"
              size="sm"
              onPress={confirm}
              disabled={!size}
              loading={exporting}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
