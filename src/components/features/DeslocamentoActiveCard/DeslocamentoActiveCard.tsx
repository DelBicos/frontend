import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';

export interface DeslocamentoActiveCardProps {
  clientName: string;
  serviceTitle: string;
  address: string;
  startTime?: string;
  inProgress: boolean;
  arrived: boolean;
  onOpenMap: () => void;
}

export const DeslocamentoActiveCard: React.FC<DeslocamentoActiveCardProps> = ({
  clientName,
  serviceTitle,
  address,
  startTime,
  inProgress,
  arrived,
  onOpenMap,
}) => {
  const colors = useColors();

  return (
    <>
      {/* Card Principal de Serviço & Endereço */}
      <View
        style={[
          styles.orderCard,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: colors.borderColor,
          },
        ]}>
        <View style={styles.orderCardMainRow}>
          <View style={styles.orderInfoLeft}>
            <Text style={[styles.orderBadge, { color: colors.primaryBlack }]}>
              {clientName}
            </Text>
            <Text style={[styles.orderTitle, { color: colors.primaryBlue }]}>
              Serviço: {serviceTitle}
            </Text>
            <Text
              style={[styles.orderAddress, { color: colors.textSecondary }]}
              numberOfLines={3}>
              {address}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.mapBoxBtn,
              {
                borderColor: colors.primaryOrange,
                backgroundColor: colors.badgeBackground,
              },
            ]}
            onPress={onOpenMap}
            activeOpacity={0.8}>
            <View style={styles.mapBoxIconCircle}>
              <Ionicons
                name="navigate-sharp"
                size={24}
                color={colors.primaryOrange}
              />
            </View>
            <Text style={[styles.mapBoxText, { color: colors.primaryOrange }]}>
              Mapa
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[styles.cardDivider, { backgroundColor: colors.divider }]}
        />

        <View style={styles.cardFooterRow}>
          <Text
            style={[styles.cardFooterText, { color: colors.textSecondary }]}>
            Horário: {startTime || 'Hoje'}
          </Text>
        </View>
      </View>

      {/* Banner de Dica / Status */}
      {inProgress ? (
        <View
          style={[
            styles.tipBox,
            {
              borderColor: colors.primaryGreen,
              backgroundColor: colors.successBackground,
            },
          ]}>
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={colors.primaryGreen}
            style={styles.tipIcon}
          />
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: colors.successText }]}>
              Serviço em Andamento ⚡
            </Text>
            <Text style={[styles.tipSub, { color: colors.successText }]}>
              Atendimento iniciado com sucesso. Realize o serviço conforme o
              agendamento.
            </Text>
          </View>
        </View>
      ) : arrived ? (
        <View
          style={[
            styles.tipBox,
            {
              borderColor: colors.primaryOrange,
              backgroundColor: colors.warningBackground,
            },
          ]}>
          <Ionicons
            name="key-outline"
            size={24}
            color={colors.primaryOrange}
            style={styles.tipIcon}
          />
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: colors.warningText }]}>
              Chegada Confirmada 🎯
            </Text>
            <Text style={[styles.tipSub, { color: colors.warningText }]}>
              Solicite o código de confirmação ao cliente para iniciar o
              atendimento.
            </Text>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.tipBox,
            {
              borderColor: colors.borderColor,
              backgroundColor: colors.badgeBackground,
            },
          ]}>
          <Ionicons
            name="bulb-outline"
            size={24}
            color={colors.primaryBlue}
            style={styles.tipIcon}
          />
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: colors.primaryBlue }]}>
              Deslocamento em Andamento
            </Text>
            <Text style={[styles.tipSub, { color: colors.textSecondary }]}>
              Você informou que está a caminho. Ao chegar no local de
              atendimento, clique no botão abaixo.
            </Text>
          </View>
        </View>
      )}


      {/* Banner com o Nome do Serviço */}
      <View
        style={[
          styles.codeCard,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: colors.borderColor,
          },
        ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons
            name="construct-outline"
            size={20}
            color={colors.primaryBlue}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.codeCardText, { color: colors.primaryBlack }]}>
            Serviço: {serviceTitle}
          </Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
  },
  orderCardMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfoLeft: {
    flex: 1,
    marginRight: 12,
  },
  orderBadge: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  orderAddress: {
    fontSize: 13,
    lineHeight: 18,
  },
  mapBoxBtn: {
    width: 76,
    height: 76,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBoxIconCircle: {
    marginBottom: 2,
  },
  mapBoxText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    marginVertical: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tipBox: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  tipSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  codeCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    elevation: 1,
  },
  codeCardText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
