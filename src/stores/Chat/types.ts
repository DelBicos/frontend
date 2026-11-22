export type ChatRoomStatus = 'active' | 'archived';

export type ChatRole = 'client' | 'professional';

export type ChatCorrespondent = {
  user_id: number;
  name: string;
  avatar_uri: string | null;
};

export type Conversation = {
  room_id: number;
  appointment_id: number;
  service_id: number;
  service_title: string | null;
  status: ChatRoomStatus;
  correspondent: ChatCorrespondent | null;
  last_message_preview: string | null;
  last_message_at: string | null;
};

export type ChatMessage = {
  id: string;
  room_id: number;
  client_message_uuid: string;
  sender_user_id: number;
  sender_role: ChatRole;
  text: string;
  sent_at: string;
  created_at: string;
  // Marca mensagens enviadas otimisticamente e ainda não confirmadas pelo servidor
  pending?: boolean;
  /** O servidor recusou ou não confirmou o envio; pode ser reenviada. */
  failed?: boolean;
};

export type FetchMessagesResult = {
  messages: ChatMessage[];
  nextCursor: string | null;
  roomStatus: ChatRoomStatus;
  role: ChatRole;
};

export type FetchRoomsOptions = {
  forceRefresh?: boolean;
};

export type ChatStore = {
  conversations: Conversation[];
  loadingRooms: boolean;
  error: string | null;
  fetchRooms: (options?: FetchRoomsOptions) => Promise<void>;
  fetchMessages: (
    roomId: number,
    cursor?: string,
    limit?: number,
  ) => Promise<FetchMessagesResult>;
  applyIncomingMessage: (message: ChatMessage) => void;
  clearChat: () => void;
};
