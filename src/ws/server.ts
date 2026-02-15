import { Server } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { Commentary, Match } from "../db/schema";
import { idType } from "../validation/matches";
import {
  MESSAGE_TYPES,
  payloadSchema,
  PayloadType,
} from "../validation/payload";

declare module "ws" {
  interface WebSocket {
    isAlive: boolean;
    subscriptions: Set<idType>;
  }
}

const matchSubscribers = new Map<idType, Set<WebSocket>>();

function subscribeToMatch(matchId: idType, socket: WebSocket) {
  if (!matchSubscribers.has(matchId)) {
    matchSubscribers.set(matchId, new Set([socket]));
  } else {
    matchSubscribers.get(matchId)?.add(socket);
  }

  return sendJsonToOpenChanel(socket, {
    message: `Subscribed to match id: ${matchId}`,
  });
}

function unsubscribeToMatch(matchId: idType, socket: WebSocket) {
  if (!matchSubscribers || matchSubscribers.size === 0) {
    return sendJsonToOpenChanel(socket, {
      error: `Subscription for match id: ${matchId} does not exist.`,
    });
  }

  if (!matchSubscribers.has(matchId)) {
    return sendJsonToOpenChanel(socket, {
      error: `Subscription for match id: ${matchId} does not exist.`,
    });
  }

  matchSubscribers.get(matchId)?.delete(socket);

  if (matchSubscribers.get(matchId)?.size === 0) {
    matchSubscribers.delete(matchId);
  }

  return sendJsonToOpenChanel(socket, {
    message: `Unsubscribed to match id: ${matchId}`,
  });
}

function cleanSubscriptionsSocket(socket: WebSocket) {
  socket.subscriptions.forEach((matchId) => {
    unsubscribeToMatch(matchId, socket);
  });
}

function handleMessageRequest(socket: WebSocket, payload: PayloadType) {
  const { type: payloadType, matchId } = payload;

  if (!payloadType || !matchId) return;

  switch (payloadType) {
    case MESSAGE_TYPES.MATCH_SUBSCRIPTION:
      subscribeToMatch(matchId, socket);
      socket.subscriptions.add(matchId);
      break;
    case MESSAGE_TYPES.MATCH_UNSUBSCRIBE:
      unsubscribeToMatch(matchId, socket);
      socket.subscriptions.delete(matchId);
      break;
  }
}

function sendJsonToOpenChanel(socket: WebSocket, payload: PayloadType) {
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(payload));
}

function broadcastMatch(matchId: idType, payload: PayloadType) {
  const subscribers = matchSubscribers.get(matchId);

  if (!subscribers || subscribers.size === 0) return;

  subscribers?.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      sendJsonToOpenChanel(socket, payload);
    }
  });
}

function broadcastToAll(wss: WebSocketServer, payload: PayloadType) {
  wss.clients.forEach((client) => {
    sendJsonToOpenChanel(client, payload);
  });
}

export function attachWebSocketServer(server: Server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", (socket) => {
    socket.isAlive = true;

    socket.on("pong", () => {
      socket.isAlive = true;
    });

    socket.subscriptions = new Set();

    sendJsonToOpenChanel(socket, { type: MESSAGE_TYPES.WELCOME });

    socket.on("message", (data) => {
      let json: unknown;
      try {
        json = JSON.parse(data.toString());
      } catch {
        return console.error("Failed to parse message as JSON");
      }

      const parsedPayload = payloadSchema.safeParse(json);

      if (!parsedPayload.success) {
        return console.error("Failed to parse payload:", parsedPayload.error);
      }

      handleMessageRequest(socket, parsedPayload.data);
    });

    socket.on("error", () => {
      socket.terminate();
    });

    socket.on("close", () => {
      cleanSubscriptionsSocket(socket);
    });

    socket.on("error", console.error);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((socket) => {
      if (socket.isAlive === false) {
        return socket.terminate();
      }

      socket.isAlive = false;
      socket.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
  });

  wss.on("error", (err) => {
    console.error("WebSocket server error:", err);
  });

  function broadcastMatchCreated(match: Match) {
    broadcastToAll(wss, { type: MESSAGE_TYPES.MATCH_CREATED, data: match });
  }

  function broadcastMatchCommentary(matchId: idType, commentary: Commentary) {
    broadcastMatch(matchId, {
      type: MESSAGE_TYPES.COMMENTARY,
      data: commentary,
    });
  }

  return { broadcastMatchCreated, broadcastMatchCommentary };
}
