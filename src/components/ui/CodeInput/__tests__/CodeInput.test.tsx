import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CodeInput from '..';

const setup = (code: string[] = ['', '', '', ''], focusedIndex = 0) => {
  const setVerificationCode = jest.fn();
  const setFocusedIndex = jest.fn();
  const utils = render(
    <CodeInput
      verificationCode={code}
      setVerificationCode={setVerificationCode}
      focusedIndex={focusedIndex}
      setFocusedIndex={setFocusedIndex}
    />,
  );
  return { ...utils, setVerificationCode, setFocusedIndex };
};

describe('CodeInput', () => {
  it('renderiza um campo por digito', () => {
    const { getByLabelText } = setup();
    expect(getByLabelText('Dígito 1 de 4')).toBeTruthy();
    expect(getByLabelText('Dígito 4 de 4')).toBeTruthy();
  });

  it('grava o digito e avanca o foco', () => {
    const { getByTestId, setVerificationCode, setFocusedIndex } = setup();
    fireEvent.changeText(getByTestId('code-input-1'), '7');
    expect(setVerificationCode).toHaveBeenCalledWith(['', '7', '', '']);
    expect(setFocusedIndex).toHaveBeenCalledWith(2);
  });

  it('nao avanca ao apagar ou no ultimo campo', () => {
    const { getByTestId, setFocusedIndex } = setup();
    fireEvent.changeText(getByTestId('code-input-3'), '9');
    fireEvent.changeText(getByTestId('code-input-2'), '');
    expect(setFocusedIndex).not.toHaveBeenCalled();
  });

  it('distribui um codigo colado e foca o ultimo campo', () => {
    const { getByTestId, setVerificationCode, setFocusedIndex } = setup();
    fireEvent.changeText(getByTestId('code-input-0'), '12');
    expect(setVerificationCode).toHaveBeenCalledWith(['1', '2', '', '']);
    expect(setFocusedIndex).toHaveBeenCalledWith(3);
  });

  it('volta o foco com Backspace em campo vazio', () => {
    const { getByTestId, setFocusedIndex } = setup(['1', '', '', ''], 1);
    fireEvent(getByTestId('code-input-1'), 'keyPress', {
      nativeEvent: { key: 'Backspace' },
    });
    expect(setFocusedIndex).toHaveBeenCalledWith(0);
  });

  it('nao volta o foco com Backspace em campo preenchido ou outra tecla', () => {
    const { getByTestId, setFocusedIndex } = setup(['1', '2', '', ''], 1);
    fireEvent(getByTestId('code-input-1'), 'keyPress', {
      nativeEvent: { key: 'Backspace' },
    });
    fireEvent(getByTestId('code-input-0'), 'keyPress', {
      nativeEvent: { key: '5' },
    });
    expect(setFocusedIndex).not.toHaveBeenCalled();
  });

  it('marca o foco ao focar um campo', () => {
    const { getByTestId, setFocusedIndex } = setup(['', '', '', ''], 9);
    fireEvent(getByTestId('code-input-2'), 'focus');
    expect(setFocusedIndex).toHaveBeenCalledWith(2);
  });
});
