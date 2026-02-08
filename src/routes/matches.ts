import { Router } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches";
import { db } from "../db/db";
import { matches } from "../db/schema";
import { getMatchStatus } from "../../utils/match-status";
import { desc } from "drizzle-orm";

export const matchRouter = Router();

const MAX_LIST_LIMIT = 100;

matchRouter.get("/", async (req, res) => {
  const parsedQuery = listMatchesQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return res.status(400).json({
      error: "Invalid query.",
      details: parsedQuery.error.issues,
    });
  }

  const queryLimit = parsedQuery.data.limit ?? MAX_LIST_LIMIT;

  const matchesLimit = Math.min(queryLimit, MAX_LIST_LIMIT);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(matchesLimit);

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to list matches." });
  }
});

matchRouter.post("/", async (req, res) => {
  const parsedBody = createMatchSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      error: "Invalid payload.",
      details: parsedBody.error.issues,
    });
  }

  const {
    data: { startTime, endTime },
  } = parsedBody;

  try {
    const [match] = await db
      .insert(matches)
      .values({
        ...parsedBody.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: getMatchStatus(new Date(startTime), new Date(endTime)),
      })
      .returning();

    if (res.app.locals.broadcastMatchCreated) {
      try {
        res.app.locals.broadcastMatchCreated(match);
      } catch (broadcastError) {
        console.error("Failed to broadcast match creation:", broadcastError);
      }
    }
    res.status(201).json({ data: match });
  } catch (e) {
    console.error("Failed to create match:", e);
    return res.status(500).json({ error: "Failed to create match." });
  }
});
