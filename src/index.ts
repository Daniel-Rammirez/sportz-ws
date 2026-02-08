import express from "express";
import { matchRouter } from "./routes/matches";

const app = express();
const PORT = 8000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Welcome to the Sportz API!");
});

app.use("/matches", matchRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
