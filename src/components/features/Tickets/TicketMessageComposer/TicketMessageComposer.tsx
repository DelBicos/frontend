import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  AccessibilityInfo,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import InlineAlert from '@components/ui/InlineAlert';
import {
  useTicketStore,
  isTicketOpen,
  TicketStatus,
  TICKET_MESSAGE_MAX_LENGTH,
} from '@stores/Ticket';
import { createStyles } from './styles';

interface TicketMessageComposerProps {
  ticketId: number;
  status: TicketStatus;
  /** Called after the message is appended to the history. */
  onSent?: () => void;
  /** Called when the ticket no longer exists for this user (404). */
  onTicketNotFound: (message: string) => void;
}

export const CLOSED_TICKET_NOTICE =
  'Este chamado foi encerrado e não aceita novas mensagens.';

export const TicketMessageComposer: React.FC<TicketMessageComposerProps> = ({
  ticketId,
  status,
  onSent,
  onTicketNotFound,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const { sendMessage } = useTicketStore();

  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  // The server may close the ticket before the detail refetch lands.
  const [closedByServer, setClosedByServer] = useState(false);
  // Synchronous guard: a double tap can fire before the re-render disables the button.
  const sendingRef = useRef(false);

  const isClosed = closedByServer || !isTicketOpen(status);
  const trimmed = text.trim();
  const isSendDisabled =
    isSending ||
    trimmed.length === 0 ||
    trimmed.length > TICKET_MESSAGE_MAX_LENGTH;

  const announce = (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  };

  const handleChangeText = (value: string) => {
    setText(value);
    if (fieldError) setFieldError(null);
  };

  const handleSend = async () => {
    if (isSendDisabled || sendingRef.current) return;
    sendingRef.current = true;
    setIsSending(true);
    setFieldError(null);
    setSendError(null);
    setCanRetry(false);

    const result = await sendMessage(ticketId, trimmed);

    sendingRef.current = false;
    setIsSending(false);

    if (result.ok) {
      setText('');
      onSent?.();
      return;
    }

    // The typed text is never cleared on error.
    announce(result.error);
    switch (result.reason) {
      case 'INVALID_CONTENT':
        setFieldError(result.error);
        break;
      case 'TICKET_CLOSED':
        setClosedByServer(true);
        setSendError(result.error);
        break;
      case 'NOT_FOUND':
        onTicketNotFound(result.error);
        break;
      default:
        setSendError(result.error);
        setCanRetry(true);
    }
  };

  if (isClosed) {
    return (
      <View style={styles.container} testID="ticket-composer-closed">
        {sendError ? <InlineAlert type="error">{sendError}</InlineAlert> : null}
        <InlineAlert type="info">{CLOSED_TICKET_NOTICE}</InlineAlert>
        {text ? (
          // Keep the unsent text visible so the user can copy it.
          <TextInput
            testID="ticket-message-input"
            style={[styles.input, styles.inputReadOnly]}
            value={text}
            multiline
            editable={false}
            accessibilityLabel="Mensagem não enviada"
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container} testID="ticket-composer">
      <Text style={styles.label}>Nova mensagem</Text>
      <TextInput
        testID="ticket-message-input"
        style={[styles.input, fieldError ? styles.inputError : null]}
        value={text}
        onChangeText={handleChangeText}
        placeholder="Escreva uma mensagem"
        placeholderTextColor={colors.placeholder}
        multiline
        maxLength={TICKET_MESSAGE_MAX_LENGTH}
        editable={!isSending}
        accessibilityLabel="Nova mensagem para o chamado"
        accessibilityHint={`Até ${TICKET_MESSAGE_MAX_LENGTH} caracteres`}
      />
      <View style={styles.inputFooter}>
        {fieldError ? (
          <Text
            style={styles.errorText}
            accessibilityLiveRegion="assertive"
            testID="ticket-message-field-error">
            {fieldError}
          </Text>
        ) : (
          <View style={styles.spacer} />
        )}
        <Text
          style={[
            styles.counter,
            text.length >= TICKET_MESSAGE_MAX_LENGTH && styles.counterLimit,
          ]}>
          {text.length}/{TICKET_MESSAGE_MAX_LENGTH}
        </Text>
      </View>

      {sendError ? (
        <View testID="ticket-message-send-error">
          <InlineAlert type="error">{sendError}</InlineAlert>
          {canRetry ? (
            <TouchableOpacity
              testID="ticket-message-retry-button"
              style={styles.retryButton}
              onPress={handleSend}
              disabled={isSendDisabled}
              accessibilityRole="button"
              accessibilityLabel="Tentar enviar a mensagem novamente"
              accessibilityState={{ disabled: isSendDisabled }}>
              <Text style={styles.retryButtonLabel}>Tentar novamente</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <TouchableOpacity
        testID="ticket-message-send-button"
        style={[styles.sendButton, isSendDisabled && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={isSendDisabled}
        accessibilityRole="button"
        accessibilityLabel="Enviar mensagem"
        accessibilityState={{ disabled: isSendDisabled, busy: isSending }}>
        {isSending ? (
          <ActivityIndicator size="small" color={colors.textOnAccent} />
        ) : (
          <>
            <FontAwesome name="send" size={14} color={colors.textOnAccent} />
            <Text style={styles.sendButtonLabel}>Enviar</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};
