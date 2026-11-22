import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { initials } from '@lib/utils/initials';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
}

/** Foto da pessoa ou, sem foto (ou se falhar), as iniciais do nome. */
function Avatar({ uri, name, size = 40 }: AvatarProps) {
  const colors = useColors();
  const [failed, setFailed] = useState(false);
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        style={[shape, { backgroundColor: colors.inputBackground }]}
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
      />
    );
  }
  return (
    <View
      style={[
        shape,
        styles.fallback,
        { backgroundColor: colors.primaryOrange },
      ]}>
      <Text style={[styles.initials, { fontSize: Math.round(size * 0.4) }]}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'Afacad-Bold',
    color: '#000000',
  },
});

export default Avatar;
