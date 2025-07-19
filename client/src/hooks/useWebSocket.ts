import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWebSocketOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onOpen,
    onClose,
    onError,
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const shouldReconnectRef = useRef(true);

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws`;
  }, []);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(getWebSocketUrl());
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setReconnectAttempts(0);
        onOpen?.();
      };

      ws.onmessage = (event) => {
        setLastMessage(event);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSocket(null);
        onClose?.();

        // Attempt to reconnect if enabled and not manually closed
        if (reconnect && shouldReconnectRef.current && reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      setSocket(ws);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      onError?.(error as Event);
    }
  }, [getWebSocketUrl, onOpen, onClose, onError, reconnect, reconnectInterval, reconnectAttempts, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  }, [socket]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
      return false;
    }
  }, [socket]);

  const sendRawMessage = useCallback((message: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(message);
        return true;
      } catch (error) {
        console.error('Failed to send raw WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('WebSocket is not connected. Cannot send raw message.');
      return false;
    }
  }, [socket]);

  useEffect(() => {
    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket,
    lastMessage,
    isConnected,
    sendMessage,
    sendRawMessage,
    connect,
    disconnect,
    reconnectAttempts
  };
}
