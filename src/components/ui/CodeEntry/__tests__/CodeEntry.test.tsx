import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CodeEntry from '../CodeEntry';

describe('CodeEntry', () => {
  it('deve exibir o valor distribuído nos campos', () => {
    const { getByTestId } = render(
      <CodeEntry value="12" onChange={jest.fn()} />,
    );
    expect(getByTestId('code-input-0').props.value).toBe('1');
    expect(getByTestId('code-input-1').props.value).toBe('2');
    expect(getByTestId('code-input-5').props.value).toBe('');
  });

  it('deve devolver o código como texto só com dígitos', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <CodeEntry value="12" onChange={onChange} length={4} />,
    );
    fireEvent.changeText(getByTestId('code-input-2'), '3');
    expect(onChange).toHaveBeenCalledWith('123');
    fireEvent.changeText(getByTestId('code-input-0'), '9a87');
    expect(onChange).toHaveBeenLastCalledWith('987');
  });
});
