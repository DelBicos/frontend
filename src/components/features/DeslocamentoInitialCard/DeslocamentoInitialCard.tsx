import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';

export interface DeslocamentoInitialCardProps {
  clientName: string;
  clientPhone?: string;
  serviceTitle: string;
  address: string;
  startTime?: string;
  onCallClient: () => void;
}

export const DeslocamentoInitialCard: React.FC<
  DeslocamentoInitialCardProps
> = ({
  clientName,
  clientPhone,
  serviceTitle,
  address,
  startTime,
  onCallClient,
}) => {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElevated,
          borderColor: colors.borderColor,
        },
      ]}>
      <View style={styles.badgeRow}>
        <View
          style={[
            styles.timeBadge,
            { backgroundColor: colors.successBackground },
          ]}>
          <Ionicons name="time-outline" size={14} color={colors.successText} />
          <Text style={[styles.timeBadgeText, { color: colors.successText }]}>
            {startTime?.toLowerCase().includes('hoje')
              ? startTime
              : `Hoje às ${startTime || '14:00'}`}
          </Text>
        </View>
      </View>

      <Text style={[styles.serviceTitle, { color: colors.primaryBlack }]}>
        {serviceTitle}
      </Text>

      <View style={[styles.infoGroup, { borderTopColor: colors.divider }]}>
        <View style={styles.infoRow}>
          <Ionicons
            name="person-outline"
            size={18}
            color={colors.textSecondary}
          />
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Cliente:
          </Text>
          <Text style={[styles.infoVal, { color: colors.primaryBlack }]}>
            {clientName}
          </Text>
        </View>

        {!!clientPhone && (
          <TouchableOpacity
            onPress={onCallClient}
            style={[
              styles.phoneCallBtn,
              { backgroundColor: colors.badgeBackground },
            ]}>
            <Ionicons
              name="call-outline"
              size={14}
              color={colors.primaryBlue}
            />
            <Text style={[styles.phoneCallText, { color: colors.primaryBlue }]}>
              {clientPhone}
            </Text>
          </TouchableOpacity>
        )}

        <View style={[styles.infoRow, { marginTop: 10 }]}>
          <Ionicons
            name="location-outline"
            size={18}
            color={colors.textSecondary}
          />
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Endereço:
          </Text>
        </View>
        <Text style={[styles.addressText, { color: colors.textSecondary }]}>
          {address}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoGroup: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  phoneCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 26,
    marginBottom: 6,
  },
  phoneCallText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 26,
  },
});
