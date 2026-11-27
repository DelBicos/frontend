import React from 'react';
import { render } from '@testing-library/react-native';
import VerifiedBadge from '../VerifiedBadge';

describe('VerifiedBadge', () => {
  it('deve ser anunciado como profissional verificado', () => {
    const { getByLabelText, queryByText } = render(<VerifiedBadge />);
    expect(getByLabelText('Profissional verificado')).toBeTruthy();
    expect(queryByText('Verificado')).toBeNull();
  });

  it('deve exibir o rótulo quando pedido', () => {
    const { getByText } = render(<VerifiedBadge showLabel size={20} />);
    expect(getByText('Verificado')).toBeTruthy();
  });
});
