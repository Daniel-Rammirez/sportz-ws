import z from "zod";
import { matchIdParamSchema } from "./matches";

export const MAX_COMMENTARY_LIMIT = 100;

export const listCommentaryQuerySchema = matchIdParamSchema.extend({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_COMMENTARY_LIMIT)
    .default(20),
});

export const createCommentarySchema = z.object({
  minute: z.coerce.number().int().nonnegative(),
  sequence: z.coerce.number().int().nonnegative().optional(),
  period: z.string().max(50).optional(),
  eventType: z.string().max(100).optional(),
  actor: z.string().max(200).optional(),
  team: z.string().max(200).optional(),
  message: z.string().min(1, "message is required").max(5000),
  metadata: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string().max(100)).max(20).optional(),
});
