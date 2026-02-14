import z from "zod";
import { matchIdParamSchema } from "./matches";

export const MAX_COMMENTARY_LIMIT = 100;

export const listCommentaryQuerySchema = matchIdParamSchema.extend({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_COMMENTARY_LIMIT)
    .optional(),
});

export const createCommentarySchema = z.object({
  minute: z.coerce.number().int().nonnegative(),
  sequence: z.coerce.number().int().optional(),
  period: z.string().optional(),
  eventType: z.string().optional(),
  actor: z.string().optional(),
  team: z.string().optional(),
  message: z.string().min(1, "message is required"),
  metadata: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
});
