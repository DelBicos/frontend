import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import uuid from 'react-native-uuid';
import { WS_DOMAIN } from '@config/varEnvs';
import { useUserStore } from '@stores/User';
import { ChatMessage, ChatRoomStatus } from '@stores/Chat';

interface UseChatSocketOptions {
  roomId: number;
  onMessage: (message: ChatMessage) => void;
}

interface SocketAck {
  ok: boolean;
  error?: string;
  status?: ChatRoomStatus;
}

export interface OptimisticMeta {
  clientMessageUuid: string;
  sentAt: string;
}

export function useChatSocket({ roomId, onMessage }: UseChatSocketOptions) {
  const token = useUserStore((s) => s.token);
  const user = useUserStore((s) => s.user);
  const socketRef = useRef<Socket | null>(null);
  const onMessageRef = useRef(onMessage);
  const [connected, setConnected] = useState(false);
  const [roomStatus, setRoomStatus] = useState<ChatRoomStatus>('active');

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!token || !roomId) return;

    const socket = io(WS_DOMAIN, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('room:join', roomId, (resp: SocketAck) => {
        if (resp?.ok && resp.status) setRoomStatus(resp.status);
      });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('message:new', (message: ChatMessage) => {
      onMessageRef.current(message);
    });

    return () => {
      socket.emit('room:leave', roomId);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, roomId]);

  /**
   * Envia uma mensagem via socket gerando o UUID e a data-hora no cliente.
   * Retorna os metadados para o caller montar a mensagem otimista.
   */
  const sendMessage = useCallback(
    (text: string): OptimisticMeta | null => {
      const socket = socketRef.current;
      const trimmed = text.trim();
      if (!trimmed || !user) return null;

      const clientMessageUuid = String(uuid.v4());
      const sentAt = new Date().toISOString();

      socket?.emit(
        'message:send',
        { roomId, clientMessageUuid, text: trimmed, sentAt },
        (resp: SocketAck) => {
          if (!resp?.ok) {
            console.warn('Falha ao enviar mensagem:', resp?.error);
          }
        },
      );

      return { clientMessageUuid, sentAt };
    },
    [roomId, user],
  );

  return { connected, roomStatus, setRoomStatus, sendMessage };
}
