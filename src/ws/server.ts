import { Server } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { Match } from "../db/schema";

function sendJson(socket: WebSocket, payload: Record<string, unknown>) {
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(payload));
}

function broadcast(wss: WebSocketServer, payload: Record<string, unknown>) {
  wss.clients.forEach((client) => {
    sendJson(client, payload);
  });
}

export function attachWebSocketServer(server: Server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", (socket) => {
    sendJson(socket, { type: "welcome" });
    socket.on("error", console.error);
  });

  wss.on("error", (err) => {
    console.error("WebSocket server error:", err);
  });

  function broadcastMatchCreated(match: Match) {
    broadcast(wss, { type: "match_created", data: match });
  }

  return { broadcastMatchCreated };
}
