import React from 'react';
import { render } from '@testing-library/react-native';
import VerifiedBadge from '..';

describe('VerifiedBadge', () => {
  it('tem rotulo acessivel e nao mostra texto por padrao', () => {
    const { getByLabelText, queryByText } = render(<VerifiedBadge />);
    expect(getByLabelText('Profissional verificado')).toBeTruthy();
    expect(queryByText('Verificado')).toBeNull();
  });

  it('mostra o texto quando showLabel e verdadeiro', () => {
    const { getByText } = render(<VerifiedBadge showLabel size={20} />);
    expect(getByText('Verificado')).toBeTruthy();
  });
});
