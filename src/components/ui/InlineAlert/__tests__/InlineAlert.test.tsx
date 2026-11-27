import React from 'react';
import { render } from '@testing-library/react-native';

import InlineAlert from '../InlineAlert';

type Node = ReturnType<typeof render>['UNSAFE_root'];

// O role "alert" não é reconhecido por getByRole no React Native Testing
// Library, então o contêiner é buscado pela prop.
const findAlert = (root: ReturnType<typeof render>['UNSAFE_root']) =>
  root.findAll((n: Node) => n.props.accessibilityRole === 'alert')[0];

describe('InlineAlert', () => {
  it('deve anunciar erros de forma assertiva por padrão', () => {
    const { getByText, UNSAFE_root } = render(
      <InlineAlert>Algo deu errado</InlineAlert>,
    );
    expect(getByText('Algo deu errado')).toBeTruthy();
    expect(findAlert(UNSAFE_root).props.accessibilityLiveRegion).toBe(
      'assertive',
    );
  });

  it.each(['success', 'info'] as const)(
    'deve anunciar %s de forma educada',
    (type) => {
      const { UNSAFE_root } = render(
        <InlineAlert type={type}>Mensagem</InlineAlert>,
      );
      expect(findAlert(UNSAFE_root).props.accessibilityLiveRegion).toBe(
        'polite',
      );
    },
  );
});
