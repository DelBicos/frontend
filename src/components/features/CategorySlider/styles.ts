import { StyleSheet, Platform } from 'react-native';
import { ColorsType } from '@theme/types';

import { webStyle } from '@utils/webStyle';
export const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    // --- Card de categoria: icone a esquerda, titulo ao centro ---
    // Sem aspectRatio: a altura minima garante que icone e titulo nunca se
    // sobreponham, e o card cresce se o titulo quebrar em mais linhas.
    card: {
      flex: 1,
      minHeight: 96,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      overflow: 'hidden',
      // A sombra fica no card inteiro; o titulo nao tem sombra.
      ...Platform.select({
        web: webStyle({
          boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.12)',
          cursor: 'pointer',
          transition:
            'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
        }),
        default: { elevation: 3 },
      }),
    },
    cardHovered: {
      transform: [{ translateY: -3 }],
      ...webStyle({ boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.2)' }),
    },
    cardPressed: {
      opacity: 0.85,
    },
    // Caixa de largura fixa: os icones tem larguras diferentes e os titulos
    // ficam alinhados entre os cards.
    iconBox: {
      width: 56,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitle: {
      flexShrink: 1,
      fontSize: 20,
      lineHeight: 24,
      fontFamily: 'Afacad-Bold',
      textAlign: 'center',
    },

    // --- Variante compacta (celular) ---
    cardCompact: {
      minHeight: 72,
      gap: 10,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 10,
    },
    iconBoxCompact: {
      width: 30,
    },
    cardTitleCompact: {
      fontSize: 15,
      lineHeight: 18,
    },

    loadingContainer: {
      height: 130,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    emptyText: {
      color: colors.textSecondary,
      fontFamily: 'Afacad-Regular',
    },
  });
