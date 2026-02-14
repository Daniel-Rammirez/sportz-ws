import { Router } from "express";
import { matchIdParamSchema } from "../validation/matches";
import { commentary } from "../db/schema";
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
  MAX_COMMENTARY_LIMIT,
} from "../validation/commentary";
import { db } from "../db/db";
import { desc, eq } from "drizzle-orm";

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
  const matchIdValidationResponse = matchIdParamSchema.safeParse(req.params);

  if (!matchIdValidationResponse.success) {
    return res.status(400).json({
      error: "Invalid match ID",
      details: matchIdValidationResponse.error.issues,
    });
  }

  const commentaryDataValidationResponse = createCommentarySchema.safeParse(
    req.body,
  );

  if (!commentaryDataValidationResponse.success) {
    return res.status(400).json({
      error: "Invalid payload",
      details: commentaryDataValidationResponse.error.issues,
    });
  }

  try {
    const [commentaryCreated] = await db
      .insert(commentary)
      .values({
        matchId: matchIdValidationResponse.data.id,
        ...commentaryDataValidationResponse.data,
      })
      .returning();

    return res.status(201).json({ data: commentaryCreated });
  } catch (error) {
    console.error("Failed to create commentary", error);
    return res.status(500).json({ error: "Failed to create commentary" });
  }
});
