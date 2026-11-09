import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import uuid from 'react-native-uuid';
import { WS_DOMAIN } from '@config/varEnvs';
import { useUserStore } from '@stores/User';
import { ChatMessage, ChatRoomStatus } from '@stores/Chat';

import { logger } from '@lib/logger';
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

/** Sem confirmação do servidor nesse prazo, a mensagem conta como não enviada. */
const SEND_ACK_TIMEOUT_MS = 10_000;

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
   * `onFailure` roda quando o servidor recusa ou não confirma a tempo.
   * Para reenviar, passe `retry` com os metadados originais: o servidor é
   * idempotente pelo `clientMessageUuid`.
   */
  const sendMessage = useCallback(
    (
      text: string,
      onFailure?: (meta: OptimisticMeta) => void,
      retry?: OptimisticMeta,
    ): OptimisticMeta | null => {
      const socket = socketRef.current;
      const trimmed = text.trim();
      if (!trimmed || !user) return null;

      const meta: OptimisticMeta = retry ?? {
        clientMessageUuid: String(uuid.v4()),
        sentAt: new Date().toISOString(),
      };

      if (!socket) {
        // Avisa depois do return, quando a mensagem otimista já está na tela.
        queueMicrotask(() => onFailure?.(meta));
        return meta;
      }

      socket
        .timeout(SEND_ACK_TIMEOUT_MS)
        .emit(
          'message:send',
          { roomId, text: trimmed, ...meta },
          (err: Error | null, resp?: SocketAck) => {
            if (err || !resp?.ok) {
              logger.warn(
                'Falha ao enviar mensagem:',
                err?.message ?? resp?.error,
              );
              onFailure?.(meta);
            }
          },
        );

      return meta;
    },
    [roomId, user],
  );

  return { connected, roomStatus, setRoomStatus, sendMessage };
}
