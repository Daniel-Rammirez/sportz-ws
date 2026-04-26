import { Router } from "express";
import { matchIdParamSchema } from "../validation/matches";
import { commentary, matches } from "../db/schema";
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
  MAX_COMMENTARY_LIMIT,
} from "../validation/commentary";
import { db } from "../db/db";
import { desc, eq, sql } from "drizzle-orm";

export const commentaryRouter = Router({ mergeParams: true });

commentaryRouter.get("/", async (req, res) => {
  const matchIdAndLimitValidationResponse = listCommentaryQuerySchema.safeParse(
    {
      ...req.params,
      ...req.query,
    },
  );

  if (!matchIdAndLimitValidationResponse.success) {
    return res.status(400).json({
      error: "Invalid match ID",
      details: matchIdAndLimitValidationResponse.error.issues,
    });
  }

  const {
    data: { limit, id },
  } = matchIdAndLimitValidationResponse;

  const queryLimit = limit ?? MAX_COMMENTARY_LIMIT;

  const commentaryLimit = Math.min(queryLimit, MAX_COMMENTARY_LIMIT);

  try {
    const commentaryList = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, id))
      .orderBy(desc(commentary.createdAt))
      .limit(commentaryLimit);

    res.status(200).json({ data: commentaryList });
  } catch (error) {
    console.error("Failed to get commentaries", error);
    return res.status(500).json({ error: "Failed to get commentaries" });
  }
});

commentaryRouter.post("/", async (req, res) => {
  const parsedParams = matchIdParamSchema.safeParse(req.params);
  if (!parsedParams.success) {
    return res.status(400).json({
      error: "Invalid match ID",
      details: parsedParams.error.issues,
    });
  }

  const parsedBody = createCommentarySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      error: "Invalid payload",
      details: parsedBody.error.issues,
    });
  }

  const matchId = parsedParams.data.id;
  const commentaryData = parsedBody.data;
  const { eventType, team } = commentaryData;

  try {
    const [match] = await db.select().from(matches).where(eq(matches.id, matchId));
    if (!match) {
      return res.status(404).json({ error: "Match not found." });
    }

    const { commentaryCreated, updatedMatch } = await db.transaction(async (tx) => {
      const [commentaryCreated] = await tx
        .insert(commentary)
        .values({ matchId, ...commentaryData })
        .returning();

      if (eventType === "goal" && team) {
        const isHome = team === match.homeTeam;
        const [updatedMatch] = await tx
          .update(matches)
          .set(
            isHome
              ? { homeScore: sql`${matches.homeScore} + 1` }
              : { awayScore: sql`${matches.awayScore} + 1` },
          )
          .where(eq(matches.id, matchId))
          .returning();
        return { commentaryCreated, updatedMatch };
      }

      return { commentaryCreated, updatedMatch: null };
    });

    if (updatedMatch) {
      res.app.locals.broadcastScoreUpdate?.(updatedMatch.id, updatedMatch);
    }
    res.app.locals.broadcastMatchCommentary?.(commentaryCreated.matchId, commentaryCreated);

    return res.status(201).json({ data: commentaryCreated });
  } catch (error) {
    console.error("Failed to create commentary", error);
    return res.status(500).json({ error: "Failed to create commentary" });
  }
});
