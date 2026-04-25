import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MessageType } from "../types";

type MessageHandler = (data: Record<string, unknown>) => void;

interface WebSocketContextType {
  isConnected: boolean;
  send: (data: object) => void;
  subscribe: (
    type: MessageType,
    handler: MessageHandler,
  ) => {
    unsubscribe: () => void;
  };
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // here we keep track of all subscriptions per tab
  const subscriptionsRef = useRef<Map<MessageType, Set<MessageHandler>>>(
    new Map(),
  );
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    )
      return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      if (wsRef.current !== ws) return;
      setIsConnected(true);
    };

    ws.onclose = () => {
      if (wsRef.current !== ws) return;
      setIsConnected(false);
      wsRef.current = null;
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onmessage = (event) => {
      if (wsRef.current !== ws) return;
      try {
        const message = JSON.parse(event.data);
        const type = message.type as MessageType | undefined;
        if (type && subscriptionsRef.current.has(type)) {
          subscriptionsRef.current
            .get(type)!
            .forEach((handler) => handler(message));
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const subscribe = useCallback(
    (type: MessageType, handler: MessageHandler) => {
      if (!subscriptionsRef.current.has(type)) {
        subscriptionsRef.current.set(type, new Set());
      }
      subscriptionsRef.current.get(type)!.add(handler);

      const unsubscribe = () => {
        subscriptionsRef.current.get(type)?.delete(handler);
        if (subscriptionsRef.current.get(type)?.size === 0) {
          subscriptionsRef.current.delete(type);
        }
      };

      return { unsubscribe };
    },
    [],
  );

  return (
    <WebSocketContext.Provider value={{ isConnected, send, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
