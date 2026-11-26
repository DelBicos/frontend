import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CodeInput from '../CodeInput';

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
  it('deve renderizar um campo por dígito', () => {
    const { getByLabelText } = setup();
    expect(getByLabelText('Dígito 1 de 4')).toBeTruthy();
    expect(getByLabelText('Dígito 4 de 4')).toBeTruthy();
  });

  it('deve gravar o dígito e avançar o foco', () => {
    const { getByTestId, setVerificationCode, setFocusedIndex } = setup();
    fireEvent.changeText(getByTestId('code-input-1'), '5');
    expect(setVerificationCode).toHaveBeenCalledWith(['', '5', '', '']);
    expect(setFocusedIndex).toHaveBeenCalledWith(2);
  });

  it('não deve avançar o foco no último dígito nem ao apagar', () => {
    const { getByTestId, setFocusedIndex } = setup();
    fireEvent.changeText(getByTestId('code-input-3'), '9');
    fireEvent.changeText(getByTestId('code-input-2'), '');
    expect(setFocusedIndex).not.toHaveBeenCalled();
  });

  it('deve distribuir um código colado', () => {
    const { getByTestId, setVerificationCode, setFocusedIndex } = setup();
    fireEvent.changeText(getByTestId('code-input-0'), '123456');
    expect(setVerificationCode).toHaveBeenCalledWith(['1', '2', '3', '4']);
    expect(setFocusedIndex).toHaveBeenCalledWith(3);
  });

  it('deve voltar o foco com Backspace em campo vazio', () => {
    const { getByTestId, setFocusedIndex } = setup(['1', '', '', ''], 1);
    fireEvent(getByTestId('code-input-1'), 'keyPress', {
      nativeEvent: { key: 'Backspace' },
    });
    expect(setFocusedIndex).toHaveBeenCalledWith(0);
    setFocusedIndex.mockClear();
    fireEvent(getByTestId('code-input-0'), 'keyPress', {
      nativeEvent: { key: 'Backspace' },
    });
    fireEvent(getByTestId('code-input-2'), 'keyPress', {
      nativeEvent: { key: '1' },
    });
    expect(setFocusedIndex).not.toHaveBeenCalled();
  });

  it('deve focar o campo tocado', () => {
    const { getByTestId, setFocusedIndex } = setup();
    fireEvent(getByTestId('code-input-2'), 'focus');
    expect(setFocusedIndex).toHaveBeenCalledWith(2);
  });
});
