import React from 'react';
import { ChatWindow } from './ChatWindow';
import { AppointmentStatusBanner } from './AppointmentStatusBanner';
import type { AppointmentStatusEvent } from '@hooks/useAppointmentStatusSocket';

const mockReceive = jest.fn();
const mockPolling = jest.fn();
const mockSession = {
  messages: [],
  loading: false,
  error: null,
  hasHydrated: false,
  conversationState: 'COLETANDO_DATA',
  conversationContext: {
    pendingAction: 'RESCHEDULE',
    appointmentId: 92,
    appointmentStatus: 'confirmed',
    appointmentPaid: true,
  },
  receiveAppointmentStatus: mockReceive,
};

jest.mock(
  '@hooks/useChatSession',
  () => ({ useChatSession: () => mockSession }),
  { virtual: true },
);
jest.mock(
  '@hooks/useVoiceRecorder',
  () => ({
    MAX_VOICE_RECORDING_DURATION_MS: 60000,
    useVoiceRecorder: () => ({ isRecording: false, isPreparing: false }),
  }),
  { virtual: true },
);
jest.mock('@stores/ChatBot', () => ({
  useChatBotStore: { getState: () => mockSession },
}));
jest.mock('@theme/ThemeProvider', () => ({ useColors: () => ({}) }));
jest.mock('@expo/vector-icons', () => ({ FontAwesome: () => null }));
jest.mock('./styles', () => ({ createStyles: () => ({}) }));
jest.mock('./hooks/useAppointmentPolling', () => ({
  useAppointmentPolling: (...args: unknown[]) => mockPolling(...args),
}));
jest.mock('./hooks/useRateLimitCountdown', () => ({
  useRateLimitCountdown: () => 0,
}));
jest.mock('../TypingIndicator', () => ({ TypingIndicator: () => null }));
jest.mock('../QuickReplies', () => ({ QuickReplies: () => null }));
jest.mock('./AppointmentQueryReplies', () => ({
  AppointmentQueryReplies: () => null,
}));
jest.mock('@components/ui/ConfirmationModal', () => () => null);
jest.mock('./MessageBubble', () => ({ MessageBubble: () => null }));
jest.mock('./ChatHeader', () => ({ ChatHeader: () => null }));
jest.mock('./ChatInputBar', () => ({ ChatInputBar: () => null }));
jest.mock('./ChatErrorBanner', () => ({ ChatErrorBanner: () => null }));
jest.mock('./AppointmentStatusBanner', () => ({
  AppointmentStatusBanner: () => null,
}));

interface TestTree {
  unmount(): void;
  root: { findAllByType(type: unknown): unknown[] };
}
// O projeto não inclui @types/react-test-renderer; tipa apenas a API usada.
const { create, act } = jest.requireActual<{
  create(element: React.ReactElement): TestTree;
  act(callback: () => void): void;
}>('react-test-renderer');
let tree: TestTree;

beforeEach(() => {
  jest.clearAllMocks();
  mockSession.conversationState = 'COLETANDO_DATA';
  mockSession.conversationContext.pendingAction = 'RESCHEDULE';
  mockPolling.mockReturnValue({
    appointmentStatus: 'confirmed',
    appointmentPaid: true,
  });
});
afterEach(() => act(() => tree.unmount()));

it.each(['COLETANDO_DATA', 'COLETANDO_HORARIO', 'CONFIRMACAO'])(
  'não consulta nem anuncia o pagamento antigo durante %s',
  (state) => {
    mockSession.conversationState = state;
    act(() => {
      tree = create(<ChatWindow />);
    });
    expect(mockPolling.mock.calls.at(-1)?.[0]).toBeUndefined();
    expect(tree.root.findAllByType(AppointmentStatusBanner)).toHaveLength(0);
  },
);

it('ignora evento atrasado quando o usuário já começou a remarcar', () => {
  mockSession.conversationState = 'AGUARDANDO_CONFIRMACAO';
  act(() => {
    tree = create(<ChatWindow />);
  });
  const onStatus = mockPolling.mock.calls.at(-1)?.[3] as (
    event: AppointmentStatusEvent,
  ) => void;
  mockSession.conversationState = 'COLETANDO_DATA';
  onStatus({
    appointment_id: 92,
    status: 'confirmed',
    paid: true,
  } as AppointmentStatusEvent);
  expect(mockReceive).not.toHaveBeenCalled();
});

it('acompanha o agendamento depois da confirmação da remarcação', () => {
  mockSession.conversationState = 'AGUARDANDO_CONFIRMACAO';
  act(() => {
    tree = create(<ChatWindow />);
  });
  expect(mockPolling.mock.calls.at(-1)?.[0]).toBe(92);
  expect(tree.root.findAllByType(AppointmentStatusBanner)).toHaveLength(1);
  const onStatus = mockPolling.mock.calls.at(-1)?.[3] as (
    event: AppointmentStatusEvent,
  ) => void;
  const event = {
    appointment_id: 92,
    status: 'pending',
    paid: true,
  } as AppointmentStatusEvent;
  onStatus(event);
  expect(mockReceive).toHaveBeenCalledWith(event);
});
