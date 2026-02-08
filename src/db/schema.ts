import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  timestamp,
  jsonb,
  text,
} from "drizzle-orm/pg-core";

export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "live",
  "finished",
]);

export const matches = pgTable("matches", {
  id: uuid().defaultRandom().primaryKey(),
  sport: varchar({ length: 50 }).notNull(),
  homeTeam: varchar("home_team", { length: 100 }).notNull(),
  awayTeam: varchar("away_team", { length: 100 }).notNull(),
  status: matchStatusEnum().default("scheduled").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }),
  homeScore: integer("home_score").default(0).notNull(),
  awayScore: integer("away_score").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const commentary = pgTable("commentary", {
  id: uuid().defaultRandom().primaryKey(),
  matchId: uuid("match_id")
    .references(() => matches.id, { onDelete: "cascade" })
    .notNull(),
  minute: integer().notNull(),
  sequence: integer().notNull(),
  period: varchar({ length: 50 }).notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  actor: varchar({ length: 100 }),
  team: varchar({ length: 100 }),
  message: text().notNull(),
  metadata: jsonb(),
  tags: text().array(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
