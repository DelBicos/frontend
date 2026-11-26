import React from 'react';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { render } from '@testing-library/react-native';
import Header from '..';

describe('Header (nativo)', () => {
  it('nao renderiza cabecalho no app', () => {
    const { toJSON } = render(
      <Header {...({} as unknown as NativeStackHeaderProps)} />,
    );
    expect(toJSON()).toBeNull();
  });
});
