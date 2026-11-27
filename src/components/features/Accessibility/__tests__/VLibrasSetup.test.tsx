/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import VLibrasSetup from '../VLibrasSetup';

type VLibrasWindow = Window & {
  VLibras?: {
    Widget: jest.Mock;
    widget?: { hide?: jest.Mock };
  };
};

const CONTAINER_ID = 'vlibras-container-manual';

const setOS = (os: string) => {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    get: () => os,
  });
};

describe('VLibrasSetup', () => {
  const previousOS = Platform.OS;

  afterEach(() => {
    setOS(previousOS);
    document.body.innerHTML = '';
    delete (window as VLibrasWindow).VLibras;
  });

  it('não deve tocar no documento fora da web', () => {
    setOS('ios');
    render(<VLibrasSetup />);

    expect(document.getElementById(CONTAINER_ID)).toBeNull();
    expect(document.querySelector('script')).toBeNull();
  });

  it('deve injetar o contêiner e o script do VLibras na web', () => {
    setOS('web');
    render(<VLibrasSetup />);

    const container = document.getElementById(CONTAINER_ID);
    expect(container).not.toBeNull();
    expect(container?.querySelector('[vw]')).not.toBeNull();

    const script = document.querySelector('script');
    expect(script?.src).toBe('https://vlibras.gov.br/app/vlibras-plugin.js');
    expect(script?.async).toBe(true);
  });

  it('não deve duplicar o contêiner quando já existe', () => {
    setOS('web');
    const existing = document.createElement('div');
    existing.id = CONTAINER_ID;
    document.body.appendChild(existing);

    render(<VLibrasSetup />);

    expect(document.querySelectorAll(`#${CONTAINER_ID}`)).toHaveLength(1);
    expect(document.querySelector('script')).toBeNull();
  });

  it('deve criar o widget e escondê-lo quando o script carrega', () => {
    setOS('web');
    const hide = jest.fn();
    const Widget = jest.fn();
    (window as VLibrasWindow).VLibras = { Widget, widget: { hide } };

    render(<VLibrasSetup />);
    const script = document.querySelector('script') as HTMLScriptElement;
    (script.onload as () => void)();

    expect(Widget).toHaveBeenCalledWith('https://vlibras.gov.br/app');
    expect(hide).toHaveBeenCalledTimes(1);
  });

  it('deve ignorar o carregamento quando o VLibras não está disponível', () => {
    setOS('web');
    render(<VLibrasSetup />);
    const script = document.querySelector('script') as HTMLScriptElement;

    expect(() => (script.onload as () => void)()).not.toThrow();
  });

  it('deve criar o widget mesmo sem a função de esconder', () => {
    setOS('web');
    const Widget = jest.fn();
    (window as VLibrasWindow).VLibras = { Widget };

    render(<VLibrasSetup />);
    const script = document.querySelector('script') as HTMLScriptElement;
    (script.onload as () => void)();

    expect(Widget).toHaveBeenCalledTimes(1);
  });
});
