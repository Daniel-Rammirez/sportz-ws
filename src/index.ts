import express from "express";
import { matchRouter } from "./routes/matches";
import { createServer } from "http";
import { attachWebSocketServer } from "./ws/server";

const app = express();
const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || "0.0.0.0";

app.use(express.json());
const server = createServer(app);

app.get("/", (_req, res) => {
  res.send("Welcome to the Sportz API!");
});

app.use("/matches", matchRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {
  const baseURL =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

  console.log(`Server running on ${baseURL}`);
  console.log(
    `WebSocket Server is running on ${baseURL.replace("http", "ws")}/ws`,
  );
});
