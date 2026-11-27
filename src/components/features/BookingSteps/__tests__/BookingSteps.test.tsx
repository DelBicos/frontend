import React from 'react';
import { Platform } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import BookingSteps, { BOOKING_STEPS } from '../BookingSteps';

const mockGoBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);
let mockIsCompact = false;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    canGoBack: mockCanGoBack,
  }),
}));

jest.mock('@lib/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ isCompact: mockIsCompact }),
}));

const setOS = (os: string) => {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    get: () => os,
  });
};

describe('BookingSteps', () => {
  const previousOS = Platform.OS;

  beforeEach(() => {
    mockGoBack.mockClear();
    mockCanGoBack.mockReturnValue(true);
    mockIsCompact = false;
    setOS('ios');
  });

  afterAll(() => setOS(previousOS));

  it('deve anunciar a etapa atual na barra de progresso', () => {
    const { getByLabelText } = render(<BookingSteps current={2} />);

    const progress = getByLabelText('Etapa 2 de 4: Profissional e horário');
    expect(progress.props.accessibilityValue).toEqual({
      min: 1,
      max: BOOKING_STEPS.length,
      now: 2,
    });
  });

  it('deve marcar etapas concluídas e numerar as próximas em telas largas', () => {
    const { getByText } = render(<BookingSteps current={3} />);

    expect(getByText('✓ Serviço e data')).toBeTruthy();
    expect(getByText('✓ Profissional e horário')).toBeTruthy();
    expect(getByText('3. Pagamento')).toBeTruthy();
    expect(getByText('4. Confirmação')).toBeTruthy();
  });

  it('deve mostrar só a legenda resumida em telas compactas', () => {
    mockIsCompact = true;
    const { getByText, queryByText } = render(<BookingSteps current={1} />);

    expect(getByText('Serviço e data')).toBeTruthy();
    expect(queryByText('2. Profissional e horário')).toBeNull();
  });

  it('deve voltar ao tocar em "Voltar" no app', () => {
    const { getByLabelText } = render(<BookingSteps current={1} />);

    fireEvent.press(getByLabelText('Voltar'));

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('não deve mostrar "Voltar" quando showBack é falso', () => {
    const { queryByLabelText } = render(
      <BookingSteps current={1} showBack={false} />,
    );

    expect(queryByLabelText('Voltar')).toBeNull();
  });

  it('não deve mostrar "Voltar" quando não há tela anterior', () => {
    mockCanGoBack.mockReturnValue(false);
    const { queryByLabelText } = render(<BookingSteps current={1} />);

    expect(queryByLabelText('Voltar')).toBeNull();
  });

  it('não deve mostrar "Voltar" na web', () => {
    setOS('web');
    const { queryByLabelText } = render(<BookingSteps current={1} />);

    expect(queryByLabelText('Voltar')).toBeNull();
  });
});
