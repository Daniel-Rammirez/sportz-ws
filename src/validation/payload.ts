import z from "zod";
import { idSchema } from "./matches";

export const MESSAGE_TYPES = {
  MATCH_SUBSCRIPTION: "Match Subscription",
  MATCH_UNSUBSCRIBE: "Match Unsubscribe",
  COMMENTARY: "Commentary",
  MATCH_CREATED: "Match Created",
  WELCOME: "Welcome",
} as const;

export const payloadSchema = z
  .object({
    type: z.enum(Object.values(MESSAGE_TYPES)).optional(),
    matchId: idSchema.optional(),
  })
  .and(z.record(z.string(), z.unknown()));

export type PayloadType = z.infer<typeof payloadSchema>;
