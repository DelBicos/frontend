import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CodeEntry from '..';

describe('CodeEntry', () => {
  it('distribui o valor nos campos', () => {
    const { getByTestId } = render(
      <CodeEntry value="123" onChange={jest.fn()} />,
    );
    expect(getByTestId('code-input-0').props.value).toBe('1');
    expect(getByTestId('code-input-2').props.value).toBe('3');
    expect(getByTestId('code-input-5').props.value).toBe('');
  });

  it('devolve o codigo como texto unico, so com digitos', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <CodeEntry value="12" onChange={onChange} length={4} />,
    );
    fireEvent.changeText(getByTestId('code-input-2'), '3');
    expect(onChange).toHaveBeenLastCalledWith('123');

    fireEvent.changeText(getByTestId('code-input-3'), 'a');
    expect(onChange).toHaveBeenLastCalledWith('12');
  });
});
